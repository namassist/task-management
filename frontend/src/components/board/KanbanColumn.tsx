import { Droppable, Draggable } from '@hello-pangea/dnd'
import { type ReactNode, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState.tsx'
import type { Task, TaskStatus } from '@/types/task.ts'
import { TaskCard } from './TaskCard.tsx'

interface KanbanColumnProps {
  status: TaskStatus | 'all'
  icon: ReactNode
  tasks: Task[]
  loading: boolean
  isFetchingMore: boolean
  hasMore: boolean
  taskCount?: number
  disableDrag?: boolean
  onRename: (task: Task, nextTitle: string) => Promise<boolean>
  onDelete: (task: Task) => Promise<void>
  onToggleStatus: (task: Task) => Promise<void>
  onEditTask: (task: Task) => void
  onLoadMore: () => void
}

export function KanbanColumn({
  status,
  icon,
  tasks,
  loading,
  isFetchingMore,
  hasMore,
  taskCount,
  disableDrag = false,
  onRename,
  onDelete,
  onToggleStatus,
  onEditTask,
  onLoadMore,
}: KanbanColumnProps) {
  const isCompleted = status === 'Completed'
  const isSingleMode = status === 'all'
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!hasMore || isFetchingMore || loading) return

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 1.0 },
    )

    if (loadMoreRef.current) {
      observer.current.observe(loadMoreRef.current)
    }

    return () => observer.current?.disconnect()
  }, [hasMore, isFetchingMore, loading, onLoadMore])

  const droppableId = isSingleMode ? 'single-list' : status
  const displayCount = taskCount ?? tasks.length
  const columnLabel = isSingleMode ? 'All Tasks' : status

  return (
    <Droppable droppableId={droppableId} isDropDisabled={disableDrag}>
      {(provided, snapshot) => (
        <section
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`relative rounded-[24px] bg-[rgba(41,44,60,0.94)] p-4 sm:p-5 shadow-[0_20px_55px_rgba(17,17,27,0.22)] transition duration-200 ${
            snapshot.isDraggingOver ? 'ring-2 ring-[rgba(140,170,238,0.4)]' : ''
          }`}
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center">{icon}</div>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ctp-subtext0 sm:text-sm">
                {columnLabel}
              </h2>
            </div>

            <span className="rounded-full bg-[rgba(81,87,109,0.95)] px-3 py-1 text-xs font-semibold text-ctp-text">
              {displayCount}
            </span>
          </div>

          <div className="flex max-h-[65vh] flex-col overflow-y-auto pr-2">
            <div className="flex min-h-88 flex-col gap-4">
              {tasks.length === 0 && !loading ? (
                <EmptyState
                  title={
                    isSingleMode
                      ? 'No tasks found'
                      : isCompleted
                        ? 'No completed tasks yet'
                        : 'No pending tasks'
                  }
                  message={
                    isSingleMode
                      ? 'Create a task to get started.'
                      : isCompleted
                        ? 'Complete a task or drag one here to move it into done.'
                        : 'Add a task above to start filling this column.'
                  }
                />
              ) : (
                tasks.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={String(task.id)}
                    index={index}
                    isDragDisabled={disableDrag}
                  >
                    {(draggableProvided, draggableSnapshot) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        style={draggableProvided.draggableProps.style}
                      >
                        <TaskCard
                          dragHandleProps={disableDrag ? null : draggableProvided.dragHandleProps}
                          isDragging={draggableSnapshot.isDragging}
                          task={task}
                          onDelete={onDelete}
                          onRename={onRename}
                          onToggleStatus={onToggleStatus}
                          onEditTask={onEditTask}
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}

              <div ref={loadMoreRef} className="mt-2 flex justify-center pb-2">
                {isFetchingMore && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(202,158,230,0.14)] text-ctp-lavender">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </Droppable>
  )
}
