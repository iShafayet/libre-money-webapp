const LOCAL_OR_TAB_STORAGE_KEY = "--ck-credentials";

const inMemoryCredentials: {
  username: string;
  password: string;
} = (() => {
  const item = sessionStorage.getItem(LOCAL_OR_TAB_STORAGE_KEY) || localStorage.getItem(LOCAL_OR_TAB_STORAGE_KEY);
  if (!item) {
    return {
      username: "",
      password: "",
    };
  }
  return JSON.parse(item);
})();

export const credentialService = {
  async storeCredentials(username: string, password: string, shouldRememberPassword: boolean) {
    inMemoryCredentials.username = username;
    inMemoryCredentials.password = password;
    if (shouldRememberPassword) {
      localStorage.setItem(LOCAL_OR_TAB_STORAGE_KEY, JSON.stringify(inMemoryCredentials));
    } else {
      sessionStorage.setItem(LOCAL_OR_TAB_STORAGE_KEY, JSON.stringify(inMemoryCredentials));
    }
  },

  hasCredentials() {
    return inMemoryCredentials.username.length > 0 && inMemoryCredentials.password.length > 0;
  },

  getCredentials() {
    return inMemoryCredentials;
  },

  async clearCredentials() {
    inMemoryCredentials.username = "";
    inMemoryCredentials.password = "";
    sessionStorage.removeItem(LOCAL_OR_TAB_STORAGE_KEY);
    localStorage.removeItem(LOCAL_OR_TAB_STORAGE_KEY);
  },

  async injectCredentials(url: string) {
    if (!this.hasCredentials()) {
      throw new Error("No credentials to inject");
    }
    const str = url.replace("https://", "");
    return `https://${encodeURIComponent(inMemoryCredentials.username)}:${encodeURIComponent(inMemoryCredentials.password)}@${str}`;
  },
};
