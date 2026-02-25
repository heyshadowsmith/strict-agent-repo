# Strict Agent Repo

This is an experimental repository by Shadow Smith that explores the idea of creating a strict Agent repo that aims to completely eliminate the ability for Agents to be too clever for their and your own good.

## Strategies

### 1. Agent Permission Lockdown (`.claude/settings.json` — deny list)

Every configuration file that defines quality rules is explicitly denied for `Edit` and `Write` by Claude. This covers `.claudeignore`, `settings.json` itself, `tsconfig.json`, `eslint.config.ts`, `.prettierrc`, all `diagnostics/*.sh` scripts, `commitlint.config.ts`, `vitest.config.ts`, all `.husky/*` hooks, `.secretlintrc.json`, `knip.json`, `CLAUDE.md`, `package.json`, `package-lock.json`, `.markdownlint.json`, and `.markdownlint-cli2.jsonc`.

**Problem solved:** An agent can't soften its own constraints. Without this, a sufficiently clever agent could relax a lint rule, lower a coverage threshold, or disable a hook to make its code appear to pass checks.

---

### 2. Bash Command Whitelist (`.claude/settings.json` — allow list)

Only two Bash patterns are pre-approved: `bash diagnostics/*.sh` and `npm run format *`. All other shell commands require explicit user approval.

**Problem solved:** Prevents the agent from running arbitrary shell commands (e.g., directly invoking `tsc --noEmit` to probe errors without going through the canonical diagnostic scripts, or running `rm`, `curl`, or other side-effectful commands unilaterally).

---

### 3. Git Hook Bypass Blocker (`.claude/settings.json` — PreToolUse hook)

A `PreToolUse` hook intercepts every `Bash` call and blocks any command containing `git --no-verify` or `git --force`.

**Problem solved:** Prevents the agent from bypassing the entire git hook pipeline with a single flag. Without this, an agent could commit broken code or push directly to main by appending `--no-verify`.

---

### 4. Immediate Type Check on Every Edit (`.claude/settings.json` — PostToolUse hook)

After every `Edit` or `Write` tool call, `diagnostics/edit.sh` runs automatically, executing `npm run tsc`. The agent sees type errors immediately in the tool response before it can make a subsequent edit.

**Problem solved:** Eliminates the pattern where an agent writes several interdependent files in sequence, introduces type errors in early files, and only discovers them much later (or never). Fast feedback keeps the agent from compounding mistakes.

---

### 5. Staged Diagnostic Scripts (`diagnostics/`)

Three scripts form a tiered quality gate pipeline, ordered by ascending cost so failures surface as cheaply as possible:

- **`edit.sh`** — type check only; runs after every file save.
- **`commit.sh`** — format check → TypeScript → lint → markdown lint; runs at pre-commit.
- **`full.sh`** — format check → TypeScript → lint → markdown lint → dead code → secret scan → vulnerability audit → tests with coverage; runs at pre-push.

**Problem solved:** Expensive checks (full test suite, audit) don't block rapid iteration, but nothing reaches the remote without passing every gate. The explicit ordering principle ("fail as early as possible") is documented in `full.sh` itself.

---

### 6. Immutable Hook Pipeline (Husky — `.husky/`)

Three git hooks enforce quality at the point of each git operation:

- **`commit-msg`** — runs `commitlint` to enforce the conventional commit format.
- **`pre-commit`** — runs `lint-staged` (auto-fix and format staged files), then `diagnostics/commit.sh`.
- **`pre-push`** — enforces branch naming convention (`<type>/<description>`), blocks direct pushes to `main`, blocks pushing already-merged branches, enforces a PR size hard cap of 500 changed lines (warning at 250), then runs `diagnostics/full.sh`.

**Problem solved:** An agent cannot land code that skips formatting, fails type checking, or violates commit conventions. The pre-push PR size cap specifically prevents agents from generating enormous "solution dumps" that are impossible for a human to review.

---

### 7. Conventional Commits with Locked Scope Enum (`commitlint.config.ts`)

Extends `@commitlint/config-conventional` and further restricts scopes to an explicit allowlist: `core`, `utils`, `config`, `test`, `deps`, `ci`. Also enforces scope case (kebab-case), subject case (sentence-case or lower-case), and a 72-character header limit.

**Problem solved:** Forces the agent to categorise every change correctly and communicate its intent clearly. Vague or overly broad commit messages ("fix stuff", "update everything") are rejected. The enumerated scope list also prevents scope sprawl.

---

### 8. Maximally Strict TypeScript (`tsconfig.json`)

