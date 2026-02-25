#!/usr/bin/env bash

# Pre-commit quality gate. Runs after lint-staged has already auto-fixed staged files.
# Skips tests, knip, secretlint, and audit — those run at pre-push.

set -euo pipefail

echo "Running pre-commit checks..."

echo "Checking code formatting..."
npm run format:check

echo "Running TypeScript compiler..."
npm run tsc

echo "Running linters..."
npm run lint
