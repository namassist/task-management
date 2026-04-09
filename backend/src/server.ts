import { app } from './app'
import { loadEnv } from './config/env'

try {
  const env = loadEnv()
  const server = app.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`)
  })

  const shutdown = (signal: NodeJS.Signals) => {
    console.log(`${signal} received, shutting down backend server`)
    server.close(() => {
      process.exit(0)
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
} catch (error) {
  const message = error instanceof Error ? error.message : 'Invalid backend configuration.'
  console.error(message)
  process.exit(1)
}
