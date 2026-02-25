#!/usr/bin/env bash

# The core principle: order by ascending cost and fail as early as possible so you don't wait for an expensive test run to discover a trivial formatting error.

set -euo pipefail

echo "Running diagnostics..."

echo "Checking code formatting..."
npm run format:check

echo "Running TypeScript compiler..."
npm run tsc

echo "Running linters..."
npm run lint
npm run lint:md

echo "Checking for dead code..."
npm run knip

echo "Checking for secrets..."
npx secretlint "**/*"

echo "Checking for vulnerabilities..."
npm audit --audit-level=moderate

echo "Running tests with coverage..."
npm run test -- --coverage
