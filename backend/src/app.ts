import express from 'express'
import { corsMiddleware } from './middleware/cors'
import { errorHandler } from './middleware/error-handler'
import { notFound } from './middleware/not-found'
import { mutationRateLimiter } from './middleware/rate-limit'
import { requestId } from './middleware/request-id'
import { requestLogger } from './middleware/request-logger'
import { docsRouter } from './routes/docs.js'
import { healthRouter } from './routes/health.js'
import { tasksRouter } from './routes/tasks.routes.js'

export const app = express()

app.disable('x-powered-by')

app.use(requestId)
app.use(requestLogger)
app.use(express.json({ limit: '16kb' }))
app.use(corsMiddleware)

app.use(healthRouter)

app.use(mutationRateLimiter)
app.use(tasksRouter)

app.use(docsRouter)

app.use(notFound)
app.use(errorHandler)
