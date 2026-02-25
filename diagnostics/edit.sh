#!/usr/bin/env bash

# Fast type check run after every file edit.
# Used by Claude's PostToolUse hook to give immediate feedback on type errors.

set -euo pipefail

echo "Running type check..."
npm run tsc
