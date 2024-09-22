'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTaskContext } from '@/context/TaskContext'

export default function Home() {
  const router = useRouter()
  const { token } = useTaskContext()

  useEffect(() => {
    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [token, router])

  return null // This component doesn't render anything, it just handles redirection
}