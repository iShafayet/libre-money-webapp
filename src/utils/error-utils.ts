class ExtendableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class CodedError extends ExtendableError {
  public code: string;

  constructor(code: string, message = "Unnamed error occurred.") {
    super(message);
    this.code = code;
  }
}

function throwOnFalsy(
  CodedErrorClass: ICodedError,
  value: any,
  code: string,
  message: string
) {
  if (!value) {
    throw new CodedErrorClass(code, message);
  }
}

function throwOnTruthy(
  CodedErrorClass: ICodedError,
  value: any,
  code: string,
  message: string
) {
  if (value) {
    throw new CodedErrorClass(code, message);
  }
}

interface ICodedError {
  new(code: string, message: string): CodedError;
}

class DeveloperError extends CodedError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

class UserError extends CodedError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

class NetworkError extends CodedError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

class ApiClientError extends CodedError {
  validationErrors: any;
  constructor(code: string, message: string, validationErrors: any = null) {
    super(code, message);
    this.validationErrors = validationErrors;
  }
}

class ApiServerError extends CodedError {
  constructor(code: string, message: string) {
    super(code, message);
  }
}

function extractMessageFromError(error: any): string {
  if (error && typeof error === "object") {
    if (typeof error.message === "string" && error.message.trim() !== "") {
      return error.message;
    }
  }
  return "Unknown error";
}

export {
  ApiClientError,
  ApiServerError, CodedError, DeveloperError, ExtendableError, NetworkError, UserError,
  extractMessageFromError, throwOnFalsy,
  throwOnTruthy
};
