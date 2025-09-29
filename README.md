# 📚 Mastering Cloud-Native Technologies

[![SvelteKit Validation](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/validation.yml?branch=master&label=SvelteKit%20Validation)](https://github.com/castocolina/learn-cloud/actions/workflows/validation.yml)
[![Deployment](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/deploy.yml?branch=master&label=Deployment)](https://github.com/castocolina/learn-cloud/actions/workflows/deploy.yml)

> A comprehensive learning platform for cloud-native development built with modern SvelteKit architecture

## 🚀 Project Overview

This interactive learning platform provides in-depth coverage of cloud-native technologies, from Python and Go backend development to DevOps, security, and serverless architectures. Built with modern web technologies and a class-based CLI architecture for optimal development experience.

🌐 **Live Site:** [https://castocolina.github.io/learn-cloud/](https://castocolina.github.io/learn-cloud/)

## 🛠️ Technology Stack

### Frontend

- **Framework**: SvelteKit 5 with static site generation
- **Styling**: Tailwind CSS 4 with typography plugin
- **UI Components**: shadcn-svelte component library
- **Icons**: lucide-svelte icon system
- **Search**: Lunr.js full-text search with custom indexing

### Backend & CLI Tools

- **CLI Architecture**: Class-based with Commander.js integration
- **Type System**: Centralized TypeScript types with Zod validation
- **Schema Generation**: Automated JSON schema generation for external integrations
- **Content Management**: Core API (ValidationService + RepositoryService)
- **Testing**: Vitest with comprehensive test coverage

### Development & Deployment

- **Package Manager**: pnpm for efficient dependency management
- **Deployment**: GitHub Pages with automated CI/CD
- **Validation**: Multi-tier validation strategy (96% fast tests, 4% full validation)
- **Quality Assurance**: ESLint, Prettier, and comprehensive testing

## 📖 Content Structure

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
- **Full-text Search**: Lunr.js powered search across all content

For detailed content breakdown, see [CONTENT.md](CONTENT.md).

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ (LTS recommended via `nvm install --lts`)
- pnpm package manager (`npm install -g pnpm`)

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

#### Core Development

```bash
make setup          # Initial environment setup
make run             # Start development server (pnpm run dev)
make build           # Build for production
make preview         # Preview production build
make check           # Type checking and validation
make lint            # Code linting
make format          # Code formatting
make test            # Run tests
make clean           # Clean build artifacts
```

#### Content Management

```bash
# Content creation and scaffolding
pnpm run content-creator scaffold --unit=1 --type=lesson --dry-run
pnpm run content-creator create --file=content.json
pnpm run content-creator list --unit=1

# Search index generation
pnpm run search-indexer dev      # Fast development index
pnpm run search-indexer prod     # Production index with validation

# Content scaffolding
pnpm run scaffold-content generate --unit=1 --type=lesson --id=01_01
pnpm run scaffold-content list-units

# Schema generation
pnpm run generate-schemas generate
pnpm run generate-schemas list
```

#### Validation & Quality

```bash
make validate        # Validate scripts and content
make check-wip       # Fast validation (modified files only)
pnpm run workflow:full-validation  # Complete validation suite
```

## 🏗️ Architecture Overview

### Class-based CLI Architecture

The platform uses a modern class-based CLI architecture with Commander.js:

```typescript
// Example CLI structure
export class ContentCreatorCLI {
	private program: Command;
	private generator: ContentScaffoldingGenerator;

	constructor() {
		this.setupCommands();
	}

	async execute(argv?: string[]): Promise<void> {
		await this.program.parseAsync(argv || process.argv);
	}
}
```

### Core API Integration

All operations flow through shared services:

```typescript
// Core services
import { ValidationService } from "./lib/services/ValidationService.js";
import { RepositoryService } from "./lib/services/RepositoryService.js";

// Centralized type system
import type { ScaffoldingArgs, CliExecutionResult } from "$types";
```

### JSON Schema Generation

Automated schema generation for external integrations:

```bash
# Generate schemas from TypeScript types
pnpm run generate-schemas generate

# Schemas available in ./schemas/
# - ScaffoldingArgs.json
# - ValidationConfig.json
# - ContentGenerationResult.json
# - And more...
```

## 📁 Project Structure

```
├── src/
│   ├── data/              # Content data (TypeScript format)
│   │   ├── book/          # Unit-specific content files
│   │   └── generated/     # Auto-generated files (content-menu, search-index)
│   ├── lib/               # Shared utilities and components
│   │   ├── components/    # Reusable Svelte components
│   │   ├── services/      # Core API services
│   │   ├── types/         # Centralized TypeScript types
│   │   └── utils/         # Utility functions
│   ├── routes/            # SvelteKit routes
│   ├── scripts/           # CLI tools and utilities
│   └── test/              # Test suites
├── schemas/               # Generated JSON schemas
├── static/                # Static assets
├── .github/workflows/     # CI/CD configuration
└── docs/                  # Project documentation
```

## 🛡️ Testing Strategy

### Three-Tier Validation Approach

1. **Tier 1 (Fast - ~5-15s)**: `make check-wip` - validates only modified files
2. **Tier 2 (Moderate - ~30-45s)**: `pnpm run format` + `pnpm run lint` - complete formatting and linting
3. **Tier 3 (Comprehensive - ~1-3m)**: `pnpm run test` + `pnpm run check` - full test suite and TypeScript validation

### Performance Optimized Testing

- **96% Fast Tests**: Use TestSetup with validation disabled
- **4% Integration Tests**: Use TestSetupWithValidation for full validation
- **Isolated Tests**: Each test uses unique temporary directories
- **Mocked Dependencies**: External services and file operations mocked

## 📚 Documentation

### Core Documentation

- [CLI Architecture Guide](./CLI-ARCHITECTURE.md) - Class-based CLI patterns and usage
- [Content Creator CLI Guide](./CONTENT-CREATOR-CLI-GUIDE.md) - Unified content management
- [JSON Schemas Documentation](./schemas/README.md) - Schema generation and usage

### Development Guides

- [SvelteKit Development Guide](./SVELTEKIT-GUIDE.md) - Frontend development standards
- [Content Standards](./CONTENT-STANDARDS.md) - Content creation workflows
- [Mermaid Standards](./MERMAID-STANDARDS.md) - Diagram rendering requirements

### Agent Guidelines

- [Claude Instructions](./CLAUDE.md) - AI assistant guidelines and project rules
- [Gemini Instructions](./GEMINI.md) - Alternative AI assistant guidelines

## 🔧 CLI Tools Reference

### Content Creator CLI

```bash
# Unified content creation and management
pnpm run content-creator scaffold [options]  # Generate templates
pnpm run content-creator create [options]    # Create real content
pnpm run content-creator update [options]    # Update existing content
pnpm run content-creator validate [options]  # Validate content
pnpm run content-creator list [options]      # List content
pnpm run content-creator delete [options]    # Delete content safely
```

### Search Index CLI

```bash
# Search index generation and management
pnpm run search-indexer generate [options]   # Generate index
pnpm run search-indexer dev                  # Development mode
pnpm run search-indexer prod                 # Production mode
pnpm run search-indexer validate [options]   # Validate index
pnpm run search-indexer info                 # Show configuration
```

### Schema Generation CLI

```bash
# JSON schema generation for external integrations
pnpm run generate-schemas generate [options] # Generate schemas
pnpm run generate-schemas list               # List available schemas
pnpm run generate-schemas validate [options] # Validate schema
```

## 🚀 Development Workflows

### Content Development

1. Generate scaffolding: `pnpm run content-creator scaffold --unit=1 --type=lesson`
2. Create real content: `pnpm run content-creator create --file=content.json`
3. Validate content: `pnpm run content-creator validate --unit=1`
4. Update search index: `pnpm run search-indexer dev`

### Frontend Development

1. Start dev server: `make run`
2. Make changes to components/routes
3. Run fast validation: `make check-wip`
4. Full validation before commit: `pnpm run workflow:full-validation`

### Schema Updates

1. Modify TypeScript types in `src/lib/types/`
2. Generate updated schemas: `pnpm run generate-schemas generate`
3. Update documentation if needed
4. Validate changes: `pnpm run test`

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow code standards**: Run `make lint` and `make format`
4. **Add tests**: Ensure test coverage for new features
5. **Validate thoroughly**: Run `pnpm run workflow:full-validation`
6. **Commit changes**: Follow conventional commit standards
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Quality Standards

- Zero TypeScript errors or warnings
- 100% test coverage for new features
- Follow class-based architecture patterns
- Use centralized type system (`$types`)
- All CLI tools must use Commander.js
- Mobile-first responsive design

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Platform](https://castocolina.github.io/learn-cloud/)
- [GitHub Repository](https://github.com/castocolina/learn-cloud)
- [Issues](https://github.com/castocolina/learn-cloud/issues)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

**Built with ❤️ using SvelteKit, TypeScript, and modern web technologies**
