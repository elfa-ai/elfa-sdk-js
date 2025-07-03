export class ElfaSDKError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: any;

  constructor(
    message: string,
    code: string,
    statusCode?: number,
    details?: any,
  ) {
    super(message);
    this.name = "ElfaSDKError";
    this.code = code;
    if (statusCode !== undefined) {
      this.statusCode = statusCode;
    }
    if (details !== undefined) {
      this.details = details;
    }
    Object.setPrototypeOf(this, ElfaSDKError.prototype);
  }
}

export class ElfaApiError extends ElfaSDKError {
  constructor(message: string, statusCode: number, details?: any) {
    super(message, "ELFA_API_ERROR", statusCode, details);
    this.name = "ElfaApiError";
  }
}

export class TwitterApiError extends ElfaSDKError {
  constructor(message: string, statusCode?: number, details?: any) {
    super(message, "TWITTER_API_ERROR", statusCode, details);
    this.name = "TwitterApiError";
  }
}

export class ValidationError extends ElfaSDKError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", undefined, details);
    this.name = "ValidationError";
  }
}

export class RateLimitError extends ElfaSDKError {
  public readonly resetTime?: Date;

  constructor(message: string, resetTime?: Date, details?: any) {
    super(message, "RATE_LIMIT_ERROR", 429, details);
    this.name = "RateLimitError";
    if (resetTime !== undefined) {
      this.resetTime = resetTime;
    }
  }
}

export class AuthenticationError extends ElfaSDKError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class NetworkError extends ElfaSDKError {
  constructor(message: string, originalError?: Error) {
    super(message, "NETWORK_ERROR", undefined, originalError);
    this.name = "NetworkError";
  }
}

export class EnhancementError extends ElfaSDKError {
  constructor(message: string, details?: any) {
    super(message, "ENHANCEMENT_ERROR", undefined, details);
    this.name = "EnhancementError";
  }
}

export function isRetryableError(error: Error): boolean {
  // Check by error name for better compatibility
  if (error.name === "RateLimitError") {
    return true;
  }

  if (error.name === "NetworkError") {
    return true;
  }

  if (error.name === "ElfaApiError" && (error as any).statusCode) {
    const statusCode = (error as any).statusCode;
    return statusCode >= 500 && statusCode < 600;
  }

  return false;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred";
}
