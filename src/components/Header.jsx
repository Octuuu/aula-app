import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Header = ({ title }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  
  return (
    <header className="bg-indigo-600 text-white sticky top-0 z-10 shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-indigo-700 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
      {user && (
        <div className="px-4 pb-3 text-sm text-indigo-200">
          Hola, {user.nombre} {user.apellido}
        </div>
      )}
    </header>
  )
}

export default Header