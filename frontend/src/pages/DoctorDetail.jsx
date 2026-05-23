import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getDoctorById } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FaStar, FaClock, FaMoneyBillWave, FaGraduationCap, FaHospital, FaArrowLeft, FaCalendarAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import './DoctorDetail.css'

const avatarColors = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const getInitials = (name) => name ? name.split(' ').filter(p => p !== 'Dr.').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR'

export default function DoctorDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDoctorById(id).then(r => setDoctor(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>
  if (!doctor) return <div className="page-wrapper container" style={{ paddingTop: '120px' }}><div className="empty-state"><div className="icon">🏥</div><h3>Doctor not found</h3><Link to="/doctors" className="btn btn-primary">Back to Doctors</Link></div></div>

  const colorIdx = Math.abs(doctor._id.charCodeAt(0)) % avatarColors.length

  return (
    <div className="doctor-detail page-wrapper">
      <div className="container" style={{ paddingTop: '32px' }}>
        <button className="btn btn-outline btn-sm back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="detail-grid">
          {/* Left - Profile */}
          <div className="detail-sidebar">
            <div className="card">
              <div className="detail-avatar" style={{ background: avatarColors[colorIdx] }}>
                {getInitials(doctor.userId?.name)}
              </div>
              <h1 className="detail-name">{doctor.userId?.name}</h1>
              <p className="detail-spec">{doctor.specialization}</p>
              <p className="detail-qual"><FaGraduationCap /> {doctor.qualification}</p>

              <div className={`avail-badge ${doctor.isAvailable ? 'available' : 'unavailable'}`}>
                <div className={`avail-dot ${doctor.isAvailable ? 'available' : 'unavailable'}`} />
                {doctor.isAvailable ? 'Available for Appointments' : 'Currently Unavailable'}
              </div>

              <div className="detail-stats">
                <div className="detail-stat">
                  <div className="ds-icon" style={{ color: '#f59e0b' }}><FaStar /></div>
                  <div><p className="ds-val">{Number(doctor.rating).toFixed(1)}</p><p className="ds-label">Rating ({doctor.totalReviews} reviews)</p></div>
                </div>
                <div className="detail-stat">
                  <div className="ds-icon" style={{ color: 'var(--cyan)' }}><FaClock /></div>
                  <div><p className="ds-val">{doctor.experience} Years</p><p className="ds-label">Experience</p></div>
                </div>
                <div className="detail-stat">
                  <div className="ds-icon" style={{ color: 'var(--green)' }}><FaMoneyBillWave /></div>
                  <div><p className="ds-val">Rs. {doctor.fees}</p><p className="ds-label">Consultation Fee</p></div>
                </div>
                <div className="detail-stat">
                  <div className="ds-icon" style={{ color: 'var(--purple-light)' }}><FaHospital /></div>
                  <div><p className="ds-val">{doctor.hospital || 'City General Hospital'}</p><p className="ds-label">Hospital</p></div>
                </div>
              </div>

              {doctor.userId?.email && (
                <div className="contact-info">
                  <div className="contact-item"><FaEnvelope /><span>{doctor.userId.email}</span></div>
                  {doctor.userId?.phone && <div className="contact-item"><FaPhone /><span>{doctor.userId.phone}</span></div>}
                </div>
              )}

              {user?.role === 'patient' && doctor.isAvailable && (
                <Link to={`/book/${doctor._id}`} className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center', marginTop: '16px' }}>
                  <FaCalendarAlt /> Book Appointment
                </Link>
              )}
              {!user && (
                <Link to="/login" className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center', marginTop: '16px' }}>
                  Login to Book
                </Link>
              )}
            </div>
          </div>

          {/* Right - Details */}
          <div className="detail-main">
            {doctor.about && (
              <div className="card detail-section">
                <h2>About Dr. {doctor.userId?.name?.split(' ').slice(1).join(' ')}</h2>
                <p className="about-text">{doctor.about}</p>
              </div>
            )}

            <div className="card detail-section">
              <h2><FaCalendarAlt /> Available Schedule</h2>
              {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                <div className="schedule-grid">
                  {doctor.availableSlots.map((s, i) => (
                    <div key={i} className="schedule-day">
                      <div className="day-name">{s.day}</div>
                      <div className="slots">
                        {s.slots.map((slot, j) => (
                          <span key={j} className="slot-badge">{slot}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No schedule set</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
