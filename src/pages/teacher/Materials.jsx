import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Loading from '../../components/Loading'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const TeacherMaterials = () => {
  const [materials, setMaterials] = useState([])
  const [grados, setGrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedGrado, setSelectedGrado] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'documento',
    para_todos_grados: false,
    archivo: null
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    const [materialsRes, gradosRes] = await Promise.all([
      supabase.from('materials').select('*').order('created_at', { ascending: false }),
      supabase.from('grados').select('*').order('nombre')
    ])
    
    if (materialsRes.data) setMaterials(materialsRes.data)
    if (gradosRes.data) setGrados(gradosRes.data)
    
    setLoading(false)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({...formData, archivo: file})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    
    let fileUrl = null
    
    // Subir archivo si existe
    if (formData.archivo) {
      const fileName = `${Date.now()}_${formData.archivo.name}`
      const { data, error } = await supabase.storage
        .from('materials')
        .upload(fileName, formData.archivo)
      
      if (error) {
        toast.error('Error al subir archivo')
        setUploading(false)
        return
      }
      
      fileUrl = supabase.storage.from('materials').getPublicUrl(fileName).data.publicUrl
    }
    
    const materialData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      archivo_url: fileUrl,
      para_todos_grados: formData.para_todos_grados,
      grado_id: !formData.para_todos_grados && selectedGrado ? selectedGrado : null
    }
    
    const { error } = await supabase
      .from('materials')
      .insert([materialData])
    
    if (error) {
      toast.error(error.message)
      setUploading(false)
      return
    }
    
    toast.success('Material subido')
    setModalOpen(false)
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'documento',
      para_todos_grados: false,
      archivo: null
    })
    setSelectedGrado('')
    loadData()
    setUploading(false)
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Materiales Educativos</h2>
        <Button onClick={() => setModalOpen(true)} size="small">
          + Subir Material
        </Button>
      </div>
      
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
            No hay materiales subidos
          </Card>
        )}
      </div>
      
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Subir Material"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="documento">📄 Documento</option>
              <option value="video">🎬 Video</option>
              <option value="juego">🎮 Juego interactivo</option>
              <option value="actividad">🎨 Actividad divertida</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Describe el material..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo (PDF, imagen, video, etc.)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              required
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="para_todos"
              checked={formData.para_todos_grados}
              onChange={(e) => setFormData({...formData, para_todos_grados: e.target.checked})}
              className="w-4 h-4 text-indigo-600"
            />
            <label htmlFor="para_todos" className="text-sm text-gray-700">
              Para todos los grados
            </label>
          </div>
          
          {!formData.para_todos_grados && (
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
          )}
          
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={uploading}>
              Subir Material
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TeacherMaterials