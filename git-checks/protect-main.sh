#!/usr/bin/env bash

# Blocks direct commits and pushes to main.
# Usage: bash git-checks/protect-main.sh <action>
# <action> is "commit" or "push" and is used in the error message.

set -euo pipefail

action="${1:-commit}"
branch=$(git branch --show-current)

if [ "$branch" = "main" ]; then
  echo "Direct ${action}s to main are not allowed. Please use a feature branch."
  exit 1
fi
