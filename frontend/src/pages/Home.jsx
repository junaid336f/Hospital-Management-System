import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaHeartbeat, FaUserMd, FaCalendarCheck, FaShieldAlt, FaStar, FaArrowRight, FaHospital, FaStethoscope, FaBrain, FaBone, FaAllergies, FaChild } from 'react-icons/fa'
import './Home.css'

const stats = [
  { icon: <FaUserMd />, value: '50+', label: 'Expert Doctors', color: '#7c3aed' },
  { icon: <FaCalendarCheck />, value: '10K+', label: 'Appointments', color: '#06b6d4' },
  { icon: <FaHeartbeat />, value: '15K+', label: 'Patients Served', color: '#10b981' },
  { icon: <FaStar />, value: '4.9', label: 'Average Rating', color: '#f59e0b' },
]

const specialties = [
  { icon: <FaHeartbeat />, name: 'Cardiology', desc: 'Heart & Vascular Care', color: '#ef4444' },
  { icon: <FaBrain />, name: 'Neurology', desc: 'Brain & Nervous System', color: '#8b5cf6' },
  { icon: <FaChild />, name: 'Pediatrics', desc: "Children's Health", color: '#06b6d4' },
  { icon: <FaBone />, name: 'Orthopedics', desc: 'Bone & Joint Care', color: '#f59e0b' },
  { icon: <FaAllergies />, name: 'Dermatology', desc: 'Skin & Hair Care', color: '#10b981' },
  { icon: <FaStethoscope />, name: 'General', desc: 'Primary Healthcare', color: '#7c3aed' },
]

const steps = [
  { num: '01', title: 'Create Account', desc: 'Register as a patient in under 2 minutes with your basic information.' },
  { num: '02', title: 'Find a Doctor', desc: 'Browse our specialists filtered by department, rating, and availability.' },
  { num: '03', title: 'Book Appointment', desc: 'Select your preferred date and time slot that fits your schedule.' },
  { num: '04', title: 'Get Treated', desc: 'Visit the doctor and receive expert medical care and prescription.' },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb-1" />
          <div className="hero-orb orb-2" />
          <div className="hero-orb orb-3" />
          <div className="hero-grid" />
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaShieldAlt /> <span>Trusted Healthcare Platform</span>
            </div>
            <h1 className="hero-title">
              Your Health,<br />
              <span className="gradient-text">Our Priority</span>
            </h1>
            <p className="hero-subtitle">
              Connect with top-rated doctors, book appointments instantly, and manage your healthcare journey — all in one place.
            </p>
            <div className="hero-actions">
              {user ? (
                <button className="btn btn-primary btn-lg" onClick={() => navigate(user.role === 'patient' ? '/patient/dashboard' : user.role === 'doctor' ? '/doctor/dashboard' : '/admin/dashboard')}>
                  Go to Dashboard <FaArrowRight />
                </button>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">Get Started <FaArrowRight /></Link>
                  <Link to="/doctors" className="btn btn-outline btn-lg">View Doctors</Link>
                </>
              )}
            </div>
            <div className="hero-trust">
              <div className="trust-avatars">
                {['S','A','F','O'].map((l, i) => (
                  <div key={i} className="trust-avatar" style={{ zIndex: 4 - i }}>{l}</div>
                ))}
              </div>
              <p><strong>15,000+</strong> patients trust us</p>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card main-card card-glass">
              <div className="hcard-header">
                <div className="pulse-dot" />
                <span>Live Health Monitor</span>
              </div>
              <div className="health-metrics">
                <div className="metric"><span className="metric-label">Heart Rate</span><span className="metric-val" style={{ color: '#ef4444' }}>72 BPM</span></div>
                <div className="metric"><span className="metric-label">Blood Pressure</span><span className="metric-val" style={{ color: '#06b6d4' }}>120/80</span></div>
                <div className="metric"><span className="metric-label">SpO2</span><span className="metric-val" style={{ color: '#10b981' }}>98%</span></div>
              </div>
              <div className="waveform">
                {[20,40,60,30,80,50,70,35,55,45,65,40,20,50,75,30,60,45,55,40].map((h, i) => (
                  <div key={i} className="wave-bar" style={{ height: h + '%', animationDelay: i * 0.05 + 's' }} />
                ))}
              </div>
            </div>
            <div className="floating-card fc-1 card-glass">
              <FaCalendarCheck style={{ color: '#10b981' }} />
              <div><p className="fc-title">Next Appointment</p><p className="fc-val">Today, 3:00 PM</p></div>
            </div>
            <div className="floating-card fc-2 card-glass">
              <FaUserMd style={{ color: '#7c3aed' }} />
              <div><p className="fc-title">Dr. Sarah Khan</p><p className="fc-val">Cardiologist</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}>
                  {s.icon}
                </div>
                <div className="stat-info">
                  <h3 style={{ color: s.color }}>{s.value}</h3>
                  <p>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="section specialties-section">
        <div className="container">
          <p className="section-label">What We Offer</p>
          <h2 className="section-title">Medical <span className="gradient-text">Specialties</span></h2>
          <p className="section-subtitle">World-class care across all major medical disciplines</p>
          <div className="specialties-grid">
            {specialties.map((sp, i) => (
              <Link to="/doctors" key={i} className="specialty-card">
                <div className="specialty-icon" style={{ background: sp.color + '20', color: sp.color }}>
                  {sp.icon}
                </div>
                <h3>{sp.name}</h3>
                <p>{sp.desc}</p>
                <div className="specialty-arrow"><FaArrowRight /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section how-section">
        <div className="container">
          <p className="section-label">Simple Process</p>
          <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
          <p className="section-subtitle">Get expert medical care in 4 simple steps</p>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <div key={i} className="step-card">
                <div className="step-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < steps.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-glow" />
            <FaHospital className="cta-icon" />
            <h2>Ready to Take Control of Your Health?</h2>
            <p>Join thousands of patients who trust MediCare Plus for their healthcare needs.</p>
            <div className="cta-actions">
              {user ? (
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/doctors')}>Book Appointment</button>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
                  <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-brand">
            <div className="brand-icon"><FaHospital /></div>
            <span className="brand-name">Medi<span>Care</span></span>
          </div>
          <p className="footer-text">© 2024 MediCare Plus. All rights reserved. Providing quality healthcare solutions.</p>
        </div>
      </footer>
    </div>
  )
}
