#!/usr/bin/env bash

# PreToolUse hook (Bash): blocks git write operations on main, on a detached HEAD,
# or on a branch that has already landed in main (including squash merges).
# Fails closed on setup errors.

set -uo pipefail

block() {
  echo "Blocked: $1" >&2
  exit 2
}

command -v jq >/dev/null 2>&1 || block "jq is required for git safety checks"
INPUT=$(cat) || block "could not read hook input"
COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty') || block "could not parse hook input"

# Match git write operations anywhere: after `cd x &&`, on later lines, or after -C/-c options.
if ! printf '%s' "$COMMAND" | grep -qE '(^|[[:space:];&|(/])git([[:space:]]+-[Cc][[:space:]]+[^[:space:]]+)*[[:space:]]+(commit|push|rebase|merge|cherry-pick|am|revert)([[:space:]]|$)'; then
  exit 0
fi

git rev-parse --git-dir >/dev/null 2>&1 || exit 0

branch=$(git branch --show-current)
if [ -z "$branch" ]; then
  block "detached HEAD. Switch to a feature branch first: git switch -c <type>/<description>"
fi
if [ "$branch" = "main" ]; then
  block "'main' is protected. Create a feature branch first: git switch -c <type>/<description>"
fi

# shellcheck source=git-checks/lib-merged.sh
source "$(dirname "$0")/lib-merged.sh"

if ! git fetch --prune --quiet origin 2>/dev/null; then
  echo "Warning: could not fetch origin; merged-branch check is using cached refs." >&2
fi

if branch_is_merged "$branch"; then
  block "'$branch' has already landed in main. Start a new branch: git switch main && git pull --ff-only && git switch -c <type>/<description>"
fi

exit 0
