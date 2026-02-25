#!/usr/bin/env bash

# PreToolUse hook (Bash): blocks git commit/push/rebase on a branch that is
# already merged into main, catching cases where SessionStart was bypassed.

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only intercept git write operations
if ! echo "$COMMAND" | grep -qE "^git\s+(commit|push|rebase)"; then
  exit 0
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  exit 0
fi

branch=$(git branch --show-current)

if [ "$branch" = "main" ]; then
  exit 0
fi

git fetch origin main 2>/dev/null || true

if git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
  if git merge-base --is-ancestor "origin/$branch" origin/main 2>/dev/null; then
    echo "Blocked: '$branch' is already merged into main." >&2
    echo "Create a new branch before committing: git checkout -b <new-branch-name>" >&2
    exit 2
  fi
fi
