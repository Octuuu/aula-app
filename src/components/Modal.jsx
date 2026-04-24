import React from 'react'
import { createPortal } from 'react-dom'
import { HiOutlineXMark } from 'react-icons/hi2'

const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null
  
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    full: 'max-w-full mx-4'
  }
  
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo borroso */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto shadow-xl`}>
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-5 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            aria-label="Cerrar"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Modal