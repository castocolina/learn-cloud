# AF02 Agent Prompts

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
   	home: { id: "home", label: "Home", url: "/", icon: "Home" },
   	demo: { id: "demo", label: "Demo", url: "/demo", icon: "Layers" },
   	sections: {
   		overview: { id: "overview", label: "Overview", url: "/demo#overview" },
   		layout: { id: "layout", label: "Layout", url: "/demo#layout" },
   		interactive: { id: "interactive", label: "Interactive", url: "/demo#interactive" }
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

---

#### Prompt 3: Implement Collapsible Sidebar

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

---

#### Prompt 4A: Generate Theme Configuration Data

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

---

#### Prompt 4B: Implement Dark Mode Toggle Component

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

---

#### Prompt 5A: Generate Search Configuration Data

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

---

#### Prompt 5B: Implement Search Box with Live Filtering

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

---

#### Prompt 6A: Generate Comprehensive Mermaid Diagram Data

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

---

#### Prompt 6B: Implement Mermaid Diagram Showcase

AF02 Agent Task: Implement Mermaid Diagram Showcase Consuming Generated Diagram Data

**Prerequisites:** Mermaid diagram data must exist from Prompt 6A

**Requirements:**

1. Create Mermaid diagram showcase component consuming diagram data from TypeScript files
2. Implement diagram rendering using Mermaid.js library with generated definitions
3. Add diagram filtering and categorization using generated metadata
4. Integrate with existing demo route and navigation structure

🚨 CRITICAL MERMAID REQUIREMENTS: 5. **Debug Mode Implementation**: Component MUST accept `debug` prop or check URL parameter `?debug=true` 6. **Error Handling**: Log all rendering errors to console with full diagram source code 7. **Fallback Content**: Display error message with diagram source when rendering fails 8. **Syntax Validation**: Ensure all generated diagrams follow double-quote rules for text

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

---

#### Prompt 7A: Generate Comprehensive Code Examples Data

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

- TypeScript/SvelteKit (4 examples: components, stores, actions, utilities)
- JavaScript (4 examples: async/await, promises, DOM manipulation)
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

---

#### Prompt 7B: Implement Code Examples Showcase

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

---

#### Prompt 8A: Generate Flip Cards Content Data

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

---

#### Prompt 8B: Implement Interactive Flip Cards

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

---

#### Prompt 9A: Generate Modal Content Data

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

---

#### Prompt 9B: Implement Modal Dialogs and Overlays

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
