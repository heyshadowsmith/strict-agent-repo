# Config Integrity

These paths are protected, and `.claude/settings.json` denies edits to each one. Most file-name patterns are protected at the repo root and in every subfolder, because ESLint, Prettier, markdownlint, lint-staged, and Claude Code use the nearest config or instruction file, so a copy in a subfolder would override the protected one. Folder paths like `diagnostics/**`, `README.md`, and the Vitest and Vite configs are protected only where listed. Vitest reads only the root config, and it writes temporary copies of that config under `node_modules`, which a subfolder rule would block. `diagnostics/check-config-files.sh` still fails the build if one of those configs appears in a subfolder, and `diagnostics/check-rules-sync.sh` fails the build if this list and the settings drift apart.

<!-- protected-paths:start -->

- Agent settings and instructions: `.claude/**`, `CLAUDE.md`, `CLAUDE.local.md`, `.claudeignore`, `~/.claude/settings.json`
- Hooks, checks, and CI: `.husky/**`, `diagnostics/**`, `git-checks/**`, `.github/**`
- Git attributes: `.gitattributes`, `.git/info/**`
- Packages: `package.json`, `package-lock.json`, `.npmrc`
- TypeScript: `tsconfig*.json`
- ESLint: `eslint.config.*`
- Formatting: `.prettierrc*`, `prettier.config.*`, `.prettierignore`, `.editorconfig`
- Markdown linting: `.markdownlint*`
- Tests and build: `vitest.config.*`, `vitest.workspace.*`, `vite.config.*`
- Staged-file fixes: `.lintstagedrc*`, `lint-staged.config.*`
- Commit messages: `commitlint.config.*`, `.commitlintrc*`, `.config/**`
- Dead code: `knip.*`, `.knip.*`
- Secret scanning: `.secretlintrc*`, `.secretlintignore`
- Project docs: `README.md`

<!-- protected-paths:end -->

- Don't edit a protected path, and don't create a new file that matches one. `diagnostics/check-config-files.sh` fails the commit, the push, and CI if a config or instruction file appears anywhere other than its allowed place.
- These restrictions apply to every method, not just the Edit and Write tools: shell redirection, `sed`, `tee`, `cp`, `mv`, scripts, and tools that rewrite files such as `npm pkg set`, `npm install`, `volta pin`, `prettier --write`, `git checkout -- <file>`, or `git diff --output`.
- Don't add suppressions: `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `v8 ignore`, `c8 ignore`, `istanbul ignore`, `prettier-ignore`, `markdownlint-disable`, `secretlint-disable`, skipped or todo tests and scenarios, or `@skip` and `@ignore` tags. `diagnostics/check-suppressions.sh` fails the commit, the push, and CI on any of them. An exception needs the user to change that check.
- The user makes and commits every change to a protected path. Propose the exact change, ideally as a patch they can review and apply.
- After a pull request that changed a protected path merges, don't switch branches or pull from the shell. The sandbox stops git from rewriting those files and leaves the branch half-updated. Ask the user to run `git switch main && git pull --ff-only`, then start the next branch.
- If a restriction blocks the task, stop and ask the user. Do not look for another route.
