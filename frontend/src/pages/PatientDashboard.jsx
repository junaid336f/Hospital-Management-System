import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyAppointments, cancelAppointment, getPatientProfile, updatePatientProfile } from '../services/api'
import { toast } from 'react-toastify'
import { FaCalendarAlt, FaUserMd, FaClock, FaTimesCircle, FaUser, FaEdit, FaSave, FaHistory, FaPlus } from 'react-icons/fa'
import './Dashboard.css'

const statusBadge = (status) => <span className={`badge badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>

export default function PatientDashboard() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('appointments')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAppointments()
    fetchProfile()
  }, [])

  const fetchAppointments = async () => {
    try {
      const { data } = await getMyAppointments()
      setAppointments(data)
    } catch (err) { toast.error('Failed to load appointments') }
    finally { setLoading(false) }
  }

  const fetchProfile = async () => {
    try {
      const { data } = await getPatientProfile()
      setProfile(data)
      setProfileForm({ name: data.name, phone: data.phone, address: data.address, gender: data.gender })
    } catch {}
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await cancelAppointment(id)
      toast.success('Appointment cancelled')
      fetchAppointments()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel') }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await updatePatientProfile(profileForm)
      setProfile(data)
      updateUser({ ...user, name: data.name, phone: data.phone })
      setEditing(false)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  const upcoming = appointments.filter(a => ['pending','approved'].includes(a.status))
  const past = appointments.filter(a => ['completed','cancelled'].includes(a.status))

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return (
    <div className="dashboard page-wrapper">
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        {/* Header */}
        <div className="dash-header">
          <div className="dash-welcome">
            <div className="avatar avatar-lg">{getInitials(user?.name)}</div>
            <div>
              <h1>Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!</h1>
              <p>Manage your appointments and health records</p>
            </div>
          </div>
          <Link to="/doctors" className="btn btn-primary"><FaPlus /> Book Appointment</Link>
        </div>

        {/* Quick Stats */}
        <div className="dash-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--purple-light)' }}><FaCalendarAlt /></div>
            <div className="stat-info"><h3>{appointments.length}</h3><p>Total Appointments</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--cyan)' }}><FaClock /></div>
            <div className="stat-info"><h3>{upcoming.length}</h3><p>Upcoming</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--green)' }}><FaHistory /></div>
            <div className="stat-info"><h3>{past.filter(a => a.status === 'completed').length}</h3><p>Completed</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}><FaTimesCircle /></div>
            <div className="stat-info"><h3>{past.filter(a => a.status === 'cancelled').length}</h3><p>Cancelled</p></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button id="tab-appointments" className={`tab-btn ${tab === 'appointments' ? 'active' : ''}`} onClick={() => setTab('appointments')}><FaCalendarAlt /> Appointments</button>
          <button id="tab-profile" className={`tab-btn ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><FaUser /> My Profile</button>
        </div>

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div>
            {loading ? <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> :
             appointments.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📅</div>
                <h3>No Appointments Yet</h3>
                <p>Book your first appointment with a specialist</p>
                <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '16px' }}>Find Doctors</Link>
              </div>
            ) : (
              <div className="appt-list">
                {appointments.map(appt => (
                  <div key={appt._id} className="appt-card">
                    <div className="appt-left">
                      <div className="avatar" style={{ background: 'var(--gradient-primary)', flexShrink: 0 }}>
                        {getInitials(appt.doctor?.userId?.name)}
                      </div>
                      <div className="appt-info">
                        <h3>{appt.doctor?.userId?.name || 'Doctor'}</h3>
                        <p className="appt-spec">{appt.doctor?.specialization}</p>
                        <div className="appt-meta">
                          <span><FaCalendarAlt /> {new Date(appt.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span><FaClock /> {appt.timeSlot}</span>
                        </div>
                        {appt.symptoms && <p className="appt-symptoms">Symptoms: {appt.symptoms}</p>}
                        {appt.prescription && <div className="prescription-box"><strong>Prescription:</strong> {appt.prescription}</div>}
                      </div>
                    </div>
                    <div className="appt-right">
                      {statusBadge(appt.status)}
                      {['pending','approved'].includes(appt.status) && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt._id)}>
                          <FaTimesCircle /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {tab === 'profile' && profile && (
          <div className="card" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2><FaUser /> My Profile</h2>
              {!editing ?
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><FaEdit /> Edit</button> :
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <div className="btn-spinner" style={{ width: 14, height: 14 }} /> : <><FaSave /> Save</>}
                  </button>
                </div>
              }
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Full Name', field: 'name', type: 'text' },
                { label: 'Phone', field: 'phone', type: 'tel' },
                { label: 'Address', field: 'address', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field} className="form-group">
                  <label>{label}</label>
                  {editing ?
                    <input type={type} className="form-control" value={profileForm[field] || ''} onChange={e => setProfileForm({ ...profileForm, [field]: e.target.value })} /> :
                    <div className="profile-value">{profile[field] || <span style={{ color: 'var(--text-muted)' }}>Not set</span>}</div>
                  }
                </div>
              ))}
              <div className="form-group">
                <label>Gender</label>
                {editing ?
                  <select className="form-control" value={profileForm.gender || 'male'} onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select> :
                  <div className="profile-value" style={{ textTransform: 'capitalize' }}>{profile.gender || 'Not set'}</div>
                }
              </div>
              <div className="form-group">
                <label>Email</label>
                <div className="profile-value">{profile.email}</div>
              </div>
              <div className="form-group">
                <label>Role</label>
                <div className="profile-value" style={{ textTransform: 'capitalize' }}>{profile.role}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
