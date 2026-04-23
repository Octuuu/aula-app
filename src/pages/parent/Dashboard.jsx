import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'

const ParentDashboard = () => {
  const { user, isParent, isStudent } = useAuth()
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('🔍 Dashboard - User:', user)
    console.log('🔍 Es padre:', isParent)
    console.log('🔍 Es estudiante:', isStudent)
    
    if (user) {
      loadStudentInfo()
    }
  }, [user])

  const loadStudentInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let studentId = null
      let studentName = ''
      
      // CASO 1: Es estudiante
      if (isStudent) {
        // Buscar el estudiante por cédula
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('cedula', user.cedula)
          .single()
        
        if (error) {
          console.error('Error buscando estudiante:', error)
        } else if (data) {
          studentId = data.id
          studentName = `${data.nombre} ${data.apellido}`
          setStudentData({ id: studentId, nombre: data.nombre, apellido: data.apellido, cedula: data.cedula })
        }
      }
      
      // CASO 2: Es padre
      else if (isParent) {
        // Primero buscar el perfil del padre
        const { data: parentProfile, error: parentError } = await supabase
          .from('profiles')
          .select('id')
          .eq('cedula', user.cedula)
          .single()
        
        if (parentError) {
          console.error('Error buscando padre:', parentError)
        } else if (parentProfile) {
          // Buscar los hijos de este padre
          const { data: children, error: childrenError } = await supabase
            .from('student_parents')
            .select(`
              student_id,
              students (id, nombre, apellido, cedula)
            `)
            .eq('parent_id', parentProfile.id)
          
          if (childrenError) {
            console.error('Error buscando hijos:', childrenError)
          } else if (children && children.length > 0) {
            const firstChild = children[0].students
            studentId = firstChild.id
            studentName = `${firstChild.nombre} ${firstChild.apellido}`
            setStudentData(firstChild)
          }
        }
      }
      
      console.log('✅ Estudiante encontrado:', { studentId, studentName })
      
      if (!studentId) {
        setError('No se encontró información del estudiante')
      }
      
    } catch (err) {
      console.error('Error:', err)
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
            onClick={loadStudentInfo}
            className="mt-2 text-indigo-600"
          >
            Reintentar
          </button>
        </Card>
      </div>
    )
  }

  if (!studentData) {
    return (
      <div className="p-4">
        <Card className="text-center p-8">
          <p className="text-gray-500">No hay información disponible</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4">
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white mb-4">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">👨‍🎓</div>
          <h2 className="text-xl font-bold">{studentData.nombre} {studentData.apellido}</h2>
          <p className="text-sm opacity-90">Cédula: {studentData.cedula}</p>
        </div>
      </Card>
      
      <h3 className="font-semibold text-gray-800 mb-2">Información del Estudiante</h3>
      <Card className="mb-2">
        <p className="text-gray-600">Cédula: {studentData.cedula}</p>
        <p className="text-gray-600">Nombre completo: {studentData.nombre} {studentData.apellido}</p>
      </Card>
      
      <p className="text-center text-gray-500 text-sm mt-4">
        ✅ Dashboard funcionando correctamente
      </p>
    </div>
  )
}

export default ParentDashboard