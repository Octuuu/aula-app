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

const TeacherNotes = () => {
  const [students, setStudents] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    tipo: 'informativo'
  })

  useEffect(() => {
    loadStudents()
    loadNotes()
  }, [])

  const loadStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('nombre')
    if (data) setStudents(data)
  }

  const loadNotes = async () => {
    const { data } = await supabase
      .from('notes')
      .select(`
        *,
        students (*)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setNotes(data)
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const { error } = await supabase
      .from('notes')
      .insert([{
        student_id: selectedStudent,
        titulo: formData.titulo,
        contenido: formData.contenido,
        tipo: formData.tipo
      }])
    
    if (error) {
      toast.error(error.message)
      return
    }
    
    toast.success('Nota registrada')
    setModalOpen(false)
    setFormData({
      titulo: '',
      contenido: '',
      tipo: 'informativo'
    })
    setSelectedStudent('')
    loadNotes()
  }

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'positivo': return 'bg-green-100 text-green-700 border-green-200'
      case 'negativo': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'positivo': return '😊'
      case 'negativo': return '⚠️'
      default: return '📝'
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Registro Anecdótico</h2>
        <Button onClick={() => setModalOpen(true)} size="small">
          + Nueva Nota
        </Button>
      </div>
      
      <div className="space-y-3">
        {notes.map(note => (
          <Card key={note.id} className={`border-l-4 ${getTipoColor(note.tipo)}`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getTipoIcon(note.tipo)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{note.titulo}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {note.students?.nombre} {note.students?.apellido}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(note.created_at), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-2">{note.contenido}</p>
              </div>
            </div>
          </Card>
        ))}
        
        {notes.length === 0 && (
          <Card className="text-center py-8 text-gray-500">
            No hay notas registradas
          </Card>
        )}
      </div>
      
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva Nota"
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
          
          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="positivo"
                  checked={formData.tipo === 'positivo'}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-4 h-4 text-green-600"
                />
                <span>😊 Positivo</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="informativo"
                  checked={formData.tipo === 'informativo'}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-4 h-4 text-blue-600"
                />
                <span>📝 Informativo</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="negativo"
                  checked={formData.tipo === 'negativo'}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="w-4 h-4 text-red-600"
                />
                <span>⚠️ Negativo</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenido
            </label>
            <textarea
              value={formData.contenido}
              onChange={(e) => setFormData({...formData, contenido: e.target.value})}
              rows="4"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Escribe la observación..."
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

export default TeacherNotes