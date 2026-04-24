// src/pages/teacher/attendance/AttendanceSheet.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Loading from '../../components/Loading'
import Badge from '../../components/Badge'
import StudentHistoryModal from './StudentHistoryModal'
import {
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlineClipboardDocumentCheck
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADOS = {
  presente: {
    label: 'Presente',
    color: 'bg-green-100 border-green-500 text-green-800',
    icon: HiOutlineCheck
  },
  ausente: {
    label: 'Ausente',
    color: 'bg-red-100 border-red-500 text-red-800',
    icon: HiOutlineXMark
  },
  tarde: {
    label: 'Tarde',
    color: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    icon: HiOutlineClock
  },
}

const AttendanceSheet = ({ grado, date, onDateChange, onBack, onRefreshGrados }) => {
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [historyStudent, setHistoryStudent] = useState(null)
  const [alreadySaved, setAlreadySaved] = useState(false)
  const [showEditMode, setShowEditMode] = useState(false)

  useEffect(() => {
    if (grado?.id) {
      loadStudents()
    }
  }, [grado?.id, date])

  const loadStudents = async () => {
    setLoading(true)
    setAlreadySaved(false)
    setShowEditMode(false)

    // 1. Estudiantes activos del grado
    const { data: enrollments } = await supabase
      .from('student_grados')
      .select(`student_id, students ( id, nombre, apellido, cedula )`)
      .eq('grado_id', grado.id)
      .eq('estado', 'activo')
      .order('students(nombre)')

    const studentsList = enrollments?.map(e => e.students).filter(Boolean) || []
    setStudents(studentsList)

    // 2. Asistencias del día (si existen)
    if (studentsList.length > 0) {
      const { data: attendances } = await supabase
        .from('attendance')
        .select('student_id, estado')
        .eq('fecha', date)
        .in('student_id', studentsList.map(s => s.id))

      const map = {}
      attendances?.forEach(a => {
        map[a.student_id] = a.estado
      })
      setAttendance(map)

      // Si encontró al menos un registro, la asistencia ya fue guardada
      if (attendances && attendances.length > 0) {
        setAlreadySaved(true)
      }
    }

    setLoading(false)
  }

  const handleToggle = (studentId, estado) => {
    setAttendance(prev => ({ ...prev, [studentId]: estado }))
  }

  const saveAll = async () => {
    setSaving(true)
    const updates = students.map(s => ({
      student_id: s.id,
      fecha: date,
      estado: attendance[s.id] || 'ausente',
      observacion: ''
    }))

    const { error } = await supabase
      .from('attendance')
      .upsert(updates, { onConflict: 'student_id,fecha' })

    if (error) {
      toast.error('Error al guardar: ' + error.message)
    } else {
      toast.success('Asistencia guardada correctamente')
      setAlreadySaved(true)
      setShowEditMode(false)
      onRefreshGrados?.()
    }
    setSaving(false)
  }

  // Contar asistencias por estado para el resumen
  const resumen = {
    presente: Object.values(attendance).filter(v => v === 'presente').length,
    ausente: Object.values(attendance).filter(v => v === 'ausente').length,
    tarde: Object.values(attendance).filter(v => v === 'tarde').length,
    sinMarcar: students.length - Object.keys(attendance).length
  }

  const fechaFormateada = (() => {
    try {
      return format(new Date(date + 'T00:00:00'), "EEEE d 'de' MMMM, yyyy", { locale: es })
    } catch {
      return date
    }
  })()

  // Si la asistencia ya fue guardada y NO está en modo edición
  if (alreadySaved && !showEditMode && !loading) {
    return (
      <div className="p-4">
        {/* Botón volver */}
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 mb-6 transition-colors"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Volver a cursos
        </button>

        {/* Encabezado */}
        <div className="mb-2">
          <h2 className="text-xl font-bold text-gray-800">{grado?.nombre}</h2>
          <p className="text-sm text-gray-500 capitalize">
            {grado?.nivel} · {grado?.anio_escolar}
          </p>
        </div>

        {/* Fecha */}
        <p className="text-sm text-gray-400 mb-6 capitalize">{fechaFormateada}</p>

        {/* Tarjeta de confirmación */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineClipboardDocumentCheck className="w-8 h-8 text-green-600" />
          </div>
          
          <h3 className="text-lg font-bold text-green-800 mb-2">
            ¡Asistencia registrada!
          </h3>
          
          <p className="text-sm text-green-700 mb-4">
            Ya se guardó la asistencia para el {fechaFormateada}.
          </p>

          {/* Resumen en badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="green" label={`✓ ${resumen.presente} presentes`} />
            <Badge variant="red" label={`✕ ${resumen.ausente} ausentes`} />
            <Badge variant="yellow" label={`⏱ ${resumen.tarde} tarde`} />
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowEditMode(true)}
            >
              <HiOutlinePencilSquare className="w-4 h-4" />
              Modificar asistencia
            </Button>
            
            <Button
              variant="ghost"
              fullWidth
              onClick={onBack}
            >
              Volver al listado de cursos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Vista normal (nueva asistencia o modo edición)
  return (
    <div className="p-4">
      {/* Botón volver siempre visible */}
      <button
        onClick={onBack}
        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 mb-3 transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Volver a cursos
      </button>

      {/* Encabezado con info del grado y fecha */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">{grado?.nombre}</h2>
        <p className="text-sm text-gray-500 capitalize">
          {grado?.nivel} · {grado?.anio_escolar}
        </p>
      </div>

      {/* Selector de fecha */}
      <Card className="mb-4">
        <Input
          label="Fecha de asistencia"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-2 capitalize">
          {fechaFormateada}
        </p>
      </Card>

      {/* Banner de edición */}
      {showEditMode && (
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
          <HiOutlinePencilSquare className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-800">
              Modo edición
            </p>
            <p className="text-xs text-indigo-700 mt-0.5">
              Estás modificando la asistencia del {fechaFormateada}.
            </p>
          </div>
        </div>
      )}

      {/* Resumen rápido de estados */}
      {students.length > 0 && !loading && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <Badge variant="green" label={`✓ ${resumen.presente} presentes`} />
          <Badge variant="red" label={`✕ ${resumen.ausente} ausentes`} />
          <Badge variant="yellow" label={`⏱ ${resumen.tarde} tarde`} />
          {resumen.sinMarcar > 0 && (
            <Badge variant="gray" label={`· ${resumen.sinMarcar} sin marcar`} />
          )}
        </div>
      )}

      {/* Contenido principal */}
      {loading ? (
        <Loading text="Cargando estudiantes..." />
      ) : students.length === 0 ? (
        <Card className="text-center py-8 text-gray-500">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">No hay estudiantes</p>
          <p className="text-sm">Este curso no tiene alumnos inscritos activos.</p>
        </Card>
      ) : (
        <>
          {/* Lista de estudiantes */}
          <div className="space-y-3 mb-4">
            {students.map(student => {
              const estado = attendance[student.id]
              return (
                <Card
                  key={student.id}
                  className={`border-l-4 transition-colors ${
                    estado
                      ? ESTADOS[estado].color.split(' ')[0]
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Avatar con iniciales */}
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-600">
                        {student.nombre?.charAt(0)}{student.apellido?.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {student.nombre} {student.apellido}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cédula: {student.cedula}
                      </p>
                    </div>

                    {/* Botones de estado */}
                    <div className="flex gap-1">
                      {Object.entries(ESTADOS).map(([key, { icon: Icon, color }]) => {
                        const isActive = estado === key
                        return (
                          <button
                            key={key}
                            onClick={() => handleToggle(student.id, key)}
                            className={`p-2 rounded-lg transition-all duration-150 ${
                              isActive
                                ? `${color} shadow-sm scale-105`
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                            }`}
                            title={ESTADOS[key].label}
                            aria-label={`Marcar como ${ESTADOS[key].label}`}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        )
                      })}

                      {/* Botón historial */}
                      <button
                        onClick={() => setHistoryStudent(student)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all"
                        title="Ver historial"
                        aria-label={`Ver historial de ${student.nombre}`}
                      >
                        <HiOutlineEye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Botón guardar */}
          <Button
            onClick={saveAll}
            loading={saving}
            fullWidth
            size="large"
          >
            {showEditMode ? 'Actualizar asistencia' : 'Guardar asistencia'}
          </Button>

          {/* Cancelar edición */}
          {showEditMode && (
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setShowEditMode(false)
                loadStudents() // Recargar datos originales
              }}
              className="mt-2"
            >
              Cancelar edición
            </Button>
          )}
        </>
      )}

      {/* Modal de historial */}
      {historyStudent && (
        <StudentHistoryModal
          student={historyStudent}
          onClose={() => setHistoryStudent(null)}
        />
      )}
    </div>
  )
}

export default AttendanceSheet