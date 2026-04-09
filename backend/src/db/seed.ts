import { sql } from 'drizzle-orm'
import { db } from './index.js'
import { tasks } from './schema.js'

async function seed() {
  console.log('Seeding initial data...')

  try {
    console.log('Truncating existing tasks...')
    await db.execute(sql`TRUNCATE TABLE tasks`)

    const dummyData = []

    for (let i = 1; i <= 100; i++) {
      const isCompleted = Math.random() > 0.5

      // Generate a random date around today (+/- 30 days)
      const dueDate = new Date()
      dueDate.setHours(0, 0, 0, 0)
      dueDate.setDate(dueDate.getDate() + (Math.floor(Math.random() * 60) - 30))

      dummyData.push({
        title: `Dummy Task ${i}`,
        description: `This is a generated description for dummy task ${i}. It provides some context about what needs to be done.`,
        dueDate,
        status: isCompleted ? ('Completed' as const) : ('Pending' as const),
      })
    }

    await db.insert(tasks).values(dummyData)
    console.log('Successfully seeded 100 dummy tasks.')
  } catch (error) {
    console.error('Error seeding tasks:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

seed()
