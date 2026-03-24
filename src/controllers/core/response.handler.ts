import { z } from 'zod'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  statusCode: number
}

export class ResponseHandler {
  static success<T>(data: T, statusCode = 200): ApiResponse<T> {
    return {
      success: true,
      data,
      statusCode,
    }
  }

  static error(error: unknown, statusCode = 400): ApiResponse<never> {
    let message = 'An unexpected error occurred'

    if (error instanceof z.ZodError) {
      message = error.errors.map((e) => `${e.path.join('.') || 'body'}: ${e.message}`).join(', ')
    } else if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }

    return {
      success: false,
      error: message,
      statusCode,
    }
  }
}
