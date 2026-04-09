import winston from 'winston'

const { combine, timestamp, colorize, printf } = winston.format

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logFormat = printf(({ level, message, timestamp: ts }: any) => {
  return `${ts} [${level}] ${message}`
})

export const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize({ level: true }),
    logFormat,
  ),
  transports: [new winston.transports.Console()],
})
