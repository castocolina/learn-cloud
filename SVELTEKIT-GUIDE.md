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

**Step 4: Theme Adoption and Tailwind Configuration**

After TailwindCSS installation, configure the theme system for your project:

```bash
# Verify Tailwind integration
cat src/app.css  # Should contain @import "tailwindcss";
```

**Configure Theme Architecture:**

1. **Update `src/app.css` with centralized theme configuration:**

```css
@import "tailwindcss";

/* Theme Configuration */
@theme {
  --color-primary: #0f172a;
  --color-secondary: #1e293b;
  --color-accent: #3b82f6;
  --color-background: #ffffff;
  --color-foreground: #0f172a;
  --color-muted: #f8fafc;
  --color-muted-foreground: #64748b;
  --color-border: #e2e8f0;
  --color-input: #ffffff;
  --color-ring: #3b82f6;
}

/* Component Layer for Custom Styles */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium;
    @apply hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2;
  }

  .card {
    @apply rounded-lg border bg-card text-card-foreground shadow-sm;
  }
}
```

2. **Test theme integration:**

```bash
# Run development server to verify theme
pnpm run dev

# Check TypeScript compilation with new CSS
pnpm run check
```

3. **Verify shadcn-svelte compatibility:**

```bash
# Install a test component to verify theme integration
pnpm dlx shadcn-svelte@latest add button

# Test component imports work with theme
pnpm run dev
```

**Common Theme Adjustments:**

- **Dark Mode Support**: Add CSS variables for dark theme variants
- **Custom Colors**: Extend theme with brand-specific color palette
- **Typography Scale**: Configure font sizes and line heights
- **Spacing System**: Customize spacing scale for component consistency

**Troubleshooting Theme Issues:**

```bash
# If build fails after theme changes
pnpm run check  # Check TypeScript errors
pnpm run build  # Verify production build
```

**Important Notes:**
- Never use `@apply` in Svelte component `<style>` blocks with Tailwind v4
- All custom styles must be in `src/app.css` using `@layer components`
- Theme variables must be defined in the `@theme` directive for Tailwind v4 compatibility

### Project Architecture

#### Core Technology Stack

**Framework**: SvelteKit with Svelte 5
- Component-based architecture with Svelte 5 runes for state management
- TypeScript support for type safety and developer experience
- Static site generation for GitHub Pages deployment

**Styling**: Tailwind CSS v4 with Centralized Architecture
- Single CSS import: `@import "tailwindcss";`
- CSS-based configuration using `@theme` directive
- Centralized component styles in `src/app.css`

**UI Components**: shadcn-svelte
- Copy-paste component system with full customization
- Built on Bits UI primitives for accessibility
- Tailwind CSS integration for theming

#### File Structure Deep Dive

```
src/
├── app.html                 # HTML template (root document)
├── app.css                  # Centralized CSS architecture
├── data/                    # Content data (TypeScript format)
│   ├── types.ts            # TypeScript interfaces with inheritance
│   └── content-menu.ts     # Generated navigation structure
├── lib/
│   └── components/
│       ├── content/        # Content renderer components
│       │   ├── LessonRenderer.svelte
│       │   ├── QuizRenderer.svelte
│       │   └── StudyGuideRenderer.svelte
│       ├── ui/             # shadcn-svelte UI components
│       │   ├── button/
│       │   ├── card/
│       │   ├── dialog/
│       │   └── sidebar/
│       └── shared/         # Shared utility components
├── routes/                 # SvelteKit routes (file-based routing)
│   ├── +page.svelte       # Homepage
│   ├── +layout.svelte     # Root layout
│   └── demo/              # Demo route (to be created)
└── bash/                  # Development scripts
    └── setup.sh           # Environment setup script
```

#### Key Files Explained

**`app.html`** - HTML Document Template
- Root HTML structure for the entire application
- Contains `%sveltekit.head%` and `%sveltekit.body%` placeholders
- Defines meta tags, favicons, and global HTML attributes

**`app.css`** - Centralized CSS Architecture
```css
@import "tailwindcss";

@layer components {
  .component-class {
    @apply flex items-center gap-2;
  }
}
```
- Single Tailwind CSS v4 import
- All component styles using `@layer components`
- Theme configuration via `@theme` directive

**`+page.svelte`** - Page Components
- Represents individual routes in file-based routing
- Contains page-specific logic and UI
- Can export `load` functions for data fetching

**`+layout.svelte`** - Layout Components
- Wraps pages with common UI elements
- Defines shared state and navigation
- Inherited by child routes

#### The `src/lib` Directory Strategy

The `lib` directory serves as the component library and utility hub:

**`src/lib/components/`** - Component Organization
- **`content/`**: Educational content renderers (LessonRenderer, QuizRenderer, StudyGuideRenderer)
- **`ui/`**: shadcn-svelte UI components (buttons, cards, modals, forms)
- **`shared/`**: Reusable utility components (icons, loading states, error boundaries)

**Best Practices for `src/lib`**:
- Use TypeScript interfaces for all component props
- Follow single responsibility principle
- Create composable, reusable components
- Maintain clear naming conventions (PascalCase for components)

### Component Development

#### TypeScript Interface Standards

**Svelte 5 Runes Syntax** (Critical):

```typescript
<!-- ✅ CORRECT Svelte 5 Runes -->
<script lang="ts">
  interface Props {
    title: string;
    items?: string[];
  }

  let count = $state(0);
  const doubled = $derived(count * 2);
  let { title, items = [] }: Props = $props();
</script>

<!-- ❌ DEPRECATED Svelte 4 Syntax -->
<script lang="ts">
  export let title: string;
  export let items: string[] = [];
  $: doubled = count * 2;
</script>
```

**Component Props Pattern**:

```typescript
// Define interfaces in separate files for reusability
export interface LessonContent {
  id: string;
  title: string;
  sections: Section[];
  metadata: ContentMetadata;
}

// Use interface inheritance
export interface QuizContent extends LessonContent {
  questions: Question[];
  timeLimit?: number;
}

// Component implementation
<script lang="ts">
  import type { LessonContent } from '$lib/types';

  interface Props {
    content: LessonContent;
    onComplete?: () => void;
  }

  let { content, onComplete }: Props = $props();
</script>
```

#### Component Architecture Patterns

**Single Responsibility Components**:

