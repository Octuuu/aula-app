import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ParentAttendance = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, justified: 0 })
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
      loadAttendance()
    }
  }, [selectedChild])

  const loadAttendance = async () => {
    setLoading(true)
    
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', selectedChild.id)
      .order('fecha', { ascending: false })
    
    if (data) {
      setAttendance(data)
      
      // Calcular estadísticas
      const present = data.filter(a => a.estado === 'presente').length
      const absent = data.filter(a => a.estado === 'ausente').length
      const late = data.filter(a => a.estado === 'tarde').length
      const justified = data.filter(a => a.estado === 'justificado').length
      
      setStats({ present, absent, late, justified })
    }
    
    setLoading(false)
  }

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'presente': return 'bg-green-100 text-green-700'
      case 'ausente': return 'bg-red-100 text-red-700'
      case 'tarde': return 'bg-yellow-100 text-yellow-700'
      case 'justificado': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100'
    }
  }

  const getStatusIcon = (estado) => {
    switch(estado) {
      case 'presente': return '✓'
      case 'ausente': return '✗'
      case 'tarde': return '⏰'
      case 'justificado': return '📝'
      default: return '?'
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
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Asistencias</h2>
      
      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <Card className="text-center p-2">
          <div className="text-green-600 text-xl">✓</div>
          <div className="font-bold">{stats.present}</div>
          <div className="text-xs text-gray-500">Presente</div>
        </Card>
        <Card className="text-center p-2">
          <div className="text-red-600 text-xl">✗</div>
          <div className="font-bold">{stats.absent}</div>
          <div className="text-xs text-gray-500">Ausente</div>
        </Card>
        <Card className="text-center p-2">
          <div className="text-yellow-600 text-xl">⏰</div>
          <div className="font-bold">{stats.late}</div>
          <div className="text-xs text-gray-500">Tarde</div>
        </Card>
        <Card className="text-center p-2">
          <div className="text-blue-600 text-xl">📝</div>
          <div className="font-bold">{stats.justified}</div>
          <div className="text-xs text-gray-500">Justificado</div>
        </Card>
      </div>
      
      {/* Lista de asistencias */}
      <div className="space-y-2">
        {attendance.map(record => (
          <Card key={record.id}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {format(new Date(record.fecha), "EEEE d 'de' MMMM yyyy", { locale: es })}
                </p>
                {record.observacion && (
                  <p className="text-xs text-gray-500 mt-1">{record.observacion}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(record.estado)}`}>
                {getStatusIcon(record.estado)} {record.estado}
              </span>
            </div>
          </Card>
        ))}
        
        {attendance.length === 0 && (
          <Card className="text-center py-8 text-gray-500">
            No hay registros de asistencia
          </Card>
        )}
      </div>
    </div>
  )
}

export default ParentAttendance