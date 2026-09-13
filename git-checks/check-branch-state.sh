#!/usr/bin/env bash

# SessionStart hook: tells Claude when the session starts on a branch that has already
# landed in main (including squash merges). Stdout is added to Claude's context.
# Blocking is handled by the PreToolUse hook, since SessionStart can't block reliably.

set -uo pipefail

git rev-parse --git-dir >/dev/null 2>&1 || exit 0

branch=$(git branch --show-current)
if [ -z "$branch" ] || [ "$branch" = "main" ]; then
  exit 0
fi

# shellcheck source=git-checks/lib-merged.sh
source "$(dirname "$0")/lib-merged.sh"
git fetch --prune --quiet origin 2>/dev/null || true

if branch_is_merged "$branch"; then
  echo "WARNING: Branch '$branch' has already landed in main."
  echo "Do NOT make changes here. Start a new branch from main before editing:"
  echo "  git switch main && git pull --ff-only && git switch -c <type>/<description>"
fi

exit 0
