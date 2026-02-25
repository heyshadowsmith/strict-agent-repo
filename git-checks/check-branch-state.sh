#!/usr/bin/env bash

# SessionStart hook: blocks an agent session if the current branch is already
# merged into main but has uncommitted changes or new local commits on top.

set -euo pipefail

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  exit 0
fi

branch=$(git branch --show-current)

# Nothing to check on main itself
if [ "$branch" = "main" ]; then
  exit 0
fi

git fetch origin main 2>/dev/null || true

# Only meaningful if the remote tracking branch exists
if ! git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
  exit 0
fi

if git merge-base --is-ancestor "origin/$branch" origin/main 2>/dev/null; then
  dirty=$(git status --porcelain)
  ahead=$(git log --oneline "origin/$branch..HEAD" 2>/dev/null)

  if [ -n "$dirty" ] || [ -n "$ahead" ]; then
    echo "ERROR: Branch '$branch' is already merged into main but has local changes." >&2
    echo "" >&2
    echo "Do NOT make changes here. Move them to a new branch first:" >&2
    echo "  git stash" >&2
    echo "  git checkout -b <new-branch-name>" >&2
    echo "  git stash pop" >&2
    exit 2
  fi
fi
