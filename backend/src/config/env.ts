import { config as loadEnvFile } from 'dotenv'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .trim()
    .min(1, 'DATABASE_URL is required')
    .refine((value) => {
      try {
        const url = new URL(value)
        return url.protocol === 'mysql:' && url.hostname.length > 0 && url.pathname.length > 1
      } catch {
        return false
      }
    }, 'DATABASE_URL must be a valid mysql:// URL'),
  FRONTEND_ORIGIN: z
    .string()
    .trim()
    .min(1, 'FRONTEND_ORIGIN is required')
    .refine((value) => {
      try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    }, 'FRONTEND_ORIGIN must be a valid http(s) URL'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
})

export type BackendEnv = Readonly<{
  databaseUrl: string
  frontendOrigin: string
  port: number
}>

export const loadEnv = (): BackendEnv => {
  loadEnvFile()

  const parsedEnv = envSchema.safeParse(process.env)

  if (!parsedEnv.success) {
    const message = parsedEnv.error.issues
      .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('; ')

    throw new Error(`Invalid backend configuration. ${message}`)
  }

  return {
    databaseUrl: parsedEnv.data.DATABASE_URL,
    frontendOrigin: parsedEnv.data.FRONTEND_ORIGIN,
    port: parsedEnv.data.PORT,
  }
}
