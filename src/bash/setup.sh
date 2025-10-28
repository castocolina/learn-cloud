#!/bin/bash

set -e

# Function to display messages
echo_step() {
  echo -e "\033[1;34m[STEP]\033[0m $1"
}

echo_step "System Setup Phase"
echo -e "\033[1;33m[CONFIRM]\033[0m Do you want to update system packages and install dependencies (curl, wget, build-essential, zsh, git, shellcheck, chromium-browser, NVM)? This may take several minutes. (y/N): "
read -r setup_system
if [[ $setup_system =~ ^[Yy]$ ]]; then
  echo_step "Updating and upgrading system packages..."
  sudo apt update && sudo apt upgrade -y
  
  echo_step "Installing system dependencies..."
  sudo apt install -y curl wget build-essential zsh git shellcheck chromium-browser jq
  
  echo_step "Installing or updating NVM (Node Version Manager)..."
  if [ -d "$HOME/.nvm" ]; then
    echo_step "NVM already installed. Updating to the latest version..."
    cd "$HOME/.nvm" && git fetch --tags && git checkout \
      $(git describe --abbrev=0 --tags)
  else
    echo_step "Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
  fi
else
  echo_step "Skipping system setup. Checking for existing NVM installation..."
fi

# Ensure NVM is available for the rest of the script
if ! command -v nvm &> /dev/null; then
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"
fi

echo_step "Installing Node.js and npm using NVM..."
nvm install --lts
nvm use --lts
npm install -g pnpm


echo_step "Project Setup Phase"
pnpm dlx sv create .

echo_step "Installing and configuring TailwindCSS..."
pnpm dlx sv add tailwindcss

echo_step "Installing and configuring shadcn-svelte..."
# This will automatically configure path aliases and component structure
pnpm dlx shadcn-svelte@latest init --base-color slate --overwrite

echo_step "Creating modular CSS architecture..."
# Create the modular CSS structure
mkdir -p src/styles

echo_step "Installing additional dependencies..."
pnpm install lucide-svelte shiki mermaid

echo_step "Installing Playwright for E2E testing..."
pnpm add -D @playwright/test
# Install Playwright browsers (chromium, firefox, webkit)
pnpm exec playwright install --with-deps chromium

echo_step "Configuring Prettier for double quotes..."
# Check if jq is available
if ! command -v jq &> /dev/null; then
  echo -e "\033[1;33m[WARNING]\033[0m jq not found. Installing jq for JSON manipulation..."
  if command -v apt &> /dev/null; then
    sudo apt install -y jq
  elif command -v brew &> /dev/null; then
    brew install jq
  else
    echo -e "\033[1;31m[ERROR]\033[0m Cannot install jq automatically. Please install jq manually and re-run the script."
    exit 1
  fi
fi

# Update Prettier configuration to use double quotes (preserving existing config)
if [ -f ".prettierrc" ]; then
  echo_step "Updating existing .prettierrc to use double quotes..."
  # Update existing prettierrc using jq, preserving all other settings
  jq '. + {"singleQuote": false}' .prettierrc > .prettierrc.tmp && mv .prettierrc.tmp .prettierrc
else
  echo_step "Creating new .prettierrc with double quotes..."
  # Create minimal prettierrc if it doesn't exist
  cat > .prettierrc << 'EOF'
{
  "singleQuote": false,
  "useTabs": true,
  "trailingComma": "none",
  "printWidth": 100
}
EOF
fi

echo_step "Configuring ignore patterns for src/book..."
# Add to .prettierignore if not already present
grep -qxF "src/book/" .prettierignore 2>/dev/null || echo "src/book/" >> .prettierignore

echo_step "Verification Phase"
echo_step "Verifying TypeScript configuration..."
pnpm run check

echo_step "Running linting..."
pnpm run lint

echo_step "Formatting code with Prettier..."
pnpm run format

echo_step "Testing development server..."
echo -e "\033[1;33m[INFO]\033[0m Starting development server for verification..."
# Start dev server in background and get its PID
pnpm run dev &
DEV_PID=$!

# Wait a moment for server to start
sleep 5

# Kill the development server
echo_step "Stopping development server..."
kill $DEV_PID 2>/dev/null || true
# Wait for process to terminate
wait $DEV_PID 2>/dev/null || true

echo -e "\033[1;32m[COMPLETE]\033[0m Environment setup complete!"

