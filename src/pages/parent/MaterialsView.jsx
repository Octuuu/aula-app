import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ParentMaterialsView = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [materials, setMaterials] = useState([])
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
    loadMaterials()
  }, [selectedChild])

  const loadMaterials = async () => {
    setLoading(true)
    
    let gradoId = null
    if (selectedChild?.grados && selectedChild.grados.length > 0) {
      gradoId = selectedChild.grados[0].id
    }
    
    let query = supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (gradoId) {
      query = query.or(`grado_id.eq.${gradoId},para_todos_grados.eq.true`)
    }
    
    const { data } = await query
    
    if (data) setMaterials(data)
    setLoading(false)
  }

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'documento': return '📄'
      case 'video': return '🎬'
      case 'juego': return '🎮'
      case 'actividad': return '🎨'
      default: return '📚'
    }
  }

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'documento': return 'bg-blue-100 text-blue-700'
      case 'video': return 'bg-red-100 text-red-700'
      case 'juego': return 'bg-green-100 text-green-700'
      case 'actividad': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100'
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-4 pb-20">
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
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Materiales Educativos</h2>
      
      <div className="space-y-3">
        {materials.map(material => (
          <Card key={material.id}>
            <div className="flex items-start gap-3">
              <div className="text-3xl">{getTipoIcon(material.tipo)}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{material.titulo}</h3>
                {material.descripcion && (
                  <p className="text-sm text-gray-600 mt-1">{material.descripcion}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getTipoColor(material.tipo)}`}>
                    {material.tipo}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(material.created_at), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
                {material.archivo_url && (
                  <a
                    href={material.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-indigo-600 text-sm hover:underline"
                  >
                    📥 Ver material
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {materials.length === 0 && (
          <Card className="text-center py-8 text-gray-500">
            No hay materiales disponibles
          </Card>
        )}
      </div>
    </div>
  )
}

export default ParentMaterialsView