```svelte
<!-- Good: Focused component -->
<script lang="ts">
  interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
  }

  let { isOpen, onClose, title }: Props = $props();
</script>

<Dialog {isOpen} {onClose}>
  <DialogTitle>{title}</DialogTitle>
  {@render children()}
</Dialog>
```

**Event-Driven Communication**:

```typescript
// Parent component
let quizCompleted = $state(false);

function handleQuizComplete(score: number) {
  quizCompleted = true;
  console.log('Quiz completed with score:', score);
}

// Child component emits events
const dispatch = createEventDispatcher<{
  complete: { score: number };
}>();

function completeQuiz() {
  dispatch('complete', { score: 85 });
}
```

#### Custom vs Third-Party Components

**Decision Matrix**:

1. **Always Check shadcn-svelte First**:
   ```bash
   # Check available components
   pnpm dlx shadcn-svelte@latest add --help

   # Install specific component
   pnpm dlx shadcn-svelte@latest add button
   ```

2. **Build Custom When**:
   - Specific educational functionality (flashcards, progress tracking)
   - Complex content rendering (Mermaid diagrams, code blocks)
   - Unique interaction patterns not covered by UI libraries

3. **Integration Strategy**:
   ```svelte
   <!-- Extend shadcn components -->
   <script lang="ts">
     import { Button } from '$lib/components/ui/button';

     interface Props {
       variant?: 'primary' | 'secondary' | 'quiz';
     }

     let { variant = 'primary' }: Props = $props();
   </script>

   <Button
     class={`quiz-button ${variant === 'quiz' ? 'quiz-specific-styles' : ''}`}
     {...restProps}
   >
     {@render children()}
   </Button>
   ```

### Theming & Styling

#### Tailwind CSS v4 Integration

**Critical Architecture Rule**: All component styles MUST be in `src/app.css` using `@layer components`. Never use `<style>` blocks with `@apply` in Svelte components.

**Centralized CSS Approach**:

```css
/* src/app.css */
@import "tailwindcss";

@theme {
  --color-primary: #0f172a;
  --color-secondary: #475569;
  --color-accent: #3b82f6;
}

@layer components {
  .lesson-container {
    @apply max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm;
  }

  .quiz-question {
    @apply p-4 border border-slate-200 rounded-md mb-4;
  }

  .flashcard-grid {
    @apply grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
  }

  .modal-overlay {
    @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50;
  }
}
```

**Component Usage**:

```svelte
<!-- ✅ CORRECT: Use global classes -->
<div class="lesson-container">
  <h1 class="text-2xl font-bold text-slate-800">Lesson Title</h1>
</div>

<!-- ❌ CAUSES BUILD FAILURES -->
<style lang="postcss">
  .local-class {
    @apply flex; /* Incompatible with Tailwind v4 + Svelte */
  }
</style>
```

#### Theme Customization Strategy

**CSS-Based Theme Configuration**:

```css
@theme {
  /* Color palette */
  --color-primary-50: #f8fafc;
  --color-primary-500: #64748b;
  --color-primary-900: #0f172a;

  /* Typography */
  --font-family-sans: 'Inter', system-ui, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;

  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;

  /* Breakpoints */
  --breakpoint-sm: 390px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
}
```

**Mobile-First Responsive Design**:

```css
@layer components {
  .responsive-grid {
    @apply grid grid-cols-1 gap-3;
  }

  @media (min-width: theme(breakpoint.md)) {
    .responsive-grid {
      @apply grid-cols-2 gap-4;
    }
  }

  @media (min-width: theme(breakpoint.lg)) {
    .responsive-grid {
      @apply grid-cols-3 gap-6;
    }
  }
}
```

#### Ensuring Third-Party Component Theme Adoption

**shadcn-svelte Theme Integration**:

1. **Use CSS Variables**:
   ```css
   @theme {
     --color-background: white;
     --color-foreground: #0f172a;
     --color-muted: #f1f5f9;
     --color-border: #e2e8f0;
   }
   ```

2. **Override Component Styles**:
   ```css
   @layer components {
     .shadcn-button {
       @apply bg-primary-500 text-white hover:bg-primary-600;
     }

     .shadcn-card {
       @apply bg-background border-border;
     }
   }
   ```

3. **Theme Consistency Pattern**:
   ```typescript
   // Create theme configuration object
   export const theme = {
     colors: {
       primary: 'hsl(var(--color-primary))',
       secondary: 'hsl(var(--color-secondary))',
       background: 'hsl(var(--color-background))',
     },
     fonts: {
       sans: 'var(--font-family-sans)',
     }
   };
   ```

#### Mermaid Diagram Critical Rendering Rules

**🚨 CRITICAL**: Follow these rules exactly to prevent Mermaid rendering failures:

**Rule 1: Double Quote All Text**
```mermaid
<!-- ✅ CORRECT: All text in double quotes -->
graph TD
    A["User Login"] --> B{"Authentication Valid?"}
    B -->|"Yes"| C["Dashboard Access"]
    B -->|"No"| D["Error Message"]

<!-- ❌ INCORRECT: Missing quotes causes rendering failure -->
graph TD
    A[User Login] --> B{Authentication Valid?}
    B -->|Yes| C[Dashboard Access]
    B -->|No| D[Error Message]
```

**Rule 2: HTML Entity Encoding in Text**
```mermaid
<!-- ✅ CORRECT: HTML entities for special characters -->
graph LR
    A["API Call &lt;request&gt;"] --> B["Process &amp; Validate"]
    B --> C["Response &lt;data&gt;"]

<!-- ❌ INCORRECT: Raw HTML breaks rendering -->
graph LR
    A["API Call <request>"] --> B["Process & Validate"]
```

**Rule 3: Escape Special Characters**
```mermaid
<!-- ✅ CORRECT: Escaped quotes and symbols -->
graph TD
    A["Function: \"getName()\""] --> B["Return: \"User Name\""]

<!-- ❌ INCORRECT: Unescaped quotes break parsing -->
graph TD
    A["Function: "getName()""] --> B["Return: "User Name""]
```

**Rule 4: Consistent Node Shape Syntax**
```mermaid
<!-- ✅ CORRECT: Consistent bracket usage -->
graph TB
    A["Rectangle Node"]     <!-- Rectangle: [] -->
    B("Round Edge Node")    <!-- Round edges: () -->
    C{"Diamond Node"}       <!-- Diamond: {} -->
    D[["Stadium Node"]]     <!-- Stadium: [[]] -->
    E[("Circle Node")]      <!-- Circle: [()] -->

<!-- ❌ INCORRECT: Mixed or incorrect bracket usage -->
graph TB
    A["Rectangle Node"]
    B("Round Edge Node"
    C{Diamond Node}         <!-- Missing closing quote -->
```

