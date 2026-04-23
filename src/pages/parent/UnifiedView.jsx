import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'

// Hook personalizado para obtener el ID del estudiante
const useStudentId = () => {
  const { user, isParent, isStudent } = useAuth()
  const [studentId, setStudentId] = useState(null)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStudentData = async () => {
      setLoading(true)
      
      try {
        if (isStudent) {
          // Para estudiante: obtener su propio ID
          const studentData = {
            id: user?.data?.student_id || user?.id,
            nombre: user?.nombre,
            apellido: user?.apellido,
            cedula: user?.cedula
          }
          setChildren([studentData])
          setSelectedChild(studentData)
          setStudentId(studentData.id)
        } 
        else if (isParent && user?.cedula) {
          // Para padre: buscar hijos en la base de datos
          const { data: parentData } = await supabase
            .from('profiles')
            .select('id')
            .eq('cedula', user.cedula)
            .single()
          
          if (parentData) {
            const { data: studentRelations } = await supabase
              .from('student_parents')
              .select(`
                student_id,
                students (
                  id,
                  nombre,
                  apellido,
                  cedula
                )
              `)
              .eq('parent_id', parentData.id)
            
            if (studentRelations && studentRelations.length > 0) {
              const studentList = studentRelations.map(rel => rel.students)
              setChildren(studentList)
              setSelectedChild(studentList[0])
              setStudentId(studentList[0].id)
            }
          }
        }
      } catch (error) {
        console.error('Error loading student data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user) {
      loadStudentData()
    }
  }, [user, isParent, isStudent])

  return { studentId, children, selectedChild, setSelectedChild, loading }
}

// Componente para Tareas
export const ParentTasksUnified = () => {
  const { studentId, children, selectedChild, setSelectedChild, loading: studentLoading } = useStudentId()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studentId) {
      loadTasks()
    }
  }, [studentId])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('task_status')
        .select(`
          *,
          tasks (*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
      
      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  if (studentLoading || loading) return <Loading />

  return (
    <div className="p-4 pb-20">
      {children.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedChild?.id}
            onChange={(e) => {
              const newChild = children.find(c => c.id === e.target.value)
              setSelectedChild(newChild)
            }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.nombre} {child.apellido}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Tareas</h2>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <Card key={task.id}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{task.tasks?.titulo}</h3>
                {task.tasks?.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">{task.tasks.descripcion}</p>
                )}
                <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                  task.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {task.estado === 'completada' ? '✓ Completada' : '⏳ Pendiente'}
                </span>
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

// Componente para Asistencias
export const ParentAttendanceUnified = () => {
  const { studentId, children, selectedChild, setSelectedChild, loading: studentLoading } = useStudentId()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studentId) {
      loadAttendance()
    }
  }, [studentId])

  const loadAttendance = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('fecha', { ascending: false })
      
      setAttendance(data || [])
    } catch (error) {
      console.error('Error loading attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  if (studentLoading || loading) return <Loading />

  const stats = {
    presente: attendance.filter(a => a.estado === 'presente').length,
    ausente: attendance.filter(a => a.estado === 'ausente').length,
    tarde: attendance.filter(a => a.estado === 'tarde').length,
    justificado: attendance.filter(a => a.estado === 'justificado').length
  }

  return (
    <div className="p-4 pb-20">
      {children.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedChild?.id}
            onChange={(e) => {
              const newChild = children.find(c => c.id === e.target.value)
              setSelectedChild(newChild)
            }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.nombre} {child.apellido}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Asistencias</h2>
      
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Card className="text-center p-2">
          <div className="text-green-600">✓</div>
          <div className="font-bold">{stats.presente}</div>
          <div className="text-xs">Presente</div>
        </Card>
        <Card className="text-center p-2">
          <div className="text-red-600">✗</div>
          <div className="font-bold">{stats.ausente}</div>
          <div className="text-xs">Ausente</div>
        </Card>
        <Card className="text-center p-2">
          <div className="text-yellow-600">⏰</div>
          <div className="font-bold">{stats.tarde}</div>
          <div className="text-xs">Tarde</div>
        </Card>
        <Card className="text-center p-2">
          <div className="text-blue-600">📝</div>
          <div className="font-bold">{stats.justificado}</div>
          <div className="text-xs">Justificado</div>
        </Card>
      </div>
      
      {attendance.map(record => (
        <Card key={record.id} className="mb-2">
          <div className="flex justify-between">
            <span>{new Date(record.fecha).toLocaleDateString()}</span>
            <span className="capitalize">{record.estado}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}

// Componente para Logros
export const ParentAchievementsUnified = () => {
  const { studentId, children, selectedChild, setSelectedChild, loading: studentLoading } = useStudentId()
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studentId) {
      loadAchievements()
    }
  }, [studentId])

  const loadAchievements = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('achievements')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
      
      setAchievements(data || [])
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  if (studentLoading || loading) return <Loading />

  return (
    <div className="p-4 pb-20">
      {children.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedChild?.id}
            onChange={(e) => {
              const newChild = children.find(c => c.id === e.target.value)
              setSelectedChild(newChild)
            }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.nombre} {child.apellido}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Logros</h2>
      
      {achievements.map(achievement => (
        <Card key={achievement.id} className={`mb-2 border-l-4 ${
          achievement.tipo === 'logro' ? 'border-yellow-500' : 'border-orange-500'
        }`}>
          <div className="flex items-start gap-2">
            <span className="text-2xl">{achievement.tipo === 'logro' ? '🏆' : '📈'}</span>
            <div>
              <h3 className="font-semibold">{achievement.titulo}</h3>
              <p className="text-sm text-gray-600">{achievement.descripcion}</p>
              <span className="text-xs text-gray-400">
                {new Date(achievement.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// Componente para Eventos
export const ParentEventsUnified = () => {
  const { studentId, children, selectedChild, setSelectedChild, loading: studentLoading } = useStudentId()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [studentId])

  const loadEvents = async () => {
    setLoading(true)
    try {
      // Primero obtener el grado del estudiante
      let gradoId = null
      if (studentId) {
        const { data: studentGrado } = await supabase
          .from('student_grados')
          .select('grado_id')
          .eq('student_id', studentId)
          .eq('estado', 'activo')
          .single()
        
        gradoId = studentGrado?.grado_id
      }
      
      let query = supabase.from('events').select('*').order('fecha_inicio', { ascending: true })
      
      if (gradoId) {
        query = query.or(`grado_id.eq.${gradoId},para_todos_grados.eq.true`)
      }
      
      const { data } = await query
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (studentLoading || loading) return <Loading />

  return (
    <div className="p-4 pb-20">
      {children.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedChild?.id}
            onChange={(e) => {
              const newChild = children.find(c => c.id === e.target.value)
              setSelectedChild(newChild)
            }}
            className="w-full px-4 py-2 border rounded-lg"
          >
            {children.map(child => (
              <option key={child.id} value={child.id}>
                {child.nombre} {child.apellido}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Eventos Escolares</h2>
      
      {events.map(event => (
        <Card key={event.id} className="mb-2">
          <div className="flex items-start gap-2">
            <span className="text-2xl">
              {event.tipo === 'actividad' ? '🎯' : event.tipo === 'reunion' ? '👥' : '📅'}
            </span>
            <div>
              <h3 className="font-semibold">{event.titulo}</h3>
              {event.descripcion && <p className="text-sm text-gray-600">{event.descripcion}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(event.fecha_inicio).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}