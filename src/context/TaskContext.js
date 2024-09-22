'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TaskContext = createContext(undefined)

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

  const fetchTasks = async (authToken) => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/tasks/fetchalltask', {
        headers: { 'auth-token': authToken },
      })
      const data = await response.json()
      if (response.ok) {
        setTasks(data.tasks)
      } else {
        throw new Error(data.error || 'Failed to fetch tasks')
      }
    } catch (error) {
      console.error('Fetch tasks error:', error)
      setError('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (response.ok) {
        setToken(data.authToken)
        localStorage.setItem('token', data.authToken)
        await fetchTasks(data.authToken)
        router.push('/dashboard')
        return { success: true }
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/auth/createuser', {
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
      console.error('Signup error:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('token')
    setTasks([])
    router.push('/login')
  }

  const addTask = async (task) => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/tasks/addtask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
        },
        body: JSON.stringify(task),
      })
      const data = await response.json()
      if (response.ok) {
        setTasks([...tasks, data.savedTask])
        return { success: true, task: data.savedTask }
      } else {
        throw new Error(data.error || 'Failed to add task')
      }
    } catch (error) {
      console.error('Add task error:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (updatedTask) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/tasks/updatetask/${updatedTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
        },
        body: JSON.stringify(updatedTask),
      })
      const data = await response.json()
      if (response.ok) {
        setTasks(tasks.map(task => task._id === updatedTask._id ? data : task))
        return { success: true, task: data }
      } else {
        throw new Error(data.error || 'Failed to update task')
      }
    } catch (error) {
      console.error('Update task error:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/tasks/deletetask/${id}`, {
        method: 'DELETE',
        headers: { 'auth-token': token },
      })
      if (response.ok) {
        setTasks(tasks.filter(task => task._id !== id))
        return { success: true }
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Delete task error:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

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
      fetchTasks: () => fetchTasks(token)
    }}>
      {children}
    </TaskContext.Provider>
  )
}