import { eq } from 'drizzle-orm'
import { db } from '../src/db/index'
import { tasks } from '../src/db/schema'

import { createTaskViaApi, request, VALID_TASK } from './setup'

describe('GET /tasks', () => {
  it('returns 200 with empty data array when no tasks exist', async () => {
    const res = await request.get('/tasks')

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    expect(res.body.meta).toEqual({
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    })
  })

  it('returns 200 with tasks using default sort (created_at descending)', async () => {
    await createTaskViaApi({ title: 'Task A', due_date: '2026-01-01' })
    await createTaskViaApi({ title: 'Task B', due_date: '2026-12-31' })

    const res = await request.get('/tasks')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.data.map((t: { title: string }) => t.title).sort()).toEqual([
      'Task A',
      'Task B',
    ])
    expect(res.body.meta).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    })
  })

  it('returns paginated results with default limit 10', async () => {
    for (let i = 1; i <= 12; i++) {
      await createTaskViaApi({
        title: `Task ${String(i).padStart(2, '0')}`,
        due_date: `2026-01-${String(i).padStart(2, '0')}`,
      })
    }

    const res = await request.get('/tasks')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(10)
    expect(res.body.meta.total).toBe(12)
    expect(res.body.meta.totalPages).toBe(2)
    expect(res.body.meta.page).toBe(1)
    expect(res.body.meta.limit).toBe(10)
  })

  it('returns page 2 of paginated results', async () => {
    for (let i = 1; i <= 12; i++) {
      await createTaskViaApi({
        title: `Task ${String(i).padStart(2, '0')}`,
        due_date: `2026-01-${String(i).padStart(2, '0')}`,
      })
    }

    const res = await request.get('/tasks?page=2')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.meta.total).toBe(12)
    expect(res.body.meta.page).toBe(2)
  })

  it('respects custom limit', async () => {
    for (let i = 1; i <= 8; i++) {
      await createTaskViaApi({
        title: `Task ${i}`,
        due_date: `2026-01-${String(i).padStart(2, '0')}`,
      })
    }

    const res = await request.get('/tasks?limit=5')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(5)
    expect(res.body.meta.limit).toBe(5)
    expect(res.body.meta.total).toBe(8)
    expect(res.body.meta.totalPages).toBe(2)
  })

  it('sorts by due_date descending', async () => {
    await createTaskViaApi({ title: 'First', due_date: '2026-01-01' })
    await createTaskViaApi({ title: 'Second', due_date: '2026-06-15' })
    await createTaskViaApi({ title: 'Third', due_date: '2026-12-31' })

    const res = await request.get('/tasks?sort_by=due_date&order=desc')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(3)
    expect(res.body.data[0].title).toBe('Third')
    expect(res.body.data[1].title).toBe('Second')
    expect(res.body.data[2].title).toBe('First')
  })

  it('sorts by title ascending', async () => {
    await createTaskViaApi({ title: 'Banana' })
    await createTaskViaApi({ title: 'Apple' })

    const res = await request.get('/tasks?sort_by=title&order=asc')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.data[0].title).toBe('Apple')
    expect(res.body.data[1].title).toBe('Banana')
  })

  it('sorts by title descending', async () => {
    await createTaskViaApi({ title: 'Apple' })
    await createTaskViaApi({ title: 'Banana' })

    const res = await request.get('/tasks?sort_by=title&order=desc')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.data[0].title).toBe('Banana')
    expect(res.body.data[1].title).toBe('Apple')
  })

  it('returns validation error for invalid page', async () => {
    const res = await request.get('/tasks?page=0')

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })

  it('returns validation error for invalid limit', async () => {
    const res = await request.get('/tasks?limit=0')

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })

  it('returns validation error for invalid sort_by', async () => {
    const res = await request.get('/tasks?sort_by=invalid')

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })
})

