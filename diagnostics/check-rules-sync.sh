#!/usr/bin/env bash

# Fails when the protected-path list in .claude/rules/config-integrity.md and the Edit deny
# rules in .claude/settings.json don't match, so the agent's instructions always describe
# exactly what the permissions enforce. A leading **/ in settings counts as the same path,
# since it only extends that rule to subfolders.

set -euo pipefail
export LC_ALL=C

echo "Checking that the rules match the permissions..."

rules_file=".claude/rules/config-integrity.md"
settings_file=".claude/settings.json"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required for the rules sync check."
  exit 1
fi

rules_paths=$(sed -n '/<!-- protected-paths:start -->/,/<!-- protected-paths:end -->/p' "$rules_file" \
  | grep -oE '`[^`]+`' | tr -d '`' | sort -u || true)
settings_paths=$(jq -r '.permissions.deny[] | select(startswith("Edit(")) | ltrimstr("Edit(") | rtrimstr(")") | ltrimstr("**/")' "$settings_file" \
  | sort -u)

if [ -z "$rules_paths" ]; then
  echo "No protected paths found between the protected-paths markers in $rules_file."
  exit 1
fi

only_settings=$(comm -13 <(printf '%s\n' "$rules_paths") <(printf '%s\n' "$settings_paths"))
only_rules=$(comm -23 <(printf '%s\n' "$rules_paths") <(printf '%s\n' "$settings_paths"))

if [ -n "$only_settings" ] || [ -n "$only_rules" ]; then
  if [ -n "$only_settings" ]; then
    printf 'Protected in %s but missing from %s:\n%s\n' "$settings_file" "$rules_file" "$only_settings"
  fi
  if [ -n "$only_rules" ]; then
    printf 'Listed in %s but not protected in %s:\n%s\n' "$rules_file" "$settings_file" "$only_rules"
  fi
  exit 1
fi
