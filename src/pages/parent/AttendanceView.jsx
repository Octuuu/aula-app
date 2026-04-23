import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'

const ParentAttendanceView = () => {
  const { user, isParent, isStudent } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAttendance()
  }, [user])

  const loadAttendance = async () => {
    try {
      setLoading(true)
      
      let studentId = null
      
      if (isStudent) {
        const { data } = await supabase
          .from('students')
          .select('id')
          .eq('cedula', user.cedula)
          .single()
        if (data) studentId = data.id
      } else if (isParent) {
        const { data: parent } = await supabase
          .from('profiles')
          .select('id')
          .eq('cedula', user.cedula)
          .single()
        
        if (parent) {
          const { data: children } = await supabase
            .from('student_parents')
            .select('student_id')
            .eq('parent_id', parent.id)
            .limit(1)
          
          if (children && children.length > 0) {
            studentId = children[0].student_id
          }
        }
      }
      
      if (studentId) {
        const { data } = await supabase
          .from('attendance')
          .select('*')
          .eq('student_id', studentId)
          .order('fecha', { ascending: false })
        
        setAttendance(data || [])
      }
      
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  const stats = {
    presente: attendance.filter(a => a.estado === 'presente').length,
    ausente: attendance.filter(a => a.estado === 'ausente').length,
    tarde: attendance.filter(a => a.estado === 'tarde').length
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Asistencias</h2>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Card className="text-center p-2">
          <div className="text-green-600 text-xl">✓</div>
          <div className="font-bold">{stats.presente}</div>
          <div className="text-xs">Presente</div>
        </Card>
        <Card className="text-center p-2">
          <div className="text-red-600 text-xl">✗</div>
          <div className="font-bold">{stats.ausente}</div>
          <div className="text-xs">Ausente</div>
        </Card>
        <Card className="text-center p-2">
          <div className="text-yellow-600 text-xl">⏰</div>
          <div className="font-bold">{stats.tarde}</div>
          <div className="text-xs">Tarde</div>
        </Card>
      </div>
      
      {attendance.map(record => (
        <Card key={record.id} className="mb-2">
          <div className="flex justify-between">
            <span>{new Date(record.fecha).toLocaleDateString()}</span>
            <span className="capitalize">{record.estado}</span>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default ParentAttendanceView