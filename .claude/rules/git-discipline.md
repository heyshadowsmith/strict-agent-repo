# Git Discipline

- Never use `--no-verify` or `--force` with any git command.
- Never commit or push directly to `main`. Always work on a feature branch.
- Branch names must follow `<type>/<description>` using only lowercase letters, numbers, and hyphens (e.g., `feat/add-auth`). Valid types:
  `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`, `revert`.
- Commit messages must follow Conventional Commits (e.g., `feat: add login`, `fix: null check`).
- If the current branch is already merged into `main`, do not make changes. Create a new branch first.
- Keep each branch under 500 lines changed vs. `main` (lock files and build artifacts excluded). Target under 250.
