#!/usr/bin/env bash

# Blocks pushing with uncommitted or untracked changes, so pre-push diagnostics
# check exactly the commits being pushed.

set -euo pipefail

if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted or untracked changes found. Commit or stash them before pushing,"
  echo "so the pre-push diagnostics check exactly what you push:"
  git status --short
  exit 1
fi
