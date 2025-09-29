interface LogContext {
  userId?: string
  route?: string
  component?: string
  action?: string
  [key: string]: unknown
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context))

    // In production, send to external logging service
    if (!this.isDevelopment) {
      this.sendToExternalService('info', message, context)
    }
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context))

    // In production, send to external logging service
    if (!this.isDevelopment) {
      this.sendToExternalService('warn', message, context)
    }
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorDetails = error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    } : context

    console.error(this.formatMessage('error', message, errorDetails))

    // In production, send to external logging service
    if (!this.isDevelopment) {
      this.sendToExternalService('error', message, errorDetails)
    }
  }

  private sendToExternalService(_level: LogLevel, _message: string, _context?: unknown) {
    // Placeholder for external logging service integration
    // Examples: Sentry, LogRocket, DataDog, etc.
    //
    // Example implementation:
    // try {
    //   if (typeof window !== 'undefined') {
    //     // Client-side logging
    //     Sentry.addBreadcrumb({
    //       message,
    //       level: level as any,
    //       data: context
    //     })
    //   } else {
    //     // Server-side logging
    //     // Send to your preferred logging service
    //   }
    // } catch (err) {
    //   console.error('Failed to send log to external service:', err)
    // }
  }
}

export const logger = new Logger()

// Helper functions for common logging scenarios
export const logError = (error: Error, component?: string, additionalContext?: LogContext) => {
  logger.error(
    `Error in ${component || 'Unknown Component'}`,
    error,
    { component, ...additionalContext }
  )
}

export const logApiError = (endpoint: string, error: Error, statusCode?: number) => {
  logger.error(
    `API Error at ${endpoint}`,
    error,
    { endpoint, statusCode, type: 'api_error' }
  )
}

export const logUserAction = (action: string, userId?: string, additionalData?: LogContext) => {
  logger.info(
    `User action: ${action}`,
    { userId, action, type: 'user_action', ...additionalData }
  )
}

export const logPerformance = (operation: string, duration: number, additionalData?: LogContext) => {
  logger.info(
    `Performance: ${operation} took ${duration}ms`,
    { operation, duration, type: 'performance', ...additionalData }
  )
}