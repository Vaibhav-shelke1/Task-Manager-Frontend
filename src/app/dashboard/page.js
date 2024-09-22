'use client'

import { useState, useEffect } from 'react'
import { useTaskContext } from '@/context/TaskContext'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function Component() {
  const { tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask } = useTaskContext()
  const [editingTask, setEditingTask] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [alert, setAlert] = useState({ type: null, message: null })
  const [filteredTasks, setFilteredTasks] = useState(tasks)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
  const [filterConfig, setFilterConfig] = useState({ status: 'All', priority: 'All', search: '' })

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => {
        setAlert({ type: null, message: null })
      }, 15000)
      return () => clearTimeout(timer)
    }
  }, [alert])

  useEffect(() => {
    let result = tasks

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

    setFilteredTasks(result)
  }, [tasks, filterConfig, sortConfig])

  const showAlert = (type, message) => {
    setAlert({ type, message })
  }

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

  const handleEditTask = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

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

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const result = await deleteTask(taskId)
        if (result.success) {
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

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task._id === active.id)
      const newIndex = tasks.findIndex((task) => task._id === over.id)
      const newTasks = arrayMove(tasks, oldIndex, newIndex)

      const updatedTask = {
        ...newTasks[newIndex],
        status: over.data.current.task.status
      }

      try {
        const result = await updateTask(updatedTask)
        if (result.success) {
          // Update local state immediately
          const updatedTasks = tasks.map(task => 
            task._id === updatedTask._id ? updatedTask : task
          )
          fetchTasks() // Refresh tasks from the server
          showAlert('success', "Task status updated successfully")
        } else {
          showAlert('error', result.error || "Failed to update task status. Please try again.")
        }
      } catch (error) {
        console.error('Error in handleDragEnd:', error)
        showAlert('error', "An unexpected error occurred. Please try again.")
      }
    }
  }

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Task Management</h1>
      {alert.message && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-4">
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Tasks Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <Input
                type="text"
                placeholder="Search tasks..."
                value={filterConfig.search}
                onChange={(e) => setFilterConfig({...filterConfig, search: e.target.value})}
                className="w-full sm:w-auto"
              />
              <Select
                value={filterConfig.status}
                onValueChange={(value) => setFilterConfig({...filterConfig, status: value})}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
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
                <SelectTrigger className="w-full sm:w-[180px]">
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
            <Tabs defaultValue="list">
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
                <KanbanBoard tasks={tasks} onDragEnd={handleDragEnd} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm onSubmit={handleAddTask} />
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Make changes to your task here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <TaskForm task={editingTask} onSubmit={handleUpdateTask} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TaskList({ tasks, onEdit, onDelete, onSort, sortConfig }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Button variant="ghost" onClick={() => onSort('title')}>
          Title {sortConfig.key === 'title' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
        </Button>
        <Button variant="ghost" onClick={() => onSort('status')}>
          Status {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
        </Button>
        <Button variant="ghost" onClick={() => onSort('priority')}>
          Priority {sortConfig.key === 'priority' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
        </Button>
        <Button variant="ghost" onClick={() => onSort('dueDate')}>
          Due Date {sortConfig.key === 'dueDate' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
        </Button>
        <span>Actions</span>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task._id} className="p-4 rounded shadow bg-card text-card-foreground">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{task.title}</h3>
                <p>{task.description}</p>
                <p>Status: {task.status}</p>
                <p>Priority: {task.priority}</p>
                <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <Button className='mx-2' variant="ghost" size="icon" onClick={() => onEdit(task)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(task._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function KanbanBoard({ tasks, onDragEnd }) {
  const columns = ['To Do', 'In Progress', 'Completed']
  const sensors = useSensors(useSensor(PointerSensor))

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <div key={column} className="p-4 rounded bg-secondary">
            <h3 className="font-bold mb-2">{column}</h3>
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

function SortableTask({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
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
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 mb-2 rounded shadow cursor-move bg-card text-card-foreground"
    >
      <h4 className="font-bold">{task.title}</h4>
      <p className="text-sm">{task.description}</p>
      <p className="text-xs">Priority: {task.priority}</p>
      <p className="text-xs">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
    </div>
  )
}

function TaskForm({ task, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        type="text"
        name="title"
        placeholder="Task Title"
        defaultValue={task ? task.title : ''}
        required
      />
      <Textarea
        name="description"
        placeholder="Task Description"
        defaultValue={task ? task.description : ''}
      />
      <Select name="status" defaultValue={task ? task.status : 'To Do'}>
        <SelectTrigger>
          <SelectValue placeholder="Select Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="To Do">To Do</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Select name="priority" defaultValue={task ? task.priority : 'Medium'}>
        <SelectTrigger>
          <SelectValue placeholder="Select Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="date"
        name="dueDate"
        defaultValue={task ? task.dueDate.split('T')[0] : ''}
        required
      />
      <Button type="submit">{task ? 'Update Task' : 'Add Task'}</Button>
    </form>
  )
}