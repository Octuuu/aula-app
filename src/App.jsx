import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layouts
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import Loading from './components/Loading'

// Pages
import Login from './pages/Login'

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherStudents from './pages/teacher/Students'
import TeacherTasks from './pages/teacher/Tasks'
import TeacherAttendance from './pages/teacher/Attendance'
import TeacherNotes from './pages/teacher/Notes'
import TeacherAchievements from './pages/teacher/Achievements'
import TeacherEvents from './pages/teacher/Events'
import TeacherMaterials from './pages/teacher/Materials'

// Parent/Student Pages (compartidas)
import ParentDashboard from './pages/parent/Dashboard'
import ParentTasks from './pages/parent/TasksView'
import ParentAttendance from './pages/parent/AttendanceView'
import ParentNotes from './pages/parent/NotesView'
import ParentAchievements from './pages/parent/AchievementsView'
import ParentEvents from './pages/parent/EventsView'
import ParentMaterials from './pages/parent/MaterialsView'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Teacher Routes */}
          <Route element={<ProtectedRoute role="teacher" />}>
            <Route element={<TeacherLayout />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/students" element={<TeacherStudents />} />
              <Route path="/teacher/tasks" element={<TeacherTasks />} />
              <Route path="/teacher/attendance" element={<TeacherAttendance />} />
              <Route path="/teacher/notes" element={<TeacherNotes />} />
              <Route path="/teacher/achievements" element={<TeacherAchievements />} />
              <Route path="/teacher/events" element={<TeacherEvents />} />
              <Route path="/teacher/materials" element={<TeacherMaterials />} />
              <Route path="/teacher/*" element={<Navigate to="/teacher/dashboard" />} />
            </Route>
          </Route>
          
          {/* Parent/Student Routes (compartidas) */}
          <Route element={<ProtectedRoute role="parent-student" />}>
            <Route element={<ParentLayout />}>
              <Route path="/parent/dashboard" element={<ParentDashboard />} />
              <Route path="/parent/tasks" element={<ParentTasks />} />
              <Route path="/parent/attendance" element={<ParentAttendance />} />
              <Route path="/parent/notes" element={<ParentNotes />} />
              <Route path="/parent/achievements" element={<ParentAchievements />} />
              <Route path="/parent/events" element={<ParentEvents />} />
              <Route path="/parent/materials" element={<ParentMaterials />} />
              <Route path="/parent/*" element={<Navigate to="/parent/dashboard" />} />
              
              {/* También permitir acceso por /student para los estudiantes */}
              <Route path="/student/dashboard" element={<ParentDashboard />} />
              <Route path="/student/tasks" element={<ParentTasks />} />
              <Route path="/student/attendance" element={<ParentAttendance />} />
              <Route path="/student/notes" element={<ParentNotes />} />
              <Route path="/student/achievements" element={<ParentAchievements />} />
              <Route path="/student/events" element={<ParentEvents />} />
              <Route path="/student/materials" element={<ParentMaterials />} />
              <Route path="/student/*" element={<Navigate to="/student/dashboard" />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

// Componente para proteger rutas por rol
function ProtectedRoute({ role }) {
  const { user, loading, isTeacher, isParent, isStudent } = useAuth()
  
  if (loading) {
    return <Loading />
  }
  
  if (!user) {
    return <Navigate to="/" replace />
  }
  
  if (role === 'teacher' && !isTeacher) {
    return <Navigate to="/" replace />
  }
  
  if (role === 'parent-student' && !isParent && !isStudent) {
    return <Navigate to="/" replace />
  }
  
  return <Outlet />
}

// Layout para profesor
function TeacherLayout() {
  return (
    <div className="min-h-screen ">
      <Header title="Panel Profesor" />
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav role="teacher" />
    </div>
  )
}

// Layout para padre/estudiante
function ParentLayout() {
  const { isParent, isStudent, user } = useAuth()
  
  const getTitle = () => {
    if (isParent) return "Panel Padre"
    if (isStudent) return "Mi Aula"
    return "Mi Espacio"
  }
  
  const getRole = () => {
    if (isParent) return "parent"
    return "student"
  }
  
  return (
    <div className="min-h-screen">
      <Header title={getTitle()} />
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav role={getRole()} />
    </div>
  )
}

export default App