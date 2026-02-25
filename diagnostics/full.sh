#!/usr/bin/env bash

# The core principle: order by ascending cost and fail as early as possible so you don't wait for an expensive test run to discover a trivial formatting error.

set -euo pipefail

echo "Running diagnostics..."

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

echo "Checking for dead code..."
npm run knip

echo "Checking for secrets..."
npx secretlint "**/*"

echo "Checking for vulnerabilities..."
npm audit --audit-level=moderate

echo "Running tests with coverage..."
npm run test -- --coverage
