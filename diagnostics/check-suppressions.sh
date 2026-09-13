#!/usr/bin/env bash

# Fails when tracked files contain comments or calls that switch a check off:
# coverage ignores, formatter and Markdown lint ignores, TypeScript error
# suppressions, and skipped tests or scenarios. ESLint already ignores inline
# config comments; they're listed too so the failure says why.

set -euo pipefail

echo "Checking for suppressions..."

# The rules files describe these patterns, so they're allowed to mention them.
set +e
matches=$(git grep -n -I -E \
  -e 'eslint-(disable|enable)' \
  -e '(v8|c8|istanbul) ignore' \
  -e 'prettier-ignore' \
  -e 'markdownlint-(disable|capture|configure-file)' \
  -e 'secretlint-disable' \
  -e '@ts-(ignore|expect-error|nocheck)' \
  -e '\.skip(If)?([^A-Za-z]|$)' \
  -e '(it|test|describe|suite|bench)\.(todo|runIf)([^A-Za-z]|$)' \
  -e '^[[:space:]]*@(skip|ignore)([^A-Za-z]|$)' \
  -- . ':!.claude/rules/' ':!diagnostics/check-suppressions.sh' ':!package-lock.json')
status=$?
set -e

if [ "$status" -eq 0 ]; then
  echo "Suppressions found. Remove them; exceptions need the repo owner to change this check:"
  echo "$matches"
  exit 1
fi

# git grep exits 1 when nothing matches; anything higher means the search itself failed.
if [ "$status" -ne 1 ]; then
  echo "The suppression check could not run (git grep exit $status)."
  exit 1
fi
