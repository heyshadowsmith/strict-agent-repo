# Config Integrity

- Do not edit any file in `diagnostics/`, `git-checks/`, or `.husky/`.
- Do not edit any of these config files: `package.json`, `tsconfig.json`, `eslint.config.ts`, `.prettierrc`, `.markdownlint.json`, `.secretlintrc.json`, `knip.json`, `commitlint.config.ts`, `.claudeignore`, `.claude/settings.json`, `CLAUDE.md`.
- These restrictions apply to every method, not just the Edit and Write tools: shell redirection, `sed`, `tee`, `cp`, `mv`, scripts, and tools that rewrite files such as `npm pkg set`, `npm install`, `volta pin`, `prettier --write`, `git checkout -- <file>`, or `git diff --output`.
- Do not create config files that take precedence over protected ones (for example `eslint.config.js`, `.markdownlint.jsonc`, `.prettierrc.json`, `vite.config.ts`).
- Do not edit `.github/`, `.npmrc`, `.prettierignore`, or `.secretlintignore` without explicit approval.
- Do not add suppressions without explicit approval: `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `v8 ignore`, `.skip`, `prettier-ignore`, `markdownlint-disable`, `secretlint-disable`.
- If a restriction blocks the task, stop and ask the user. Do not look for another route.
