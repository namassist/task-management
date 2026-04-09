export class AppError extends Error {
  public readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Task not found') {
    super(404, message)
  }
}

export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>

  constructor(errors: Array<{ field: string; message: string }>) {
    super(400, 'Validation error')
    this.errors = errors
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(500, message)
  }
}