**Rule 5: Link Text Format**
```mermaid
<!-- ✅ CORRECT: Proper link text syntax -->
graph LR
    A["Start"] -->|"Process Data"| B["Middle"]
    B -.->|"Optional Flow"| C["End"]

<!-- ❌ INCORRECT: Missing quotes on link text -->
graph LR
    A["Start"] -->|Process Data| B["Middle"]
```

**Validation Checklist**:
- ✅ All node text enclosed in double quotes
- ✅ All link text enclosed in double quotes
- ✅ HTML entities used for `<`, `>`, `&` characters
- ✅ Escaped quotes within text using `\"`
- ✅ Consistent bracket syntax for node shapes
- ✅ No raw HTML tags in text content

**Testing Command**:
```bash
# Validate Mermaid syntax before implementation
pnpm run dev  # Check rendering in browser console for errors
```

### Component Libraries

#### Recommended Svelte Component Libraries (2025)

Based on industry research and flexibility requirements:

**1. shadcn-svelte** (Primary Choice)
- **Pros**: Copy-paste system, full customization, Tailwind integration
- **Use Case**: Core UI components (buttons, cards, modals, forms)
- **Installation**: `pnpm dlx shadcn-svelte@latest add [component]`
- **Theming**: Built-in theme system with CSS variable support

**2. Melt UI** (Headless & Maximum Flexibility)
- **Pros**: Headless components, complete customization, accessibility-first
- **Use Case**: Complex interactive components requiring custom styling
- **Best For**: Advanced developers who need complete control

**3. Bits UI** (Built on Melt UI)
- **Pros**: Headless primitives, Melt UI foundation, zero styling
- **Use Case**: When you need accessible primitives without opinions

**4. Skeleton** (Comprehensive Design System)
- **Pros**: Complete design system, Tailwind integration, Svelte-native
- **Use Case**: Rapid prototyping, consistent design language
- **Best For**: Teams wanting opinionated but flexible components

**5. Flowbite-Svelte**
- **Pros**: 60+ components, Tailwind styling, well-documented
- **Use Case**: Traditional component library approach
- **Best For**: Developers familiar with Bootstrap-style libraries

#### Selection Strategy

**Priority Order**:
1. Check **shadcn-svelte** component availability
2. If not available, evaluate **Melt UI** for headless approach
3. Consider **Skeleton** for design system consistency
4. Build custom component as last resort

**Compatibility Matrix**:

| Library | Svelte 5 | TypeScript | Tailwind v4 | Theming | Accessibility |
|---------|----------|------------|-------------|---------|--------------|
| shadcn-svelte | ✅ | ✅ | ✅ | Excellent | Excellent |
| Melt UI | ✅ | ✅ | ✅ | Maximum | Excellent |
| Bits UI | ✅ | ✅ | ✅ | Complete | Excellent |
| Skeleton | ✅ | ✅ | ⚠️ | Good | Good |
| Flowbite | ✅ | ✅ | ⚠️ | Limited | Good |

**Integration Example**:

```typescript
// Multi-library integration strategy
import { Button } from '$lib/components/ui/button'; // shadcn-svelte
import { createDialog } from '@melt-ui/svelte'; // Melt UI for complex modal
import { Progress } from '$lib/components/ui/progress'; // shadcn-svelte

// Custom wrapper for educational components
interface LearningButtonProps {
  variant: 'lesson' | 'quiz' | 'study-guide';
  progress?: number;
}

let { variant, progress }: LearningButtonProps = $props();
```

---

## Demo Implementation Plan

### Demo Data Architecture

The demo implementation follows a **data-driven approach** where all content, navigation, and component configurations are stored in TypeScript files within `src/data/demo/`. This architecture ensures easy identification, modification, and future cleanup of demo assets.

#### Directory Structure

```
src/data/demo/
├── types.ts                    # Demo-specific TypeScript interfaces
├── navigation/
│   ├── sidebar-menu.ts         # Sidebar navigation structure
│   ├── breadcrumbs.ts         # Breadcrumb configuration
│   └── quick-nav.ts           # Quick navigation shortcuts
├── content/
│   ├── units/                 # Demo units (structured like lessons)
│   │   ├── unit-overview.ts   # Demo overview and introduction
│   │   ├── unit-layout.ts     # Layout components showcase
│   │   ├── unit-interactive.ts # Interactive elements showcase
│   │   ├── unit-content.ts    # Content display components
│   │   ├── unit-modals.ts     # Modal system showcase
│   │   ├── unit-educational.ts # Educational tools
│   │   └── unit-integration.ts # Final integration
│   └── components/
│       ├── code-examples.ts   # Code block examples
│       ├── diagram-examples.ts # Mermaid diagram definitions
│       ├── quiz-questions.ts  # Quiz content
│       └── flashcard-data.ts  # Study guide content
├── assets/
│   ├── icons.ts              # Icon mappings and configurations
│   ├── themes.ts             # Theme configuration data
│   └── progress.ts           # Progress tracking configuration
└── config/
    ├── routes.ts             # SPA route definitions
    ├── features.ts           # Feature flags for demo
    └── settings.ts           # Demo-specific settings
```

#### Core TypeScript Interfaces

**Demo Navigation Structure:**

```typescript
// src/data/demo/types.ts
export interface DemoUnit {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;          // SPA-friendly URL (no redirects)
  order: number;
  status: 'draft' | 'ready' | 'complete';
  lessons: DemoLesson[];
}

export interface DemoLesson {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;          // SPA-friendly URL fragment
  order: number;
  duration?: string;    // Estimated interaction time
  components: string[]; // List of components showcased
  content: DemoContent;
}

export interface DemoContent {
  type: 'overview' | 'showcase' | 'interactive' | 'tutorial';
  sections: DemoSection[];
  metadata: {
    created: string;
    lastModified: string;
    author: string;
    tags: string[];
  };
}

export interface DemoSection {
  id: string;
  title: string;
  type: 'text' | 'component' | 'code' | 'diagram' | 'interactive';
  content: any;         // Content varies by type
  order: number;
}
```

**Component Configuration:**

