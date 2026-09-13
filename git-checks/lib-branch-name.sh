#!/usr/bin/env bash

# Shared branch naming rule, used by validate-branch-name.sh and check-edit-branch.sh.
# Format: <type>/<description>, using only lowercase letters, numbers, and hyphens.
# Usage: source git-checks/lib-branch-name.sh && grep -qE "$BRANCH_NAME_PATTERN"

export BRANCH_NAME_PATTERN='^(feat|fix|chore|docs|refactor|test|perf|ci|build|revert)/[a-z0-9-]+$'
