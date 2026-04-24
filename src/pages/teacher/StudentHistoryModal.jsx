import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import Modal from '../../components/Modal'
import Loading from '../../components/Loading'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { HiOutlineCheck, HiOutlineXMark, HiOutlineClock } from 'react-icons/hi2'

const ICON_MAP = {
  presente: HiOutlineCheck,
  ausente: HiOutlineXMark,
  tarde: HiOutlineClock,
}

const COLOR_MAP = {
  presente: 'text-green-600',
  ausente: 'text-red-600',
  tarde: 'text-yellow-600',
}

const StudentHistoryModal = ({ student, onClose }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (student?.id) {
      loadHistory()
    }
  }, [student?.id])

  const loadHistory = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('attendance')
      .select('id, fecha, estado')
      .eq('student_id', student.id)
      .order('fecha', { ascending: false })
      .limit(30)

    setHistory(data || [])
    setLoading(false)
  }

  return (
    <Modal
      isOpen={!!student}
      onClose={onClose}
      title={`Historial de ${student?.nombre} ${student?.apellido}`}
    >
      {loading ? (
        <Loading />
      ) : history.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Sin registros de asistencia</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map(record => {
            const EstadoIcon = ICON_MAP[record.estado] || null
            const colorClass = COLOR_MAP[record.estado] || 'text-gray-400'
            return (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {EstadoIcon && <EstadoIcon className={`w-4 h-4 ${colorClass}`} />}
                  <span className="text-sm font-medium capitalize">{record.estado}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(record.fecha + 'T00:00:00'), 'dd/MM/yyyy')}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

export default StudentHistoryModal