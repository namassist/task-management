import * as React from 'react'
import { CalendarDays, CircleDashed, PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { cn } from '@/lib/utils.ts'
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from '@/types/task.ts'

interface TaskFormDialogProps {
  defaultStatus: TaskStatus
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onSave: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>
}

export function TaskFormDialog({
  defaultStatus,
  open,
  onOpenChange,
  task,
  onSave,
}: TaskFormDialogProps) {
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [dueDate, setDueDate] = React.useState('')
  const [status, setStatus] = React.useState<TaskStatus>('Pending')
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      return
    }

    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setDueDate(task.due_date)
      setStatus(task.status)
    } else {
      setTitle('')
      setDescription('')
      setDueDate(new Date().toISOString().split('T')[0])
      setStatus(defaultStatus)
    }

    setErrors({})
  }, [defaultStatus, open, task])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!dueDate) {
      newErrors.due_date = 'Due date is required'
    } else {
      const selectedDate = new Date(dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.due_date = 'Due date cannot be in the past'
      }
    }

    if (!status) {
      newErrors.status = 'Status is required'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      const inputData = {
        title,
        description: description || null,
        due_date: dueDate,
        status,
      }

      await onSave(task ? (inputData satisfies UpdateTaskInput) : (inputData satisfies CreateTaskInput))
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setErrors({})
    onOpenChange(false)
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="surface-pill mb-1 flex h-12 w-12 items-center justify-center rounded-2xl">
            {task ? (
              <PencilLine className="h-5 w-5 text-ctp-lavender" />
            ) : (
              <CircleDashed className="h-5 w-5 text-ctp-yellow" />
            )}
          </div>
          <DialogTitle>{task ? 'Edit task card' : 'Create a new card'}</DialogTitle>
          <DialogDescription>
            {task
              ? 'Update the title, notes, due date, or lane without leaving the board.'
              : 'Add the task details below and place the card in the right lane from the start.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-ctp-red">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="For example: Prepare sprint handoff"
                  disabled={loading}
                  className={cn(errors.title && 'border border-ctp-red')}
                />
                {errors.title ? (
                  <p className="text-xs text-ctp-red">{errors.title}</p>
                ) : (
                  <p className="text-xs text-ctp-subtext0">
                    Keep it short enough to scan quickly inside a card.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add the context teammates need without opening other docs."
                  disabled={loading}
                  rows={5}
                />
              </div>
            </div>

            <div className="rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(35,38,52,0.45)] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-ctp-subtext1">
                <CalendarDays className="h-4 w-4 text-ctp-blue" />
                Card settings
              </div>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">
                    Due date <span className="text-ctp-red">*</span>
                  </Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={dueDate}
                    min={minDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    disabled={loading}
                    className={cn(errors.due_date && 'border border-ctp-red')}
                  />
                  {errors.due_date && <p className="text-xs text-ctp-red">{errors.due_date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-ctp-red">*</span>
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as TaskStatus)}
                    disabled={loading}
                  >
                    <SelectTrigger id="status" className={errors.status ? 'border border-ctp-red' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status ? (
                    <p className="text-xs text-ctp-red">{errors.status}</p>
                  ) : (
                    <p className="text-xs text-ctp-subtext0">
                      Choose the lane where this card should appear.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-xs leading-6 text-ctp-subtext0">
            Required fields are validated before saving. Dates in the past are blocked to keep the
            board timeline readable.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : task ? 'Update card' : 'Create card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
