import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { getMe } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (!token || !savedUser) {
      setLoading(false)
      return
    }
    try {
      const parsed = JSON.parse(savedUser)
      setUser(parsed)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      getMe()
        .then(({ data }) => {
          const next = { _id: data._id, name: data.name, email: data.email, role: data.role, phone: data.phone, doctorId: data.doctorId }
          setUser(next)
          localStorage.setItem('user', JSON.stringify(next))
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          delete axios.defaults.headers.common['Authorization']
          setUser(null)
        })
        .finally(() => setLoading(false))
    } catch {
      setLoading(false)
    }
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
