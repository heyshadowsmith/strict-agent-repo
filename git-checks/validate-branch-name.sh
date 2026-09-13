#!/usr/bin/env bash

# Validates branch names against <type>/<description>.
# Usage:
#   bash git-checks/validate-branch-name.sh        (checks the current branch)
#   bash git-checks/validate-branch-name.sh push   (checks every pushed branch from pre-push stdin)

set -euo pipefail

pattern='^(feat|fix|chore|docs|refactor|test|perf|ci|build|revert)/[a-z0-9-]+$'

fail() {
  echo "Branch '$1' does not follow naming convention."
  echo "Format: <type>/<description> (e.g. feat/add-auth, fix/null-check)"
  echo "Types: feat, fix, chore, docs, refactor, test, perf, ci, build, revert"
  exit 1
}

if [ "${1:-}" != "push" ]; then
  branch=$(git branch --show-current)
  echo "$branch" | grep -qE "$pattern" || fail "$branch"
  exit 0
fi

while read -r local_ref _local_oid remote_ref _remote_oid; do
  [ -n "$local_ref" ] || continue
  case "$remote_ref" in
    refs/heads/*) name="${remote_ref#refs/heads/}" ;;
    *) continue ;;
  esac
  echo "$name" | grep -qE "$pattern" || fail "$name"
done
