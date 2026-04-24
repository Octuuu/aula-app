import React from 'react'

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-blue-700 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Cargando...
        </div>
      ) : children}
    </button>
  )
}

export default Button