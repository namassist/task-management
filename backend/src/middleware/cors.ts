import cors from 'cors'

import { loadEnv } from '../config/env.js'

const env = loadEnv()

export const corsMiddleware = cors({
  origin: env.frontendOrigin,
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
})
