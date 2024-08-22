import { defineStore } from "pinia";

export const useErrorStore = defineStore({
  id: "errorStore",
  state: () => ({
    errorMessage: "",
    errorVisible: false,
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
  },
});