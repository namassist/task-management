import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'

import { openApiSpec } from '../docs/openapi.js'

export const docsRouter = Router()

docsRouter.use('/docs', swaggerUi.serve)
docsRouter.get('/docs', swaggerUi.setup(openApiSpec))
