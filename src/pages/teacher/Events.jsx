import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Loading from '../../components/Loading'
import Badge from '../../components/Badge'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineClipboardDocumentCheck,
  HiOutlineGlobeAlt,
  HiOutlinePlus
} from 'react-icons/hi2'

const TIPOS = {
  actividad: {
    label: 'Actividad',
    icon: HiOutlineSparkles,
    variant: 'green'
  },
  reunion: {
    label: 'Reunión',
    icon: HiOutlineUserGroup,
    variant: 'blue'
  },
  evaluacion: {
    label: 'Evaluación',
    icon: HiOutlineClipboardDocumentCheck,
    variant: 'red'
  },
  feriado: {
    label: 'Feriado',
    icon: HiOutlineGlobeAlt,
    variant: 'gray'
  }
}

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

  const resetForm = () => {
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.titulo || !formData.fecha_inicio) {
      toast.error('Completa los campos requeridos')
      return
    }
    
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
    
    toast.success('Evento creado correctamente')
    setModalOpen(false)
    resetForm()
    loadData()
  }

  if (loading) return <Loading />

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Eventos</h2>
          <p className="text-sm text-gray-500">Calendario de actividades</p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="small">
          <HiOutlinePlus className="w-4 h-4" />
          Nuevo
        </Button>
      </div>
      
      <div className="space-y-3">
        {events.map(event => {
          const tipoInfo = TIPOS[event.tipo] || TIPOS.actividad
          const TipoIcon = tipoInfo.icon
          
          return (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {/* Icono del tipo */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  event.tipo === 'actividad' ? 'bg-green-100' :
                  event.tipo === 'reunion' ? 'bg-blue-100' :
                  event.tipo === 'evaluacion' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  <TipoIcon className={`w-6 h-6 ${
                    event.tipo === 'actividad' ? 'text-green-600' :
                    event.tipo === 'reunion' ? 'text-blue-600' :
                    event.tipo === 'evaluacion' ? 'text-red-600' :
                    'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-gray-800 truncate">{event.titulo}</h3>
                    <Badge variant={tipoInfo.variant} label={tipoInfo.label} />
                  </div>
                  
                  {event.descripcion && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.descripcion}</p>
                  )}
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                      <span className="capitalize">
                        {format(new Date(event.fecha_inicio), "EEEE d 'de' MMMM, yyyy '·' HH:mm", { locale: es })}
                      </span>
                    </div>
                    
                    {event.ubicacion && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <HiOutlineMapPin className="w-3.5 h-3.5" />
                        <span>{event.ubicacion}</span>
                      </div>
                    )}
                    
                    {!event.para_todos_grados && event.grado_id && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <HiOutlineAcademicCap className="w-3.5 h-3.5" />
                        <span>{grados.find(g => g.id === event.grado_id)?.nombre || 'Grado específico'}</span>
                      </div>
                    )}
                    
                    {event.para_todos_grados && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <HiOutlineGlobeAlt className="w-3.5 h-3.5" />
                        <span>Todos los grados</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
        
        {events.length === 0 && (
          <Card className="text-center py-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HiOutlineCalendarDays className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-500">No hay eventos programados</p>
            <p className="text-sm text-gray-400 mt-1">Crea un nuevo evento para empezar</p>
            <Button 
              variant="secondary" 
              size="small" 
              onClick={() => setModalOpen(true)}
              className="mt-4"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Crear evento
            </Button>
          </Card>
        )}
      </div>
      
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          resetForm()
        }}
        title="Nuevo Evento"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            placeholder="Ej: Feria de ciencias"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de evento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TIPOS).map(([key, { label, icon: Icon, variant }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData({...formData, tipo: key})}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.tipo === key
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    formData.tipo === key ? 'text-indigo-600' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    formData.tipo === key ? 'text-indigo-700' : 'text-gray-600'
                  }`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Inicio"
              type="datetime-local"
              value={formData.fecha_inicio}
              onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
              required
            />
            
            <Input
              label="Fin (opcional)"
              type="datetime-local"
              value={formData.fecha_fin}
              onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
            />
          </div>
          
          <Input
            label="Ubicación"
            value={formData.ubicacion}
            onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
            placeholder="Ej: Auditorio, Salón de clases..."
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows="3"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm resize-none"
              placeholder="Describe el evento..."
            />
          </div>
          
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={formData.para_todos_grados}
              onChange={(e) => setFormData({...formData, para_todos_grados: e.target.checked})}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Para todos los grados</span>
              <p className="text-xs text-gray-500">El evento será visible para todos</p>
            </div>
          </label>
          
          {!formData.para_todos_grados && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grado
              </label>
              <select
                value={selectedGrado}
                onChange={(e) => setSelectedGrado(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm"
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
          
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setModalOpen(false)
                resetForm()
              }}
              fullWidth
            >
              Cancelar
            </Button>
            <Button type="submit" fullWidth>
              Guardar evento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TeacherEvents