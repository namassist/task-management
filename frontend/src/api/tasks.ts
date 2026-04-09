import type {
  CreateTaskInput,
  PaginatedTasksResponse,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '@/types/task.ts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

async function fetchFromAPI(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }))
    throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response
}

export type SortBy = 'created_at' | 'due_date' | 'title'

export interface FetchTasksParams {
  page?: number
  limit?: number
  sortBy?: SortBy
  order?: 'asc' | 'desc'
  status?: TaskStatus
}

export async function fetchTasks(params: FetchTasksParams = {}): Promise<PaginatedTasksResponse> {
  const { page = 1, limit = 20, sortBy = 'created_at', order = 'desc', status } = params

  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort_by: sortBy,
    order,
  })

  if (status) {
    searchParams.set('status', status)
  }

  const response = await fetchFromAPI(`/tasks?${searchParams.toString()}`)
  return response.json()
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const response = await fetchFromAPI('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function updateTask(id: number, data: UpdateTaskInput): Promise<Task> {
  const response = await fetchFromAPI(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.json()
}

export async function patchTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  const response = await fetchFromAPI(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return response.json()
}

export async function deleteTask(id: number): Promise<{ message: string }> {
  const response = await fetchFromAPI(`/tasks/${id}`, {
    method: 'DELETE',
  })
  return response.json()
}
