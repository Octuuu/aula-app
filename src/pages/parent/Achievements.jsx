import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ParentAchievements = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [achievements, setAchievements] = useState([])
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
      loadAchievements()
    }
  }, [selectedChild])

  const loadAchievements = async () => {
    setLoading(true)
    
    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('student_id', selectedChild.id)
      .order('created_at', { ascending: false })
    
    if (data) setAchievements(data)
    setLoading(false)
  }

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'logro': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'mejora': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100'
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
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Logros y Áreas de Mejora</h2>
      
      <div className="space-y-3">
        {achievements.map(achievement => (
          <Card key={achievement.id} className={`border-l-4 ${getTipoColor(achievement.tipo)}`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getTipoIcon(achievement.tipo)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">{achievement.titulo}</h3>
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
            No hay logros o mejoras registradas para este estudiante
          </Card>
        )}
      </div>
    </div>
  )
}

export default ParentAchievements