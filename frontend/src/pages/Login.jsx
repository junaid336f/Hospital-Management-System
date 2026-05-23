import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/api'
import { toast } from 'react-toastify'
import { FaHospital, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa'
import './Auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const { data } = await loginUser(form)
      login(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`)
      if (redirectTo && data.user.role === 'patient') navigate(redirectTo, { replace: true })
      else if (data.user.role === 'admin') navigate('/admin/dashboard')
      else if (data.user.role === 'doctor') navigate('/doctor/dashboard')
      else navigate('/patient/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@hospital.com', password: 'admin123' })
    else if (role === 'doctor') setForm({ email: 'sarah@hospital.com', password: 'doctor123' })
    else setForm({ email: 'patient@demo.com', password: 'patient123' })
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <div className="brand-icon"><FaHospital /></div>
              <span className="brand-name">Medi<span>Care</span></span>
            </Link>
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          {/* Demo credentials */}
          <div className="demo-creds">
            <p>Quick Login:</p>
            <div className="demo-btns">
              <button className="demo-btn" onClick={() => fillDemo('admin')}>Admin</button>
              <button className="demo-btn" onClick={() => fillDemo('doctor')}>Doctor</button>
              <button className="demo-btn" onClick={() => fillDemo('patient')}>Patient</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-icon-wrap">
                <FaEnvelope className="input-icon" />
                <input id="login-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="form-control with-icon" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-icon-wrap">
                <FaLock className="input-icon" />
                <input id="login-password" type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="form-control with-icon with-icon-right" />
                <button type="button" className="icon-right" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <button id="login-submit" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? <div className="btn-spinner" /> : <><span>Sign In</span><FaArrowRight /></>}
            </button>
          </form>
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
