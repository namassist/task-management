export type TaskStatus = 'Pending' | 'Completed'

export interface Task {
  id: number
  title: string
  description: string | null
  due_date: string
  status: TaskStatus
  created_at: string
  updated_at: string | null
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedTasksResponse {
  data: Task[]
  meta: PaginationMeta
}

export interface CreateTaskInput {
  title: string
  description?: string | null
  due_date: string
  status: TaskStatus
}

export interface UpdateTaskInput {
  title: string
  description?: string | null
  due_date: string
  status: TaskStatus
}
