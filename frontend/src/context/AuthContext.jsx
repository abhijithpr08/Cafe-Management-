import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import apiClient from '../api/apiClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('restropos-user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch (error) {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('restropos-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('restropos-user')
    }
  }, [user])

  const login = async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username: username.trim(),
        password,
      })

      const sessionUser = {
        _id: response.data.user._id,
        username: response.data.user.username,
        role: response.data.user.role,
        name: response.data.user.name,
        email: response.data.user.email,
      }

      setUser(sessionUser)

      return {
        success: true,
        user: sessionUser,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid username or password',
      }
    }
  }

  const logout = () => {
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
