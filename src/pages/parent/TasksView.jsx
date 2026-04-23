import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'

const ParentTasksView = () => {
  const { user, isParent, isStudent } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTasks()
  }, [user])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let studentId = null
      
      // Si es estudiante, buscar por cédula
      if (isStudent) {
        const { data } = await supabase
          .from('students')
          .select('id')
          .eq('cedula', user.cedula)
          .single()
        
        if (data) studentId = data.id
      }
      
      // Si es padre, buscar hijo
      else if (isParent) {
        const { data: parent } = await supabase
          .from('profiles')
          .select('id')
          .eq('cedula', user.cedula)
          .single()
        
        if (parent) {
          const { data: children } = await supabase
            .from('student_parents')
            .select('student_id')
            .eq('parent_id', parent.id)
            .limit(1)
          
          if (children && children.length > 0) {
            studentId = children[0].student_id
          }
        }
      }
      
      if (studentId) {
        const { data } = await supabase
          .from('task_status')
          .select(`
            *,
            tasks (*)
          `)
          .eq('student_id', studentId)
        
        setTasks(data || [])
      }
      
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  
  if (error) {
    return (
      <div className="p-4">
        <Card className="bg-red-50 p-4">
          <p className="text-red-600">Error: {error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Tareas</h2>
      
      {tasks.length === 0 ? (
        <Card className="text-center py-8 text-gray-500">
          No hay tareas asignadas
        </Card>
      ) : (
        tasks.map(task => (
          <Card key={task.id} className="mb-2">
            <h3 className="font-semibold">{task.tasks?.titulo}</h3>
            {task.tasks?.descripcion && (
              <p className="text-sm text-gray-600 mt-1">{task.tasks.descripcion}</p>
            )}
            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
              task.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {task.estado === 'completada' ? '✓ Completada' : '⏳ Pendiente'}
            </span>
          </Card>
        ))
      )}
    </div>
  )
}

export default ParentTasksView