```typescript
// Component-specific interfaces for demo data
export interface ComponentDemo {
  name: string;
  category: 'layout' | 'interactive' | 'content' | 'educational';
  description: string;
  props?: Record<string, any>;
  examples: ComponentExample[];
  documentation: string;
}

export interface ComponentExample {
  title: string;
  description: string;
  code: string;
  preview?: boolean;
  interactive?: boolean;
}
```

#### Example Data Implementation

**Sidebar Navigation Data:**

```typescript
// src/data/demo/navigation/sidebar-menu.ts
import type { DemoUnit } from '../types.js';
import {
  Home, Layout, MousePointer, FileText,
  Square, GraduationCap, Puzzle, CheckCircle
} from 'lucide-svelte';

export const demoUnits: DemoUnit[] = [
  {
    id: 'demo-overview',
    title: 'Demo Overview',
    description: 'Introduction to the component showcase',
    icon: 'Home',
    url: '/demo',
    order: 1,
    status: 'ready',
    lessons: [
      {
        id: 'introduction',
        title: 'Platform Introduction',
        description: 'Overview of SvelteKit architecture and demo purpose',
        icon: 'Info',
        url: '/demo#introduction',
        order: 1,
        duration: '5 min',
        components: ['Header', 'Breadcrumbs', 'Navigation'],
        content: { /* content definition */ }
      }
    ]
  },
  {
    id: 'layout-components',
    title: 'Layout Components',
    description: 'Headers, sidebars, and navigation patterns',
    icon: 'Layout',
    url: '/demo/layout',
    order: 2,
    status: 'ready',
    lessons: [
      {
        id: 'sticky-header',
        title: 'Sticky Header',
        description: 'Responsive header with breadcrumbs',
        icon: 'Navigation',
        url: '/demo/layout#sticky-header',
        order: 1,
        duration: '3 min',
        components: ['Header', 'Breadcrumbs'],
        content: { /* content definition */ }
      },
      {
        id: 'collapsible-sidebar',
        title: 'Collapsible Sidebar',
        description: 'Mobile-responsive sidebar navigation',
        icon: 'Sidebar',
        url: '/demo/layout#sidebar',
        order: 2,
        duration: '4 min',
        components: ['Sidebar', 'Navigation'],
        content: { /* content definition */ }
      }
    ]
  }
  // ... additional units
];
```

**Component Examples Data:**

```typescript
// src/data/demo/content/components/code-examples.ts
export const codeExamples = [
  {
    id: 'sveltekit-component',
    title: 'SvelteKit Component with Runes',
    language: 'typescript',
    category: 'component',
    description: 'Modern Svelte 5 component using runes syntax',
    code: `<script lang="ts">
  interface Props {
    title: string;
    items?: string[];
  }

  let count = $state(0);
  const doubled = $derived(count * 2);
  let { title, items = [] }: Props = $props();

  function handleClick() {
    count++;
  }
</script>

