import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'

const ParentAchievementsView = () => {
  const { user, isParent, isStudent } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('🎯 Cargando logros...')
    loadAchievements()
  }, [user])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let studentId = null
      
      console.log('👤 Usuario:', user)
      console.log('📌 Es padre:', isParent)
      console.log('📌 Es estudiante:', isStudent)
      
      // CASO 1: Es estudiante
      if (isStudent) {
        console.log('🔍 Buscando estudiante por cédula:', user.cedula)
        const { data, error } = await supabase
          .from('students')
          .select('id, nombre, apellido')
          .eq('cedula', user.cedula)
          .single()
        
        if (error) {
          console.error('❌ Error buscando estudiante:', error)
        } else if (data) {
          console.log('✅ Estudiante encontrado:', data)
          studentId = data.id
        }
      }
      
      // CASO 2: Es padre
      else if (isParent) {
        console.log('🔍 Buscando padre por cédula:', user.cedula)
        
        // Buscar el perfil del padre
        const { data: parentProfile, error: parentError } = await supabase
          .from('profiles')
          .select('id')
          .eq('cedula', user.cedula)
          .single()
        
        if (parentError) {
          console.error('❌ Error buscando padre:', parentError)
        } else if (parentProfile) {
          console.log('✅ Padre encontrado:', parentProfile)
          
          // Buscar los hijos de este padre
          const { data: children, error: childrenError } = await supabase
            .from('student_parents')
            .select(`
              student_id,
              students (id, nombre, apellido, cedula)
            `)
            .eq('parent_id', parentProfile.id)
          
          if (childrenError) {
            console.error('❌ Error buscando hijos:', childrenError)
          } else if (children && children.length > 0) {
            console.log('✅ Hijos encontrados:', children)
            const firstChild = children[0].students
            studentId = firstChild.id
            console.log('📚 Usando primer hijo:', firstChild)
          } else {
            console.log('⚠️ No se encontraron hijos para este padre')
          }
        }
      }
      
      // Si tenemos studentId, cargar los logros
      if (studentId) {
        console.log('🔍 Cargando logros para estudiante ID:', studentId)
        
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('❌ Error cargando logros:', error)
          setError(error.message)
        } else {
          console.log('✅ Logros cargados:', data?.length || 0, 'registros')
          setAchievements(data || [])
        }
      } else {
        console.log('No se pudo determinar el ID del estudiante')
        setError('No se encontró información del estudiante')
      }
      
    } catch (err) {
      console.error('❌ Error general:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="bg-red-50 p-4 text-center">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={loadAchievements}
            className="mt-2 text-indigo-600 hover:text-indigo-800"
          >
            Reintentar
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 pb-20">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Logros y Mejoras</h2>
      
      {achievements.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">No hay logros o mejoras registradas</p>
          <p className="text-xs text-gray-400 mt-2">
            Los logros aparecerán aquí cuando el profesor los registre
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {achievements.map(achievement => (
            <Card 
              key={achievement.id} 
              className={`border-l-4 ${
                achievement.tipo === 'logro' 
                  ? 'border-yellow-500 bg-yellow-50' 
                  : 'border-orange-500 bg-orange-50'
              }`}
            >
              <div className="flex items-start gap-3 p-2">
                <div className="text-3xl">
                  {achievement.tipo === 'logro' ? '🏆' : '📈'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">
                    {achievement.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {achievement.descripcion}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      achievement.tipo === 'logro' 
                        ? 'bg-yellow-200 text-yellow-800' 
                        : 'bg-orange-200 text-orange-800'
                    }`}>
                      {achievement.tipo === 'logro' ? '🏆 Logro' : '📈 Área a mejorar'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(achievement.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ParentAchievementsView