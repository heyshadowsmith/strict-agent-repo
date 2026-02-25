#!/usr/bin/env bash

# Blocks pushing a branch that has already been merged into main.

set -euo pipefail

branch=$(git branch --show-current)

if git show-ref --verify --quiet refs/remotes/origin/main; then
  if git merge-base --is-ancestor "$branch" origin/main 2>/dev/null; then
    echo "Branch '$branch' has already been merged into main. Push blocked."
    exit 1
  fi
fi
