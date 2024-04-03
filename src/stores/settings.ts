import { defineStore } from "pinia";

function deserializeString(localStorageKey: string): string | null {
  const value = localStorage.getItem(localStorageKey) || "null";
  try {
    return JSON.parse(value);
  } catch (ex) {
    return null;
  }
}

function deserializeBoolean(localStorageKey: string): boolean {
  const value = localStorage.getItem(localStorageKey) || "true";
  try {
    return JSON.parse(value);
  } catch (ex) {
    return false;
  }
}

function serializeValue(localStorageKey: string, value: any) {
  localStorage.setItem(localStorageKey, JSON.stringify(value));
}

const LOCAL_STORAGE_KEY__CURRENCY_ID = "--settings--default-currency-id";
const LOCAL_STORAGE_KEY__DEFAULT_VIEW = "--settings--default-view";
const LOCAL_STORAGE_KEY__REMEMBER_VIEW = "--settings--remember-view";
const LOCAL_STORAGE_KEY__LAST_VIEW = "--settings--last-opened-view";

export const useSettingsStore = defineStore("settingsStore", {
  state: () => ({
    defaultCurrencyId: deserializeString(LOCAL_STORAGE_KEY__CURRENCY_ID),
    defaultView: deserializeString(LOCAL_STORAGE_KEY__DEFAULT_VIEW) || "overview",
    rememberLastOpenedView: deserializeBoolean(LOCAL_STORAGE_KEY__REMEMBER_VIEW),
    lastOpenedView: deserializeString(LOCAL_STORAGE_KEY__LAST_VIEW) || "overview",
  }),

  getters: {},

  actions: {
    setDefaultCurrencyId(value: string) {
      serializeValue(LOCAL_STORAGE_KEY__CURRENCY_ID, value);
      this.defaultCurrencyId = value;
    },
    setDefaultView(value: string) {
      serializeValue(LOCAL_STORAGE_KEY__DEFAULT_VIEW, value);
      this.defaultView = value;
    },
    setRememberLastOpenedView(value: boolean) {
      serializeValue(LOCAL_STORAGE_KEY__REMEMBER_VIEW, value);
      this.rememberLastOpenedView = value;
    },
    setLastOpenedView(value: string) {
      serializeValue(LOCAL_STORAGE_KEY__LAST_VIEW, value);
      this.lastOpenedView = value;
    },
  },
});
