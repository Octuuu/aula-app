import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const TeacherTasks = () => {
  const [tasks, setTasks] = useState([])
  const [grados, setGrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGrado, setSelectedGrado] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_entrega: '',
    para_todos_grados: false
  })
  const [viewTaskStatus, setViewTaskStatus] = useState(null)
  const [taskStatusModal, setTaskStatusModal] = useState(false)
  const [studentsStatus, setStudentsStatus] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    const [tasksRes, gradosRes] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('grados').select('*').order('nombre')
    ])
    
    if (tasksRes.data) setTasks(tasksRes.data)
    if (gradosRes.data) setGrados(gradosRes.data)
    
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const taskData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha_entrega: formData.fecha_entrega,
      para_todos_grados: formData.para_todos_grados,
      grado_id: !formData.para_todos_grados && selectedGrado ? selectedGrado : null
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
    
    if (error) {
      toast.error(error.message)
      return
    }
    
    // Si no es para todos los grados, crear task_status para cada estudiante
    if (!formData.para_todos_grados && selectedGrado) {
      const students = await getStudentsByGrado(selectedGrado)
      
      for (const student of students) {
        await supabase
          .from('task_status')
          .insert([{
            task_id: data[0].id,
            student_id: student.id,
            estado: 'pendiente'
          }])
      }
    } else if (formData.para_todos_grados) {
      // Para todos los grados, crear para todos los estudiantes
      const { data: allStudents } = await supabase
        .from('students')
        .select('id')
      
      for (const student of allStudents) {
        await supabase
          .from('task_status')
          .insert([{
            task_id: data[0].id,
            student_id: student.id,
            estado: 'pendiente'
          }])
      }
    }
    
    toast.success('Tarea creada')
    setModalOpen(false)
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_entrega: '',
      para_todos_grados: false
    })
    setSelectedGrado('')
    loadData()
  }

  const getStudentsByGrado = async (gradoId) => {
    const { data } = await supabase
      .from('student_grados')
      .select(`
        student_id,
        students (*)
      `)
      .eq('grado_id', gradoId)
      .eq('estado', 'activo')
    
    return data?.map(item => item.students) || []
  }

  const viewTaskDetails = async (task) => {
    setViewTaskStatus(task)
    
    // Obtener todos los estudiantes y sus estados
    let students = []
    
    if (task.para_todos_grados) {
      const { data } = await supabase.from('students').select('*')
      students = data || []
    } else if (task.grado_id) {
      students = await getStudentsByGrado(task.grado_id)
    }
    
    // Obtener estados actuales
    const { data: statuses } = await supabase
      .from('task_status')
      .select('*')
      .eq('task_id', task.id)
    
    const studentsWithStatus = students.map(student => ({
      ...student,
      status: statuses?.find(s => s.student_id === student.id)?.estado || 'pendiente'
    }))
    
    setStudentsStatus(studentsWithStatus)
    setTaskStatusModal(true)
  }

  const updateStudentStatus = async (taskId, studentId, newStatus) => {
    const { error } = await supabase
      .from('task_status')
      .update({
        estado: newStatus,
        fecha_completado: newStatus === 'completada' ? new Date() : null
      })
      .eq('task_id', taskId)
      .eq('student_id', studentId)
    
    if (error) {
      toast.error('Error al actualizar')
      return
    }
    
    // Actualizar estado local
    setStudentsStatus(prev => prev.map(s => 
      s.id === studentId ? { ...s, status: newStatus } : s
    ))
    
    toast.success('Estado actualizado')
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completada': return 'bg-green-100 text-green-700'
      case 'pendiente': return 'bg-yellow-100 text-yellow-700'
      case 'atrasada': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'completada': return '✓ Completada'
      case 'pendiente': return '⏳ Pendiente'
      case 'atrasada': return '⚠️ Atrasada'
      default: return status
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Tareas</h2>
        <Button onClick={() => setModalOpen(true)} size="small">
          + Nueva Tarea
        </Button>
      </div>
      
      <div className="space-y-3">
        {tasks.map(task => (
          <Card key={task.id} onClick={() => viewTaskDetails(task)}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{task.titulo}</h3>
                {task.descripcion && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.descripcion}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {task.fecha_entrega && (
                    <span className="text-xs text-gray-500">
                      📅 {format(new Date(task.fecha_entrega), "dd MMM yyyy", { locale: es })}
                    </span>
                  )}
                  {task.para_todos_grados ? (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      Todos los grados
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      Grado específico
                    </span>
                  )}
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Card>
        ))}
        
        {tasks.length === 0 && (
          <Card className="text-center py-8 text-gray-500">
            No hay tareas creadas
          </Card>
        )}
      </div>
      
      {/* Modal para crear tarea */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva Tarea"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Descripción de la tarea..."
            />
          </div>
          
          <Input
            label="Fecha de Entrega"
            type="date"
            value={formData.fecha_entrega}
            onChange={(e) => setFormData({...formData, fecha_entrega: e.target.value})}
          />
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="para_todos"
              checked={formData.para_todos_grados}
              onChange={(e) => setFormData({...formData, para_todos_grados: e.target.checked})}
              className="w-4 h-4 text-indigo-600"
            />
            <label htmlFor="para_todos" className="text-sm text-gray-700">
              Para todos los grados
            </label>
          </div>
          
          {!formData.para_todos_grados && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grado
              </label>
              <select
                value={selectedGrado}
                onChange={(e) => setSelectedGrado(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                required={!formData.para_todos_grados}
              >
                <option value="">Seleccionar grado</option>
                {grados.map(grado => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre} - {grado.nivel}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
      
      {/* Modal para ver estado de tarea */}
      <Modal
        isOpen={taskStatusModal}
        onClose={() => setTaskStatusModal(false)}
        title={`Estado: ${viewTaskStatus?.titulo}`}
        size="large"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {studentsStatus.map(student => (
            <Card key={student.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{student.nombre} {student.apellido}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(student.status)}`}>
                    {getStatusText(student.status)}
                  </span>
                  <select
                    value={student.status}
                    onChange={(e) => updateStudentStatus(viewTaskStatus.id, student.id, e.target.value)}
                    className="text-sm border rounded-lg px-2 py-1"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="completada">Completada</option>
                    <option value="atrasada">Atrasada</option>
                  </select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default TeacherTasks