import { NextResponse } from 'next/server';

export interface APIError {
  error: string;
  message: string;
  details?: any;
  statusCode: number;
  timestamp?: string;
}

export enum ErrorCodes {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_VALUE = 'INVALID_VALUE',

  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Business Logic
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',

  // External Services
  WHATSAPP_ERROR = 'WHATSAPP_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',

  // System Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export class AppError extends Error {
  public readonly code: ErrorCodes;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCodes,
    message: string,
    statusCode: number = 500,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error instances
export const Errors = {
  // Authentication
  Unauthorized: (message = 'Authentication required') =>
    new AppError(ErrorCodes.UNAUTHORIZED, message, 401),

  Forbidden: (message = 'Access denied') =>
    new AppError(ErrorCodes.FORBIDDEN, message, 403),

  TokenExpired: (message = 'Authentication token has expired') =>
    new AppError(ErrorCodes.TOKEN_EXPIRED, message, 401),

  // Validation
  ValidationError: (message: string, details?: any) =>
    new AppError(ErrorCodes.VALIDATION_ERROR, message, 400, details),

  MissingField: (field: string) =>
    new AppError(ErrorCodes.MISSING_REQUIRED_FIELD, `Required field: ${field}`, 400, { field }),

  InvalidFormat: (field: string, expectedFormat: string) =>
    new AppError(ErrorCodes.INVALID_FORMAT, `Invalid format for ${field}. Expected: ${expectedFormat}`, 400, { field, expectedFormat }),

  InvalidValue: (message: string, details?: any) =>
    new AppError(ErrorCodes.INVALID_VALUE, message, 400, details),

  // Resource Errors
  NotFound: (resource: string) =>
    new AppError(ErrorCodes.NOT_FOUND, `${resource} not found`, 404),

  AlreadyExists: (resource: string, details?: any) =>
    new AppError(ErrorCodes.ALREADY_EXISTS, `${resource} already exists`, 409, details),

  Conflict: (message: string, details?: any) =>
    new AppError(ErrorCodes.CONFLICT, message, 409, details),

  // Business Logic
  InsufficientPermissions: (requiredRole?: string) =>
    new AppError(ErrorCodes.INSUFFICIENT_PERMISSIONS, `Insufficient permissions${requiredRole ? `. Required: ${requiredRole}` : ''}`, 403, { requiredRole }),

  BusinessRuleViolation: (message: string, details?: any) =>
    new AppError(ErrorCodes.BUSINESS_RULE_VIOLATION, message, 422, details),

  OperationNotAllowed: (operation: string, reason?: string) =>
    new AppError(ErrorCodes.OPERATION_NOT_ALLOWED, `Operation not allowed: ${operation}${reason ? `. ${reason}` : ''}`, 403, { operation, reason }),

  // External Services
  WhatsAppError: (message: string, details?: any) =>
    new AppError(ErrorCodes.WHATSAPP_ERROR, `WhatsApp error: ${message}`, 502, details),

  DatabaseError: (message = 'Database operation failed') =>
    new AppError(ErrorCodes.DATABASE_ERROR, message, 500),

  // System Errors
  InternalServerError: (message = 'Internal server error') =>
    new AppError(ErrorCodes.INTERNAL_SERVER_ERROR, message, 500),

  ServiceUnavailable: (service: string) =>
    new AppError(ErrorCodes.SERVICE_UNAVAILABLE, `${service} is currently unavailable`, 503, { service }),

  RateLimitExceeded: (message = 'Too many requests') =>
    new AppError(ErrorCodes.RATE_LIMIT_EXCEEDED, message, 429)
};

/**
 * Creates a standardized API error response
 */
export function createErrorResponse(
  error: AppError | Error | string,
  statusCode?: number,
  details?: any
): APIError {
  let appError: any

  if (error instanceof AppError) {
    appError = error;
  } else if (typeof error === 'string') {
    appError = Errors.InternalServerError(error);
  } else {
    // Handle unknown errors
    appError = Errors.InternalServerError(error.message || 'Unknown error');
  }

  // Override status code if provided
  if (statusCode) {
    appError.statusCode = statusCode;
  }

  // Add additional details if provided
  if (details) {
    appError.details = { ...appError.details, ...details } 
  }

  return {
    error: appError.code,
    message: appError.message,
    details: appError.details,
    statusCode: appError.statusCode,
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a NextResponse with standardized error format
 */
export function createErrorResponseNext(
  error: AppError | Error | string,
  statusCode?: number,
  details?: any
): NextResponse {
  const apiError = createErrorResponse(error, statusCode, details);
  return NextResponse.json(apiError, { status: apiError.statusCode });
}

/**
 * Type guard to check if error is operational (user-facing)
 */
export function isOperationalError(error: Error): error is AppError {
  return error instanceof AppError && error.isOperational;
}

/**
 * Logs error with appropriate level based on operational status
 */
export function logError(error: Error): void {
  if (isOperationalError(error)) {
    // Log operational errors as warnings
    console.warn('Operational Error:', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details
    });
  } else {
    // Log programming errors as errors
    console.error('Programming Error:', error);
  }
}

/**
 * Global error handler for async route handlers
 */
export function handleAsyncError(fn: Function) {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error as Error);

      if (isOperationalError(error as Error)) {
        return createErrorResponseNext(error as AppError);
      }

      // Don't expose programming errors to users
      return createErrorResponseNext(Errors.InternalServerError());
    }
  };
}

/**
 * Validation helper functions
 */
export const validate = {
  required: (value: any, fieldName: string): void => {
    if (value === undefined || value === null || value === '') {
      throw Errors.MissingField(fieldName);
    }
  },

  email: (email: string): void => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw Errors.InvalidFormat('email', 'valid email address');
    }
  },

  phoneNumber: (phone: string): void => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      throw Errors.InvalidFormat('phoneNumber', 'valid phone number with country code');
    }
  },

  positiveNumber: (value: number, fieldName: string): void => {
    if (typeof value !== 'number' || value <= 0) {
      throw Errors.InvalidValue(`${fieldName} must be a positive number`);
    }
  },

  enum: <T>(value: any, enumObj: T, fieldName: string): void => {
    const enumValues = Object.values(enumObj as any);
    if (!enumValues.includes(value)) {
      throw Errors.InvalidValue(`${fieldName} must be one of: ${enumValues.join(', ')}`);
    }
  },

  stringLength: (value: string, fieldName: string, min: number, max?: number): void => {
    if (value.length < min) {
      throw Errors.InvalidValue(`${fieldName} must be at least ${min} characters long`);
    }
    if (max && value.length > max) {
      throw Errors.InvalidValue(`${fieldName} must be no more than ${max} characters long`);
    }
  }
};
