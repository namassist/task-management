/* eslint-disable @typescript-eslint/no-explicit-any */
export const openApiSpec: any = {
  openapi: '3.0.3',
  info: {
    title: 'Task Management System API',
    version: '1.0.0',
    description: 'REST API for managing tasks. Supports full CRUD operations on task resources.',
  },
  servers: [{ url: 'http://localhost:3001' }],
  paths: {
    '/tasks': {
      get: {
        summary: 'List all tasks',
        description:
          'Returns paginated and sorted tasks. **By default, this returns ALL tasks (both Pending and Completed).** Use the `status` query parameter to filter the results.',
        operationId: 'listTasks',
        tags: ['Tasks'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            description: 'Page number (starts at 1)',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Number of tasks per page (max 100)',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'sort_by',
            in: 'query',
            required: false,
            description: 'Field to sort by',
            schema: {
              type: 'string',
              enum: ['created_at', 'due_date', 'title'],
              default: 'created_at',
            },
          },
          {
            name: 'order',
            in: 'query',
            required: false,
            description: 'Sort direction',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
          },
          {
            name: 'status',
            in: 'query',
            required: false,
            description:
              'Filter tasks by status. **If omitted, returns both Pending and Completed tasks.**',
            schema: { type: 'string', enum: ['Pending', 'Completed'] },
          },
        ],
        responses: {
          '200': {
            description: 'Paginated list of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['data', 'meta'],
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Task' },
                    },
                    meta: {
                      type: 'object',
                      required: ['total', 'page', 'limit', 'totalPages'],
                      properties: {
                        total: { type: 'integer', description: 'Total number of tasks' },
                        page: { type: 'integer', description: 'Current page number' },
                        limit: { type: 'integer', description: 'Number of tasks per page' },
                        totalPages: { type: 'integer', description: 'Total number of pages' },
                      },
                    },
                  },
                },
                example: {
                  data: [
                    {
                      id: 1,
                      title: 'Buy groceries',
                      description: 'Milk, eggs, bread',
                      due_date: '2026-04-15',
                      status: 'Pending',
                      created_at: '2026-04-09T09:00:00.000Z',
                      updated_at: null,
                    },
                    {
                      id: 2,
                      title: 'Submit report',
                      description: null,
                      due_date: '2026-04-20',
                      status: 'Completed',
                      created_at: '2026-04-08T14:30:00.000Z',
                      updated_at: '2026-04-09T10:15:00.000Z',
                    },
                  ],
                  meta: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                  },
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { message: 'Internal server error' },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a task',
        description: 'Creates a new task.',
        operationId: 'createTask',
        tags: ['Tasks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskRequest' },
              example: {
                title: 'Buy groceries',
                description: 'Milk, eggs, bread',
                due_date: '2026-04-15',
                status: 'Pending',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Task created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' },
                example: {
                  id: 1,
                  title: 'Buy groceries',
                  description: 'Milk, eggs, bread',
                  due_date: '2026-04-15',
                  status: 'Pending',
                  created_at: '2026-04-09T09:30:00.000Z',
                  updated_at: null,
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
                example: {
                  message: 'Validation error',
                  errors: [
                    {
                      field: 'title',
                      message: 'Title is required',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/tasks/{id}': {
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Task ID',
          schema: { type: 'integer', minimum: 1 },
        },
      ],
      put: {
        summary: 'Full update of a task',
        description: 'Replaces all mutable fields of a task.',
        operationId: 'updateTask',
        tags: ['Tasks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskRequest' },
              example: {
                title: 'Buy groceries and cook dinner',
                description: 'Chicken, rice, vegetables',
                due_date: '2026-04-18',
                status: 'Pending',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Task updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' },
                example: {
                  id: 1,
                  title: 'Buy groceries and cook dinner',
                  description: 'Chicken, rice, vegetables',
                  due_date: '2026-04-18',
                  status: 'Pending',
                  created_at: '2026-04-09T09:00:00.000Z',
                  updated_at: '2026-04-09T12:00:00.000Z',
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
                example: {
                  message: 'Validation error',
                  errors: [
                    {
                      field: 'due_date',
                      message: 'due_date must be a valid date in YYYY-MM-DD format',
                    },
                  ],
                },
              },
            },
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { message: 'Task not found' },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update task status only',
        description:
          'Updates only the status field of a task. The request body must contain ' +
          'ONLY the `status` field — any additional fields will be rejected.',
        operationId: 'patchTask',
        tags: ['Tasks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PatchTaskRequest' },
              example: {
                status: 'Completed',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Task status updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' },
                example: {
                  id: 1,
                  title: 'Buy groceries',
                  description: 'Milk, eggs, bread',
                  due_date: '2026-04-15',
                  status: 'Completed',
                  created_at: '2026-04-09T09:00:00.000Z',
                  updated_at: '2026-04-09T10:15:00.000Z',
                },
              },
            },
          },
          '400': {
            description: 'Validation error — request body must contain only the status field',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
                example: {
                  message: 'Validation error',
                  errors: [
                    {
                      field: '',
                      message: 'Request body must contain only the status field',
                    },
                  ],
                },
              },
            },
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { message: 'Task not found' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a task',
        description: 'Permanently deletes a task.',
        operationId: 'deleteTask',
        tags: ['Tasks'],
        responses: {
          '200': {
            description: 'Task deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeleteResponse' },
                example: { message: 'Task deleted successfully' },
              },
            },
          },
          '404': {
            description: 'Task not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { message: 'Task not found' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Task: {
        type: 'object',
        required: ['id', 'title', 'description', 'due_date', 'status', 'created_at', 'updated_at'],
        properties: {
          id: {
            type: 'integer',
            description: 'Unique task identifier',
            example: 1,
          },
          title: {
            type: 'string',
            description: 'Task title',
            maxLength: 255,
            example: 'Buy groceries',
          },
          description: {
            type: 'string',
            nullable: true,
            description: 'Optional task description',
            maxLength: 5000,
            example: 'Milk, eggs, bread',
          },
          due_date: {
            type: 'string',
            description: 'Due date in YYYY-MM-DD format',
            example: '2026-04-15',
          },
          status: {
            type: 'string',
            enum: ['Pending', 'Completed'],
            description: 'Current status of the task',
            example: 'Pending',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the task was created',
            example: '2026-04-09T09:00:00.000Z',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Timestamp when the task was last updated',
            example: '2026-04-09T10:15:00.000Z',
          },
        },
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['title', 'due_date', 'status'],
        additionalProperties: false,
        description:
          'Request body for creating a task. `description` is optional and defaults to null.',
        properties: {
          title: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            description: 'Task title (trimmed, cannot be empty)',
            example: 'Buy groceries',
          },
          description: {
            type: 'string',
            nullable: true,
            maxLength: 5000,
            description: 'Optional task description (defaults to null)',
            example: 'Milk, eggs, bread',
          },
          due_date: {
            type: 'string',
            description: 'Due date in YYYY-MM-DD format',
            example: '2026-04-15',
          },
          status: {
            type: 'string',
            enum: ['Pending', 'Completed'],
            description: 'Initial status of the task',
            example: 'Pending',
          },
        },
      },
      UpdateTaskRequest: {
        type: 'object',
        required: ['title', 'due_date', 'status'],
        additionalProperties: false,
        description:
          'Request body for fully updating a task. All fields except `description` are required.',
        properties: {
          title: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            description: 'Task title (trimmed, cannot be empty)',
            example: 'Buy groceries and cook dinner',
          },
          description: {
            type: 'string',
            nullable: true,
            maxLength: 5000,
            description: 'Task description (pass null to clear)',
            example: 'Chicken, rice, vegetables',
          },
          due_date: {
            type: 'string',
            description: 'Due date in YYYY-MM-DD format',
            example: '2026-04-18',
          },
          status: {
            type: 'string',
            enum: ['Pending', 'Completed'],
            description: 'Updated status of the task',
            example: 'Pending',
          },
        },
      },
      PatchTaskRequest: {
        type: 'object',
        required: ['status'],
        additionalProperties: false,
        description: 'Request body for patching a task. ONLY the `status` field is allowed.',
        properties: {
          status: {
            type: 'string',
            enum: ['Pending', 'Completed'],
            description: 'New status for the task',
            example: 'Completed',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
            example: 'Task not found',
          },
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        required: ['message', 'errors'],
        properties: {
          message: {
            type: 'string',
            description: 'Error type',
            example: 'Validation error',
          },
          errors: {
            type: 'array',
            description: 'List of validation errors',
            items: {
              type: 'object',
              required: ['field', 'message'],
              properties: {
                field: {
                  type: 'string',
                  description: 'Field that failed validation',
                  example: 'title',
                },
                message: {
                  type: 'string',
                  description: 'Validation error message',
                  example: 'Title is required',
                },
              },
            },
          },
        },
      },
      DeleteResponse: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            description: 'Confirmation message',
            example: 'Task deleted successfully',
          },
        },
      },
    },
  },
}
