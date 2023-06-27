export const validators = {
  name: [(val: string) => (val && val.length > 0) || "Please type a name"],
  username: [
    (val: string) => (val && val.length > 0) || "Please type your username",
  ],
  password: [
    (val: string) => (val && val.length > 0) || "Please type your password",
  ],
  currencySign: [
    (val: string) =>
      (val && val.length > 0 && val.length < 4) ||
      "Sign must be within 1 to 3 characters",
  ],
};
