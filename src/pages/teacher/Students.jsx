import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'
import StudentsList from './StudentsList'
import { LuSchool } from 'react-icons/lu'

const NIVELES = ['primaria', 'secundaria', 'inicial']

const Students = () => {
  const [grados, setGrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedGrado, setSelectedGrado] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', nivel: 'primaria', anio_escolar: '', descripcion: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadGrados()
  }, [])

  const loadGrados = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('grados')
      .select('*, student_grados(count)')
      .order('nombre')
    if (data) setGrados(data)
    setLoading(false)
  }

  const resetForm = () => setFormData({ nombre: '', nivel: 'primaria', anio_escolar: '', descripcion: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('grados')
      .insert([{
        nombre: formData.nombre,
        nivel: formData.nivel,
        anio_escolar: formData.anio_escolar,
        descripcion: formData.descripcion || null
      }])

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Curso creado')
      setModalOpen(false)
      resetForm()
      loadGrados()
    }

    setSaving(false)
  }

  if (loading) return <Loading />

  if (selectedGrado) {
    return (
      <StudentsList
        grado={selectedGrado}
        onBack={() => setSelectedGrado(null)}
        onRefresh={loadGrados}
      />
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold text-gray-800">Estudiantes</h2>
        <Button onClick={() => setModalOpen(true)} size="small">
          + Crear curso
        </Button>
      </div>
      <p className="text-sm text-gray-500 mb-4">Listado de tus cursos</p>

      <div className="space-y-3">
        {grados.map(grado => {
          const count = grado.student_grados?.[0]?.count ?? 0
          return (
            <Card
              key={grado.id}
              className="cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-200 border border-transparent"
              onClick={() => setSelectedGrado(grado)}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm() }}
        title="Nuevo Curso"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre del curso"
            placeholder="Ej: 3° Básico"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <select
              value={formData.nivel}
              onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              required
            >
              {NIVELES.map(n => (
                <option key={n} value={n} className="capitalize">{n.charAt(0).toUpperCase() + n.slice(1)}</option>
              ))}
            </select>
          </div>

          <Input
            label="Año Escolar"
            placeholder="Ej: 2025"
            value={formData.anio_escolar}
            onChange={(e) => setFormData({ ...formData, anio_escolar: e.target.value })}
            required
          />

          <Input
            label="Descripción (opcional)"
            placeholder="Ej: Tercer grado de educación básica"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); resetForm() }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Students