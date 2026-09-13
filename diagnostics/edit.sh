#!/usr/bin/env bash

# Fast type check run after every file edit.
# Used by Claude's PostToolUse hook to give immediate feedback on type errors.
# Claude only sees a hook's stderr, and only exit code 2 blocks, so send tsc's
# output to stderr and exit 2 when it fails.

set -euo pipefail

echo "Running type check..."
if ! npm run --silent tsc 1>&2; then
  exit 2
fi
