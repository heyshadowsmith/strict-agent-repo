#!/usr/bin/env bash

# Blocks commits on main or a detached HEAD, and any push that targets or deletes a remote branch.
# Usage:
#   bash git-checks/protect-main.sh commit
#   bash git-checks/protect-main.sh push   (reads pre-push refs on stdin)

set -euo pipefail

action="${1:-commit}"

if [ "$action" = "commit" ]; then
  branch=$(git branch --show-current)
  if [ -z "$branch" ] || [ "$branch" = "main" ]; then
    echo "Direct commits to main or a detached HEAD are not allowed. Please use a feature branch."
    exit 1
  fi
  exit 0
fi

# pre-push stdin: one "<local ref> <local oid> <remote ref> <remote oid>" line per ref.
while read -r local_ref local_oid remote_ref _remote_oid; do
  [ -n "$local_ref" ] || continue

  if [ "$remote_ref" = "refs/heads/main" ]; then
    echo "Pushing to main is not allowed (from $local_ref). Open a pull request instead."
    exit 1
  fi

  case "$local_oid" in
    *[!0]*) ;;
    *)
      echo "Deleting remote branch '${remote_ref#refs/heads/}' is not allowed from a push."
      exit 1
      ;;
  esac
done
