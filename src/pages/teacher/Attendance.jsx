import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const TeacherAttendance = () => {
  const [grados, setGrados] = useState([])
  const [selectedGrado, setSelectedGrado] = useState('')
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    loadGrados()
  }, [])

  useEffect(() => {
    if (selectedGrado) {
      loadStudents()
    }
  }, [selectedGrado, selectedDate])

  const loadGrados = async () => {
    const { data } = await supabase.from('grados').select('*').order('nombre')
    if (data) setGrados(data)
    setLoading(false)
  }

  const loadStudents = async () => {
    setLoading(true)
    
    // Obtener estudiantes del grado
    const { data: studentGrados } = await supabase
      .from('student_grados')
      .select(`
        student_id,
        students (*)
      `)
      .eq('grado_id', selectedGrado)
      .eq('estado', 'activo')
    
    const studentsList = studentGrados?.map(sg => sg.students) || []
    setStudents(studentsList)
    
    // Obtener asistencias del día
    const { data: attendanceData } = await supabase
      .from('attendance')
      .select('*')
      .eq('fecha', selectedDate)
    
    const attendanceMap = {}
    attendanceData?.forEach(a => {
      attendanceMap[a.student_id] = a.estado
    })
    
    setAttendance(attendanceMap)
    setLoading(false)
  }

  const handleAttendanceChange = (studentId, estado) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: estado
    }))
  }

  const saveAttendance = async () => {
    setSaving(true)
    
    for (const student of students) {
      const estado = attendance[student.id]
      if (estado) {
        await supabase
          .from('attendance')
          .upsert({
            student_id: student.id,
            fecha: selectedDate,
            estado: estado,
            observacion: ''
          })
      }
    }
    
    toast.success('Asistencia guardada')
    setSaving(false)
  }

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'presente': return 'bg-green-100 border-green-500'
      case 'ausente': return 'bg-red-100 border-red-500'
      case 'tarde': return 'bg-yellow-100 border-yellow-500'
      case 'justificado': return 'bg-blue-100 border-blue-500'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Asistencias</h2>
      
      {/* Filtros */}
      <Card className="mb-4">
        <div className="space-y-3">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>
      </Card>
      
      {/* Lista de estudiantes */}
      {selectedGrado && students.length > 0 && (
        <>
          <div className="space-y-3 mb-4">
            {students.map(student => (
              <Card key={student.id} className={`p-3 ${getStatusColor(attendance[student.id])}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{student.nombre} {student.apellido}</p>
                    <p className="text-xs text-gray-500">Cédula: {student.cedula}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'presente')}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        attendance[student.id] === 'presente'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Presente
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'ausente')}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        attendance[student.id] === 'ausente'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Ausente
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(student.id, 'tarde')}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        attendance[student.id] === 'tarde'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Tarde
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Button
            onClick={saveAttendance}
            loading={saving}
            fullWidth
          >
            Guardar Asistencia
          </Button>
        </>
      )}
      
      {selectedGrado && students.length === 0 && (
        <Card className="text-center py-8 text-gray-500">
          No hay estudiantes en este grado
        </Card>
      )}
      
      {!selectedGrado && (
        <Card className="text-center py-8 text-gray-500">
          Selecciona un grado para ver los estudiantes
        </Card>
      )}
    </div>
  )
}

export default TeacherAttendance