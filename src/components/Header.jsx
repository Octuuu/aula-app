import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { HiOutlineArrowRightOnRectangle, HiOutlineAcademicCap } from 'react-icons/hi2'

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
          <HiOutlineAcademicCap className="h-8 w-8" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
          aria-label="Cerrar sesión"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
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