import axios from 'axios'

const API = axios.create({ baseURL: '/api' })

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const registerUser = (data) => API.post('/auth/register', data)
export const loginUser = (data) => API.post('/auth/login', data)
export const getMe = () => API.get('/auth/me')

// Doctors
export const getDoctors = (params) => API.get('/doctors', { params })
export const getDoctorById = (id) => API.get(`/doctors/${id}`)
export const getMyDoctorProfile = () => API.get('/doctors/my-profile')
export const updateMyDoctorProfile = (data) => API.put('/doctors/my-profile', data)
export const getAllDoctorsAdmin = () => API.get('/doctors/admin-all')

// Appointments
export const bookAppointment = (data) => API.post('/appointments', data)
export const getMyAppointments = () => API.get('/appointments/my')
export const getDoctorAppointments = () => API.get('/appointments/doctor')
export const getAllAppointments = () => API.get('/appointments/all')
export const updateAppointmentStatus = (id, data) => API.put(`/appointments/${id}/status`, data)
export const cancelAppointment = (id) => API.put(`/appointments/${id}/cancel`)

// Admin
export const getStats = () => API.get('/admin/stats')
export const getAllPatients = () => API.get('/admin/patients')
export const addDoctor = (data) => API.post('/admin/doctors', data)
export const updateDoctor = (id, data) => API.put(`/admin/doctors/${id}`, data)
export const deleteDoctor = (id) => API.delete(`/admin/doctors/${id}`)
export const getAdminAppointments = () => API.get('/admin/appointments')
export const updateAdminAppointmentStatus = (id, data) => API.put(`/admin/appointments/${id}/status`, data)

// Patient
export const getPatientProfile = () => API.get('/patients/profile')
export const updatePatientProfile = (data) => API.put('/patients/profile', data)

export default API
