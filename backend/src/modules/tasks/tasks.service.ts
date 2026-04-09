import { NotFoundError } from '../../lib/http-errors.js'
import { tasksRepository } from './tasks.repository.js'
import type {
  CreateTaskInput,
  ListTasksQuery,
  PatchTaskInput,
  UpdateTaskInput,
} from './tasks.schemas.js'
import type { PaginatedTasksResponse, Task } from './tasks.types.js'

export const tasksService = {
  async getAllTasks(query: ListTasksQuery): Promise<PaginatedTasksResponse> {
    const [tasks, total] = await Promise.all([
      tasksRepository.findAll(query),
      tasksRepository.countAll(query.status),
    ])

    return {
      data: tasks,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    }
  },

  async getTaskById(id: number): Promise<Task> {
    const task = await tasksRepository.findById(id)
    if (!task) throw new NotFoundError()
    return task
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    return tasksRepository.create(input)
  },

  async updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
    const existing = await tasksRepository.findById(id)
    if (!existing) throw new NotFoundError()
    const updated = await tasksRepository.update(id, input)
    return updated!
  },

  async patchTask(id: number, input: PatchTaskInput): Promise<Task> {
    const existing = await tasksRepository.findById(id)
    if (!existing) throw new NotFoundError()
    const updated = await tasksRepository.update(id, input)
    return updated!
  },

  async deleteTask(id: number): Promise<void> {
    const existing = await tasksRepository.findById(id)
    if (!existing) throw new NotFoundError()
    await tasksRepository.remove(id)
  },
}
