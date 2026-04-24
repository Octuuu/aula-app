import React from 'react'

const variants = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-600',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-indigo-100 text-indigo-700',
  gray: 'bg-gray-100 text-gray-600',
}

const Badge = ({ label, variant = 'gray', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${variants[variant] || variants.gray} ${className}`}
    >
      {label}
    </span>
  )
}

export default Badge