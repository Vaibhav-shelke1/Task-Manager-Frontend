'use client'

import React, { useState, useEffect } from "react"
import { useTaskContext } from '@/context/TaskContext'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toaster"
import { Pencil } from "lucide-react"

export default function EditTaskDialog({ taskId }) {
  const { updateTask, tasks } = useTaskContext()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [task, setTask] = useState({
    _id: "",
    title: "",
    description: "",
    status: "",
    priority: "",
    dueDate: "",
  })

  useEffect(() => {
    const currentTask = tasks.find((t) => t._id === taskId)
    if (currentTask) {
      setTask(currentTask)
    }
  }, [taskId, tasks])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateTask(task)
      setOpen(false)
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating your task.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (name, value) => {
    setTask((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={task.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={task.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={task.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={task.priority}
              onValueChange={(value) => handleChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={task.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}