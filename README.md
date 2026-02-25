# Strict Agent Repo

This is an experimental repository by Shadow Smith that explores the idea of creating a strict Agent repo that aims to completely eliminate the ability for Agents to be too clever for their and your own good.

## Strategies

### 1. Agent Permission Lockdown

Every configuration file that defines quality rules is explicitly denied for editing and writing. An agent cannot soften its own constraints.

### 2. Bash Command Allowlist

Only two Bash patterns are pre-approved; all other shell commands require explicit user approval. Prevents the agent from running arbitrary shell commands unilaterally.

### 3. Git Hook Bypass Blocker

A pre-tool hook intercepts every Bash call and blocks any git command that bypasses hooks or forces operations. Prevents the agent from circumventing the entire git hook pipeline with a single flag.

### 4. Immediate Type Check on Every Edit

After every file edit, a type check runs automatically and the agent sees errors before making a subsequent edit. Eliminates the pattern where an agent writes several interdependent files, introduces type errors early, and only discovers them much later.

### 5. Staged Diagnostic Scripts

Three scripts form a tiered quality gate pipeline ordered by ascending cost, so failures surface as cheaply as possible. Expensive checks don't block rapid iteration, but nothing reaches the remote without passing every gate.

### 6. Immutable Hook Pipeline

Three git hooks enforce quality at the point of each git operation: commit message validation, pre-commit linting and type checks, and pre-push branch validation and full diagnostics. An agent cannot land code that skips formatting, fails type checking, or violates commit conventions.

### 7. Conventional Commits with Locked Scope Enum

Commit messages must follow a conventional format with an explicit scope allowlist, case rules, and a character limit. Forces the agent to categorise every change correctly and prevents vague or overly broad messages.

### 8. Maximally Strict TypeScript

Every available strict TypeScript flag is enabled. Closes every common escape hatch agents use to silence type errors without fixing their root cause.

### 9. Comprehensive ESLint Configuration

Six rule sets enforce strict type-aware rules, modern JavaScript practices, code quality, functional programming patterns, and test hygiene. Prevents a wide class of agent anti-patterns including type assertions, deeply nested logic, monolithic functions, and mutable state.

### 10. 100% Test Coverage Threshold

Coverage is enforced across all four axes at 100%. An agent cannot deliver a feature without fully testing it.

### 11. Dead Code Detection

Unused exports, files, and dependencies are detected on every pre-push run. Agents frequently leave behind scaffolding and stale exports that silently accumulate as technical debt.

### 12. Secret Scanning

All files are scanned for credential patterns on every pre-push run. Prevents accidental or agent-generated commits that embed secrets in source files.

### 13. Dependency Vulnerability Auditing

Dependencies are audited for known vulnerabilities on every pre-push. Catches introduced vulnerabilities when the agent adds or upgrades packages.

### 14. Agent Instructions via `.claude/rules/`

Two rule files give the agent explicit behavioural constraints aligned with the hook pipeline — one for git discipline, one for protected files. Rather than forcing the agent to discover constraints only at violation time, the rules surface the same policies the hooks enforce as intent before they become blocked actions.

### 15. Staged Auto-formatting

Auto-formatting runs on every commit, normalising output regardless of what the agent produced. Keeps diffs focused on logic, not whitespace.

### 16. Markdown Linting

Consistent Markdown style is enforced across all documentation files at both commit and push time. Prevents agents from producing poorly structured documentation that degrades readability.

### 17. Required Human Review

Every pull request requires an approving review from the code owner before it can be merged. Even if an agent passes every automated quality gate, a human must inspect and approve its changes.
