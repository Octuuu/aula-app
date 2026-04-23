import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

const ParentTasks = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.data?.children) {
      setChildren(user.data.children)
      if (user.data.children.length > 0) {
        setSelectedChild(user.data.children[0])
      }
    }
  }, [user])

  useEffect(() => {
    if (selectedChild) {
      loadTasks()
    }
  }, [selectedChild])

  const loadTasks = async () => {
    setLoading(true)
    
    const { data } = await supabase
      .from('task_status')
      .select(`
        *,
        tasks (*)
      `)
      .eq('student_id', selectedChild.id)
      .order('created_at', { ascending: false })
    
    if (data) setTasks(data)
    setLoading(false)
  }

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'completada': return 'bg-green-100 text-green-700'
      case 'pendiente': return 'bg-yellow-100 text-yellow-700'
      case 'atrasada': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100'
    }
  }

  const getStatusText = (estado) => {
    switch(estado) {
      case 'completada': return '✓ Completada'
      case 'pendiente': return '⏳ Pendiente'
      case 'atrasada': return '⚠️ Atrasada'
      default: return estado
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-4 pb-20">
      {/* Selector de hijos */}
      {children.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedChild?.id}
            onChange={(e) => setSelectedChild(children.find(c => c.id === e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.nombre} {child.apellido}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Tareas Escolares</h2>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <Card key={task.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{task.tasks?.titulo}</h3>
                {task.tasks?.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">{task.tasks.descripcion}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {task.tasks?.fecha_entrega && (
                    <span className="text-xs text-gray-400">
                      📅 {format(new Date(task.tasks.fecha_entrega), "dd MMM yyyy", { locale: es })}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.estado)}`}>
                    {getStatusText(task.estado)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {tasks.length === 0 && (
          <Card className="text-center py-8 text-gray-500">
            No hay tareas asignadas
          </Card>
        )}
      </div>
    </div>
  )
}

export default ParentTasks