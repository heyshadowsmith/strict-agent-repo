#!/usr/bin/env bash

# Shared helper: decides whether a local branch has already landed in main.
# Handles regular merges, squash merges, and branches GitHub deleted after merging.
# Callers should run `git fetch --prune origin` first.
# Usage: source git-checks/lib-merged.sh && branch_is_merged <branch>

branch_is_merged() {
  local branch="$1"
  local track tip base squashed

  # The upstream branch was deleted on GitHub, which happens on merge.
  track=$(git for-each-ref --format='%(upstream:track)' "refs/heads/$branch")
  if [ "$track" = "[gone]" ]; then
    return 0
  fi

  if ! git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
    return 1
  fi
  tip="origin/$branch"

  # Regular merge commit or fast-forward.
  if git merge-base --is-ancestor "$tip" origin/main 2>/dev/null; then
    return 0
  fi

  # Squash merge: build a throwaway commit holding the branch's whole diff on top of
  # the merge base, then ask git cherry whether main already has an equivalent patch.
  base=$(git merge-base origin/main "$tip" 2>/dev/null) || return 1
  squashed=$(git commit-tree "$tip^{tree}" -p "$base" -m "squash-merge check") || return 1
  case "$(git cherry origin/main "$squashed")" in
    -*) return 0 ;;
  esac
  return 1
}
