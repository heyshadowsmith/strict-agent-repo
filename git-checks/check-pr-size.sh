#!/usr/bin/env bash

# Checks the number of lines changed against origin/main.
# Warns above 250 lines, blocks above 500 lines.
# Excludes lock files and build artifacts from the count.

set -euo pipefail

if ! git show-ref --verify --quiet refs/remotes/origin/main; then
  exit 0
fi

base=$(git merge-base HEAD origin/main 2>/dev/null) || {
  echo "Warning: no merge base found, skipping PR size check."
  exit 0
}

lines=$(git diff --numstat "$base" HEAD -- \
  ':!package-lock.json' \
  ':!yarn.lock' \
  ':!pnpm-lock.yaml' \
  ':!*.lock' \
  ':!dist/**' \
  ':!build/**' \
  | awk '{a+=$1; d+=$2} END {print a+d+0}')

if [ "$lines" -gt 500 ]; then
  echo ""
  echo "PR size check failed: $lines lines changed (max 500)."
  echo "Split this branch into smaller pieces before pushing."
  echo ""
  exit 1
elif [ "$lines" -gt 250 ]; then
  echo ""
  echo "PR size warning: $lines lines changed. Consider splitting this branch (recommended max 250)."
  echo ""
fi
