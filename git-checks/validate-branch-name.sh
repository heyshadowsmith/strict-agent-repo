#!/usr/bin/env bash

# Validates that the current branch follows the naming convention:
# <type>/<description> where type is one of the conventional commit types
# and description is lowercase alphanumeric with hyphens.

set -euo pipefail

branch=$(git branch --show-current)

if ! echo "$branch" | grep -qE '^(feat|fix|chore|docs|refactor|test|perf|ci|build|revert)/[a-z0-9-]+$'; then
  echo "Branch '$branch' does not follow naming convention."
  echo "Format: <type>/<description> (e.g. feat/add-auth, fix/null-check)"
  echo "Types: feat, fix, chore, docs, refactor, test, perf, ci, build, revert"
  exit 1
fi
