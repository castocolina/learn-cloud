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
  sudo apt install -y curl wget build-essential zsh git shellcheck chromium-browser
  
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

echo_step "Installing Node.js dependencies..."

pnpm dlx sv add tailwindcss
pnpm dlx shadcn-svelte@latest init
pnpm install lucide-svelte
pnpm dlx shadcn-svelte@latest add sidebar-05

echo -e "\033[1;32m[COMPLETE]\033[0m Environment setup complete!"

