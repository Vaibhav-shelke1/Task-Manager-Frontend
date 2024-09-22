'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const TaskContext = createContext(undefined)
const common_url = "https://task-manager-backend-wqxa.vercel.app"

export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
}

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([])
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchTasks(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const handleApiError = useCallback((error, customMessage) => {
    console.error(customMessage, error)
    if (error.response && error.response.status === 401) {
      setError('Session expired. Please login again.')
      logout()
    } else {
      setError(error.message || customMessage)
    }
  }, [])

  const fetchTasks = useCallback(async (authToken) => {
    try {
      setLoading(true)
      const response = await fetch(`${common_url}/api/tasks/fetchalltask`, {
        headers: { 'auth-token': authToken },
      })
      const data = await response.json()
      if (response.ok) {
        setTasks(data.tasks)
      } else {
        throw new Error(data.error || 'Failed to fetch tasks')
      }
    } catch (error) {
      handleApiError(error, 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [handleApiError])

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await fetch(`${common_url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (data.success) {
        setToken(data.authToken)
        localStorage.setItem('token', data.authToken)
        await fetchTasks(data.authToken)
        router.push('/dashboard')
        return { success: true }
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (error) {
      handleApiError(error, 'Login failed')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    try {
      setLoading(true)
      const response = await fetch(`${common_url}/api/auth/createuser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (response.ok) {
        setToken(data.authToken)
        localStorage.setItem('token', data.authToken)
        await fetchTasks(data.authToken)
        router.push('/dashboard')
        return { success: true }
      } else {
        throw new Error(data.error || 'Signup failed')
      }
    } catch (error) {
      handleApiError(error, 'Signup failed')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    setToken(null)
    localStorage.removeItem('token')
    setTasks([])
    router.push('/login')
  }, [router])

  const addTask = async (task) => {
    try {
      setLoading(true)
      const response = await fetch(`${common_url}/api/tasks/addtask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
        },
        body: JSON.stringify(task),
      })
      const data = await response.json()
      if (response.ok) {
        setTasks(prevTasks => [...prevTasks, data.savedTask])
        return { success: true, task: data.savedTask }
      } else {
        throw new Error(data.error || 'Failed to add task')
      }
    } catch (error) {
      handleApiError(error, 'Failed to add task')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (updatedTask) => {
    try {
      setLoading(true)
      const response = await fetch(`${common_url}/api/tasks/updatetask/${updatedTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
        },
        body: JSON.stringify(updatedTask),
      })
      const data = await response.json()
      if (response.ok) {
        setTasks(prevTasks => prevTasks.map(task => task._id === updatedTask._id ? data : task))
        return { success: true, task: data }
      } else {
        throw new Error(data.error || 'Failed to update task')
      }
    } catch (error) {
      handleApiError(error, 'Failed to update task')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${common_url}/api/tasks/deletetask/${id}`, {
        method: 'DELETE',
        headers: { 'auth-token': token },
      })
      if (response.ok) {
        setTasks(prevTasks => prevTasks.filter(task => task._id !== id))
        return { success: true }
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete task')
      }
    } catch (error) {
      handleApiError(error, 'Failed to delete task')
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <TaskContext.Provider value={{
      tasks,
      token,
      loading,
      error,
      login,
      signup,
      logout,
      addTask,
      updateTask,
      deleteTask,
      fetchTasks: () => fetchTasks(token),
      clearError
    }}>
      {children}
    </TaskContext.Provider>
  )
}
