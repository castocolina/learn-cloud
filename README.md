# 📚 Mastering Cloud-[![SvelteKit Validation](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/validation.yml?branch=master&label=SvelteKit%20Validation)](https://github.com/castocolina/learn-cloud/actions/workflows/validation.yml)
[![Deployment](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/deploy.yml?branch=master&label=Deployment)](https://github.com/castocolina/learn-cloud/actions/workflows/deploy.yml)

## 📖 Content Structureve Technologies

> A comprehensive learning platform for cloud-native development built with SvelteKit

## 🚀 Project Overview

This interactive learning platform provides in-depth coverage of cloud-native technologies, from Python and Go backend development to DevOps, security, and serverless architectures. Built with modern web technologies for an optimal learning experience.

🌐 **Live Site:** [https://castocolina.github.io/learn-cloud/](https://castocolina.github.io/learn-cloud/)

## 🛠️ Technology Stack

- **Framework**: SvelteKit with static site generation
- **Styling**: Tailwind CSS with typography plugin
- **UI Components**: shadcn-svelte component library
- **Icons**: lucide-svelte icon system
- **Deployment**: GitHub Pages with automated CI/CD
- **Package Manager**: pnpm for efficient dependency management

## Status

[![SvelteKit Validation](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/validation.yml?branch=master&label=SvelteKit%20Validation)](https://github.com/castocolina/learn-cloud/actions/workflows/validation.yml)
[![Deployment](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/deploy.yml?branch=master&label=Deployment)](https://github.com/castocolina/learn-cloud/actions/workflows/deploy.yml)

## � Content Structure

The curriculum consists of 9 comprehensive units covering:

1. **Python for Cloud-Native Backend Development**
2. **Go for Cloud-Native Backend Development** 
3. **DevOps, IaC, and CI/CD**
4. **Secrets and Configuration Management**
5. **DevSecOps**
6. **Automation**
7. **The Serverless Ecosystem on AWS**
8. **Systems Integration and Security**
9. **Capstone Projects**

### Learning Features

- **Interactive Lessons**: Structured content with hands-on examples
- **Study Guides**: Flashcard-based review system (6+ cards per lesson)
- **Quizzes**: Randomized questions from larger pools (display 5, store 8+)
- **Exams**: Comprehensive assessments (display 20, store 30+)
- **Progress Tracking**: Monitor learning progress across units

For detailed content breakdown, see [CONTENT.md](CONTENT.md).

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (LTS installed via `nvm install --lts`)
- pnpm package manager

### Development Setup

```bash
# Clone the repository
git clone https://github.com/castocolina/learn-cloud.git
cd learn-cloud

# Install dependencies
make install

# Start development server
make run
```

The application will be available at `http://localhost:5173`

### Available Commands

```bash
make setup          # Initial environment setup
make run             # Start development server  
make build           # Build for production
make preview         # Preview production build
make check           # Type checking and validation
make lint            # Code linting
make format          # Code formatting
make test            # Run tests
make validate        # Validate scripts and content
make clean           # Clean build artifacts
```

## 📁 Project Structure

```
├── src/
│   ├── data/              # Content data (JSON format)
│   │   ├── unit1/         # Unit-specific content
│   │   ├── unit2/         # ...
│   │   └── content-menu.json
│   ├── lib/               # Shared utilities and components
│   ├── routes/            # SvelteKit routes
│   └── app.html           # HTML template
├── src/book/              # Legacy HTML content (to be removed)
├── static/                # Static assets
├── .github/workflows/     # CI/CD configuration
└── docs/                  # Project documentation
```

## 📚 Content Management

### Content Format

All educational content is stored as structured JSON files in `src/data/`:

- **Lessons**: Sectioned content with headings and rich text
- **Study Guides**: Flashcard collections for review
- **Quizzes**: Question pools with explanations
- **Exams**: Comprehensive assessment questions
- **Overviews**: Unit introductions and learning objectives

### Content Standards

- Titles must match `content-menu.json` exactly
- Minimum 6 flashcards per study guide
- Quiz pools: 1.5x display questions (show 5, store 8+)
- Exam pools: 1.5x display questions (show 20, store 30+)
- Production-ready code examples
- Security-first approach

## 🧪 Development Guidelines

### Component Development

1. **Priority**: Use shadcn-svelte components first
   ```bash
   pnpm dlx shadcn-svelte@latest add [component-name]
   ```

2. **Custom Components**: Only when shadcn-svelte doesn't provide functionality

3. **Styling**: Tailwind CSS with mobile-first approach

### Content Integration

- Dynamic JSON imports for content loading
- Type-safe content interfaces
- Error handling for missing content
- Consistent metadata structure

## 🚀 Deployment

The project automatically deploys to GitHub Pages via GitHub Actions:

1. Push to main branch triggers CI/CD
2. Validation checks (lint, type-check, tests)
3. SvelteKit static build generation
4. Deployment to GitHub Pages

## 📖 Documentation

- **[TECHNICAL-SPECS.md](TECHNICAL-SPECS.md)**: Technical architecture details
- **[CONTENT-STANDARDS.md](CONTENT-STANDARDS.md)**: Content creation guidelines
- **[AGENTS.md](AGENTS.md)**: AI agent development guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow coding standards and content guidelines
4. Run validation checks: `make validate`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions or support:
- Open an issue on GitHub
- Check the documentation in the `docs/` directory
- Review the technical specifications