Every available strict TypeScript flag is enabled: `strict`, `alwaysStrict`, `noImplicitAny`, `strictNullChecks`, `strictPropertyInitialization`, `useUnknownInCatchVariables`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`, `allowUnreachableCode: false`, and `allowUnusedLabels: false`.

**Problem solved:** Closes every common TypeScript escape hatch. Agents frequently use `any`, non-null assertions, and optional chaining shortcuts to silence type errors without fixing their root cause. This configuration makes those tricks compile errors.

---

### 9. Comprehensive ESLint Configuration (`eslint.config.ts`)

Layers six rule sets:

- **`typescript-eslint` strictTypeChecked + stylisticTypeChecked** — the strictest available TS-aware rules.
- **`eslint-plugin-unicorn`** — opinionated modern JavaScript best practices.
- **`eslint-plugin-sonarjs`** — code quality and bug-detection rules derived from SonarQube.
- **`eslint-plugin-functional`** — enforces functional programming patterns (no mutation, no side effects outside designated boundaries).
- **`eslint-plugin-no-only-tests`** — treats `.only` in test files as an error.

Additional hand-configured rules enforce: no `console`, no type assertions (`assertionStyle: "never"`), cyclomatic complexity ≤ 10, nesting depth ≤ 3, function body ≤ 40 lines, file length ≤ 200 lines, parameter count ≤ 3, and strict naming conventions across all identifier types.

**Problem solved:** Prevents a wide class of agent anti-patterns: disabling tests with `.only`, using `as` casts to force types, writing deeply nested logic that is hard to review, creating monolithic functions, and producing mutable state-heavy code.

---

### 10. 100% Test Coverage Threshold (`vitest.config.ts`)

Coverage is enforced across all four axes — lines, functions, branches, and statements — each at 100%.

**Problem solved:** An agent cannot deliver a feature without fully testing it. Partial coverage, which often corresponds to untested edge cases or dead branches, causes the check to fail.

---

### 11. Dead Code Detection (`knip`)

`knip` scans for unused exports, files, and dependencies on every pre-push run.

**Problem solved:** Agents frequently leave behind scaffolding, half-used utilities, or stale exports from earlier iterations of a solution. Dead code silently accumulates and becomes technical debt. `knip` makes it a hard error.

---

### 12. Secret Scanning (`secretlint`)

`secretlint` with the recommended rule preset scans all files for patterns matching API keys, tokens, private keys, and other credentials on every pre-push run.

**Problem solved:** Prevents accidental or agent-generated commits that embed secrets directly in source files — a common failure mode when agents construct example configurations or test fixtures.

---

### 13. Dependency Vulnerability Auditing (`npm audit`)

`npm audit --audit-level=moderate` runs as part of `diagnostics/full.sh` on every pre-push.

**Problem solved:** Catches introduced vulnerabilities when the agent adds or upgrades packages as part of a task.

---

### 14. Configuration File Opacity (`.claudeignore`)

All tool configuration files — `tsconfig.json`, `eslint.config.ts`, `.prettierrc`, all `diagnostics/*.sh` scripts, `commitlint.config.ts`, `vitest.config.ts`, all `.husky/*` hooks, `.secretlintrc.json`, `knip.json`, `.claude/settings.json`, `.markdownlint.json`, `.markdownlint-cli2.jsonc` — are listed in `.claudeignore`, making them invisible to Claude's file reading tools.

**Problem solved:** Prevents the agent from reading the rules that constrain it and then writing code specifically designed to pass them superficially (e.g., knowing the exact complexity threshold and writing code that scores 10 rather than fixing the underlying design).

---

### 15. No Agent Instructions

There is no `CLAUDE.md` or `AGENTS.md`, and `README.md` is explicitly denied for reading, editing, and writing. The agent receives zero project-level instructions and cannot read the documentation that describes the constraints it operates under.

**Problem solved:** Any agent instruction file — even a minimal one — is a gift to the agent. Documenting which diagnostic script to run tells it which script to read and model its behaviour around. Denying `README.md` closes the remaining gap: even if the agent found and read the project documentation, it would gain a complete map of every enforcement mechanism and could write code calibrated to pass each check superficially. Keeping both instruction files and strategy documentation out of reach forces the agent to work blind, discovering constraints only when it violates them.

---

### 17. Markdown Linting (`markdownlint-cli2`)

`markdownlint-cli2` enforces consistent Markdown style across all `.md` files using rules defined in `.markdownlint.json`. It runs as part of both `diagnostics/commit.sh` and `diagnostics/full.sh`, blocking commits and pushes that contain malformed or inconsistently styled documentation.

**Problem solved:** Prevents agents from producing poorly structured Markdown — broken headings, inconsistent list styles, improper code fences — that would degrade the readability of human-facing content.

---

### 16. Staged Auto-formatting (`lint-staged`)

`lint-staged` runs on every commit: ESLint with `--fix` and Prettier on staged `.ts` files; Prettier on staged `.json`, `.html`, `.css`, and `.md` files.

**Problem solved:** Prevents formatting debates and ensures that even if the agent produces poorly formatted output, it is normalised automatically before being committed. Keeps the diff focused on logic, not whitespace.
