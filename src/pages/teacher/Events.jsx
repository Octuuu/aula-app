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

const TeacherEvents = () => {
  const [events, setEvents] = useState([])
  const [grados, setGrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGrado, setSelectedGrado] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo: 'actividad',
    ubicacion: '',
    para_todos_grados: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    const [eventsRes, gradosRes] = await Promise.all([
      supabase.from('events').select('*').order('fecha_inicio', { ascending: true }),
      supabase.from('grados').select('*').order('nombre')
    ])
    
    if (eventsRes.data) setEvents(eventsRes.data)
    if (gradosRes.data) setGrados(gradosRes.data)
    
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const eventData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin || formData.fecha_inicio,
      tipo: formData.tipo,
      ubicacion: formData.ubicacion,
      para_todos_grados: formData.para_todos_grados,
      grado_id: !formData.para_todos_grados && selectedGrado ? selectedGrado : null
    }
    
    const { error } = await supabase
      .from('events')
      .insert([eventData])
    
    if (error) {
      toast.error(error.message)
      return
    }
    
    toast.success('Evento creado')
    setModalOpen(false)
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      tipo: 'actividad',
      ubicacion: '',
      para_todos_grados: false
    })
    setSelectedGrado('')
    loadData()
  }

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'actividad': return 'bg-green-100 text-green-700'
      case 'reunion': return 'bg-blue-100 text-blue-700'
      case 'evaluacion': return 'bg-red-100 text-red-700'
      case 'feriado': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100'
    }
  }

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'actividad': return '🎯'
      case 'reunion': return '👥'
      case 'evaluacion': return '📝'
      case 'feriado': return '🎉'
      default: return '📅'
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Eventos</h2>
        <Button onClick={() => setModalOpen(true)} size="small">
          + Nuevo Evento
        </Button>
      </div>
      
      <div className="space-y-3">
        {events.map(event => (
          <Card key={event.id}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getTipoIcon(event.tipo)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">{event.titulo}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getTipoColor(event.tipo)}`}>
                    {event.tipo}
                  </span>
                </div>
                {event.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">{event.descripcion}</p>
                )}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    📅 {format(new Date(event.fecha_inicio), "EEEE d 'de' MMMM yyyy, HH:mm", { locale: es })}
                  </p>
                  {event.ubicacion && (
                    <p className="text-xs text-gray-500">📍 {event.ubicacion}</p>
                  )}
                  {!event.para_todos_grados && event.grado_id && (
                    <p className="text-xs text-gray-500">
                      👥 Grado específico
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {events.length === 0 && (
          <Card className="text-center py-8 text-gray-500">
            No hay eventos programados
          </Card>
        )}
      </div>
      
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo Evento"
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
              Tipo
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="actividad">🎯 Actividad</option>
              <option value="reunion">👥 Reunión</option>
              <option value="evaluacion">📝 Evaluación</option>
              <option value="feriado">🎉 Feriado</option>
            </select>
          </div>
          
          <Input
            label="Fecha y Hora de Inicio"
            type="datetime-local"
            value={formData.fecha_inicio}
            onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
            required
          />
          
          <Input
            label="Fecha y Hora de Fin (opcional)"
            type="datetime-local"
            value={formData.fecha_fin}
            onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
          />
          
          <Input
            label="Ubicación"
            value={formData.ubicacion}
            onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
            placeholder="Ej: Salón de clases, Auditorio, etc."
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
              placeholder="Descripción del evento..."
            />
          </div>
          
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
    </div>
  )
}

export default TeacherEvents