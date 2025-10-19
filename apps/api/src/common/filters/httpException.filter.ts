import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common'
import { Response } from 'express'

/**
 * Global exception filter that:
 * 1. Logs detailed error information server-side
 * 2. Returns generic error messages to clients (security best practice)
 *
 * This prevents information disclosure attacks like user enumeration
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    // Log the detailed error server-side
    this.logger.error({
      statusCode: status,
      message: exception.message,
      response: exception.getResponse(),
      stack: exception.stack
    })

    // Return generic error message to client
    const clientResponse = {
      statusCode: status,
      message: this.getGenericMessage(status),
      timestamp: new Date().toISOString()
    }

    response.status(status).json(clientResponse)
  }

  /**
   * Maps HTTP status codes to generic error messages
   * This prevents information disclosure
   */
  private getGenericMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request data'
      case 409:
        return 'Operation could not be completed'
      case 404:
        return 'Resource not found'
      case 500:
        return 'An error occurred processing your request'
      default:
        return 'An error occurred'
    }
  }
}
