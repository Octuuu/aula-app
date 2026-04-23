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

const TeacherAchievements = () => {
  const [students, setStudents] = useState([])
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [formData, setFormData] = useState({
    tipo: 'logro',
    titulo: '',
    descripcion: ''
  })

  useEffect(() => {
    loadStudents()
    loadAchievements()
  }, [])

  const loadStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('nombre')
    if (data) setStudents(data)
  }

  const loadAchievements = async () => {
    const { data } = await supabase
      .from('achievements')
      .select(`
        *,
        students (*)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setAchievements(data)
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('achievements')
      .insert([{
        student_id: selectedStudent,
        tipo: formData.tipo,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha: new Date()
      }])
    
    if (error) {
      toast.error(error.message)
      return
    }
    
    toast.success(formData.tipo === 'logro' ? 'Logro registrado' : 'Área de mejora registrada')
    setModalOpen(false)
    setFormData({
      tipo: 'logro',
      titulo: '',
      descripcion: ''
    })
    setSelectedStudent('')
    loadAchievements()
  }

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'logro': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'mejora': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'logro': return '🏆'
      case 'mejora': return '📈'
      default: return '⭐'
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Logros y Mejoras</h2>
        <Button onClick={() => setModalOpen(true)} size="small">
          + Nuevo
        </Button>
      </div>
      
      <div className="space-y-3">
        {achievements.map(achievement => (
          <Card key={achievement.id} className={`border-l-4 ${getTipoColor(achievement.tipo)}`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getTipoIcon(achievement.tipo)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{achievement.titulo}</h3>
                    <p className="text-sm text-gray-600">
                      {achievement.students?.nombre} {achievement.students?.apellido}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(achievement.created_at), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-2">{achievement.descripcion}</p>
                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-gray-100">
                  {achievement.tipo === 'logro' ? '🏆 Logro' : '📈 Área a mejorar'}
                </span>
              </div>
            </div>
          </Card>
        ))}
        
        {achievements.length === 0 && (
          <Card className="text-center py-8 text-gray-500">
            No hay logros o mejoras registradas
          </Card>
        )}
      </div>
      
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo Registro"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estudiante
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            >
              <option value="">Seleccionar estudiante</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.nombre} {student.apellido} - {student.cedula}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="logro"
                  checked={formData.tipo === 'logro'}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-4 h-4 text-yellow-600"
                />
                <span>🏆 Logro</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="mejora"
                  checked={formData.tipo === 'mejora'}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-4 h-4 text-orange-600"
                />
                <span>📈 Área a mejorar</span>
              </label>
            </div>
          </div>
          
          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            placeholder="Ej: Excelente participación"
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
              placeholder="Describe el logro o área a mejorar..."
              required
            />
          </div>
          
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TeacherAchievements