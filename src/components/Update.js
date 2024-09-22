'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTaskContext } from '@/context/TaskContext'

export function DialogDemo({ taskId, children }) {
  const { updateTask, tasks } = useTaskContext()
  const [open, setOpen] = useState(false)
  const [task, setTask] = useState({ _id: "", title: "", description: "", status: "", priority: "", dueDate: "" })
  const [notification, setNotification] = useState(null)
    

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const success = await updateTask(task)
      if (success) {
        setOpen(false)
        setNotification({ type: 'success', message: 'Task updated successfully.' })
      } else {
        throw new Error("Failed to update task")
      }
    } catch (error) {
      setNotification({ type: 'error', message: 'There was a problem updating your task.' })
    }
  }

  const handleChange = (name, value) => {
    setTask(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || <Button variant="outline">Edit</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              id="title"
              name="title"
              placeholder="Task Title"
              value={task.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
            <Textarea
              id="description"
              name="description"
              placeholder="Task Description"
              value={task.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            <Select name="status" value={task.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select name="priority" value={task.priority} onValueChange={(value) => handleChange('priority', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              id="dueDate"
              name="dueDate"
              value={task.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              required
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notification.message}
        </div>
      )}
    </>
  )
}

// Comment: The code appears to be correct. If there is an error, it might be in the context or the components being imported. Ensure that the `useTaskContext` hook and the UI components are correctly implemented and imported.