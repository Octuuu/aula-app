import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ParentEvents = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [events, setEvents] = useState([])
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
    loadEvents()
  }, [selectedChild])

  const loadEvents = async () => {
    setLoading(true)
    
    // Obtener eventos del grado del estudiante
    let gradoId = null
    if (selectedChild?.grados && selectedChild.grados.length > 0) {
      gradoId = selectedChild.grados[0].id
    }
    
    let query = supabase
      .from('events')
      .select('*')
      .order('fecha_inicio', { ascending: true })
    
    if (gradoId) {
      query = query.or(`grado_id.eq.${gradoId},para_todos_grados.eq.true`)
    }
    
    const { data } = await query
    
    if (data) setEvents(data)
    setLoading(false)
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
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Eventos Escolares</h2>
      
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
    </div>
  )
}

export default ParentEvents