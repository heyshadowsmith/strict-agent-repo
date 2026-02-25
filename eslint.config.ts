import * as js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import noOnlyTests from "eslint-plugin-no-only-tests";
import unicorn from "eslint-plugin-unicorn";
import { configs as sonarjsConfigs } from "eslint-plugin-sonarjs";
import functional from "eslint-plugin-functional";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  unicorn.configs["recommended"],
  sonarjsConfigs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    ignores: ["dist/**"],
  },
  {
    plugins: { "no-only-tests": noOnlyTests },
    rules: {
      "no-console": "error",
      "no-only-tests/no-only-tests": "error",
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      complexity: ["error", 10],
      "max-depth": ["error", 3],
      "max-lines-per-function": ["error", 40],
      "max-lines": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      "max-params": ["error", 3],
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "default", format: ["camelCase"] },
        { selector: "variable", format: ["camelCase", "UPPER_CASE"] },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        { selector: "typeLike", format: ["PascalCase"] },
        { selector: "enumMember", format: ["UPPER_CASE"] },
      ],
    },
  },
  functional.configs.recommended,
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "functional/no-expression-statements": "off",
      "functional/no-return-void": "off",
    },
  },
  prettierConfig,
);
