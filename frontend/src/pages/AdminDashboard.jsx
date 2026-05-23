import { useState, useEffect } from 'react'
import { getStats, getAllPatients, getAllDoctorsAdmin, getAdminAppointments, addDoctor, updateDoctor, deleteDoctor, updateAdminAppointmentStatus } from '../services/api'
import { toast } from 'react-toastify'
import { FaUserMd, FaUsers, FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaTachometerAlt, FaHospital } from 'react-icons/fa'
import './Dashboard.css'

const statusBadge = (status) => <span className={`badge badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>

const INIT_DOCTOR = { name: '', email: '', password: 'doctor123', phone: '', gender: 'male', specialization: '', qualification: '', experience: '', fees: '', hospital: 'City General Hospital', about: '' }
const SPECS = ['Cardiologist','Neurologist','Pediatrician','Orthopedic','Dermatologist','General Physician','Psychiatrist','Ophthalmologist','ENT Specialist','Urologist']

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDoctor, setShowAddDoctor] = useState(false)
  const [doctorForm, setDoctorForm] = useState(INIT_DOCTOR)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [searchPatient, setSearchPatient] = useState('')
  const [searchDoctor, setSearchDoctor] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [statsRes, patientsRes, doctorsRes, apptRes] = await Promise.all([
        getStats(), getAllPatients(), getAllDoctorsAdmin(), getAdminAppointments()
      ])
      setStats(statsRes.data)
      setPatients(patientsRes.data)
      setDoctors(doctorsRes.data)
      setAppointments(apptRes.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const handleAddDoctor = async e => {
    e.preventDefault()
    setFormLoading(true)
    try {
      await addDoctor(doctorForm)
      toast.success('Doctor added successfully!')
      setShowAddDoctor(false)
      setDoctorForm(INIT_DOCTOR)
      fetchAll()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add doctor') }
    finally { setFormLoading(false) }
  }

  const handleEditDoctor = async e => {
    e.preventDefault()
    setFormLoading(true)
    try {
      await updateDoctor(editingDoctor._id, { specialization: doctorForm.specialization, qualification: doctorForm.qualification, experience: doctorForm.experience, fees: doctorForm.fees, hospital: doctorForm.hospital, about: doctorForm.about })
      toast.success('Doctor updated!')
      setEditingDoctor(null)
      setDoctorForm(INIT_DOCTOR)
      fetchAll()
    } catch { toast.error('Failed to update doctor') }
    finally { setFormLoading(false) }
  }

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Remove this doctor?')) return
    try { await deleteDoctor(id); toast.success('Doctor removed'); fetchAll() }
    catch { toast.error('Failed to remove doctor') }
  }

  const handleApptStatus = async (id, status) => {
    try { await updateAdminAppointmentStatus(id, { status }); toast.success(`Appointment ${status}`); fetchAll() }
    catch { toast.error('Failed to update') }
  }

  const openEdit = (doc) => {
    setEditingDoctor(doc)
    setDoctorForm({ ...doctorForm, specialization: doc.specialization, qualification: doc.qualification, experience: doc.experience, fees: doc.fees, hospital: doc.hospital || '', about: doc.about || '' })
  }

  const getInitials = (name) => name ? name.split(' ').filter(p => p !== 'Dr.').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  const filteredPatients = patients.filter(p => p.name?.toLowerCase().includes(searchPatient.toLowerCase()) || p.email?.toLowerCase().includes(searchPatient.toLowerCase()))
  const filteredDoctors = doctors.filter(d => d.userId?.name?.toLowerCase().includes(searchDoctor.toLowerCase()) || d.specialization?.toLowerCase().includes(searchDoctor.toLowerCase()))

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>

  return (
    <div className="dashboard page-wrapper">
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        {/* Header */}
        <div className="dash-header">
          <div className="dash-welcome">
            <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>A</div>
            <div><h1><span className="gradient-text">Admin Panel</span></h1><p>Manage the entire hospital system</p></div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="dash-stats">
            {[
              { icon: <FaUsers />, val: stats.totalPatients, label: 'Patients', color: '#7c3aed' },
              { icon: <FaUserMd />, val: stats.totalDoctors, label: 'Doctors', color: '#06b6d4' },
              { icon: <FaCalendarAlt />, val: stats.totalAppointments, label: 'Total Appts', color: '#10b981' },
              { icon: <FaHospital />, val: stats.pendingAppointments, label: 'Pending Appts', color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
                <div className="stat-info"><h3 style={{ color: s.color }}>{s.val}</h3><p>{s.label}</p></div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          {[
            { id: 'overview', icon: <FaTachometerAlt />, label: 'Overview' },
            { id: 'doctors', icon: <FaUserMd />, label: 'Doctors' },
            { id: 'patients', icon: <FaUsers />, label: 'Patients' },
            { id: 'appointments', icon: <FaCalendarAlt />, label: 'Appointments' },
          ].map(t => (
            <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Appointment Status</h3>
              {[
                { label: 'Pending', val: stats.pendingAppointments, color: 'var(--orange)' },
                { label: 'Completed', val: stats.completedAppointments, color: 'var(--green)' },
                { label: 'Cancelled', val: stats.cancelledAppointments, color: 'var(--red)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color, fontSize: '18px' }}>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Recent Appointments</h3>
              {appointments.slice(0, 5).map(appt => (
                <div key={appt._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{appt.patient?.name}</p>
                    <p style={{ color: 'var(--text-muted)' }}>{appt.doctor?.userId?.name} · {appt.timeSlot}</p>
                  </div>
                  {statusBadge(appt.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {tab === 'doctors' && (
          <div>
            <div className="section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h2>Manage Doctors ({filteredDoctors.length})</h2>
                <input className="form-control" style={{ width: 220, padding: '8px 12px', fontSize: '13px' }} placeholder="Search doctors..." value={searchDoctor} onChange={e => setSearchDoctor(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setShowAddDoctor(true); setDoctorForm(INIT_DOCTOR) }}><FaPlus /> Add Doctor</button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Doctor</th><th>Specialization</th><th>Experience</th><th>Fees</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredDoctors.map((doc, i) => (
                    <tr key={doc._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ background: ['#7c3aed','#06b6d4','#10b981','#f59e0b'][i%4], width: 36, height: 36, fontSize: 13 }}>{getInitials(doc.userId?.name)}</div>
                          <div><p style={{ fontWeight: 600, fontSize: '14px' }}>{doc.userId?.name}</p><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.userId?.email}</p></div>
                        </div>
                      </td>
                      <td><span className="badge" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--purple-light)', border: '1px solid rgba(124,58,237,0.3)' }}>{doc.specialization}</span></td>
                      <td>{doc.experience} yrs</td>
                      <td>Rs. {doc.fees}</td>
                      <td><span className={`badge ${doc.isAvailable ? 'badge-approved' : 'badge-cancelled'}`}>{doc.isAvailable ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(doc)}><FaEdit /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDoctor(doc._id)}><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {tab === 'patients' && (
          <div>
            <div className="section-header">
              <h2>All Patients ({filteredPatients.length})</h2>
              <input className="form-control" style={{ width: 220, padding: '8px 12px', fontSize: '13px' }} placeholder="Search patients..." value={searchPatient} onChange={e => setSearchPatient(e.target.value)} />
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Patient</th><th>Email</th><th>Phone</th><th>Gender</th><th>Joined</th></tr></thead>
                <tbody>
                  {filteredPatients.map((p, i) => (
                    <tr key={p._id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar" style={{ background: ['#7c3aed','#06b6d4','#10b981','#f59e0b'][i%4], width: 36, height: 36, fontSize: 13 }}>{getInitials(p.name)}</div>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</span>
                      </div></td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{p.email}</td>
                      <td style={{ fontSize: '13px' }}>{p.phone || '—'}</td>
                      <td style={{ fontSize: '13px', textTransform: 'capitalize' }}>{p.gender}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div>
            <div className="section-header"><h2>All Appointments ({appointments.length})</h2></div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {appointments.map(appt => (
                    <tr key={appt._id}>
                      <td style={{ fontSize: '14px', fontWeight: 600 }}>{appt.patient?.name}</td>
                      <td>
                        <div><p style={{ fontSize: '14px', fontWeight: 600 }}>{appt.doctor?.userId?.name}</p><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{appt.doctor?.specialization}</p></div>
                      </td>
                      <td>
                        <div><p style={{ fontSize: '13px' }}>{new Date(appt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p><p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{appt.timeSlot}</p></div>
                      </td>
                      <td>{statusBadge(appt.status)}</td>
                      <td>
                        {appt.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn btn-success btn-sm" onClick={() => handleApptStatus(appt._id, 'approved')}><FaCheckCircle /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleApptStatus(appt._id, 'cancelled')}><FaTimesCircle /></button>
                          </div>
                        )}
                        {appt.status !== 'pending' && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Doctor Modal */}
        {(showAddDoctor || editingDoctor) && (
          <div className="modal-overlay" onClick={() => { setShowAddDoctor(false); setEditingDoctor(null) }}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
                <button className="modal-close" onClick={() => { setShowAddDoctor(false); setEditingDoctor(null) }}>✕</button>
              </div>
              <form onSubmit={editingDoctor ? handleEditDoctor : handleAddDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {!editingDoctor && (
                  <>
                    <div className="grid-2">
                      <div className="form-group"><label>Full Name *</label><input className="form-control" value={doctorForm.name} onChange={e => setDoctorForm({ ...doctorForm, name: e.target.value })} placeholder="Dr. Full Name" required /></div>
                      <div className="form-group"><label>Email *</label><input type="email" className="form-control" value={doctorForm.email} onChange={e => setDoctorForm({ ...doctorForm, email: e.target.value })} placeholder="doctor@hospital.com" required /></div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group"><label>Password</label><input className="form-control" value={doctorForm.password} onChange={e => setDoctorForm({ ...doctorForm, password: e.target.value })} placeholder="doctor123" /></div>
                      <div className="form-group"><label>Phone</label><input className="form-control" value={doctorForm.phone} onChange={e => setDoctorForm({ ...doctorForm, phone: e.target.value })} placeholder="03XX-XXXXXXX" /></div>
                    </div>
                    <div className="form-group"><label>Gender</label><select className="form-control" value={doctorForm.gender} onChange={e => setDoctorForm({ ...doctorForm, gender: e.target.value })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                  </>
                )}
                <div className="form-group"><label>Specialization *</label><select className="form-control" value={doctorForm.specialization} onChange={e => setDoctorForm({ ...doctorForm, specialization: e.target.value })} required><option value="">Select Specialization</option>{SPECS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="form-group"><label>Qualification *</label><input className="form-control" value={doctorForm.qualification} onChange={e => setDoctorForm({ ...doctorForm, qualification: e.target.value })} placeholder="MBBS, MD..." required /></div>
                <div className="grid-2">
                  <div className="form-group"><label>Experience (years) *</label><input type="number" className="form-control" value={doctorForm.experience} onChange={e => setDoctorForm({ ...doctorForm, experience: e.target.value })} placeholder="5" required min="0" /></div>
                  <div className="form-group"><label>Consultation Fee (Rs.) *</label><input type="number" className="form-control" value={doctorForm.fees} onChange={e => setDoctorForm({ ...doctorForm, fees: e.target.value })} placeholder="1500" required min="0" /></div>
                </div>
                <div className="form-group"><label>Hospital</label><input className="form-control" value={doctorForm.hospital} onChange={e => setDoctorForm({ ...doctorForm, hospital: e.target.value })} placeholder="Hospital name" /></div>
                <div className="form-group"><label>About / Bio</label><textarea className="form-control" rows="3" value={doctorForm.about} onChange={e => setDoctorForm({ ...doctorForm, about: e.target.value })} placeholder="Brief description about the doctor..." /></div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} disabled={formLoading}>
                  {formLoading ? <div className="btn-spinner" /> : <>{editingDoctor ? <><FaEdit /> Update Doctor</> : <><FaPlus /> Add Doctor</>}</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
