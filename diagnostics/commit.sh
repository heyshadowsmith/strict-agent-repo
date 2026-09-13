#!/usr/bin/env bash

# Pre-commit quality gate. Runs after lint-staged has already auto-fixed staged files.
# Check-only, so what gets checked is what gets committed.
# Skips tests, knip, and secretlint, which run at pre-push. npm audit runs in CI.

set -euo pipefail

echo "Running pre-commit checks..."

# The checks below read the working tree, so unstaged edits or untracked source files
# could hide problems in what is actually committed.
partially_staged=$(comm -12 <(git diff --name-only | sort) <(git diff --cached --name-only | sort))
if [ -n "$partially_staged" ]; then
  echo "These files have both staged and unstaged changes:"
  echo "$partially_staged"
  echo "Stage or stash the remaining changes so the checks see exactly what you commit."
  exit 1
fi

untracked_src=$(git ls-files --others --exclude-standard src)
if [ -n "$untracked_src" ]; then
  echo "Untracked files in src/ can make checks pass locally but fail in CI:"
  echo "$untracked_src"
  echo "Add or remove them before committing."
  exit 1
fi

bash diagnostics/check-suppressions.sh

echo "Checking code formatting..."
npm run format:check

echo "Running TypeScript compiler..."
npm run tsc

echo "Running linters..."
npm run lint
npm run lint:md
