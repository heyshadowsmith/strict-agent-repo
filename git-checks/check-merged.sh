#!/usr/bin/env bash

# Blocks pushing a branch that has already landed in main (including squash merges).

set -euo pipefail

branch=$(git branch --show-current)
[ -n "$branch" ] || exit 0

# shellcheck source=git-checks/lib-merged.sh
source "$(dirname "$0")/lib-merged.sh"
git fetch --prune --quiet origin 2>/dev/null || true

if branch_is_merged "$branch"; then
  echo "Branch '$branch' has already landed in main. Push blocked."
  exit 1
fi
