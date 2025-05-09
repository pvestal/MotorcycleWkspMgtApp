import { defineStore } from "pinia";

/**
 * Type for notification types
 */
export type NotificationType = "info" | "success" | "warning" | "error";

/**
 * Interface for error store state
 */
interface ErrorStoreState {
  errorMessage: string;
  errorVisible: boolean;
  notificationMessage: string;
  notificationVisible: boolean;
  notificationType: NotificationType;
}

/**
 * Error store for managing application errors and notifications
 */
export const useErrorStore = defineStore({
  id: "errorStore",
  state: (): ErrorStoreState => ({
    errorMessage: "",
    errorVisible: false,
    notificationMessage: "",
    notificationVisible: false,
    notificationType: "info", // "info", "success", "warning", "error"
  }),
  actions: {
    /**
     * Display an error message
     * @param message - The error message to display
     */
    showError(message: string | Error): void {
      // If message is an Error object, extract the message property
      const errorMessage = message instanceof Error ? message.message : message;
      
      console.error("Error:", errorMessage);
      this.errorMessage = errorMessage;
      this.errorVisible = true;
      setTimeout(() => {
        this.clearError();
      }, 8000);
    },
    
    /**
     * Clear the current error message
     */
    clearError(): void {
      this.errorMessage = "";
      this.errorVisible = false;
    },
    
    /**
     * Display a notification
     * @param message - The notification message to display
     * @param type - The type of notification
     * @param duration - How long to display the notification (in milliseconds)
     */
    showNotification(message: string, type: NotificationType = "success", duration: number = 5000): void {
      this.notificationMessage = message;
      this.notificationType = type;
      this.notificationVisible = true;
      setTimeout(() => {
        this.clearNotification();
      }, duration);
    },
    
    /**
     * Clear the current notification
     */
    clearNotification(): void {
      this.notificationMessage = "";
      this.notificationVisible = false;
    },
  },
});