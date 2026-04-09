import supertest from 'supertest'

import { app } from '../src/app'
import { db } from '../src/db/index'
import { tasks } from '../src/db/schema'

export const request = supertest(app)

export const VALID_TASK = {
  title: 'Test task',
  description: 'A test description',
  due_date: '2026-12-31',
  status: 'Pending' as const,
}

export async function createTaskViaApi(
  overrides: Record<string, unknown> = {},
): Promise<supertest.Response> {
  return request.post('/tasks').send({ ...VALID_TASK, ...overrides })
}

beforeEach(async () => {
  await db.delete(tasks)
})

afterAll(async () => {
  await db.delete(tasks)
  const pool = db.$client
  await pool.end()
})