describe('POST /tasks', () => {
  it('returns 201 with created task when payload is valid', async () => {
    const res = await createTaskViaApi()

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      title: 'Test task',
      description: 'A test description',
      due_date: '2026-12-31',
      status: 'Pending',
    })
  })

  it('returns 201 when description is null', async () => {
    const res = await createTaskViaApi({ description: null })

    expect(res.status).toBe(201)
    expect(res.body.description).toBeNull()
  })

  it('returns 400 when title is empty/whitespace', async () => {
    const res = await createTaskViaApi({ title: '   ' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })

  it('returns 400 when due_date is invalid format', async () => {
    const res = await createTaskViaApi({ due_date: 'not-a-date' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })

  it('returns 400 when status is invalid value', async () => {
    const res = await createTaskViaApi({ status: 'InvalidStatus' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })

  it('returns 400 when unknown fields are present', async () => {
    const res = await createTaskViaApi({ unknown_field: 'oops' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await request.post('/tasks').send({})

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })
})

describe('PUT /tasks/:id', () => {
  it('returns 200 with updated task when payload is valid', async () => {
    const created = await createTaskViaApi()
    const id = created.body.id

    const res = await request.put(`/tasks/${id}`).send({
      title: 'Updated title',
      description: 'Updated description',
      due_date: '2027-01-15',
      status: 'Completed',
    })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id,
      title: 'Updated title',
      description: 'Updated description',
      due_date: '2027-01-15',
      status: 'Completed',
    })
  })

  it('returns 404 when task ID does not exist', async () => {
    const res = await request.put('/tasks/999999').send(VALID_TASK)

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Task not found')
  })

  it('returns 400 when payload is incomplete', async () => {
    const created = await createTaskViaApi()
    const id = created.body.id

    const res = await request.put(`/tasks/${id}`).send({ title: 'Only title' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })

  it('returns 400 when unknown fields are present', async () => {
    const created = await createTaskViaApi()
    const id = created.body.id

    const res = await request.put(`/tasks/${id}`).send({ ...VALID_TASK, extra: 'bad' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })
})

describe('PATCH /tasks/:id', () => {
  it('returns 200 with updated task when status is valid', async () => {
    const created = await createTaskViaApi()
    const id = created.body.id

    const res = await request.patch(`/tasks/${id}`).send({ status: 'Completed' })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id,
      status: 'Completed',
    })
  })

  it('returns 400 when body contains fields other than status', async () => {
    const created = await createTaskViaApi()
    const id = created.body.id

    const res = await request.patch(`/tasks/${id}`).send({ status: 'Completed', title: 'Hacked' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })

  it('returns 400 when status value is invalid', async () => {
    const created = await createTaskViaApi()
    const id = created.body.id

    const res = await request.patch(`/tasks/${id}`).send({ status: 'NotAStatus' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('Validation error')
  })

  it('returns 404 when task ID does not exist', async () => {
    const res = await request.patch('/tasks/999999').send({ status: 'Completed' })

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Task not found')
  })
})

describe('DELETE /tasks/:id', () => {
  it('returns 200 with success message', async () => {
    const created = await createTaskViaApi()
    const id = created.body.id

    const res = await request.delete(`/tasks/${id}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Task deleted successfully' })
  })

  it('returns 404 when task ID does not exist', async () => {
    const res = await request.delete('/tasks/999999')

    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Task not found')
  })

  it('task is actually removed from database after delete', async () => {
    const created = await createTaskViaApi()
    const id = created.body.id

    await request.delete(`/tasks/${id}`)

    const [row] = await db.select().from(tasks).where(eq(tasks.id, id))
    expect(row).toBeUndefined()

    const listRes = await request.get('/tasks')
    expect(listRes.body.data).toEqual([])
  })
})

describe('Not-found handling', () => {
  it('GET /unknown-route returns 404 with JSON message', async () => {
    const res = await request.get('/unknown-route')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ message: 'Not found' })
  })
})
