import type { NextFunction, Request, Response } from 'express'

import { logger } from '../lib/logger'

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now()

  res.on('finish', () => {
    const duration = Math.round(performance.now() - start)
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms requestId=${req.id}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      requestId: req.id,
    })
  })

  next()
}
