const inMemoryCredentials: {
  username: string;
  password: string;
} = {
  username: "",
  password: "",
};

export const credentialService = {
  async storeCredentials(username: string, password: string) {
    inMemoryCredentials.username = username;
    inMemoryCredentials.password = password;
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
  },

  async injectCredentials(url: string) {
    if (!this.hasCredentials()) {
      throw new Error("No credentials to inject");
    }
    const str = url.replace("https://", "");
    return `https://${encodeURIComponent(inMemoryCredentials.username)}:${encodeURIComponent(inMemoryCredentials.password)}@${str}`;
  },
};
