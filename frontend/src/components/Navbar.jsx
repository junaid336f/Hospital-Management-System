import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaHospital, FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const handleLogout = () => {
    logout()
    navigate('/')
    setDropdownOpen(false)
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'admin') return '/admin/dashboard'
    if (user.role === 'doctor') return '/doctor/dashboard'
    return '/patient/dashboard'
  }

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <div className="brand-icon"><FaHospital /></div>
          <span className="brand-name">Medi<span>Care</span></span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/doctors" className={`nav-link ${location.pathname.startsWith('/doctors') && !location.pathname.includes('dashboard') ? 'active' : ''}`}>Doctors</Link>
          {user?.role === 'patient' && (
            <Link to="/patient/dashboard" className={`nav-link ${location.pathname === '/patient/dashboard' ? 'active' : ''}`}>Appointments</Link>
          )}
          {user && (
            <Link to={getDashboardLink()} className={`nav-link ${location.pathname.includes('dashboard') ? 'active' : ''}`}>Dashboard</Link>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="avatar avatar-sm">{getInitials(user.name)}</div>
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </button>
              {dropdownOpen && (
                <div className="dropdown">
                  <div className="dropdown-header">
                    <div className="avatar">{getInitials(user.name)}</div>
                    <div>
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-role">{user.role}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <FaTachometerAlt /> Dashboard
                  </Link>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  )
}
