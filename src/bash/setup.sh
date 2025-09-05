#!/bin/bash

set -e

# Function to display messages
echo_step() {
  echo -e "\033[1;34m[STEP]\033[0m $1"
}

echo_step "Updating and upgrading system packages..."
sudo apt update && sudo apt upgrade -y

echo_step "Installing system dependencies..."
sudo apt install -y curl wget build-essential zsh git python3 python3-venv python3-pip shellcheck chromium-browser

echo_step "Installing or updating NVM (Node Version Manager)..."
if [ -d "$HOME/.nvm" ]; then
  echo_step "NVM already installed. Updating to the latest version..."
  cd "$HOME/.nvm" && git fetch --tags && git checkout \
    $(git describe --abbrev=0 --tags)
else
  echo_step "Installing NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \ . "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \ . "$NVM_DIR/bash_completion"

echo_step "Installing Node.js and npm using NVM..."
nvm install --lts
nvm use --lts

echo_step "Installing global npm packages..."
npm install -g http-server

echo_step "Installing Node.js dependencies..."
npm install

echo_step "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip

echo_step "Installing Puppeteer dependencies..."
sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libx11-xcb1 libxcomposite1 libxrandr2 libxdamage1 libgbm1 libasound2

echo -e "\033[1;32m[COMPLETE]\033[0m Environment setup complete!"
