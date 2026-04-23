import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'

const StudentsList = ({ grado, onBack, onRefresh }) => {
  const [students, setStudents] = useState([])
  const [allGrados, setAllGrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGrado, setSelectedGrado] = useState(grado.id)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    fecha_nacimiento: '',
    direccion: ''
  })

  useEffect(() => {
    loadStudents()
    loadGrados()
  }, [grado.id])

  const loadStudents = async () => {
    setLoading(true)

    // Traer alumnos del curso seleccionado para el año actual
    const { data } = await supabase
      .from('student_grados')
      .select(`
        student_id,
        anio_escolar,
        students (
          id,
          nombre,
          apellido,
          cedula,
          fecha_nacimiento,
          direccion
        )
      `)
      .eq('grado_id', grado.id)
      .eq('anio_escolar', new Date().getFullYear().toString())
      .order('students(nombre)')

    if (data) {
      setStudents(data.map(sg => sg.students).filter(Boolean))
    }

    setLoading(false)
  }

  const loadGrados = async () => {
    const { data } = await supabase
      .from('grados')
      .select('*')
      .order('nombre')
    if (data) setAllGrados(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Crear estudiante
    const { data: student, error } = await supabase
      .from('students')
      .insert([{
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        direccion: formData.direccion
      }])
      .select()

    if (error) {
      toast.error(error.message)
      return
    }

    // Asignar al grado (usa el seleccionado en el form, por defecto el actual)
    const gradoDestino = selectedGrado || grado.id
    if (gradoDestino) {
      await supabase
        .from('student_grados')
        .insert([{
          student_id: student[0].id,
          grado_id: gradoDestino,
          anio_escolar: new Date().getFullYear().toString()
        }])
    }

    toast.success('Estudiante creado')
    setModalOpen(false)
    resetForm()
    loadStudents()
    onRefresh?.()
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      cedula: '',
      fecha_nacimiento: '',
      direccion: ''
    })
    setSelectedGrado(grado.id)
  }

  if (loading) return <Loading />

  return (
    <div className="p-4">
      {/* Header con botón volver */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1 transition-colors"
        >
          ‹ Cursos
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{grado.nombre}</h2>
          <p className="text-sm text-gray-500">{grado.nivel} · {students.length} alumnos</p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="small">
          + Nuevo
        </Button>
      </div>

      {/* Listado de alumnos */}
      <div className="space-y-3">
        {students.map(student => (
          <Card key={student.id}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-xl">👨‍🎓</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {student.nombre} {student.apellido}
                </h3>
                <p className="text-sm text-gray-500">Cédula: {student.cedula}</p>
              </div>
            </div>
          </Card>
        ))}

        {students.length === 0 && (
          <Card className="text-center py-8 text-gray-500">
            No hay alumnos en este curso
          </Card>
        )}
      </div>

      {/* Modal nuevo alumno */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm() }}
        title="Nuevo Estudiante"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          <Input
            label="Apellido"
            value={formData.apellido}
            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
            required
          />

          <Input
            label="Cédula"
            value={formData.cedula}
            onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
            required
          />

          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
          />

          <Input
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
          />

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
              {allGrados.map(g => (
                <option key={g.id} value={g.id}>
                  {g.nombre} - {g.nivel}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); resetForm() }}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default StudentsList