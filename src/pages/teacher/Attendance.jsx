import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import Loading from '../../components/Loading'
import GradeList from './GradeList.jsx'
import AttendanceSheet from './AttendanceSheet.jsx'
import { format } from 'date-fns'

const TeacherAttendance = () => {
  const [view, setView] = useState('grades')
  const [grados, setGrados] = useState([])
  const [selectedGrado, setSelectedGrado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    loadGrados()
  }, [])

  const loadGrados = async () => {
    setLoading(true)
    const { data } = await supabase.from('grados').select('*').order('nombre')
    if (data) setGrados(data)
    setLoading(false)
  }

  const handleSelectGrado = (grado) => {
    setSelectedGrado(grado)
    setView('sheet')
  }

  const handleBackToGrades = () => {
    setView('grades')
    setSelectedGrado(null)
  }

  if (loading && view === 'grades') return <Loading />

  if (view === 'grades') {
    return <GradeList grados={grados} onSelectGrado={handleSelectGrado} />
  }

  return (
    <AttendanceSheet
      grado={selectedGrado}
      date={selectedDate}
      onDateChange={setSelectedDate}
      onBack={handleBackToGrades}
      onRefreshGrados={loadGrados}
    />
  )
}

export default TeacherAttendance