<div class="component-container">
  <h2>{title}</h2>
  <p>Count: {count}, Doubled: {doubled}</p>
  <button onclick={handleClick}>Increment</button>

  {#each items as item}
    <div class="item">{item}</div>
  {/each}
</div>`,
    tags: ['svelte', 'typescript', 'runes', 'component']
  }
  // ... additional examples
];
```

#### Asset Organization Strategy

**Modular Architecture for Easy Management:**

1. **Prefix-based Organization**: All demo files use `demo-` prefix for easy identification
2. **Isolated Dependencies**: Demo-specific types and utilities in separate namespace
3. **Clean Separation**: Demo assets don't interfere with main application logic
4. **Easy Cleanup**: All demo files can be identified and removed via glob patterns

**Cleanup Commands:**

```bash
# Remove all demo data (future cleanup)
find src/data -name "*demo*" -type f -delete
rm -rf src/data/demo/

# Remove demo routes
rm -rf src/routes/demo/

# Remove demo-specific CSS classes
grep -l "demo-" src/app.css | xargs sed -i '/\.demo-/d'
```

**Migration Strategy for Permanent Use:**

```typescript
// If demo components become permanent, rename and move:
// src/data/demo/components/ → src/data/components/
// Remove 'demo-' prefixes from class names and file names
// Update imports throughout the application
```

#### SPA Route Configuration

**Hash-based Navigation (No Page Redirects):**

```typescript
// src/data/demo/config/routes.ts
export const demoRoutes = {
  base: '/demo',
  sections: {
    overview: '#overview',
    layout: '#layout',
    interactive: '#interactive',
    content: '#content',
    modals: '#modals',
    educational: '#educational',
    integration: '#integration'
  },
  subsections: {
    'layout.header': '#layout-header',
    'layout.sidebar': '#layout-sidebar',
    'interactive.darkmode': '#interactive-darkmode',
    'interactive.search': '#interactive-search'
    // ... additional subsections
  }
};

// Navigation function for SPA behavior
export function navigateToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(null, '', `${demoRoutes.base}#${sectionId}`);
  }
}
```

This data-driven architecture ensures that the demo remains organized, easily maintainable, and ready for future cleanup or integration into the main application.

### Incremental Build Strategy

The demo route (`/demo`) will showcase all integrated components through a systematic, incremental build process. Each step adds specific functionality while maintaining the existing architecture.

#### Target Component Set

**Navigation & Layout**:
- Sticky header with breadcrumbs
- Collapsible sidebar (sidecard)
- Mobile-responsive navigation

**Interactive Elements**:
- Dark mode toggle with system preference detection
- Search box with live filtering
- Progress indicators and navigation buttons

**Content Display**:
- Mermaid diagrams with various chart types
- Syntax-highlighted code blocks
- Interactive flip cards for concepts
- Modal dialogs for detailed information

**Educational Components**:
- Quiz interface with timer and scoring
- Study guide flashcards
- Progress tracking visualizations

### AF02 Agent Prompts

The following prompts are designed for an **AF02 (Architect Frontend)** agent to implement the demo route incrementally. Each prompt represents a single, focused implementation step.

---

#### Prompt 1A: Generate Demo Navigation Data

**AF02 Agent Task: Generate Comprehensive Demo Navigation Structure**

**CRITICAL:** This is a DATA GENERATION prompt. Generate extensive navigation data in TypeScript files BEFORE implementing any components.

**Requirements:**
1. Create `src/data/demo/navigation/demo-sidebar-menu.ts` with 10+ units
2. Generate 3-15 lessons per unit (total 80-120 lessons)
3. Include varied content types: code-heavy, diagram-heavy, interactive, text-heavy, mixed-content
4. Add realistic durations, icons, descriptions, and educational metadata

**Expected Output:**
- 10+ navigation units with educational structure (unit/lesson hierarchy)
- 80-120 total lessons with realistic variety
- All data using `demo-` prefixes for easy identification
- TypeScript interfaces for type safety
- SPA-friendly URLs with hash navigation

**Content Type Variety:**
- Code-heavy lessons (30%): Multiple code examples, tutorials
- Interactive lessons (25%): Quizzes, forms, flip cards
- Diagram-heavy lessons (20%): Multiple Mermaid diagrams
- Text-heavy lessons (15%): Long-form educational content
- Mixed-content lessons (10%): Combination of all types

**Success Criteria:**
- Navigation data supports realistic testing of sidebar accordion behavior
- Sufficient variety to test all component rendering scenarios
- Educational structure mirrors real learning platform

---

#### Prompt 1B: Implement Demo Route Foundation

**AF02 Agent Task: Create Demo Route Foundation Consuming Navigation Data**

**Prerequisites:** Navigation data must exist from Prompt 1A

**Requirements:**
1. Create `src/routes/demo/+page.svelte` consuming navigation data from TypeScript files
2. Implement SPA hash-based navigation (no page redirects)
3. Create responsive layout foundation with demo-specific CSS classes
4. Add data loading and error handling for navigation structure

**Technical Specifications:**
- Use Svelte 5 runes syntax with proper TypeScript interfaces
- Follow centralized CSS architecture with `demo-` prefixed classes
- Implement mobile-first responsive design (≤390px primary target)
- Load ALL navigation data from TypeScript files (no hardcoded content)

**Expected Deliverables:**
- Demo route foundation consuming generated navigation data
- SPA hash navigation system working with generated URLs
- Responsive layout ready for component integration
- Error handling for missing or malformed navigation data

**Critical:** Only implement after navigation data is fully generated and available.

---

#### Prompt 2: Sticky Header with Data-Driven Breadcrumbs

**AF02 Agent Task: Implement Sticky Header with Data-Driven Breadcrumbs for Demo Route**

Enhance the `/demo` route with a sticky header containing breadcrumbs navigation that loads configuration from TypeScript data files.

**Requirements:**
1. Create data-driven sticky header component for demo page
2. Implement breadcrumb navigation using data from `src/data/demo/navigation/breadcrumbs.ts`
3. Ensure mobile-first responsive behavior with demo-specific styling
4. Integrate with existing project header patterns

**Technical Specifications:**
- Analyze existing header implementation in `src/lib/components/ui/header/`
- **CRITICAL**: Load breadcrumb configuration from TypeScript data files
- Implement proper z-index hierarchy for sticky positioning
- Follow centralized CSS architecture in `src/app.css` with `demo-` prefixed classes

**Data-Driven Implementation:**

1. **Create Breadcrumb Configuration File:**
   ```typescript
   // src/data/demo/navigation/breadcrumbs.ts
   export interface BreadcrumbConfig {
     id: string;
     label: string;
     url: string;
     icon?: string;
     isActive?: boolean;
   }

   export const demoBreadcrumbs = {
     home: { id: 'home', label: 'Home', url: '/', icon: 'Home' },
     demo: { id: 'demo', label: 'Demo', url: '/demo', icon: 'Layers' },
     sections: {
       overview: { id: 'overview', label: 'Overview', url: '/demo#overview' },
       layout: { id: 'layout', label: 'Layout', url: '/demo#layout' },
       interactive: { id: 'interactive', label: 'Interactive', url: '/demo#interactive' }
     }
   };
   ```

2. **Dynamic Breadcrumb Generation**:
   - Load breadcrumb data from configuration file
   - Generate breadcrumb path based on current section
   - Support SPA navigation with hash-based URLs

**Component Features:**
- Sticky positioning that works across all viewport sizes
- Dynamic breadcrumb path: Home > Demo > [Current Section]
- Data-driven breadcrumb labels and URLs
- Mobile hamburger menu integration (if applicable)
- Smooth scroll behavior when navigating sections

Styling Requirements:
- Use existing project color palette (slate-based theme)
- Demo-specific CSS classes with `demo-header-`, `demo-breadcrumb-` prefixes
- Mobile-optimized touch targets (44px minimum)
- Proper contrast ratios for accessibility

**Expected Deliverables:**
- Sticky header component integrated into demo route
- Breadcrumb configuration file: `src/data/demo/navigation/breadcrumbs.ts`
- Data-driven breadcrumb navigation with clickable links
- Mobile-responsive header behavior with demo-specific styling

**Integration Requirements:**
- Import and use breadcrumb data from TypeScript configuration file
- Reuse existing shadcn-svelte components where possible
- Maintain consistency with main application header patterns
- Support keyboard navigation and proper ARIA labels

**Success Criteria:**
- Header remains sticky during scroll with proper z-index
- Breadcrumbs load from data file and show correct navigation hierarchy
- Hash-based navigation updates breadcrumbs dynamically
- Mobile experience optimized (≤390px) with demo-specific styling
- TypeScript validation passes
- All CSS classes use `demo-` prefix for easy identification

Data-Driven Validation:
- Breadcrumb configuration loads from TypeScript file successfully
- Dynamic breadcrumb generation works with SPA navigation
- Current section detection updates breadcrumbs properly
- No hardcoded breadcrumb labels in component code
```

---

#### Prompt 3: Implement Collapsible Sidebar

```
AF02 Agent Task: Implement Data-Driven Collapsible Sidebar

**Prerequisites:** Navigation data from Prompt 1A must exist

**Requirements:**
1. Implement collapsible sidebar consuming navigation data from `demo-sidebar-menu.ts`
2. Add accordion behavior (only one unit expanded at a time)
3. Implement responsive mobile/desktop behavior (overlay vs inline)
4. Add search and filtering capabilities for lessons

**Technical Specifications:**
- Analyze existing sidebar implementation in `src/lib/components/ui/sidebar/`
- Use Svelte 5 runes for accordion state management
- Follow centralized CSS architecture with `demo-sidebar-` prefixed classes
- Support touch gestures and keyboard navigation

Sidebar Features:
- Load unit/lesson structure from TypeScript data files
- Accordion behavior with smooth animations
- Mobile: Full-screen overlay with backdrop
- Desktop: Collapsible inline sidebar
- Search functionality filtering lessons by title/content type
- Active state highlighting based on current section

**Expected Deliverables:**
- Collapsible sidebar component integrated into demo layout
- Search functionality working with generated navigation data
- Mobile and desktop responsive behavior
- Accordion state management consuming data structure

**Success Criteria:**
- Sidebar loads 100% of navigation from data files (no hardcoded content)
- Accordion behavior works with realistic lesson counts
- Search filters through actual generated lesson data
- Mobile overlay behavior functions properly
- All CSS uses `demo-` prefixes for easy identification

**Critical:** Only implement after navigation data is fully generated and available.
```

