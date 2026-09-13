#!/usr/bin/env bash

# PreToolUse hook (Edit, Write, NotebookEdit): blocks editing files inside the repo on main,
# on a detached HEAD, on a badly named branch, or on a branch that has already landed in main.
# Uses cached remote refs to stay fast; the SessionStart hook and git writes fetch origin.
# Files outside the repo, like scratch files, are allowed. Fails closed on setup errors.

set -uo pipefail

block() {
  echo "Blocked: $1" >&2
  exit 2
}

command -v jq >/dev/null 2>&1 || block "jq is required for branch checks"
INPUT=$(cat) || block "could not read hook input"
FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty') || block "could not parse hook input"

project="${CLAUDE_PROJECT_DIR:-}"
[ -n "$project" ] || block "CLAUDE_PROJECT_DIR is not set"

case "$FILE" in
  "$project"/*) ;;
  *) exit 0 ;;
esac

cd "$project" || block "could not open the project directory"
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

branch=$(git branch --show-current)
if [ -z "$branch" ]; then
  block "detached HEAD. Switch to a feature branch before editing: git switch -c <type>/<description>"
fi
if [ "$branch" = "main" ]; then
  block "'main' is protected. Create a feature branch before editing: git switch -c <type>/<description>"
fi

# shellcheck source=git-checks/lib-branch-name.sh
source "$(dirname "$0")/lib-branch-name.sh"
if ! printf '%s' "$branch" | grep -qE "$BRANCH_NAME_PATTERN"; then
  block "branch '$branch' doesn't follow <type>/<description>. Rename it before editing: git branch -m <type>/<description>"
fi

# shellcheck source=git-checks/lib-merged.sh
source "$(dirname "$0")/lib-merged.sh"
if branch_is_merged "$branch"; then
  block "'$branch' has already landed in main. Start a new branch from an up-to-date main before editing."
fi

exit 0
