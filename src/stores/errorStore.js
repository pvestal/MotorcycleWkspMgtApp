import { defineStore } from "pinia";

export const useErrorStore = defineStore({
  id: "errorStore",
  state: () => ({
    errorMessage: "",
    errorVisible: false,
    notificationMessage: "",
    notificationVisible: false,
    notificationType: "info", // "info", "success", "warning", "error"
  }),
  actions: {
    showError(message) {
      console.error("Error:", message);
      this.errorMessage = message;
      this.errorVisible = true;
      setTimeout(() => {
        this.clearError();
      }, 8000);
    },
    clearError() {
      this.errorMessage = "";
      this.errorVisible = false;
    },
    showNotification(message, type = "success", duration = 5000) {
      this.notificationMessage = message;
      this.notificationType = type;
      this.notificationVisible = true;
      setTimeout(() => {
        this.clearNotification();
      }, duration);
    },
    clearNotification() {
      this.notificationMessage = "";
      this.notificationVisible = false;
    },
  },
});