import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      2,
      "always",
      ["core", "utils", "config", "test", "deps", "ci"],
    ],
    "scope-case": [2, "always", "kebab-case"],
    "subject-case": [2, "always", ["sentence-case", "lower-case"]],
    "header-max-length": [2, "always", 72],
  },
};

export default config;
