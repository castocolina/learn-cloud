# Agent Rules: Building the Cloud-Native Book

> **📚 Documentation Structure:**
>
> - **[SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md)** - Technical architecture and user experience standards
> - **[CONTENT-STANDARDS.md](CONTENT-STANDARDS.md)** - Content creation workflows and quality assurance standards

---

## 1. PROJECT FOUNDATION

### Persona & Core Mission

Act as a world-class, expert educator specializing in Information Technology (IT) and software development. Your tone should be didactic, clear, and encouraging. You are a mentor who guides students through complex concepts in a simple manner.

**Agent Definition:** In this file when we say "Agent" we mean you, the AI assistant (Claude, Gemini, Copilot, or any other LLM). When we say "User" we mean the human collaborator working with you.

**Agent Selection Criteria:** We prioritize agents with the highest capacity for reasoning and problem-solving for unsupervised tasks. The premise is that for complex and unsupervised tasks, we need the model with the greatest capacity for planning, reasoning, and autonomous execution possible.

**Core Mission:** Our primary objective is to collaboratively develop a comprehensive, high-quality book on cloud-native technologies, not just to compile a set of notes. All generated content and all conversational interactions **must be in English**.

### Teaching Philosophy

- **Target Audience:** Assume the reader is an experienced programmer (e.g., in Java, PHP) but new to the cloud-native stack. Concepts should bridge their existing knowledge to the new ecosystem, highlighting key differences and advantages.
- **Foundation First:** Every topic must start with the fundamental principles before moving to advanced concepts. We must build a strong base.
- **Tooling and Recommendations:** For each technology, introduce not only the core concepts but also the most widely used and industry-recommended tools (e.g., linters, formatters, testing frameworks). Explain _why_ these tools are recommended and how they provide leverage.
- **Additive Detail:** Our process is evolutionary. When refining outlines or content, always build upon the existing details. Do not replace detailed breakdowns with summaries. The goal is to continuously increase the level of detail.
- **Docker Proficiency Assumed:** The reader is expected to have a working knowledge of Docker. To simplify setup and avoid complex local installations, we will prefer using `docker run` commands to provision required software like databases, message queues, or other tools.

### Content Structure & Authority

- **Authoritative Outline:** The book structure—units and topics—is defined in `CONTENT.md`. We will follow that outline closely.
- **Source Reliability:** Prioritize and cite official documentation, peer-reviewed articles, and recognized industry leaders as primary sources. All information must be verifiable and up-to-date.
- **Technology Versions:** Always use recent but stable versions of all frameworks, languages, and technologies.
- **Best Practices:** All examples, concepts, and code must adhere to current industry best practices, emphasizing efficiency and security.
- **Secure by Default:** Security is not an afterthought. All code and architectural patterns should be designed with security as a primary consideration.
- **Production-Ready Code:** Examples should be robust, well-documented, and ready for production environments.

## 2. TECHNICAL ARCHITECTURE

> **📋 Detailed Technical Specifications:** See [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md) for comprehensive technical architecture and user experience standards including:
>
> - Technology stack requirements and standardized libraries
> - File structure and path consistency rules
> - Modern CSS Grid system and mobile-first responsive design
> - ES6 module architecture and component isolation
> - Hierarchical navigation system and progress tracking
> - Enhanced search implementation with Lunr.js

## 3. CONTENT CREATION WORKFLOW & QUALITY ASSURANCE

> **📋 Comprehensive Content Standards:** See [CONTENT-STANDARDS.md](CONTENT-STANDARDS.md) for detailed content creation workflows and quality assurance standards including:
>
> - Mandatory hierarchical workflow (Unit Overview → Topic → Study Aids → Quiz)
> - Study aids structure with interactive flashcards and modals
> - Interactive quiz & assessment system with navigation controls
> - Unit overview page requirements and interactive elements
> - HTML quality standards and validation workflows
> - Testing standards & framework with comprehensive coverage requirements
> - Mobile-first testing standards and file-type specific validation
>
> **📋 Mermaid Diagram Standards:** See [MERMAID-STANDARDS.md](MERMAID-STANDARDS.md) for critical rendering rules, debug requirements, and component implementation standards.

## 4. AGENT IMPLEMENTATION GUIDELINES