---

#### Prompt 4A: Generate Theme Configuration Data

```
AF02 Agent Task: Generate Comprehensive Theme Configuration Data

**CRITICAL:** This is a DATA GENERATION prompt. Generate extensive theme configuration data in TypeScript files BEFORE implementing dark mode toggle component.

**Requirements:**
1. Create `src/data/demo/themes/theme-config.ts` with comprehensive theme definitions
2. Generate 15+ component theme variants (cards, buttons, inputs, sidebars, headers, etc.)
3. Include system preference configurations and transition settings
4. Add accessibility contrast ratios and theme validation data

**Expected Output:**
- Theme configuration with light, dark, and system preference settings
- 15+ component-specific theme variants with CSS custom properties
- Transition timing and animation configuration data
- Color palette definitions with accessibility compliance data
- Icon mapping for theme toggle states

**Theme Variety:**
- Light theme variants (5+ color schemes)
- Dark theme variants (5+ color schemes)
- High contrast themes (2+ variants)
- System themes with auto-detection rules
- Custom theme definitions for demo components

**Success Criteria:**
- Theme data supports comprehensive dark mode testing scenarios
- Sufficient variety to test all component rendering in different themes
- Accessibility-compliant color combinations with proper contrast ratios
```

---

#### Prompt 4B: Implement Dark Mode Toggle Component

```
AF02 Agent Task: Implement Dark Mode Toggle Consuming Theme Configuration

**Prerequisites:** Theme configuration data must exist from Prompt 4A

**Requirements:**
1. Create dark mode toggle component consuming theme data from TypeScript files
2. Implement theme switching logic using Svelte stores and generated configuration
3. Add theme persistence using localStorage with generated theme options
4. Integrate with existing project theming approach

**Technical Specifications:**
- Load ALL theme configurations from TypeScript data files
- Use Svelte 5 runes for reactive theme state management
- Implement system preference detection using generated preference rules
- Follow centralized CSS architecture with `demo-theme-` prefixed classes

**Expected Deliverables:**
- Dark mode toggle component consuming generated theme data
- Theme store management using generated configuration options
- System preference detection with generated rules
- Smooth transitions using generated animation configurations

**Critical:** Only implement after theme configuration data is fully generated and available.
- Implement theme-aware color variables

Styling Requirements:
- Add dark theme colors to `@theme` configuration
- Create dark mode component styles in centralized CSS
- Ensure all demo components support both themes
- Maintain project's color palette consistency (slate-based)

**Expected Deliverables:**
- Dark mode toggle component with state management
- Theme store for application-wide theme state
- Dark theme CSS variables and component styles
- System preference detection and response logic

**Integration Requirements:**
- Use existing project styling patterns
- Maintain accessibility standards in both themes
- Support keyboard interaction for toggle
- Include proper ARIA attributes for screen readers

**Success Criteria:**
- Theme toggles smoothly between light/dark/system modes
- Theme preference persists across page reloads
- System preference changes are detected and applied
- All demo components render correctly in both themes
- TypeScript validation passes
- Accessibility standards maintained in both themes
```

---

#### Prompt 5A: Generate Search Configuration Data

```
AF02 Agent Task: Generate Comprehensive Search Configuration Data

**CRITICAL:** This is a DATA GENERATION prompt. Generate extensive search configuration and indexable content data in TypeScript files BEFORE implementing search functionality.

**Requirements:**
1. Create `src/data/demo/search/search-index.ts` with 100+ searchable items
2. Generate search configurations for different content types (components, lessons, diagrams, code)
3. Include search keywords, tags, and categories for realistic filtering
4. Add search result templates and ranking algorithms

**Expected Output:**
- Comprehensive search index with 100+ items across all demo content
- Search configuration for debouncing, filtering, and result ranking
- Content type mappings with appropriate search weights
- Search result display templates and highlighting rules

**Search Content Variety:**
- Component names and descriptions (30+ items)
- Lesson titles and content summaries (40+ items)
- Code example titles and descriptions (20+ items)
- Mermaid diagram titles and metadata (10+ items)
- Interactive element descriptions (10+ items)

**Success Criteria:**
- Search index supports realistic search testing scenarios
- Sufficient variety to test search performance and filtering
- Content metadata includes realistic keywords and categories
```

---

#### Prompt 5B: Implement Search Box with Live Filtering

```
AF02 Agent Task: Implement Search Box Consuming Search Index Data

**Prerequisites:** Search configuration data must exist from Prompt 5A

**Requirements:**
1. Create search input component consuming search index from TypeScript files
2. Implement live filtering logic using generated search configuration
3. Add search result highlighting using generated templates
4. Integrate with existing demo route structure

**Technical Specifications:**
- Load ALL search configurations from TypeScript data files
- Use Svelte 5 derived state for reactive search filtering
- Implement debounced search using generated timing configurations
- Follow existing project input component patterns

**Expected Deliverables:**
- Search input component consuming generated search index
- Live filtering functionality using generated search data
- Search result highlighting with generated templates
- Integration with demo navigation consuming search results

**Critical:** Only implement after search configuration data is fully generated and available.
```

---

#### Prompt 6A: Generate Comprehensive Mermaid Diagram Data

