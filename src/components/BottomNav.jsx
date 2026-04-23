import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const BottomNav = ({ role }) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const teacherNav = [
    { path: '/teacher/dashboard', label: 'Inicio', icon: '🏠' },
    { path: '/teacher/students', label: 'Alumnos', icon: '👥' },
    { path: '/teacher/tasks', label: 'Tareas', icon: '📝' },
    { path: '/teacher/attendance', label: 'Asistencia', icon: '📅' },
    { path: '/teacher/events', label: 'Eventos', icon: '📆' }
  ]
  
  const parentNav = [
    { path: '/parent/dashboard', label: 'Inicio', icon: '🏠' },
    { path: '/parent/tasks', label: 'Tareas', icon: '📝' },
    { path: '/parent/attendance', label: 'Asistencia', icon: '📅' },
    { path: '/parent/achievements', label: 'Logros', icon: '🏆' },
    { path: '/parent/events', label: 'Eventos', icon: '📆' }
  ]
  
  const studentNav = [
    { path: '/student/dashboard', label: 'Inicio', icon: '🏠' },
    { path: '/student/tasks', label: 'Tareas', icon: '📝' },
    { path: '/student/attendance', label: 'Asistencia', icon: '📅' },
    { path: '/student/achievements', label: 'Logros', icon: '🏆' },
    { path: '/student/events', label: 'Eventos', icon: '📆' }
  ]
  
  let navItems = teacherNav
  if (role === 'parent') navItems = parentNav
  if (role === 'student') navItems = studentNav
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
      <div className="flex justify-around py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-indigo-500 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav