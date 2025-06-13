import { dialogService } from "./dialog-service";

class ErrorService {

  async handleUnexpectedError<T>(fn: () => Promise<T>): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      console.error("Unexpected error", error);
      if (error instanceof Error) {
        dialogService.alert("Unexpected Error", error.message + "\n\n" + error.stack);
      } else {
        dialogService.alert("Unexpected Non-standard Error", JSON.stringify(error));
      }
    }
    return undefined;
  }
}

export const errorService = new ErrorService();
