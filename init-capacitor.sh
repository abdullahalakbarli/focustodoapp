#!/bin/bash
# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js 20
nvm use 20

# Verify Node.js version
echo "Using Node.js: $(node --version)"
echo "Using npm: $(npm --version)"

# Initialize Capacitor
npx cap init "$@"
