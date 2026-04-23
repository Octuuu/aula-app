import React, { createContext, useState, useContext, useEffect } from 'react'
import { getSession, clearSession, setSession } from '../config/supabase'
import { checkCedulaAccess } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    console.log('📀 Verificando sesión guardada:', session)
    if (session) {
      setUser(session.userData)
      console.log('👤 Usuario restaurado:', session.userData)
    }
    setLoading(false)
  }, [])

  const login = async (cedula) => {
    try {
      console.log('🔐 Login iniciado con cédula:', cedula)
      const result = await checkCedulaAccess(cedula)
      
      console.log('📊 Resultado de checkCedulaAccess:', result)
      
      if (!result.exists) {
        console.log('❌ Cédula no encontrada')
        return { success: false, error: 'Cédula no encontrada' }
      }
      
      const userData = {
        cedula,
        role: result.role,
        nombre: result.nombre,
        apellido: result.apellido,
        data: result.data
      }
      
      console.log('✅ Usuario creado:', userData)
      console.log('🎯 Rol:', userData.role)
      
      setSession(cedula, result.role, userData)
      setUser(userData)
      
      return { success: true, role: result.role, userData }
    } catch (error) {
      console.error('❌ Error en login:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    console.log('🚪 Cerrando sesión')
    clearSession()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isTeacher: user?.role === 'teacher',
    isParent: user?.role === 'parent',
    isStudent: user?.role === 'student'
  }

  console.log('🔧 AuthContext value:', { 
    user: value.user, 
    loading: value.loading,
    isTeacher: value.isTeacher,
    isParent: value.isParent,
    isStudent: value.isStudent
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}