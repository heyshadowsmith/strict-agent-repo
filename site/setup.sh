#!/usr/bin/env bash
# Initialize the Astro project: creates package.json and installs dependencies.
set -euo pipefail
cd "$(dirname "$0")"

cat > package.json << 'EOF'
{
  "name": "astro-tool-access-docs",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.7.10"
  }
}
EOF

npm install
echo "Setup complete. Run 'npm run dev' to start the dev server."
