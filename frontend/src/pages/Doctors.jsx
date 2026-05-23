import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDoctors } from '../services/api'
import { FaSearch, FaStar, FaUserMd, FaClock, FaMoneyBillWave, FaFilter } from 'react-icons/fa'
import './Doctors.css'

const specializations = ['All', 'Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedic', 'Dermatologist', 'General Physician']

const getInitials = (name) => name ? name.split(' ').filter(p => p !== 'Dr.').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR'

const avatarColors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Doctors() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [spec, setSpec] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDoctors().then(r => { setDoctors(r.data); setFiltered(r.data) }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = doctors
    if (spec !== 'All') result = result.filter(d => d.specialization === spec)
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(d => d.userId?.name?.toLowerCase().includes(s) || d.specialization?.toLowerCase().includes(s))
    }
    setFiltered(result)
  }, [search, spec, doctors])

  return (
    <div className="doctors-page page-wrapper">
      <div className="doctors-header">
        <div className="dh-bg" />
        <div className="container">
          <h1>Find Your <span className="gradient-text">Doctor</span></h1>
          <p>Browse our team of expert specialists and book your appointment</p>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              id="doctor-search"
              type="text"
              placeholder="Search by name or specialization..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <div className="filters-row">
          <FaFilter style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          {specializations.map(s => (
            <button key={s} id={`filter-${s.replace(/\s+/g,'-')}`} className={`filter-btn ${spec === s ? 'active' : ''}`} onClick={() => setSpec(s)}>{s}</button>
          ))}
        </div>

        {/* Results count */}
        <div className="results-info">
          <span>{filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found</span>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: '300px' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔍</div>
            <h3>No doctors found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="doctors-grid">
            {filtered.map((doc, i) => (
              <div key={doc._id} className="doctor-card">
                <div className="dc-top">
                  <div className="dc-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>
                    {getInitials(doc.userId?.name)}
                  </div>
                  <div className="dc-avail">
                    <div className={`avail-dot ${doc.isAvailable ? 'available' : 'unavailable'}`} />
                    <span>{doc.isAvailable ? 'Available' : 'Unavailable'}</span>
                  </div>
                </div>
                <div className="dc-info">
                  <h3>{doc.userId?.name || 'Dr. Unknown'}</h3>
                  <p className="dc-spec">{doc.specialization}</p>
                  <p className="dc-qual">{doc.qualification}</p>
                </div>
                <div className="dc-stats">
                  <div className="dc-stat">
                    <FaStar style={{ color: '#f59e0b' }} />
                    <span>{Number(doc.rating).toFixed(1)}</span>
                    <span className="dc-stat-label">({doc.totalReviews})</span>
                  </div>
                  <div className="dc-stat">
                    <FaClock style={{ color: 'var(--cyan)' }} />
                    <span>{doc.experience}yr exp</span>
                  </div>
                  <div className="dc-stat">
                    <FaMoneyBillWave style={{ color: 'var(--green)' }} />
                    <span>Rs. {doc.fees}</span>
                  </div>
                </div>
                {doc.about && <p className="dc-about">{doc.about.slice(0, 80)}...</p>}
                <div className="dc-actions">
                  <Link to={`/doctors/${doc._id}`} className="btn btn-outline btn-sm">View Profile</Link>
                  {doc.isAvailable ? (
                    user?.role === 'patient' ? (
                      <Link to={`/book/${doc._id}`} className="btn btn-primary btn-sm">Book Now</Link>
                    ) : (
                      <Link to="/login" state={{ from: `/book/${doc._id}` }} className="btn btn-primary btn-sm">Book Now</Link>
                    )
                  ) : (
                    <span className="btn btn-outline btn-sm" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Unavailable</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
