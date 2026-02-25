#!/usr/bin/env bash

# PreToolUse hook (Bash): blocks git commands that bypass hooks or force-push.

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -qE "git.*(--no-verify|--force)"; then
  echo "Blocked: bypassing git hooks is not allowed" >&2
  exit 2
fi
