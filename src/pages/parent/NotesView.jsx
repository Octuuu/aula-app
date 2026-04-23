import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../config/supabase'
import Card from '../../components/Card'
import Loading from '../../components/Loading'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ParentNotesView = () => {
  const { user } = useAuth()
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [notes, setNotes] = useState([])
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
    if (selectedChild) {
      loadNotes()
    }
  }, [selectedChild])

  const loadNotes = async () => {
    setLoading(true)
    
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('student_id', selectedChild.id)
      .order('created_at', { ascending: false })
    
    if (data) setNotes(data)
    setLoading(false)
  }

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'positivo': return 'bg-green-100 text-green-700 border-green-200'
      case 'negativo': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  const getTipoIcon = (tipo) => {
    switch(tipo) {
      case 'positivo': return '😊'
      case 'negativo': return '⚠️'
      default: return '📝'
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
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Registro Anecdótico</h2>
      
      <div className="space-y-3">
        {notes.map(note => (
          <Card key={note.id} className={`border-l-4 ${getTipoColor(note.tipo)}`}>
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getTipoIcon(note.tipo)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">{note.titulo}</h3>
                  <span className="text-xs text-gray-400">
                    {format(new Date(note.created_at), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-2">{note.contenido}</p>
              </div>
            </div>
          </Card>
        ))}
        
        {notes.length === 0 && (
          <Card className="text-center py-8 text-gray-500">
            No hay notas registradas para este estudiante
          </Card>
        )}
      </div>
    </div>
  )
}

export default ParentNotesView