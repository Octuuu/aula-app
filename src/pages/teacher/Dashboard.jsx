import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'
import {
  HiOutlineUsers,
  HiOutlineClipboardDocumentList,
  HiOutlineCalendarDays,
  HiOutlineBookOpen
} from 'react-icons/hi2'

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    tasks: 0,
    events: 0,
    materials: 0
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadStats()
  }, [])
  
  const loadStats = async () => {
    setLoading(true)
    
    const [students, tasks, events, materials] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('materials').select('*', { count: 'exact', head: true })
    ])
    
    setStats({
      students: students.count || 0,
      tasks: tasks.count || 0,
      events: events.count || 0,
      materials: materials.count || 0
    })
    
    setLoading(false)
  }
  
  if (loading) return <Loading />
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Link to="/teacher/students">
          <Card className="text-center hover:shadow-md transition-shadow">
            <HiOutlineUsers className="text-3xl mb-2 mx-auto text-indigo-600" />
            <div className="text-2xl font-bold text-indigo-600">{stats.students}</div>
            <div className="text-sm text-gray-500">Estudiantes</div>
          </Card>
        </Link>
        
        <Link to="/teacher/tasks">
          <Card className="text-center hover:shadow-md transition-shadow">
            <HiOutlineClipboardDocumentList className="text-3xl mb-2 mx-auto text-indigo-600" />
            <div className="text-2xl font-bold text-indigo-600">{stats.tasks}</div>
            <div className="text-sm text-gray-500">Tareas</div>
          </Card>
        </Link>
        
        <Link to="/teacher/events">
          <Card className="text-center hover:shadow-md transition-shadow">
            <HiOutlineCalendarDays className="text-3xl mb-2 mx-auto text-indigo-600" />
            <div className="text-2xl font-bold text-indigo-600">{stats.events}</div>
            <div className="text-sm text-gray-500">Eventos</div>
          </Card>
        </Link>
        
        <Link to="/teacher/materials">
          <Card className="text-center hover:shadow-md transition-shadow">
            <HiOutlineBookOpen className="text-3xl mb-2 mx-auto text-indigo-600" />
            <div className="text-2xl font-bold text-indigo-600">{stats.materials}</div>
            <div className="text-sm text-gray-500">Materiales</div>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default TeacherDashboard