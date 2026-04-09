import { Router } from 'express'

import { validate, validateParams, validateQuery } from '../lib/validator.js'
import { tasksController } from '../modules/tasks/tasks.controller.js'
import {
  createTaskSchema,
  listTasksQuerySchema,
  patchTaskSchema,
  taskIdParamSchema,
  updateTaskSchema,
} from '../modules/tasks/tasks.schemas.js'

export const tasksRouter = Router()

tasksRouter.get('/tasks', validateQuery(listTasksQuerySchema), tasksController.listTasks)
tasksRouter.post('/tasks', validate(createTaskSchema), tasksController.createTask)
tasksRouter.put(
  '/tasks/:id',
  validateParams(taskIdParamSchema),
  validate(updateTaskSchema),
  tasksController.updateTask,
)
tasksRouter.patch(
  '/tasks/:id',
  validateParams(taskIdParamSchema),
  validate(patchTaskSchema),
  tasksController.patchTask,
)
tasksRouter.delete('/tasks/:id', validateParams(taskIdParamSchema), tasksController.deleteTask)
