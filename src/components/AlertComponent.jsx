'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from 'lucide-react'


export function AlertComponent({ message, type, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 15000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  const alertStyles = {
    success: 'bg-green-100 border-green-400 text-green-700 dark:bg-green-800 dark:border-green-600 dark:text-green-200',
    error: 'bg-red-100 border-red-400 text-red-700 dark:bg-red-800 dark:border-red-600 dark:text-red-200',
    info: 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-800 dark:border-blue-600 dark:text-blue-200'
  }

  return (
    <Alert className={`${alertStyles[type]} border-l-4 p-4 mb-4 rounded-md shadow-md transition-all duration-300 ease-in-out`}>
      <div className="flex justify-between items-center">
        <AlertDescription>{message}</AlertDescription>
        <button
          onClick={() => {
            setIsVisible(false)
            onClose()
          }}
          className="text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1 hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors duration-200"
        >
          <X size={16} />
        </button>
      </div>
    </Alert>
  )
}