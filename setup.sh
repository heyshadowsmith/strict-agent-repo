#!/usr/bin/env bash
# Install Astro as a dependency into the existing project.
set -euo pipefail
cd "$(dirname "$0")"

npm install astro
echo "Setup complete. Run 'npx astro dev' to start the dev server."
