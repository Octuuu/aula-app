import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'
import toast from 'react-hot-toast'

const Login = () => {
  const [cedula, setCedula] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!cedula.trim()) {
      toast.error('Ingrese su cédula')
      return
    }
    
    setLoading(true)
    const result = await login(cedula.trim())
    setLoading(false)
    
    if (result.success) {
      toast.success('Bienvenido')
      navigate(`/${result.role}/dashboard`)
    } else {
      toast.error(result.error || 'Cédula no encontrada')
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Aula App</h1>
          <p className="text-gray-600 mt-2">
            Ingrese su cédula para acceder
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Cédula"
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            placeholder="Ej: 12345678"
            required
            autoFocus
            className="text-center text-lg"
          />
          
          <Button
            type="submit"
            loading={loading}
            fullWidth
            className="mt-6"
          >
            Ingresar
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default Login