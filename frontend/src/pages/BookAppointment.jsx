import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDoctorById, bookAppointment } from '../services/api'
import { toast } from 'react-toastify'
import { FaCalendarAlt, FaClock, FaMoneyBillWave, FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import './BookAppointment.css'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export default function BookAppointment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [success, setSuccess] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])

  useEffect(() => {
    getDoctorById(id).then(r => setDoctor(r.data)).catch(() => toast.error('Doctor not found')).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!selectedDate || !doctor) { setAvailableSlots([]); setSelectedSlot(''); return }
    const dayName = DAYS[new Date(selectedDate + 'T12:00:00').getDay()]
    const found = doctor.availableSlots?.find(s => s.day === dayName)
    setAvailableSlots(found ? found.slots : [])
    setSelectedSlot('')
  }, [selectedDate, doctor])

  const minDate = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const handleSubmit = async e => {
    e.preventDefault()
    if (!selectedDate) { toast.error('Please select a date'); return }
    if (!selectedSlot) { toast.error('Please select a time slot'); return }
    setSubmitting(true)
    try {
      await bookAppointment({ doctorId: id, appointmentDate: selectedDate, timeSlot: selectedSlot, symptoms })
      setSuccess(true)
      toast.success('Appointment booked successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  if (!doctor?.isAvailable) {
    return (
      <div className="book-page page-wrapper">
        <div className="container" style={{ paddingTop: '120px' }}>
          <div className="empty-state">
            <div className="icon">🩺</div>
            <h3>Doctor Unavailable</h3>
            <p>This doctor is not accepting appointments right now.</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/doctors')}>Browse Other Doctors</button>
          </div>
        </div>
      </div>
    )
  }

  if (success) return (
    <div className="book-page page-wrapper">
      <div className="success-screen">
        <div className="success-icon"><FaCheckCircle /></div>
        <h2>Appointment Booked!</h2>
        <p>Your appointment with <strong>{doctor?.userId?.name}</strong> on <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong> has been confirmed.</p>
        <div className="success-actions">
          <button className="btn btn-primary" onClick={() => navigate('/patient/dashboard')}>View My Appointments</button>
          <button className="btn btn-outline" onClick={() => navigate('/doctors')}>Book Another</button>
        </div>
      </div>
    </div>
  )

  const selectedDayName = selectedDate ? DAYS[new Date(selectedDate + 'T12:00:00').getDay()] : ''

  return (
    <div className="book-page page-wrapper">
      <div className="container" style={{ paddingTop: '32px' }}>
        <button className="btn btn-outline btn-sm" style={{ marginBottom: '24px' }} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <div className="book-grid">
          {/* Doctor Card */}
          <div className="book-sidebar">
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--text-secondary)' }}>Booking Appointment With</h3>
              <div className="book-doc-info">
                <div className="avatar avatar-lg" style={{ background: 'var(--gradient-primary)', flexShrink: 0 }}>
                  {doctor?.userId?.name?.split(' ').filter(p => p !== 'Dr.').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h2 style={{ fontSize: '20px' }}>{doctor?.userId?.name}</h2>
                  <p style={{ color: 'var(--purple-light)', fontSize: '13px', fontWeight: 600 }}>{doctor?.specialization}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{doctor?.qualification}</p>
                </div>
              </div>
              <div className="book-meta">
                <div className="book-meta-item"><FaMoneyBillWave style={{ color: 'var(--green)' }} /><span>Consultation Fee: <strong>Rs. {doctor?.fees}</strong></span></div>
                <div className="book-meta-item"><FaClock style={{ color: 'var(--cyan)' }} /><span>Duration: <strong>30 Minutes</strong></span></div>
              </div>
              <div className="info-box info" style={{ marginTop: '12px' }}>
                <strong>Note:</strong> Your appointment is pending approval by the doctor. You will be notified once confirmed.
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="book-main">
            <div className="card">
              <h2 style={{ marginBottom: '24px' }}><FaCalendarAlt /> Select Date & Time</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="form-group">
                  <label htmlFor="appt-date">Appointment Date *</label>
                  <input id="appt-date" type="date" className="form-control" value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={minDate} max={maxDate} required />
                  {selectedDate && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Selected: {selectedDayName}, {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>}
                </div>

                {selectedDate && (
                  <div className="form-group">
                    <label>Available Time Slots *</label>
                    {availableSlots.length === 0 ? (
                      <div className="info-box warning">No available slots on {selectedDayName}. Please select a different date.</div>
                    ) : (
                      <div className="slots-grid">
                        {availableSlots.map((slot, i) => (
                          <button key={i} type="button"
                            className={`slot-option ${selectedSlot === slot ? 'selected' : ''}`}
                            onClick={() => setSelectedSlot(slot)}>
                            <FaClock />{slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="symptoms">Symptoms / Reason for Visit</label>
                  <textarea id="symptoms" className="form-control" rows="4" value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    placeholder="Describe your symptoms or reason for the appointment..." />
                </div>

                <button id="book-submit" type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} disabled={submitting || !selectedSlot}>
                  {submitting ? <div className="btn-spinner" /> : <><FaCalendarAlt /> Confirm Appointment</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
