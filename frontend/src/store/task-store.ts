import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createTask as apiCreateTask,
  deleteTask as apiDeleteTask,
  fetchTasks,
  patchTaskStatus as apiPatchTaskStatus,
  updateTask as apiUpdateTask,
  type SortBy,
} from '@/api/tasks.ts'
import type {
  CreateTaskInput,
  PaginationMeta,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '@/types/task.ts'

type ViewMode = 'multiple' | 'single'

export type { ViewMode }

interface ColumnState {
  tasks: Task[]
  meta: PaginationMeta
  loading: boolean
  isFetchingMore: boolean
}

interface TaskState {
  // Global
  viewMode: ViewMode
  error: string | null

  // Single list mode (no status filter, one API source)
  single: ColumnState

  // Multiple mode (two separate API sources per status)
  pendingColumn: ColumnState
  completedColumn: ColumnState

  // Actions — global
  setViewMode: (mode: ViewMode) => void

  // Actions — single mode
  fetchSingleTasks: (params?: { sortBy?: SortBy; order?: 'asc' | 'desc' }) => Promise<void>
  loadMoreSingleTasks: (params?: { sortBy?: SortBy; order?: 'asc' | 'desc' }) => Promise<void>

  // Actions — multiple mode
  fetchColumnTasks: (
    status: TaskStatus,
    params?: { sortBy?: SortBy; order?: 'asc' | 'desc' },
  ) => Promise<void>
  loadMoreColumnTasks: (
    status: TaskStatus,
    params?: { sortBy?: SortBy; order?: 'asc' | 'desc' },
  ) => Promise<void>
  refreshAllColumns: (params?: { sortBy?: SortBy; order?: 'asc' | 'desc' }) => Promise<void>

  // Actions — mutations
  createTask: (data: CreateTaskInput) => Promise<void>
  updateTask: (id: number, data: UpdateTaskInput) => Promise<void>
  patchTaskStatus: (id: number, status: TaskStatus) => Promise<void>
  deleteTask: (id: number) => Promise<void>
}

function makeEmptyColumn(): ColumnState {
  return {
    tasks: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    loading: false,
    isFetchingMore: false,
  }
}

function getColumn(state: TaskState, status: TaskStatus): ColumnState {
  return status === 'Pending' ? state.pendingColumn : state.completedColumn
}

function setColumn(
  state: Partial<TaskState>,
  status: TaskStatus,
  column: Partial<ColumnState>,
): Partial<TaskState> {
  const key = status === 'Pending' ? 'pendingColumn' : 'completedColumn'
  return { ...state, [key]: { ...(state as TaskState)[key], ...column } }
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      viewMode: 'multiple' as ViewMode,
      error: null,
      single: makeEmptyColumn(),
      pendingColumn: makeEmptyColumn(),
      completedColumn: makeEmptyColumn(),

      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode })
      },

      // ─── Single mode ───────────────────────────────────
      fetchSingleTasks: async (params = {}) => {
        const { sortBy = 'created_at', order = 'desc' } = params
        set({ single: { ...get().single, loading: true }, error: null })
        try {
          const response = await fetchTasks({ page: 1, limit: 20, sortBy, order })
          set({
            single: {
              tasks: response.data,
              meta: response.meta,
              loading: false,
              isFetchingMore: false,
            },
          })
        } catch (error) {
          set({
            single: { ...get().single, loading: false },
            error: error instanceof Error ? error.message : 'Failed to fetch tasks',
          })
        }
      },

      loadMoreSingleTasks: async (params = {}) => {
        const { single } = get()
        if (single.loading || single.isFetchingMore || single.meta.page >= single.meta.totalPages)
          return

        set({ single: { ...single, isFetchingMore: true }, error: null })
        try {
          const { sortBy = 'created_at', order = 'desc' } = params
          const response = await fetchTasks({
            page: single.meta.page + 1,
            limit: 20,
            sortBy,
            order,
          })
          const merged = [...single.tasks, ...response.data]
          const unique = Array.from(new Map(merged.map((t) => [t.id, t])).values())
          set({
            single: {
              tasks: unique,
              meta: response.meta,
              loading: false,
              isFetchingMore: false,
            },
          })
        } catch (error) {
          set({
            single: { ...get().single, isFetchingMore: false },
            error: error instanceof Error ? error.message : 'Failed to load more tasks',
          })
        }
      },

      // ─── Multiple mode ─────────────────────────────────
      fetchColumnTasks: async (status, params = {}) => {
        const { sortBy = 'created_at', order = 'desc' } = params
        set({
          ...setColumn(get(), status, { loading: true }),
          error: null,
        })
        try {
          const response = await fetchTasks({ page: 1, limit: 20, sortBy, order, status })
          set({
            ...setColumn(get(), status, {
              tasks: response.data,
              meta: response.meta,
              loading: false,
              isFetchingMore: false,
            }),
          })
        } catch (error) {
          set({
            ...setColumn(get(), status, { loading: false }),
            error: error instanceof Error ? error.message : 'Failed to fetch tasks',
          })
        }
      },

      loadMoreColumnTasks: async (status, params = {}) => {
        const col = getColumn(get(), status)
        if (col.loading || col.isFetchingMore || col.meta.page >= col.meta.totalPages) return

        set({
          ...setColumn(get(), status, { isFetchingMore: true }),
          error: null,
        })
        try {
          const { sortBy = 'created_at', order = 'desc' } = params
          const response = await fetchTasks({
            page: col.meta.page + 1,
            limit: 20,
            sortBy,
            order,
            status,
          })
          const merged = [...col.tasks, ...response.data]
          const unique = Array.from(new Map(merged.map((t) => [t.id, t])).values())
          set({
            ...setColumn(get(), status, {
              tasks: unique,
              meta: response.meta,
              loading: false,
              isFetchingMore: false,
            }),
          })
        } catch (error) {
          set({
            ...setColumn(get(), status, { isFetchingMore: false }),
            error: error instanceof Error ? error.message : 'Failed to load more tasks',
          })
        }
      },

      refreshAllColumns: async (params = {}) => {
        const { sortBy = 'created_at', order = 'desc' } = params
        const { viewMode } = get()

        if (viewMode === 'single') {
          await get().fetchSingleTasks({ sortBy, order })
        } else {
          await Promise.all([
            get().fetchColumnTasks('Pending', { sortBy, order }),
            get().fetchColumnTasks('Completed', { sortBy, order }),
          ])
        }
      },

      // ─── Mutations ─────────────────────────────────────
      createTask: async (data: CreateTaskInput) => {
        set({ error: null })
        try {
          const newTask = await apiCreateTask(data)
          const { viewMode } = get()

          if (viewMode === 'single') {
            const { single } = get()
            set({
              single: {
                ...single,
                tasks: [newTask, ...single.tasks],
                meta: { ...single.meta, total: single.meta.total + 1 },
              },
            })
          } else {
            const key = newTask.status === 'Pending' ? 'pendingColumn' : 'completedColumn'
            const col = get()[key]
            set({
              [key]: {
                ...col,
                tasks: [newTask, ...col.tasks],
                meta: { ...col.meta, total: col.meta.total + 1 },
              },
            })
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to create task',
          })
          throw error
        }
      },

      updateTask: async (id: number, data: UpdateTaskInput) => {
        set({ error: null })
        try {
          const updatedTask = await apiUpdateTask(id, data)
          const { viewMode } = get()

          const replaceInList = (tasks: Task[]) => tasks.map((t) => (t.id === id ? updatedTask : t))

          if (viewMode === 'single') {
            const { single } = get()
            set({ single: { ...single, tasks: replaceInList(single.tasks) } })
          } else {
            const { pendingColumn, completedColumn } = get()
            const oldInPending = pendingColumn.tasks.some((t) => t.id === id)
            const oldInCompleted = completedColumn.tasks.some((t) => t.id === id)

            if (oldInPending && updatedTask.status === 'Completed') {
              set({
                pendingColumn: {
                  ...pendingColumn,
                  tasks: pendingColumn.tasks.filter((t) => t.id !== id),
                  meta: { ...pendingColumn.meta, total: Math.max(0, pendingColumn.meta.total - 1) },
                },
                completedColumn: {
                  ...completedColumn,
                  tasks: [updatedTask, ...completedColumn.tasks],
                  meta: { ...completedColumn.meta, total: completedColumn.meta.total + 1 },
                },
              })
            } else if (oldInCompleted && updatedTask.status === 'Pending') {
              set({
                completedColumn: {
                  ...completedColumn,
                  tasks: completedColumn.tasks.filter((t) => t.id !== id),
                  meta: {
                    ...completedColumn.meta,
                    total: Math.max(0, completedColumn.meta.total - 1),
                  },
                },
                pendingColumn: {
                  ...pendingColumn,
                  tasks: [updatedTask, ...pendingColumn.tasks],
                  meta: { ...pendingColumn.meta, total: pendingColumn.meta.total + 1 },
                },
              })
            } else {
              set({
                pendingColumn: { ...pendingColumn, tasks: replaceInList(pendingColumn.tasks) },
                completedColumn: {
                  ...completedColumn,
                  tasks: replaceInList(completedColumn.tasks),
                },
              })
            }
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update task',
          })
          throw error
        }
      },

      patchTaskStatus: async (id: number, status: TaskStatus) => {
        set({ error: null })
        try {
          const updatedTask = await apiPatchTaskStatus(id, status)
          const { viewMode } = get()

          if (viewMode === 'single') {
            const { single } = get()
            set({
              single: {
                ...single,
                tasks: single.tasks.map((t) => (t.id === id ? updatedTask : t)),
              },
            })
          } else {
            const sourceKey = status === 'Pending' ? 'completedColumn' : 'pendingColumn'
            const destKey = status === 'Pending' ? 'pendingColumn' : 'completedColumn'
            const sourceCol = get()[sourceKey]
            const destCol = get()[destKey]

            set({
              [sourceKey]: {
                ...sourceCol,
                tasks: sourceCol.tasks.filter((t) => t.id !== id),
                meta: { ...sourceCol.meta, total: Math.max(0, sourceCol.meta.total - 1) },
              },
              [destKey]: {
                ...destCol,
                tasks: [updatedTask, ...destCol.tasks],
                meta: { ...destCol.meta, total: destCol.meta.total + 1 },
              },
            })
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update task status',
          })
          throw error
        }
      },

      deleteTask: async (id: number) => {
        set({ error: null })
        try {
          await apiDeleteTask(id)
          const { viewMode } = get()

          if (viewMode === 'single') {
            const { single } = get()
            set({
              single: {
                ...single,
                tasks: single.tasks.filter((t) => t.id !== id),
                meta: { ...single.meta, total: Math.max(0, single.meta.total - 1) },
              },
            })
          } else {
            const { pendingColumn, completedColumn } = get()
            const inPending = pendingColumn.tasks.some((t) => t.id === id)
            const inCompleted = completedColumn.tasks.some((t) => t.id === id)

            set({
              pendingColumn: {
                ...pendingColumn,
                tasks: pendingColumn.tasks.filter((t) => t.id !== id),
                meta: {
                  ...pendingColumn.meta,
                  total: inPending
                    ? Math.max(0, pendingColumn.meta.total - 1)
                    : pendingColumn.meta.total,
                },
              },
              completedColumn: {
                ...completedColumn,
                tasks: completedColumn.tasks.filter((t) => t.id !== id),
                meta: {
                  ...completedColumn.meta,
                  total: inCompleted
                    ? Math.max(0, completedColumn.meta.total - 1)
                    : completedColumn.meta.total,
                },
              },
            })
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete task',
          })
          throw error
        }
      },
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
      }),
    },
  ),
)
