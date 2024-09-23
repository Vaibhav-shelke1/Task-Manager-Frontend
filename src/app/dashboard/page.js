'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTaskContext } from '@/context/TaskContext'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Plus, Calendar, Flag, ArrowUpDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DndContext, closestCorners, TouchSensor, MouseSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Main component for the Task Management Dashboard
export default function Component() {
  const { tasks: contextTasks, loading, error, fetchTasks, addTask, updateTask, deleteTask } = useTaskContext()
  const [editingTask, setEditingTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [alert, setAlert] = useState({ type: null, message: null })
  const [localTasks, setLocalTasks] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
  const [filterConfig, setFilterConfig] = useState({ status: 'All', priority: 'All', search: '' })

  // Configure sensors for drag and drop functionality
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  // Load tasks from localStorage or fetch from server on initial render
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks')
    if (storedTasks) {
      setLocalTasks(JSON.parse(storedTasks))
    } else {
      fetchTasks()
    }
  }, [fetchTasks])

  // Update localTasks and localStorage when contextTasks change
  useEffect(() => {
    if (contextTasks.length > 0) {
      setLocalTasks(contextTasks)
      localStorage.setItem('tasks', JSON.stringify(contextTasks))
    }
  }, [contextTasks])

  // Clear alert message after 15 seconds
  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => {
        setAlert({ type: null, message: null })
      }, 15000)
      return () => clearTimeout(timer)
    }
  }, [alert])

  // Filter and sort tasks based on current configuration
  const filterAndSortTasks = useCallback(() => {
    let result = localTasks

    if (filterConfig.status !== 'All') {
      result = result.filter(task => task.status === filterConfig.status)
    }
    if (filterConfig.priority !== 'All') {
      result = result.filter(task => task.priority === filterConfig.priority)
    }
    if (filterConfig.search) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(filterConfig.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filterConfig.search.toLowerCase())
      )
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }

    return result
  }, [localTasks, filterConfig, sortConfig])

  // Display alert message
  const showAlert = (type, message) => {
    setAlert({ type, message })
  }

  // Handle adding a new task
  const handleAddTask = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newTask = {
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
      priority: formData.get('priority'),
      dueDate: formData.get('dueDate'),
    }
    try {
      const result = await addTask(newTask)
      if (result.success) {
        const updatedTasks = [...localTasks, result.task]
        setLocalTasks(updatedTasks)
        localStorage.setItem('tasks', JSON.stringify(updatedTasks))
        e.target.reset()
        showAlert('success', "Task added successfully")
      } else {
        showAlert('error', result.error || "Failed to add task. Please try again.")
      }
    } catch (error) {
      console.error('Error in handleAddTask:', error)
      showAlert('error', "An unexpected error occurred. Please try again.")
    }
  }

  // Set the task to be edited and open the edit modal
  const handleEditTask = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  // Handle updating an existing task
  const handleUpdateTask = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const updatedTask = {
      ...editingTask,
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
      priority: formData.get('priority'),
      dueDate: formData.get('dueDate'),
    }
    try {
      const result = await updateTask(updatedTask)
      if (result.success) {
        const updatedTasks = localTasks.map(task => task._id === updatedTask._id ? updatedTask : task)
        setLocalTasks(updatedTasks)
        localStorage.setItem('tasks', JSON.stringify(updatedTasks))
        setEditingTask(null)
        setIsModalOpen(false)
        showAlert('success', "Task updated successfully")
      } else {
        showAlert('error', result.error || "Failed to update task. Please try again.")
      }
    } catch (error) {
      console.error('Error in handleUpdateTask:', error)
      showAlert('error', "An unexpected error occurred. Please try again.")
    }
  }

  // Handle deleting a task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const result = await deleteTask(taskId)
        if (result.success) {
          const updatedTasks = localTasks.filter(task => task._id !== taskId)
          setLocalTasks(updatedTasks)
          localStorage.setItem('tasks', JSON.stringify(updatedTasks))
          showAlert('success', "Task deleted successfully")
        } else {
          showAlert('error', result.error || "Failed to delete task. Please try again.")
        }
      } catch (error) {
        console.error('Error in handleDeleteTask:', error)
        showAlert('error', "An unexpected error occurred. Please try again.")
      }
    }
  }

  // Handle drag and drop of tasks
  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = localTasks.findIndex((task) => task._id === active.id)
      const newIndex = localTasks.findIndex((task) => task._id === over.id)
      const newTasks = arrayMove(localTasks, oldIndex, newIndex)

      const updatedTask = {
        ...newTasks[newIndex],
        status: over.data.current.task.status
      }

      setLocalTasks(newTasks)
      localStorage.setItem('tasks', JSON.stringify(newTasks))

      try {
        const result = await updateTask(updatedTask)
        if (result.success) {
          showAlert('success', "Task status updated successfully")
        } else {
          showAlert('error', result.error || "Failed to update task status. Please try again.")
          // Revert the change if the server update fails
          setLocalTasks(localTasks)
          localStorage.setItem('tasks', JSON.stringify(localTasks))
        }
      } catch (error) {
        console.error('Error in handleDragEnd:', error)
        showAlert('error', "An unexpected error occurred. Please try again.")
        // Revert the change if there's an error
        setLocalTasks(localTasks)
        localStorage.setItem('tasks', JSON.stringify(localTasks))
      }
    }
  }

  // Handle sorting of tasks
  const handleSort = (key) => {
    let direction = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  const filteredTasks = filterAndSortTasks()

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-purple-800 dark:text-purple-300">Task Management</h1>
      {alert.message && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4 bg-opacity-90 backdrop-blur-sm">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-700 dark:text-purple-300">Tasks Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <Input
                type="text"
                placeholder="Search tasks..."
                value={filterConfig.search}
                onChange={(e) => setFilterConfig({...filterConfig, search: e.target.value})}
                className="w-full sm:w-auto bg-white dark:bg-gray-700"
              />
              <Select
                value={filterConfig.status}
                onValueChange={(value) => setFilterConfig({...filterConfig, status: value})}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterConfig.priority}
                onValueChange={(value) => setFilterConfig({...filterConfig, priority: value})}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-700">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Priorities</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Tabs defaultValue="board" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="board">Board View</TabsTrigger>
              </TabsList>
              <TabsContent value="list">
                <TaskList
                  tasks={filteredTasks}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                />
              </TabsContent>
              <TabsContent value="board">
                <KanbanBoard tasks={filteredTasks} onDragEnd={handleDragEnd} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <div>
          <Card className="bg-white dark:bg-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-purple-700 dark:text-purple-300">Add New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm onSubmit={handleAddTask} />
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl text-purple-700 dark:text-purple-300">Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <TaskForm task={editingTask} onSubmit={handleUpdateTask} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Component for displaying tasks in a list format
function TaskList({ tasks, onEdit, onDelete, onSort, sortConfig }) {
  return (
    <div className="space-y-4">
      <div className="hidden md:grid md:grid-cols-5 gap-4 font-semibold text-sm text-gray-500 dark:text-gray-400">
        <div className="col-span-2">
          <Button variant="ghost" onClick={() => onSort('title')} className="w-full justify-start">
            Title {sortConfig.key === 'title' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
          </Button>
        </div>
        <div>
          <Button variant="ghost" onClick={() => onSort('status')} className="w-full justify-start">
            Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
          </Button>
        </div>
        <div>
          <Button variant="ghost" onClick={() => onSort('priority')} className="w-full justify-start">
            Priority {sortConfig.key === 'priority' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
          </Button>
        </div>
        <div>
          <Button variant="ghost" onClick={() => onSort('dueDate')} className="w-full justify-start">
            Due Date {sortConfig.key === 'dueDate' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
          </Button>
        </div>
      </div>
      {tasks.map((task) => (
        <Card key={task._id} className="bg-white dark:bg-gray-800 shadow hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="md:hidden mb-2">
              <Button variant="ghost" onClick={() => onSort('title')} className="w-full justify-start text-sm font-semibold text-purple-700 dark:text-purple-300">
                Sort by Title <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="md:grid md:grid-cols-5 gap-4 items-center">
              <div className="col-span-2 mb-2 md:mb-0">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">{task.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
              </div>
              <div className="mb-2 md:mb-0">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${task.status === 'To Do' ? 'bg-yellow-200 text-yellow-800' :
                    task.status === 'In Progress' ? 'bg-blue-200 text-blue-800' :
                    'bg-green-200 text-green-800'}`}>
                  {task.status}
                </span>
              </div>
              <div className="mb-2 md:mb-0">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${task.priority === 'Low' ? 'bg-gray-200 text-gray-800' :
                    task.priority === 'Medium' ? 'bg-orange-200 text-orange-800' :
                    'bg-red-200 text-red-800'}`}>
                  {task.priority}
                </span>
              </div>
              <div className="mb-2 md:mb-0 text-sm text-gray-600 dark:text-gray-400">
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(task._id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Component for displaying tasks in a Kanban board format
function KanbanBoard({ tasks, onDragEnd }) {
  const columns = ['To Do', 'In Progress', 'Completed']
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <div key={column} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
            <h3 className="font-bold mb-4 text-lg text-center text-purple-700 dark:text-purple-300">{column}</h3>
            <SortableContext items={tasks.filter((task) => task.status === column).map((task) => task._id)} strategy={verticalListSortingStrategy}>
              {tasks
                .filter((task) => task.status === column)
                .map((task) => (
                  <SortableTask key={task._id} task={task} />
                ))}
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  )
}

// Component for individual draggable task items in the Kanban board
function SortableTask({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task._id,
    data: {
      type: 'Task',
      task,
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'move',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 mb-3 rounded-lg shadow bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200"
    >
      <h4 className="font-bold text-purple-700 dark:text-purple-300">{task.title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
      <div className="flex justify-between items-center mt-2">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold
          ${task.priority === 'Low' ? 'bg-gray-200 text-gray-800' :
            task.priority === 'Medium' ? 'bg-orange-200 text-orange-800' :
            'bg-red-200 text-red-800'}`}>
          {task.priority}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

// Component for the task form (used for both adding and editing tasks)
function TaskForm({ task, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        type="text"
        name="title"
        placeholder="Task Title"
        defaultValue={task ? task.title : ''}
        required
        className="w-full bg-white dark:bg-gray-700"
      />
      <Textarea
        name="description"
        placeholder="Task Description"
        defaultValue={task ? task.description : ''}
        className="w-full bg-white dark:bg-gray-700"
      />
      <Select name="status" defaultValue={task ? task.status : 'To Do'}>
        <SelectTrigger className="w-full bg-white dark:bg-gray-700">
          <SelectValue placeholder="Select Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="To Do">To Do</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select name="priority" defaultValue={task ? task.priority : 'Medium'}>
        <SelectTrigger className="w-full bg-white dark:bg-gray-700">
          <SelectValue placeholder="Select Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        {/* <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" /> */}
        <Input
          type="date"
          name="dueDate"
          defaultValue={task ? task.dueDate.split('T')[0] : ''}
          required
          className="flex-grow bg-white dark:bg-gray-700"
        />
      </div>
      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
        {task ? 'Update Task' : 'Add Task'}
        {task ? <Pencil className="ml-2 h-4 w-4" /> : <Plus className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  )
}