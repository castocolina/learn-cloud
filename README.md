# Learn Cloud-Native Book

This repository contains the content for a comprehensive book on learning and mastering cloud-native technologies. The book aims to guide experienced programmers through the cloud-native stack, bridging their existing knowledge with new concepts, tools, and best practices.

🌐 **Live Site:** [https://castocolina.github.io/learn-cloud/index.html](https://castocolina.github.io/learn-cloud/index.html)

## Status

[![HTML Link Check](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/validation.yml?branch=master&label=HTML%20Link%20Check)](https://github.com/castocolina/learn-cloud/actions/workflows/validation.yml)
[![Mermaid Diagram Check](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/validation.yml?branch=master&label=Mermaid%20Diagram%20Check)](https://github.com/castocolina/learn-cloud/actions/workflows/validation.yml)
[![Deployment](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/deploy.yml?branch=master&label=Deployment)](https://github.com/castocolina/learn-cloud/actions/workflows/deploy.yml)

## 📚 Book Structure

The book is organized into comprehensive units covering the complete cloud-native technology stack:

- **Unit 1:** Python for Cloud-Native Backend Development
- **Unit 2:** Go for Cloud-Native Backend Development  
- **Unit 3:** DevOps, IaC, and CI/CD
- **Unit 4:** Secrets and Configuration Management
- **Unit 5:** DevSecOps
- **Unit 6:** Automation
- **Unit 7:** The Serverless Ecosystem on AWS
- **Unit 8:** Systems Integration and Security
- **Unit 9:** Capstone Projects

For detailed content breakdown, see [CONTENT.md](CONTENT.md).

## 🚀 Getting Started

### Quick Setup with Automated Script

For a complete development environment setup (system dependencies, NVM, Node.js, and Svelte):

```bash
chmod +x src/bash/setup.sh
./src/bash/setup.sh
```

This automated script will:
- Update system packages (with confirmation)
- Install development dependencies (curl, wget, build-essential, zsh, git, shellcheck, chromium-browser)
- Install/update Node Version Manager (NVM)
- Set up Node.js LTS and pnpm
- Initialize Svelte project with Tailwind CSS and Flowbite
- Start the development server

### Manual Setup

If you prefer manual setup or already have some dependencies installed:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/castocolina/learn-cloud.git
   cd learn-cloud
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Serve the content locally:**
   ```bash
   make serve
   # or for Svelte development
   npm run dev
   # or with auto-open
   npm run dev -- --open
   ```

### Svelte Development

This project also includes Svelte components powered by [`sv`](https://github.com/sveltejs/cli):

```bash
# Start Svelte development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
