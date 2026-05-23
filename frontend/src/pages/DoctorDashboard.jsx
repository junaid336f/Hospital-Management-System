import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getDoctorAppointments, updateAppointmentStatus, getMyDoctorProfile, updateMyDoctorProfile } from '../services/api'
import { toast } from 'react-toastify'
import { FaCalendarAlt, FaUser, FaClock, FaCheckCircle, FaTimesCircle, FaEdit, FaSave, FaStethoscope, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import './Dashboard.css'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const ALL_SLOTS = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM']

const statusBadge = (status) => <span className={`badge badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('appointments')
  const [appointments, setAppointments] = useState([])
  const [doctorProfile, setDoctorProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingSchedule, setEditingSchedule] = useState(false)
  const [scheduleForm, setScheduleForm] = useState([])
  const [saving, setSaving] = useState(false)
  const [prescription, setPrescription] = useState({})

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [apptRes, profileRes] = await Promise.all([getDoctorAppointments(), getMyDoctorProfile()])
      setAppointments(apptRes.data)
      setDoctorProfile(profileRes.data)
      setScheduleForm(profileRes.data.availableSlots || [])
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const handleStatusUpdate = async (id, status, pres = '') => {
    try {
      await updateAppointmentStatus(id, { status, prescription: pres })
      toast.success(`Appointment ${status}`)
      fetchAll()
    } catch { toast.error('Update failed') }
  }

  const toggleSlot = (day, slot) => {
    setScheduleForm(prev => prev.map(d => {
      if (d.day !== day) return d
      const slots = d.slots.includes(slot) ? d.slots.filter(s => s !== slot) : [...d.slots, slot]
      return { ...d, slots }
    }))
  }

  const toggleDay = (day) => {
    setScheduleForm(prev => {
      const exists = prev.find(d => d.day === day)
      if (exists) return prev.filter(d => d.day !== day)
      return [...prev, { day, slots: ['09:00 AM', '10:00 AM', '11:00 AM'] }]
    })
  }

  const handleSaveSchedule = async () => {
    setSaving(true)
    try {
      await updateMyDoctorProfile({ availableSlots: scheduleForm, isAvailable: doctorProfile.isAvailable, fees: doctorProfile.fees, about: doctorProfile.about })
      toast.success('Schedule updated!')
      setEditingSchedule(false)
      fetchAll()
    } catch { toast.error('Failed to save schedule') }
    finally { setSaving(false) }
  }

  const toggleAvailability = async () => {
    try {
      await updateMyDoctorProfile({ availableSlots: doctorProfile.availableSlots, isAvailable: !doctorProfile.isAvailable, fees: doctorProfile.fees, about: doctorProfile.about })
      toast.success(`You are now ${!doctorProfile.isAvailable ? 'available' : 'unavailable'}`)
      fetchAll()
    } catch { toast.error('Update failed') }
  }

  const pending = appointments.filter(a => a.status === 'pending')
  const today = appointments.filter(a => a.status === 'approved')
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'P'

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="dashboard page-wrapper">
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        {/* Header */}
        <div className="dash-header">
          <div className="dash-welcome">
            <div className="avatar avatar-lg" style={{ background: 'var(--gradient-primary)' }}>{getInitials(user?.name)}</div>
            <div>
              <h1><span className="gradient-text">{user?.name}</span></h1>
              <p>{doctorProfile?.specialization} · {doctorProfile?.experience} years experience</p>
            </div>
          </div>
          <button className={`btn ${doctorProfile?.isAvailable ? 'btn-success' : 'btn-danger'}`} onClick={toggleAvailability}>
            {doctorProfile?.isAvailable ? <><FaToggleOn /> Available</> : <><FaToggleOff /> Unavailable</>}
          </button>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--purple-light)' }}><FaCalendarAlt /></div>
            <div className="stat-info"><h3>{appointments.length}</h3><p>Total Appointments</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--orange)' }}><FaClock /></div>
            <div className="stat-info"><h3>{pending.length}</h3><p>Pending Requests</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--cyan)' }}><FaCheckCircle /></div>
            <div className="stat-info"><h3>{today.length}</h3><p>Approved</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--green)' }}><FaUser /></div>
            <div className="stat-info"><h3>{appointments.filter(a => a.status === 'completed').length}</h3><p>Completed</p></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab === 'appointments' ? 'active' : ''}`} onClick={() => setTab('appointments')}><FaCalendarAlt /> All Appointments</button>
          <button className={`tab-btn ${tab === 'schedule' ? 'active' : ''}`} onClick={() => setTab('schedule')}><FaEdit /> Manage Schedule</button>
          <button className={`tab-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><FaStethoscope /> Profile</button>
        </div>

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          appointments.length === 0 ? (
            <div className="empty-state"><div className="icon">📋</div><h3>No appointments yet</h3><p>Patients will appear here once they book with you</p></div>
          ) : (
            <div className="appt-list">
              {appointments.map(appt => (
                <div key={appt._id} className="appt-card">
                  <div className="appt-left">
                    <div className="avatar" style={{ background: 'var(--gradient-primary)', flexShrink: 0 }}>{getInitials(appt.patient?.name)}</div>
                    <div className="appt-info">
                      <h3>{appt.patient?.name}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{appt.patient?.phone} · {appt.patient?.email}</p>
                      <div className="appt-meta" style={{ marginTop: '8px' }}>
                        <span><FaCalendarAlt /> {new Date(appt.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span><FaClock /> {appt.timeSlot}</span>
                      </div>
                      {appt.symptoms && <p className="appt-symptoms">Symptoms: {appt.symptoms}</p>}
                      {appt.status === 'approved' && (
                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input className="form-control" style={{ maxWidth: '260px', padding: '8px 12px', fontSize: '13px' }}
                            placeholder="Write prescription..." value={prescription[appt._id] || ''}
                            onChange={e => setPrescription({ ...prescription, [appt._id]: e.target.value })} />
                          <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(appt._id, 'completed', prescription[appt._id] || '')}>
                            <FaCheckCircle /> Complete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="appt-right">
                    {statusBadge(appt.status)}
                    {appt.status === 'pending' && (
                      <div className="status-actions">
                        <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(appt._id, 'approved')}><FaCheckCircle /> Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(appt._id, 'cancelled')}><FaTimesCircle /> Decline</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Schedule Tab */}
        {tab === 'schedule' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Weekly Schedule</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!editingSchedule ?
                  <button className="btn btn-primary btn-sm" onClick={() => setEditingSchedule(true)}><FaEdit /> Edit Schedule</button> :
                  <>
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditingSchedule(false); setScheduleForm(doctorProfile?.availableSlots || []) }}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveSchedule} disabled={saving}>
                      {saving ? <div className="btn-spinner" style={{ width: 14, height: 14 }} /> : <><FaSave /> Save</>}
                    </button>
                  </>
                }
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {DAYS.map(day => {
                const dayData = scheduleForm.find(d => d.day === day)
                const isActive = !!dayData
                return (
                  <div key={day} className="schedule-card">
                    <div className="schedule-day-header">
                      {editingSchedule && (
                        <button className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => toggleDay(day)}>
                          {isActive ? 'Remove Day' : 'Add Day'}
                        </button>
                      )}
                      <span className="schedule-day-name" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{day}</span>
                      {!isActive && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>— Not Available</span>}
                    </div>
                    {isActive && (
                      editingSchedule ? (
                        <div className="slot-edit-grid">
                          {ALL_SLOTS.map(slot => (
                            <button key={slot} className={`slot-toggle ${dayData.slots.includes(slot) ? 'on' : ''}`}
                              onClick={() => toggleSlot(day, slot)}>{slot}</button>
                          ))}
                        </div>
                      ) : (
                        <div className="slots" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {dayData.slots.map((slot, i) => <span key={i} className="slot-badge">{slot}</span>)}
                        </div>
                      )
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && doctorProfile && (
          <div className="card" style={{ maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '20px' }}><FaStethoscope /> Doctor Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Full Name', val: doctorProfile.userId?.name },
                { label: 'Email', val: doctorProfile.userId?.email },
                { label: 'Phone', val: doctorProfile.userId?.phone },
                { label: 'Specialization', val: doctorProfile.specialization },
                { label: 'Qualification', val: doctorProfile.qualification },
                { label: 'Experience', val: doctorProfile.experience + ' years' },
                { label: 'Consultation Fee', val: 'Rs. ' + doctorProfile.fees },
                { label: 'Hospital', val: doctorProfile.hospital },
                { label: 'Rating', val: `⭐ ${Number(doctorProfile.rating).toFixed(1)} (${doctorProfile.totalReviews} reviews)` },
              ].map(({ label, val }) => (
                <div key={label} className="form-group">
                  <label>{label}</label>
                  <div className="profile-value">{val || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
