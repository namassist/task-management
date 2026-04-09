import rateLimit from 'express-rate-limit'

export const mutationRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  skip: (req) => req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS',
  handler: (_req, res) => {
    res.status(429).json({ message: 'Too many requests, please try again later' })
  },
})
