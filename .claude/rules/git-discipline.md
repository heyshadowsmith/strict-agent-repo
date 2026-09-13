# Git Discipline

Each rule names what enforces it. Claude Code hooks check the agent's tool calls before they run, git hooks in `.husky/` run on every commit and push, and CI runs the full diagnostics on every pull request.

- Never use `--no-verify` or `--force` with any git command. Enforced by `git-checks/check-no-override.sh`.
- Never commit or push directly to `main`, and don't edit files while on `main`. Always work on a feature branch. Enforced by `git-checks/check-edit-branch.sh` for edits, `git-checks/validate-branch-before-git.sh` for git commands, and `git-checks/protect-main.sh` on commit and push.
- Branch names must follow `<type>/<description>` using only lowercase letters, numbers, and hyphens (e.g., `feat/add-auth`). Valid types:
  `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `build`, `revert`. Enforced by `git-checks/check-edit-branch.sh` before edits and `git-checks/validate-branch-name.sh` on commit and push.
- Commit messages must follow Conventional Commits (e.g., `feat: add login`, `fix: null check`). Enforced by commitlint on every commit and on pull request titles.
- If the current branch is already merged into `main`, do not make changes. Create a new branch first. Enforced by `git-checks/check-edit-branch.sh` for edits, `git-checks/validate-branch-before-git.sh` for git commands, and `git-checks/check-merged.sh` on push.
- Keep each branch under 500 lines changed vs. `main` (lock files and build artifacts excluded). Target under 250. `git-checks/check-pr-size.sh` warns above 250 and blocks the push above 500.
- Never skip hooks by other means: no `HUSKY=0`, no `core.hooksPath` changes, no `git commit -n`, no git aliases. Enforced by `git-checks/check-no-override.sh`. The sandbox also blocks writes to `.git/config` and `.git/hooks/`.
- Never push to `main` through any refspec (e.g. `git push origin HEAD:main`), and never delete remote branches. Enforced by `git-checks/check-no-override.sh` and `git-checks/protect-main.sh`.
- Never change GitHub branch protection, rulesets, repository settings, workflows, secrets, variables, or deploy keys. Enforced by `git-checks/check-no-override.sh`.