```
AF02 Agent Task: Generate Extensive Mermaid Diagram Library

**CRITICAL:** This is a DATA GENERATION prompt. Generate 20+ comprehensive Mermaid diagrams across ALL diagram types with educational content BEFORE implementing showcase component.

**Requirements:**
1. Create `src/data/demo/content/diagrams/mermaid-examples.ts` with 20+ diagram examples
2. Generate diagrams across ALL Mermaid types (flowcharts, sequence, class, ER, gitgraph, etc.)
3. Include educational metadata, complexity levels, and usage scenarios
4. Add diagram categories, tags, and learning objectives

**Expected Output:**
- 20+ Mermaid diagrams across all supported types
- Complete diagram definitions with proper Mermaid syntax
- Educational metadata for each diagram
- Categories and complexity levels for filtering and organization

**Diagram Type Distribution:**
- Flowcharts (5 examples: simple to complex)
- Sequence diagrams (4 examples: API flows, user interactions)
- Class diagrams (3 examples: OOP structures)
- ER diagrams (3 examples: database designs)
- State diagrams (2 examples: application states)
- Gitgraph (2 examples: branching strategies)
- Journey maps (1 example: user experience)

**Success Criteria:**
- Diagram collection supports comprehensive Mermaid rendering testing
- Educational content suitable for cloud-native learning context
- Sufficient variety to test all Mermaid diagram types and complexity levels
```

---

#### Prompt 6B: Implement Mermaid Diagram Showcase

```
AF02 Agent Task: Implement Mermaid Diagram Showcase Consuming Generated Diagram Data

**Prerequisites:** Mermaid diagram data must exist from Prompt 6A

**Requirements:**
1. Create Mermaid diagram showcase component consuming diagram data from TypeScript files
2. Implement diagram rendering using Mermaid.js library with generated definitions
3. Add diagram filtering and categorization using generated metadata
4. Integrate with existing demo route and navigation structure

🚨 CRITICAL MERMAID REQUIREMENTS:
5. **Debug Mode Implementation**: Component MUST accept `debug` prop or check URL parameter `?debug=true`
6. **Error Handling**: Log all rendering errors to console with full diagram source code
7. **Fallback Content**: Display error message with diagram source when rendering fails
8. **Syntax Validation**: Ensure all generated diagrams follow double-quote rules for text

**Technical Specifications:**
- Load ALL diagram definitions from TypeScript data files
- Use Svelte 5 runes for reactive diagram filtering and display
- Implement proper Mermaid.js integration with comprehensive error handling
- Follow centralized CSS architecture with `demo-diagram-` prefixed classes
- **Debug Flag**: `<MermaidDiagram {diagram} debug={$page.url.searchParams.has('debug')} />`
- **Error Logging**: `console.error('Mermaid render failed:', diagramSource, error)`

**Expected Deliverables:**
- Mermaid diagram showcase component consuming generated diagram library
- Diagram filtering by type, complexity, and category using generated metadata
- Comprehensive error handling with debug mode and fallback content
- Integration with demo navigation and responsive display
- **Component tests validating both successful renders and error scenarios**

**Testing Requirements:**
- Test successful diagram rendering with valid syntax
- Test error handling with malformed diagram syntax
- Test debug mode displays error details correctly
- Test fallback content when rendering fails
- Validate all diagrams follow critical syntax rules (double quotes, HTML entities)

**Critical:** Only implement after comprehensive diagram data is fully generated and available.
```

---

#### Prompt 7A: Generate Comprehensive Code Examples Data

```
AF02 Agent Task: Generate Extensive Code Examples Library

**CRITICAL:** This is a DATA GENERATION prompt. Generate 30+ comprehensive code examples across 8+ programming languages with educational content BEFORE implementing showcase component.

**Requirements:**
1. Create `src/data/demo/content/code/code-examples.ts` with 30+ code examples
2. Generate examples across 8+ languages (TypeScript, JavaScript, Python, Go, Rust, Java, PHP, SQL)
3. Include educational metadata, complexity levels, and use case scenarios
4. Add syntax highlighting configurations and copy-to-clipboard functionality data

**Expected Output:**
- 30+ code examples across multiple programming languages
- Complete code snippets with proper syntax and best practices
- Educational metadata for each example
- Categories and complexity levels for filtering and organization

**Language Distribution:**
- TypeScript/SvelteKit (8 examples: components, stores, actions, utilities)
- JavaScript (5 examples: async/await, promises, DOM manipulation)
- Python (4 examples: web scraping, data processing, APIs)
- Go (3 examples: concurrency, REST APIs, CLI tools)
- Rust (3 examples: memory safety, performance, WebAssembly)
- Java (3 examples: Spring Boot, streams, concurrency)
- PHP (2 examples: Laravel, APIs)
- SQL (2 examples: complex queries, optimization)

**Success Criteria:**
- Code collection supports comprehensive syntax highlighting testing
- Educational content suitable for cloud-native learning context
- Sufficient variety to test all supported languages and use cases
```

---

#### Prompt 7B: Implement Code Examples Showcase

```
AF02 Agent Task: Implement Code Examples Showcase Consuming Generated Code Data

**Prerequisites:** Code examples data must exist from Prompt 7A

**Requirements:**
1. Create code showcase component consuming code examples from TypeScript files
2. Implement syntax highlighting using Shiki with generated configurations
3. Add code filtering and search using generated metadata
4. Integrate copy-to-clipboard functionality and code execution examples

**Technical Specifications:**
- Load ALL code examples from TypeScript data files
- Use Svelte 5 runes for reactive code filtering and display
- Implement Shiki integration with proper theme support
- Follow centralized CSS architecture with `demo-code-` prefixed classes

**Expected Deliverables:**
- Code showcase component consuming generated code library
- Syntax highlighting with theme support using generated configurations
- Code filtering by language, complexity, and category using generated metadata
- Copy-to-clipboard functionality and responsive code display

**Critical:** Only implement after comprehensive code examples data is fully generated and available.
```

---

#### Prompt 8A: Generate Flip Cards Content Data

```
AF02 Agent Task: Generate Comprehensive Flip Cards Content Library

**CRITICAL:** This is a DATA GENERATION prompt. Generate extensive flip card content data in TypeScript files BEFORE implementing flip card component.

**Requirements:**
1. Create `src/data/demo/content/flipcards/concept-cards.ts` with 25+ educational flip cards
2. Generate cards across different complexity levels (beginner, intermediate, advanced)
3. Include educational metadata, categories, and learning objectives
4. Add card animations and interaction configurations

**Expected Output:**
- 25+ educational flip cards with front/back content pairs
- Categories covering cloud-native concepts, programming patterns, and best practices
- Interactive configuration for animations, timings, and gestures
- Progress tracking data for card completion and mastery

**Content Categories:**
- Cloud fundamentals (8 cards)
- Container technologies (6 cards)
- Microservices patterns (5 cards)
- DevOps practices (4 cards)
- Security concepts (2 cards)

**Success Criteria:**
- Card content supports comprehensive interactive learning testing
- Educational progression from basic to advanced concepts
- Sufficient variety to test all flip card interaction scenarios
```

