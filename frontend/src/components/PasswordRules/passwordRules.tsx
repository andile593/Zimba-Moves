export const passwordRules = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  {
    label: "At least 1 uppercase letter",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    label: "At least 1 lowercase letter",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  { label: "At least 1 number", test: (pw: string) => /[0-9]/.test(pw) },
  {
    label: "At least 1 special character",
    test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  },
];
