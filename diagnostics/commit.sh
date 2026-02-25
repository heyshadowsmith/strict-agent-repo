#!/usr/bin/env bash

# Pre-commit quality gate. Runs after lint-staged has already auto-fixed staged files.
# Skips tests, knip, secretlint, and audit — those run at pre-push.

set -euo pipefail

echo "Running pre-commit checks..."

echo "Checking code formatting..."
if ! npm run format:check; then
    echo "Formatting issues found. Auto-fixing..."
    npm run format
fi

echo "Running TypeScript compiler..."
npm run tsc

echo "Running linters..."
if ! npm run lint; then
    echo "Lint issues found. Auto-fixing..."
    npm run lint:fix
fi
if ! npm run lint:md; then
    echo "Markdown lint issues found. Auto-fixing..."
    npm run lint:md:fix
fi
