import type { NextFunction, Request, Response } from 'express'

import { AppError, ValidationError } from '../lib/http-errors'
import { logger } from '../lib/logger'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors,
    })
    return
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  logger.error(err.message, { stack: err.stack })

  res.status(500).json({ message: 'Internal server error' })
}
