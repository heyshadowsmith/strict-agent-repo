#!/usr/bin/env bash

# Fails when a config or agent-instruction file exists anywhere other than its allowed path.
# ESLint, Prettier, markdownlint, lint-staged, and Claude Code use the nearest such file,
# so a copy in a subfolder would quietly override the protected one at the root.
# Checks tracked files and untracked files that aren't gitignored.

set -euo pipefail

echo "Checking for unexpected config files..."

allowed=(
  .markdownlint-cli2.jsonc
  .markdownlint.json
  .prettierignore
  .prettierrc
  .secretlintrc.json
  CLAUDE.md
  commitlint.config.ts
  eslint.config.ts
  knip.json
  package.json
  tsconfig.json
  vitest.config.ts
)

is_allowed() {
  local candidate
  for candidate in "${allowed[@]}"; do
    [ "$1" = "$candidate" ] && return 0
  done
  return 1
}

watched() {
  case "${1##*/}" in
    eslint.config.* | .eslintrc* | .prettierrc* | prettier.config.* | .prettierignore | .editorconfig) return 0 ;;
    .markdownlint* | tsconfig*.json | jsconfig*.json | vite.config.* | vitest.config.* | vitest.workspace.*) return 0 ;;
    knip.* | .knip.* | commitlint.config.* | .commitlintrc* | .lintstagedrc* | lint-staged.config.*) return 0 ;;
    .secretlintrc* | .secretlintignore | .gitattributes | .npmrc | package.json | CLAUDE.md | CLAUDE.local.md) return 0 ;;
  esac
  case "$1" in
    .config/* | */.config/* | */.claude/*) return 0 ;;
  esac
  return 1
}

found=()
while IFS= read -r -d '' path; do
  if watched "$path" && ! is_allowed "$path"; then
    found+=("$path")
  fi
done < <(git ls-files --cached --others --exclude-standard -z)

if [ "${#found[@]}" -gt 0 ]; then
  echo "Config or instruction files found outside their allowed paths:"
  printf '  %s\n' "${found[@]}"
  echo "Remove them. A new config file needs the repo owner to add it to this check."
  exit 1
fi
