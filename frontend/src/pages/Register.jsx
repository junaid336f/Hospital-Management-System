import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registerUser } from '../services/api'
import { toast } from 'react-toastify'
import { FaHospital, FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa'
import './Auth.css'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', gender: 'male' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all required fields'); return }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await registerUser({ name: form.name, email: form.email, password: form.password, phone: form.phone, gender: form.gender })
      login(data.user, data.token)
      toast.success(`Welcome to MediCare, ${data.user.name.split(' ')[0]}!`)
      navigate('/patient/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
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
            <h1>Create Account</h1>
            <p>Join MediCare Plus as a patient</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="reg-name">Full Name *</label>
                <div className="input-icon-wrap">
                  <FaUser className="input-icon" />
                  <input id="reg-name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="form-control with-icon" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-phone">Phone Number</label>
                <div className="input-icon-wrap">
                  <FaPhone className="input-icon" />
                  <input id="reg-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="03XX-XXXXXXX" className="form-control with-icon" />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reg-email">Email Address *</label>
              <div className="input-icon-wrap">
                <FaEnvelope className="input-icon" />
                <input id="reg-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="form-control with-icon" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="reg-gender">Gender</label>
              <select id="reg-gender" name="gender" value={form.gender} onChange={handleChange} className="form-control">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="reg-password">Password *</label>
                <div className="input-icon-wrap">
                  <FaLock className="input-icon" />
                  <input id="reg-password" type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" className="form-control with-icon with-icon-right" required />
                  <button type="button" className="icon-right" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password *</label>
                <div className="input-icon-wrap">
                  <FaLock className="input-icon" />
                  <input id="reg-confirm" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="form-control with-icon" required />
                </div>
              </div>
            </div>
            <button id="register-submit" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? <div className="btn-spinner" /> : <><span>Create Account</span><FaArrowRight /></>}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
