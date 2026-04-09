import { asc, desc, eq, sql } from 'drizzle-orm'

import { db } from '../../db/index.js'
import { tasks } from '../../db/schema.js'
import type { ListTasksQuery } from './tasks.schemas.js'
import type { Task } from './tasks.types.js'

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toTask(row: {
  id: number
  title: string
  description: string | null
  dueDate: Date
  status: 'Pending' | 'Completed'
  createdAt: Date
  updatedAt: Date | null
}): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    due_date: formatDate(row.dueDate),
    status: row.status,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt ? row.updatedAt.toISOString() : null,
  }
}

export const tasksRepository = {
  async findAll(query: ListTasksQuery): Promise<Task[]> {
    const { page, limit, sort_by, order, status } = query
    const offset = (page - 1) * limit

    const orderFn = order === 'asc' ? asc : desc

    let sortColumn: SQL<unknown>
    switch (sort_by) {
      case 'due_date':
        sortColumn = tasks.dueDate
        break
      case 'title':
        sortColumn = tasks.title
        break
      default:
        sortColumn = tasks.createdAt
        break
    }

    const whereClause = status ? eq(tasks.status, status) : undefined

    const rows = await db
      .select()
      .from(tasks)
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset)

    return rows.map(toTask)
  },

  async countAll(status?: 'Pending' | 'Completed'): Promise<number> {
    const whereClause = status ? eq(tasks.status, status) : undefined

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(whereClause)

    return result.count
  },

  async findById(id: number): Promise<Task | undefined> {
    const [row] = await db.select().from(tasks).where(eq(tasks.id, id))
    return row ? toTask(row) : undefined
  },

  async create(input: {
    title: string
    description: string | null
    due_date: string
    status: 'Pending' | 'Completed'
  }): Promise<Task> {
    const [result] = await db
      .insert(tasks)
      .values({
        title: input.title,
        description: input.description,
        dueDate: new Date(input.due_date),
        status: input.status,
      })
      .$returningId()

    const task = await this.findById(result.id)
    if (!task) throw new Error('Failed to fetch created task')
    return task
  },

  async update(
    id: number,
    input: {
      title?: string
      description?: string | null
      due_date?: string
      status?: 'Pending' | 'Completed'
    },
  ): Promise<Task | undefined> {
    const { due_date, ...rest } = input
    const values = {
      ...rest,
      ...(due_date !== undefined ? { dueDate: new Date(due_date) } : {}),
    }

    await db.update(tasks).set(values).where(eq(tasks.id, id))
    return this.findById(id)
  },

  async remove(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id))
  },
}
