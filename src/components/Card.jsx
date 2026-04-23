import React from 'react'

const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm p-4
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card