### Critical SvelteKit Architecture Rules

**CRITICAL: SvelteKit Component Development**

- ✅ **ALWAYS** use SvelteKit components for all UI elements
- ✅ **ALWAYS** prefer `shadcn-svelte` components over custom implementations
- ✅ **ALWAYS** use TypeScript interfaces for component props and data structures
- ✅ **ALWAYS** follow SvelteKit file-based routing conventions
- ✅ **ALWAYS** use Svelte 5 runes syntax (`$state`, `$derived`, `$props`)
- ❌ **NEVER** create vanilla HTML/CSS/JS files for new features
- ❌ **NEVER** use inline styles - use modular CSS architecture
- ❌ **NEVER** use deprecated Svelte 4 syntax (`export let`, `$:` reactivity)

**Component Architecture Standards:**

- **Single Responsibility:** Each component should have one clear purpose
- **Props-Based Configuration:** Use well-defined TypeScript interfaces for props
- **Reactive State:** Leverage Svelte's built-in reactivity for state management
- **Event-Driven Communication:** Use component events and stores for data flow
- **Composition over Inheritance:** Build complex UIs by composing simpler components

**shadcn-svelte Integration:**

- **Priority System:** Always check `shadcn-svelte` library first before building custom components
- **Installation Command:** Use `pnpm dlx shadcn-svelte@latest add [component-name]`
- **Customization:** Extend shadcn components using Tailwind CSS classes and component composition
- **Documentation Reference:** [shadcn-svelte.com/docs/components](https://www.shadcn-svelte.com/docs/components)

### SvelteKit Development Practices

**Agent Workflow Standards:**

- **TypeScript First:** All components must use TypeScript with proper interfaces
- **Mobile-First:** Always design and test mobile experience first
- **shadcn-svelte Priority:** Check component library before building custom components

> **📋 Detailed Technical Specifications:** See [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md) for comprehensive file structure, component development standards, and data loading patterns.

### Content Integration Workflow

**JSON-First Approach:**

- **Data Structure:** All content stored as structured JSON in `src/data/`
- **Type Safety:** Use TypeScript interfaces to ensure data structure consistency
- **Content Loading:** Implement dynamic imports with proper error handling
- **Validation:** Validate JSON structure and required fields at runtime

**Component-Based Content Display:**

- **Lesson Component:** Display structured lesson content with sections and rich formatting
- **Quiz Component:** Interactive quiz system with question navigation and scoring
- **Flashcard Component:** Modal-based flashcard system for study guides
- **Progress Components:** Unit and global progress tracking with visual indicators

**Migration from Legacy HTML:**

- **Reference Only:** Use existing `src/book/` HTML files as content reference
- **Extract Content:** Convert HTML content to structured JSON format
- **Component Implementation:** Build SvelteKit components to display JSON content
- **Legacy Cleanup:** Remove HTML files after successful migration

**Progress Tracking & Task Management:**

- **TodoWrite Integration:** Always use the TodoWrite tool to track tasks when working on content generation
- **Mobile-First Validation:** Always test mobile experience (≤390px) before desktop development
- **Iterative Development:** Follow the hierarchical workflow: Unit Overview → Topic → Study Aids → Quiz
- **Quality Assurance:** Ensure all generated content is pedagogically sound and builds upon previous concepts

### Development Tooling & Scripts

**Build/Utility Scripts (Not Application Code):**

- **User-Requested:** `src/bash/` and `src/python/` for permanent utility scripts (e.g., content generation, validation)
- **Temporary/Agent:** `./tmp/bash/` and `./tmp/python/` for one-off tooling solutions
- **Validation:** Always run `shellcheck` on bash scripts before completion
- **Python Cache:** Use `make` commands with `PYTHONPYCACHEPREFIX=tmp/pycache` for utility scripts

> **🎯 Note:** These are development tools, not application code. SvelteKit application uses TypeScript/JavaScript only.

**SvelteKit Configuration:**

- **Project Configuration:** SvelteKit configuration in `svelte.config.js`, Vite config in `vite.config.js`
- **TypeScript Configuration:** `tsconfig.json` for TypeScript compiler options
- **No Root Configs:** Avoid placing unnecessary configuration files in project root

**File Modification Scope:**

- **Strict Scope:** Modify only requested files/paths unless global functionality requires shared resources
- **Shared Resources:** May modify `src/lib/`, `src/routes/`, or component files for global SvelteKit features
- **Documentation:** Avoid creating docs unless explicitly requested

**Project Execution Standards:**

- **Root Execution:** ALL scripts and commands MUST execute from the project root directory
- **No Directory Changes:** NEVER use `cd` commands in Makefile or script execution
- **Environment Configuration:** Project uses `.env` file for tooling configuration (automatically loaded by Makefile)
- **SvelteKit Development:** Use `pnpm run dev`, `pnpm run build`, `pnpm run check` for application development
- **Tooling Scripts:** Use `make` commands for utility scripts (content generation, validation, etc.)

---

## IMPERATIVE GUIDELINES PERSISTENCE

**Learning Integration Rule:** When users provide specific imperative guidelines or corrections during interactions that represent fundamental project rules or repeated issues, these guidelines should be evaluated for inclusion in this document to ensure persistence across future interactions.

**Evaluation Criteria:**

- **Fundamental Project Rules:** Guidelines that affect core architecture, file organization, or execution standards
- **Repeated Corrections:** Issues that users have had to correct multiple times across different interactions
- **System-Wide Impact:** Rules that affect how all agents should work with the project
- **Quality Standards:** Requirements that ensure consistent quality and prevent regression

**Integration Process:**

1. **Identify:** Recognize when user feedback represents a systemic rule rather than a one-time request
2. **Evaluate:** Determine if the guideline should apply to all future interactions
3. **Document:** Add the rule to the appropriate section in CLAUDE.md with clear, actionable language
4. **Validate:** Ensure the rule doesn't conflict with existing guidelines

**Documentation Architecture Strategy:**

**Inline Documentation Approach:**

- **Component-Level Documentation:** All component-specific knowledge stored as comprehensive inline comments
- **Co-location Principle:** Documentation lives alongside implementation for better maintainability
- **Recurring Issues:** Critical issues and solutions documented directly in affected component files
- **Technical Architecture:** Consolidated in SVELTEKIT-GUIDE.md for comprehensive reference

**Documentation Distribution:**

- **SVELTEKIT-GUIDE.md:** Complete technical architecture, development standards, and troubleshooting
- **CONTENT-STANDARDS.md:** Content creation workflows and quality assurance standards
- **MERMAID-STANDARDS.md:** Diagram rendering requirements and syntax standards
- **Component Files:** Specific implementation details, known issues, and architectural decisions

**Issue Documentation Workflow:**

- **Recurring Issues (2+ occurrences):** Document as inline comments in affected component files
- **Architecture Patterns:** Add to SVELTEKIT-GUIDE.md for project-wide reference
- **Component-Specific:** Include in relevant component file headers
- **Avoid Separate Issue Files:** Do not create standalone documentation files for issues

**Examples of Guidelines That Should Persist:**

- File organization standards (scripts execute from root)
- Code architecture requirements (modular CSS, shadcn-svelte components, centralized state management)
- Validation procedures (always run `pnpm run format`, `pnpm run check`, and `pnpm run lint` after SvelteKit changes)
- Mobile-first development mandates
- Security requirements (secure by default, no exposed secrets)
- Issue documentation co-location (inline comments in affected components)

---

## IMPORTANT INSTRUCTION REMINDERS

- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User
- **MOBILE-FIRST MANDATE:** Always test mobile experience (≤390px) before desktop
- **SVELTEKIT DEVELOPMENT:** Use components and TypeScript - avoid vanilla HTML/CSS/JS
- **shadcn-svelte PRIORITY:** Always check component library first before building custom components
- **SVELTEKIT VALIDATION:** Run `pnpm run format`, `pnpm run check` for TypeScript/component validation, and `pnpm run lint` for code quality
- **ZERO TOLERANCE POLICY:** NO TypeScript errors, NO warnings, NO unused variables (unless user-requested or ShadCN components), NO deprecated components
- **AUTOMATED VALIDATION:** ESLint and Prettier handle code formatting and quality automatically
- **CONTENT VALIDATION:** Use `make content-validate` for JSON structure validation when needed
- **CONTENT-FIRST:** All new features should consume JSON data from `src/data/` structure
