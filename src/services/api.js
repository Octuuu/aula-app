import { supabase } from '../config/supabase'

// Verificar cédula
export const checkCedulaAccess = async (cedula) => {
  try {
    const { data, error } = await supabase
      .rpc('check_cedula_access', { cedula_input: cedula })
    
    if (error) throw error
    
    if (data && data.length > 0) {
      return {
        exists: data[0].existe,
        role: data[0].role,
        nombre: data[0].nombre,
        apellido: data[0].apellido,
        data: data[0].data
      }
    }
    
    return { exists: false }
  } catch (error) {
    console.error('Error:', error)
    return { exists: false, error: error.message }
  }
}

// ========== GRADOS ==========
export const getGrados = async () => {
  const { data, error } = await supabase
    .from('grados')
    .select('*')
    .order('nombre')
  
  if (error) throw error
  return data
}

export const createGrado = async (grado) => {
  const { data, error } = await supabase
    .from('grados')
    .insert([grado])
    .select()
  
  if (error) throw error
  return data[0]
}

// ========== ESTUDIANTES ==========
export const getStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('nombre')
  
  if (error) throw error
  return data
}

export const getStudentsByGrado = async (gradoId) => {
  const { data, error } = await supabase
    .from('student_grados')
    .select(`
      student_id,
      students (*)
    `)
    .eq('grado_id', gradoId)
    .eq('estado', 'activo')
  
  if (error) throw error
  return data.map(item => item.students)
}

export const createStudent = async (student) => {
  const { data, error } = await supabase
    .from('students')
    .insert([student])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateStudent = async (id, updates) => {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

// ========== PADRES ==========
export const getParents = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'parent')
  
  if (error) throw error
  return data
}

export const createParent = async (parent) => {
  // Primero crear usuario en auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parent.email,
    password: parent.cedula // Contraseña temporal = cédula
  })
  
  if (authError) throw authError
  
  // Luego crear perfil
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: authData.user.id,
      cedula: parent.cedula,
      nombre: parent.nombre,
      apellido: parent.apellido,
      email: parent.email,
      telefono: parent.telefono,
      role: 'parent'
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

// ========== RELACIÓN ESTUDIANTE-PADRE ==========
export const assignParentToStudent = async (studentId, parentId, parentesco) => {
  const { data, error } = await supabase
    .from('student_parents')
    .insert([{
      student_id: studentId,
      parent_id: parentId,
      parentesco
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

// ========== RELACIÓN ESTUDIANTE-GRADO ==========
export const enrollStudent = async (studentId, gradoId, anioEscolar) => {
  const { data, error } = await supabase
    .from('student_grados')
    .insert([{
      student_id: studentId,
      grado_id: gradoId,
      anio_escolar: anioEscolar
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

// ========== TAREAS ==========
export const getTasks = async (gradoId = null) => {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('fecha_entrega', { ascending: true })
  
  if (gradoId) {
    query = query.or(`grado_id.eq.${gradoId},para_todos_grados.eq.true`)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export const createTask = async (task) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateTaskStatus = async (taskId, studentId, estado) => {
  const { data, error } = await supabase
    .from('task_status')
    .upsert({
      task_id: taskId,
      student_id: studentId,
      estado,
      fecha_completado: estado === 'completada' ? new Date() : null
    })
    .select()
  
  if (error) throw error
  return data[0]
}

export const getTaskStatusByStudent = async (studentId) => {
  const { data, error } = await supabase
    .from('task_status')
    .select(`
      *,
      tasks (*)
    `)
    .eq('student_id', studentId)
  
  if (error) throw error
  return data
}

// ========== ASISTENCIAS ==========
export const getAttendanceByStudent = async (studentId, fecha) => {
  let query = supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
  
  if (fecha) {
    query = query.eq('fecha', fecha)
  }
  
  const { data, error } = await query.order('fecha', { ascending: false })
  if (error) throw error
  return data
}

export const markAttendance = async (studentId, fecha, estado, observacion = '') => {
  const { data, error } = await supabase
    .from('attendance')
    .upsert({
      student_id: studentId,
      fecha,
      estado,
      observacion
    })
    .select()
  
  if (error) throw error
  return data[0]
}

// ========== NOTAS ==========
export const getNotesByStudent = async (studentId) => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createNote = async (note) => {
  const { data, error } = await supabase
    .from('notes')
    .insert([note])
    .select()
  
  if (error) throw error
  return data[0]
}

// ========== LOGROS ==========
export const getAchievementsByStudent = async (studentId) => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createAchievement = async (achievement) => {
  const { data, error } = await supabase
    .from('achievements')
    .insert([achievement])
    .select()
  
  if (error) throw error
  return data[0]
}

// ========== EVENTOS ==========
export const getEvents = async (gradoId = null) => {
  let query = supabase
    .from('events')
    .select('*')
    .order('fecha_inicio', { ascending: true })
  
  if (gradoId) {
    query = query.or(`grado_id.eq.${gradoId},para_todos_grados.eq.true`)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export const createEvent = async (event) => {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
  
  if (error) throw error
  return data[0]
}

// ========== MATERIALES ==========
export const getMaterials = async (gradoId = null) => {
  let query = supabase
    .from('materials')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (gradoId) {
    query = query.or(`grado_id.eq.${gradoId},para_todos_grados.eq.true`)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export const createMaterial = async (material) => {
  const { data, error } = await supabase
    .from('materials')
    .insert([material])
    .select()
  
  if (error) throw error
  return data[0]
}

// ========== HORARIOS ==========
export const getSchedules = async (gradoId) => {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('grado_id', gradoId)
    .order('dia_semana')
    .order('hora_inicio')
  
  if (error) throw error
  return data
}

export const createSchedule = async (schedule) => {
  const { data, error } = await supabase
    .from('schedules')
    .insert([schedule])
    .select()
  
  if (error) throw error
  return data[0]
}