# SvelteKit Developer Guide

> **Comprehensive technical documentation for the Cloud-Native Learning Platform SvelteKit project**

This guide provides developers with everything needed to understand, set up, and extend the SvelteKit-based educational platform. The document is structured into two main sections: a comprehensive developer guide and a detailed demo implementation plan.

---

## Table of Contents

1. [SvelteKit Developer Guide](#sveltekit-developer-guide)
   - [Installation & Setup](#installation--setup)
   - [Project Architecture](#project-architecture)
   - [Component Development](#component-development)
   - [Theming & Styling](#theming--styling)
   - [Component Libraries](#component-libraries)
2. [Demo Implementation Plan](#demo-implementation-plan)
   - [Incremental Build Strategy](#incremental-build-strategy)
   - [AF02 Agent Prompts](#af02-agent-prompts)

---

## SvelteKit Developer Guide

### Installation & Setup

#### Prerequisites

- **Node.js**: Version 18.0+ with LTS recommended
- **Package Manager**: pnpm (required by this project)
- **System Dependencies**: curl, wget, build-essential, git, shellcheck, chromium-browser

#### Automated Setup Process

The project includes a setup script at `src/bash/setup.sh` that provides basic environment configuration. However, **several improvements are recommended** for production use:

**Current Script Analysis:**

```bash
# From project root
bash src/bash/setup.sh
```

**What the current script does:**

1. **System Setup Phase** (optional):
   - Updates system packages (`sudo apt update && sudo apt upgrade -y`)
   - Installs system dependencies: curl, wget, build-essential, zsh, git, shellcheck, chromium-browser
   - Installs/updates NVM (Node Version Manager) v0.39.5

2. **Node.js Environment**:
   - Installs latest LTS Node.js via NVM
   - Installs pnpm globally for package management
   - Ensures proper environment variables are set

3. **Project Initialization**:
   - Creates SvelteKit project using `pnpm dlx sv create .`
   - Adds Tailwind CSS v4 via `pnpm dlx sv add tailwindcss`
   - Installs core dependencies:
     - `lucide-svelte` for icons
     - `shiki` for syntax highlighting
     - `mermaid` for diagram rendering

#### Recommended Setup Script Improvements

**Critical Issues Identified:**

1. **OS Dependency**: Only works on Ubuntu/Debian (apt-based systems)
2. **Hardcoded Versions**: NVM version is fixed at v0.39.5
3. **Missing Validations**: No pre-requisite checks or post-installation validation
4. **Error Handling**: Limited error recovery and rollback options
5. **Unnecessary Dependencies**: chromium-browser may not be required
6. **Existing Project**: No check if SvelteKit project already exists

**Improved Setup Script Structure:**

```bash
#!/bin/bash
set -e

# Key improvements for production use:

# 1. Cross-platform OS detection
detect_os() {
  case "$OSTYPE" in
    linux-gnu*) PACKAGE_MANAGER="apt" ;;
    darwin*)    PACKAGE_MANAGER="brew" ;;
    *)          echo "Unsupported OS: $OSTYPE"; exit 1 ;;
  esac
}

# 2. Dynamic NVM version detection
get_latest_nvm_version() {
  curl -s https://api.github.com/repos/nvm-sh/nvm/releases/latest |
  grep -oP '"tag_name": "\K(.*)(?=")'
}

# 3. Enhanced validation and error handling
validate_setup() {
  [[ -f "svelte.config.js" ]] && echo "SvelteKit project exists" && exit 0
  command -v node >/dev/null || echo "Node.js required" && exit 1
  command -v pnpm >/dev/null || npm install -g pnpm


# Complete improved setup script available in project repository
# Focus: Cross-platform support, validation, error handling
```

#### Post-Installation Configuration

After running the setup script, complete the configuration:

**Step 1: Verify Installation**

```bash
# Check SvelteKit is working
pnpm run dev

# Verify TypeScript configuration
pnpm run check

# Run linting
pnpm run lint
```

**Step 2: Environment Configuration**

Create or verify your `.env` file contains necessary configuration:

```bash
# Development configuration
VITE_ENV=development
```

**Step 3: Validate Build Process**

```bash
# Test production build
pnpm run build

# Preview production build
pnpm run preview
```
