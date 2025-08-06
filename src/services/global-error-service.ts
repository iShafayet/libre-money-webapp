import { auditLogService } from "./audit-log-service";

class GlobalErrorService {
  private isSubscribed = false;

  /**
   * Set up global error handlers
   */
  setupSubscription(): void {
    if (this.isSubscribed) {
      console.warn("Global error handlers already set up");
      return;
    }

    // Global error handler for uncaught errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Uncaught error:", event.error);

      // Log to audit log if it's an Error object
      if (event.error instanceof Error) {
        auditLogService.logUncaughtError(event.error, {
          type: "uncaught",
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          message: event.message,
        });
      }
    };

    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);

      // Log to audit log
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      auditLogService.logUncaughtError(error, {
        type: "unhandled-rejection",
        reason: event.reason,
      });
    };

    // Add global error listeners
    window.addEventListener("error", handleGlobalError, { capture: false });
    window.addEventListener("unhandledrejection", handleUnhandledRejection, { capture: false });

    this.isSubscribed = true;
    console.debug("Global error handlers set up");
  }

  /**
   * Cancel global error handlers
   */
  cancelSubscription(): void {
    if (!this.isSubscribed) {
      console.warn("Global error handlers not set up");
      return;
    }

    // Remove global error listeners
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);

    this.isSubscribed = false;
    console.debug("Global error handlers removed");
  }

  /**
   * Global error handler for uncaught errors
   */
  private handleGlobalError = (event: ErrorEvent) => {
    console.error("Uncaught error:", event.error);

    // Log to audit log if it's an Error object
    if (event.error instanceof Error) {
      auditLogService.logUncaughtError(event.error, {
        type: "uncaught",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message,
      });
    }
  };

  /**
   * Global error handler for unhandled promise rejections
   */
  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error("Unhandled promise rejection:", event.reason);

    // Log to audit log
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    auditLogService.logUncaughtError(error, {
      type: "unhandled-rejection",
      reason: event.reason,
    });
  };
}

export const globalErrorService = new GlobalErrorService();
