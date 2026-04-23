import React from 'react'

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-gray-500">Cargando...</p>
      </div>
    </div>
  )
}

export default Loading