// src/pages/teacher/attendance/GradeList.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'
import { LuSchool } from 'react-icons/lu'

const GradeList = ({ grados, onSelectGrado }) => {
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCounts()
  }, [grados])

  const fetchCounts = async () => {
    if (grados.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    
    // ✅ OPCIÓN 1: Usar la relación que ya tienes (student_grados tiene relación con grados)
    // Supabase permite contar relaciones con { count: 'exact' }
    const { data } = await supabase
      .from('grados')
      .select(`
        id,
        student_grados ( count )
      `)
      .in('id', grados.map(g => g.id))
    
    const map = {}
    data?.forEach(grado => {
      map[grado.id] = grado.student_grados?.[0]?.count || 0
    })
    
    setCounts(map)
    setLoading(false)
  }

  if (loading) return <Loading />

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-1">Asistencia</h2>
      <p className="text-sm text-gray-500 mb-4">Selecciona un curso para pasar lista</p>

      <div className="space-y-3">
        {grados.map(grado => {
          const count = counts[grado.id] || 0
          return (
            <Card
              key={grado.id}
              className="cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-200 border border-transparent"
              onClick={() => onSelectGrado(grado)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <LuSchool className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{grado.nombre}</h3>
                  <p className="text-sm text-gray-500 capitalize">{grado.nivel} · {grado.anio_escolar}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-indigo-600">{count}</span>
                  <p className="text-xs text-gray-400">alumnos</p>
                </div>
                <span className="text-gray-400 ml-1">›</span>
              </div>
            </Card>
          )
        })}

        {grados.length === 0 && (
          <Card className="text-center py-8 text-gray-500">
            No hay cursos registrados
          </Card>
        )}
      </div>
    </div>
  )
}

export default GradeList