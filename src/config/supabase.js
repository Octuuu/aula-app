import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sesión simple
export const setSession = (cedula, role, data) => {
  localStorage.setItem('cedula', cedula)
  localStorage.setItem('role', role)
  localStorage.setItem('userData', JSON.stringify(data))
}

export const getSession = () => {
  const cedula = localStorage.getItem('cedula')
  const role = localStorage.getItem('role')
  const userData = localStorage.getItem('userData')
  
  if (!cedula || !role) return null
  
  return {
    cedula,
    role,
    userData: userData ? JSON.parse(userData) : null
  }
}

export const clearSession = () => {
  localStorage.removeItem('cedula')
  localStorage.removeItem('role')
  localStorage.removeItem('userData')
}