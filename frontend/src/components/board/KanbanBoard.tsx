import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { AlertTriangle, CheckCircle2, Clock3, LayoutList, Loader2, Plus, Rows4 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TaskFormDialog } from '@/components/forms/TaskFormDialog.tsx'
import { useTaskStore } from '@/store/task-store.ts'
import type { SortBy } from '@/api/tasks.ts'
import type { CreateTaskInput, Task, TaskStatus, UpdateTaskInput } from '@/types/task.ts'
import { KanbanColumn } from './KanbanColumn.tsx'

const SORT_OPTIONS: { label: string; sortBy: SortBy; order: 'asc' | 'desc' }[] = [
  { label: 'Newest', sortBy: 'created_at', order: 'desc' },
  { label: 'Oldest', sortBy: 'created_at', order: 'asc' },
  { label: 'Due Date (Newest)', sortBy: 'due_date', order: 'desc' },
  { label: 'Due Date (Oldest)', sortBy: 'due_date', order: 'asc' },
  { label: 'Title (A-Z)', sortBy: 'title', order: 'asc' },
]

export function KanbanBoard() {
  const {
    viewMode,
    setViewMode,
    error,
    single,
    pendingColumn,
    completedColumn,
    fetchSingleTasks,
    loadMoreSingleTasks,
    fetchColumnTasks,
    loadMoreColumnTasks,
    createTask,
    deleteTask,
    updateTask,
    patchTaskStatus,
  } = useTaskStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [sortIndex, setSortIndex] = useState(0)
  const [singleFilter, setSingleFilter] = useState<TaskStatus | 'all'>('all')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  const currentSort = SORT_OPTIONS[sortIndex]

  const isInitialLoading =
    viewMode === 'single'
      ? single.loading && single.tasks.length === 0
      : pendingColumn.loading &&
        completedColumn.loading &&
        pendingColumn.tasks.length === 0 &&
        completedColumn.tasks.length === 0

  useEffect(() => {
    if (viewMode === 'single') {
      fetchSingleTasks({ sortBy: currentSort.sortBy, order: currentSort.order })
    } else {
      fetchColumnTasks('Pending', { sortBy: currentSort.sortBy, order: currentSort.order })
      fetchColumnTasks('Completed', { sortBy: currentSort.sortBy, order: currentSort.order })
    }
  }, [viewMode, sortIndex])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setSortMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSortChange = (index: number) => {
    setSortIndex(index)
    setSortMenuOpen(false)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  const handleSaveForm = async (data: CreateTaskInput | UpdateTaskInput) => {
    if (editingTask) {
      try {
        await updateTask(editingTask.id, data as UpdateTaskInput)
      } catch {
        refreshData()
      }
    } else {
      try {
        await createTask(data as CreateTaskInput)
      } catch {}
    }
  }

  const handleRenameTask = async (task: Task, nextTitle: string) => {
    const title = nextTitle.trim()
    if (!title || title === task.title) return true

    const payload: UpdateTaskInput = {
      title,
      description: task.description,
      due_date: task.due_date,
      status: task.status,
    }

    try {
      await updateTask(task.id, payload)
      return true
    } catch {
      refreshData()
      return false
    }
  }

  const handleDeleteTask = async (task: Task) => {
    try {
      await deleteTask(task.id)
    } catch {
      refreshData()
    }
  }

  const handleToggleStatus = async (task: Task) => {
    const destinationStatus: TaskStatus = task.status === 'Pending' ? 'Completed' : 'Pending'

    try {
      await patchTaskStatus(task.id, destinationStatus)
    } catch {
      refreshData()
    }
  }

  const handleDragEnd = async ({ source, destination, draggableId }: DropResult) => {
    if (!destination) return

    const sourceStatus = source.droppableId as TaskStatus
    const destinationStatus = destination.droppableId as TaskStatus
    const taskId = Number(draggableId)

    if (sourceStatus === destinationStatus && source.index === destination.index) return
    if (sourceStatus === destinationStatus) return

    try {
      await patchTaskStatus(taskId, destinationStatus)
    } catch {
      refreshData()
    }
  }

  const refreshData = () => {
    if (viewMode === 'single') {
      fetchSingleTasks({ sortBy: currentSort.sortBy, order: currentSort.order })
    } else {
      fetchColumnTasks('Pending', { sortBy: currentSort.sortBy, order: currentSort.order })
      fetchColumnTasks('Completed', { sortBy: currentSort.sortBy, order: currentSort.order })
    }
  }

  const filteredSingleTasks = useMemo(() => {
    if (singleFilter === 'all') return single.tasks
    return single.tasks.filter((t) => t.status === singleFilter)
  }, [single.tasks, singleFilter])

  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-panel w-full max-w-md rounded-[28px] px-8 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[rgba(202,158,230,0.14)] text-ctp-lavender">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Loading task board</h1>
          <p className="mt-2 text-sm text-ctp-subtext0">Fetching tasks and preparing the layout.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-stretch px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto flex w-full max-w-[100vw] flex-col overflow-hidden">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-4xl font-bold tracking-[-0.05em] text-ctp-lavender sm:text-5xl lg:text-6xl">
            Task Board
          </h1>
          <p className="mt-3 text-lg text-ctp-subtext0 sm:text-xl">
            Organize your tasks with style
          </p>
        </header>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setEditingTask(undefined)
              setIsDialogOpen(true)
            }}
            className="inline-flex h-12 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,rgba(140,170,238,1),rgba(186,187,241,0.96))] px-6 text-sm font-semibold text-ctp-crust shadow-[0_18px_45px_rgba(140,170,238,0.24)] transition hover:brightness-110"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Task
          </button>

          <div className="flex items-center rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[rgba(41,44,60,0.6)] p-1">
            <button
              type="button"
              title="Multiple columns"
              onClick={() => setViewMode('multiple')}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-[16px] transition ${
                viewMode === 'multiple'
                  ? 'bg-[rgba(140,170,238,0.2)] text-ctp-blue'
                  : 'text-ctp-overlay1 hover:text-ctp-text'
              }`}
            >
              <Rows4 className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="Single list"
              onClick={() => setViewMode('single')}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-[16px] transition ${
                viewMode === 'single'
                  ? 'bg-[rgba(140,170,238,0.2)] text-ctp-blue'
                  : 'text-ctp-overlay1 hover:text-ctp-text'
              }`}
            >
              <LayoutList className="h-5 w-5" />
            </button>
          </div>

          <div ref={sortMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="inline-flex h-10 items-center justify-center rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[rgba(41,44,60,0.6)] px-4 text-xs font-medium text-ctp-subtext1 transition hover:bg-[rgba(255,255,255,0.05)]"
            >
              {currentSort.label}
            </button>
            {sortMenuOpen && (
              <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(30,30,46,0.95)] p-2 shadow-xl backdrop-blur-md">
                {SORT_OPTIONS.map((opt, i) => (
                  <button
                    key={opt.label}
                    onClick={() => handleSortChange(i)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      sortIndex === i
                        ? 'bg-[rgba(255,255,255,0.1)] text-ctp-lavender'
                        : 'hover:bg-[rgba(255,255,255,0.05)] text-ctp-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {viewMode === 'single' && (
            <div className="flex items-center rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[rgba(41,44,60,0.6)] p-1">
              {(['all', 'Pending', 'Completed'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSingleFilter(filter)}
                  className={`rounded-[16px] px-3 py-1.5 text-xs font-medium transition ${
                    singleFilter === filter
                      ? 'bg-[rgba(140,170,238,0.2)] text-ctp-blue'
                      : 'text-ctp-overlay1 hover:text-ctp-text'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {error ? (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[rgba(231,130,132,0.22)] bg-[rgba(231,130,132,0.12)] px-4 py-3 text-sm text-ctp-red">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <DragDropContext onDragEnd={handleDragEnd}>
          {viewMode === 'single' ? (
            <KanbanColumn
              status="all"
              icon={<LayoutList className="h-5 w-5 text-ctp-lavender" />}
              tasks={filteredSingleTasks}
              loading={single.loading}
              isFetchingMore={single.isFetchingMore}
              hasMore={single.meta.page < single.meta.totalPages}
              onDelete={handleDeleteTask}
              onRename={handleRenameTask}
              onToggleStatus={handleToggleStatus}
              onEditTask={handleEditTask}
              onLoadMore={() =>
                loadMoreSingleTasks({ sortBy: currentSort.sortBy, order: currentSort.order })
              }
              taskCount={single.meta.total}
              disableDrag
            />
          ) : (
            <div className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto pb-6 pt-2">
              <div className="w-[340px] shrink-0 snap-start xl:w-[380px]">
                <KanbanColumn
                  status="Pending"
                  icon={<Clock3 className="h-5 w-5 text-(--ctp-peach)" />}
                  tasks={pendingColumn.tasks}
                  loading={pendingColumn.loading}
                  isFetchingMore={pendingColumn.isFetchingMore}
                  hasMore={pendingColumn.meta.page < pendingColumn.meta.totalPages}
                  onDelete={handleDeleteTask}
                  onRename={handleRenameTask}
                  onToggleStatus={handleToggleStatus}
                  onEditTask={handleEditTask}
                  onLoadMore={() =>
                    loadMoreColumnTasks('Pending', {
                      sortBy: currentSort.sortBy,
                      order: currentSort.order,
                    })
                  }
                  taskCount={pendingColumn.meta.total}
                />
              </div>
              <div className="w-[340px] shrink-0 snap-start xl:w-[380px]">
                <KanbanColumn
                  status="Completed"
                  icon={<CheckCircle2 className="h-5 w-5 text-ctp-green" />}
                  tasks={completedColumn.tasks}
                  loading={completedColumn.loading}
                  isFetchingMore={completedColumn.isFetchingMore}
                  hasMore={completedColumn.meta.page < completedColumn.meta.totalPages}
                  onDelete={handleDeleteTask}
                  onRename={handleRenameTask}
                  onToggleStatus={handleToggleStatus}
                  onEditTask={handleEditTask}
                  onLoadMore={() =>
                    loadMoreColumnTasks('Completed', {
                      sortBy: currentSort.sortBy,
                      order: currentSort.order,
                    })
                  }
                  taskCount={completedColumn.meta.total}
                />
              </div>
            </div>
          )}
        </DragDropContext>

        <TaskFormDialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setEditingTask(undefined)
          }}
          task={editingTask}
          defaultStatus="Pending"
          onSave={handleSaveForm}
        />
      </div>
    </div>
  )
}