---

#### Prompt 8B: Implement Interactive Flip Cards

```
AF02 Agent Task: Implement Interactive Flip Cards Consuming Generated Content

**Prerequisites:** Flip card content data must exist from Prompt 8A

**Requirements:**
1. Create flip card component consuming card content from TypeScript files
2. Implement 3D flip animations and touch/click interactions using generated configurations
3. Add educational progress tracking using generated metadata
4. Integrate with existing demo route and navigation structure

**Technical Specifications:**
- Load ALL flip card content from TypeScript data files
- Use Svelte 5 runes for flip state and animation management
- Implement CSS 3D transforms using generated animation configurations
- Follow centralized CSS architecture with `demo-flipcard-` prefixed classes

**Expected Deliverables:**
- Interactive flip card component consuming generated content library
- 3D flip animations with touch/click/keyboard support using generated settings
- Progress tracking and completion states using generated metadata
- Integration with demo navigation and responsive display

**Critical:** Only implement after comprehensive flip card data is fully generated and available.
```

---

#### Prompt 9A: Generate Modal Content Data

```
AF02 Agent Task: Generate Comprehensive Modal Content Library

**CRITICAL:** This is a DATA GENERATION prompt. Generate extensive modal content data in TypeScript files BEFORE implementing modal components.

**Requirements:**
1. Create `src/data/demo/content/modals/modal-examples.ts` with 15+ modal configurations
2. Generate modals for different use cases (confirmation, forms, information, galleries)
3. Include modal sizing, animation, and accessibility configurations
4. Add modal content templates and validation rules

**Expected Output:**
- 15+ modal examples with varied content and purposes
- Configuration for animations, sizing, and behavior
- Accessibility attributes and keyboard navigation data
- Modal content templates for different use cases

**Modal Types:**
- Confirmation modals (3 examples)
- Form modals (4 examples)
- Information modals (3 examples)
- Image gallery modals (2 examples)
- Video/media modals (2 examples)
- Custom interactive modals (1 example)

**Success Criteria:**
- Modal collection supports comprehensive overlay testing
- Accessibility configurations ensure WCAG compliance
- Sufficient variety to test all modal interaction patterns
```

---

#### Prompt 9B: Implement Modal Dialogs and Overlays

```
AF02 Agent Task: Implement Modal System Consuming Generated Content

**Prerequisites:** Modal content data must exist from Prompt 9A

**Requirements:**
1. Create modal system consuming modal data from TypeScript files
2. Implement overlay management and accessibility features using generated configurations
3. Add modal animations and responsive behavior using generated settings
4. Integrate with existing demo route and navigation structure

**Technical Specifications:**
- Load ALL modal configurations from TypeScript data files
- Use Svelte 5 runes for modal state and overlay management
- Implement proper accessibility with focus trap and ARIA attributes
- Follow centralized CSS architecture with `demo-modal-` prefixed classes

**Expected Deliverables:**
- Modal system consuming generated content library
- Overlay management with backdrop and focus handling
- Responsive modal behavior using generated configurations
- Integration with demo navigation and keyboard accessibility

**Critical:** Only implement after comprehensive modal data is fully generated and available.

---

#### Prompt 10A: Generate Educational Quiz Content Data

**AF02 Agent Task: Generate Comprehensive Quiz Content Library**

**CRITICAL:** This is a DATA GENERATION prompt. Generate extensive quiz content data in TypeScript files BEFORE implementing quiz components.

**Requirements:**
1. Create `src/data/demo/content/quizzes/quiz-examples.ts` with 15+ educational quizzes
2. Generate quizzes for different educational levels (beginner, intermediate, advanced)
3. Include question types: multiple choice, true/false, drag-and-drop, code completion
4. Add scoring, timing, and progress tracking configurations

**Expected Output:**
- 15+ educational quizzes with varied question types and complexity
- Cloud-native technology questions covering fundamental to advanced concepts
- Interactive configuration for animations, timing, and user feedback
- Progress tracking data for quiz completion and performance analytics

**Quiz Categories:**
- Cloud fundamentals (5 quizzes)
- Container technologies (4 quizzes)
- Microservices architecture (3 quizzes)
- DevOps practices (2 quizzes)
- Security and monitoring (1 quiz)

**Success Criteria:**
- Quiz content supports comprehensive interactive learning testing
- Educational progression from basic to advanced technical concepts
- Sufficient variety to test all quiz interaction and scoring scenarios

---

#### Prompt 10B: Implement Interactive Quiz System

**AF02 Agent Task: Implement Quiz System Consuming Generated Content**

**Prerequisites:** Quiz content data must exist from Prompt 10A

**Requirements:**
1. Create quiz system consuming quiz data from TypeScript files
2. Implement timer, scoring, and progress tracking using generated configurations
3. Add question navigation and result analytics using generated metadata
4. Integrate with existing demo route and educational flow structure

**Technical Specifications:**
- Load ALL quiz configurations from TypeScript data files
- Use Svelte 5 runes for quiz state and progress management
- Implement proper accessibility with keyboard navigation and ARIA labels
- Follow centralized CSS architecture with `demo-quiz-` prefixed classes

**Expected Deliverables:**
- Interactive quiz system consuming generated content library
- Timer and scoring functionality using generated configurations
- Progress tracking and analytics using generated metadata
- Integration with demo navigation and responsive display

**Critical:** Only implement after comprehensive quiz data is fully generated and available.

---

## Summary

This comprehensive SvelteKit developer guide provides:

1. **Complete Setup Instructions**: From environment configuration to theme integration
2. **Architecture Overview**: SvelteKit, Tailwind CSS v4, and component library integration
3. **Development Standards**: Component patterns, TypeScript interfaces, and mobile-first design
4. **Demo Implementation Plan**: Data-driven incremental build strategy with 20+ prompts

The demo route implementation follows a systematic approach where data generation precedes component development, ensuring comprehensive testing scenarios and realistic content for all educational components.

**Key Benefits:**
- **Comprehensive Coverage**: All major SvelteKit components and patterns
- **Data-Driven Architecture**: Easy cleanup and maintenance through prefixed naming
- **Educational Focus**: Content designed for cloud-native learning context
- **Production-Ready**: Following current best practices and accessibility standards

This guide serves as both a reference for developers and a complete implementation roadmap for building sophisticated educational platforms with SvelteKit.
