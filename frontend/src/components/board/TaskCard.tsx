import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import {
  Calendar,
  CheckCircle2,
  Clock3,
  GripVertical,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils.ts'
import type { Task } from '@/types/task.ts'

interface TaskCardProps {
  task: Task
  isDragging: boolean
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined
  onRename: (task: Task, nextTitle: string) => Promise<boolean>
  onDelete: (task: Task) => Promise<void>
  onToggleStatus: (task: Task) => Promise<void>
  onEditTask: (task: Task) => void
}

export function TaskCard({
  task,
  isDragging,
  dragHandleProps,
  onRename,
  onDelete,
  onToggleStatus,
  onEditTask,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(task.title)
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const isCompleted = task.status === 'Completed'

  useEffect(() => {
    setDraftTitle(task.title)
  }, [task.title])

  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }
  }, [isEditing])

  const commitTitle = async () => {
    if (isSavingTitle) {
      return
    }

    const nextTitle = draftTitle.trim()
    if (!nextTitle) {
      setDraftTitle(task.title)
      setIsEditing(false)
      return
    }

    if (nextTitle === task.title) {
      setIsEditing(false)
      return
    }

    setIsSavingTitle(true)
    try {
      const didSave = await onRename(task, nextTitle)
      if (didSave) {
        setIsEditing(false)
      } else {
        setDraftTitle(task.title)
      }
    } finally {
      setIsSavingTitle(false)
    }
  }

  const cancelEditing = () => {
    setDraftTitle(task.title)
    setIsEditing(false)
  }

  return (
    <article
      className={cn(
        'group relative rounded-2xl border border-[rgba(140,170,238,0.12)] bg-[rgba(81,87,109,0.56)] px-3 py-3 shadow-[inset_0_0_0_1px_rgba(140,170,238,0.04)] transition duration-200',
        isDragging && 'rotate-1 scale-[1.02] shadow-[0_22px_45px_rgba(17,17,27,0.4)]',
      )}
    >
      <div className="flex items-start gap-2">
        {dragHandleProps && (
          <button
            type="button"
            title={`Drag ${task.title}`}
            aria-label={`Drag ${task.title}`}
            className="mt-0 flex h-6 w-5 shrink-0 items-center justify-center rounded-lg text-ctp-overlay1 transition hover:bg-[rgba(255,255,255,0.08)] hover:text-ctp-text"
            {...dragHandleProps}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 shrink-0">
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-ctp-green" />
              ) : (
                <Clock3 className="h-4 w-4 text-(--ctp-peach)" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  ref={titleInputRef}
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onBlur={() => void commitTitle()}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      void commitTitle()
                    }

                    if (event.key === 'Escape') {
                      event.preventDefault()
                      cancelEditing()
                    }
                  }}
                  className="w-full rounded-[14px] border border-[rgba(202,158,230,0.45)] bg-[rgba(17,17,27,0.24)] px-2.5 py-1.5 text-sm font-medium text-ctp-text outline-none"
                />
              ) : (
                <button
                  type="button"
                  title="Edit task title"
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    'block text-left text-sm sm:text-base font-medium text-ctp-text transition hover:text-ctp-lavender',
                    isCompleted && 'text-ctp-subtext0 line-through',
                  )}
                >
                  {task.title}
                </button>
              )}

              {task.due_date && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[0.7rem] sm:text-xs font-medium text-ctp-overlay1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(task.due_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="absolute right-2 top-2 z-10 flex items-center justify-end gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 rounded-full bg-[rgba(30,30,46,0.85)] p-1 backdrop-blur-sm">
              <button
                type="button"
                title={isCompleted ? 'Reopen Task' : 'Complete Task'}
                onClick={() => void onToggleStatus(task)}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:scale-110',
                  isCompleted
                    ? 'bg-[rgba(229,200,144,0.15)] text-ctp-yellow hover:bg-[rgba(229,200,144,0.25)]'
                    : 'bg-[rgba(166,209,137,0.15)] text-ctp-green hover:bg-[rgba(166,209,137,0.25)]',
                )}
              >
                {isCompleted ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                title="Edit Task Details"
                onClick={() => onEditTask(task)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(202,158,230,0.15)] text-ctp-lavender transition hover:scale-110 hover:bg-[rgba(202,158,230,0.25)]"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                title="Delete Task"
                onClick={() => void onDelete(task)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(231,130,132,0.15)] text-ctp-red transition hover:scale-110 hover:bg-[rgba(231,130,132,0.25)]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
