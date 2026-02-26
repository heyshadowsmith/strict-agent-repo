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
      // Allow `as` type assertions; ban the old angle-bracket form
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "as" },
      ],
      complexity: ["error", 15],
      "max-depth": ["error", 4],
      "max-lines-per-function": ["error", 60],
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      "max-params": ["error", 4],
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
      // Unicorn: disable rules that harm readability more than they help
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/no-null": "off",
      "unicorn/no-negated-condition": "off",
      "unicorn/no-array-callback-reference": "off",
    },
  },
  {
    plugins: { functional },
    rules: {
      "functional/no-mixed-types": "error",
    },
  },
  prettierConfig,
);
