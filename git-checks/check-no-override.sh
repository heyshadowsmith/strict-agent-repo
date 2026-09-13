#!/usr/bin/env bash

# PreToolUse hook (Bash): blocks git commands that skip hooks, force-push, push to
# main, or delete work, and gh commands that change GitHub protections, settings,
# workflows, secrets, variables, or deploy keys. Fails closed on any setup error.

set -uo pipefail

block() {
  echo "Blocked: $1" >&2
  exit 2
}

command -v jq >/dev/null 2>&1 || block "jq is required for git safety checks"
INPUT=$(cat) || block "could not read hook input"
COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty') || block "could not parse hook input"

# Hook bypasses can appear anywhere, e.g. `HUSKY=0 git commit` or `git -c core.hooksPath=...`.
if printf '%s' "$COMMAND" | grep -qE "HUSKY=[\"']?0|core\.hooksPath|--no-verify"; then
  block "bypassing git hooks is not allowed"
fi

# Check each shell segment on its own so flags from one command don't match another.
SEGMENTS=$(printf '%s\n' "$COMMAND" | awk '{ gsub(/&&|\|\||;|\|/, "\n"); print }')

while IFS= read -r segment; do
  if printf '%s' "$segment" | grep -qE '(^|[[:space:]/(])git([[:space:]]|$)'; then
    printf '%s' "$segment" | grep -qE 'alias\.' \
      && block "defining git aliases is not allowed"

    # Drop git global options (-C <path>, -c <key=value>) so subcommands are easy to match.
    normalized=$(printf '%s' "$segment" | sed -E 's/[[:space:]]-[Cc][[:space:]]+[^[:space:]]+//g')

    printf '%s' "$normalized" | grep -qE '[[:space:]](--force[a-z-]*|-[a-zA-Z]*f[a-zA-Z]*)([[:space:]=]|$)' \
      && block "--force / -f is not allowed with git"

    case "$normalized" in
      *"git push"*)
        printf '%s' "$normalized" | grep -qE '[[:space:]]\+[^[:space:]]' \
          && block "force pushes via +refspec are not allowed"
        printf '%s' "$normalized" | grep -qE '[[:space:]](--mirror|--delete|-d)([[:space:]]|$)|[[:space:]]:[^[:space:]]' \
          && block "deleting or mirroring remote refs is not allowed"
        printf '%s' "$normalized" | grep -qE '[[:space:]:](refs/heads/)?main([[:space:]]|$)' \
          && block "pushing directly to main is not allowed"
        ;;
      *"git commit"*)
        printf '%s' "$normalized" | grep -qE '[[:space:]]-[a-zA-Z]*n[a-zA-Z]*([[:space:]]|$)' \
          && block "git commit -n skips hooks and is not allowed"
        ;;
      *"git branch"*)
        printf '%s' "$normalized" | grep -qE '[[:space:]]-[a-zA-Z]*D[a-zA-Z]*([[:space:]]|$)' \
          && block "force-deleting branches is not allowed"
        ;;
      *"git reset"*)
        printf '%s' "$normalized" | grep -qE '[[:space:]]--hard([[:space:]]|$)' \
          && block "git reset --hard is not allowed"
        ;;
    esac
  fi

  if printf '%s' "$segment" | grep -qE '(^|[[:space:]/(])gh([[:space:]]|$)'; then
    printf '%s' "$segment" | grep -qE 'gh[[:space:]]+pr[[:space:]]+merge.*--admin' \
      && block "merging with --admin bypasses branch rules"
    printf '%s' "$segment" | grep -qE 'gh[[:space:]]+repo[[:space:]]+(edit|delete|rename|archive|unarchive)' \
      && block "changing GitHub repository settings is not allowed"
    printf '%s' "$segment" | grep -qE 'gh[[:space:]]+repo[[:space:]]+deploy-key[[:space:]]+(add|delete)' \
      && block "changing deploy keys is not allowed"
    # Disabling a workflow would switch off CI, the last check before merge.
    printf '%s' "$segment" | grep -qE 'gh[[:space:]]+workflow[[:space:]]+(disable|enable)' \
      && block "enabling or disabling GitHub workflows is not allowed"
    printf '%s' "$segment" | grep -qE 'gh[[:space:]]+(secret|variable)[[:space:]]+(set|delete|remove)' \
      && block "changing repository secrets or variables is not allowed"
    # gh api sends POST when fields are given, so treat field flags as writes too.
    if printf '%s' "$segment" | grep -qE 'gh[[:space:]]+api' \
      && printf '%s' "$segment" | grep -qE '[[:space:]](-X|--method)[[:space:]=]*(POST|PUT|PATCH|DELETE)|[[:space:]](-f|-F|--field|--raw-field|--input)([[:space:]=]|$)'; then
      block "writing to the GitHub API with gh api is not allowed"
    fi
  fi
done <<< "$SEGMENTS"

exit 0
