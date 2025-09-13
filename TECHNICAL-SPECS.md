# Technical Specifications: Cloud-Native Learning Platform

This document contains the technical architecture and user experience standards for the Cloud-Native Book project.

> **📚 Related Documentation:**
> - [AGENTS.md](AGENTS.md) - Core project rules and agent implementation guidelines
> - [CONTENT-STANDARDS.md](CONTENT-STANDARDS.md) - Content creation workflows and quality assurance standards

---

## TECHNICAL ARCHITECTURE

### Core Technology Stack

**Framework**: SvelteKit
- Modern, performant web framework with SSR/SSG capabilities
- Component-based architecture with reactive state management
- TypeScript support for type safety and better developer experience
- Optimized for production deployment on GitHub Pages

**Styling**: Tailwind CSS
- Utility-first CSS framework for rapid development
- `tailwindcss-typography` plugin for rich content formatting
- Mobile-first responsive design approach
- Custom design system with consistent spacing and colors

**UI Components**: `shadcn-svelte`
- High-quality, accessible component library built for SvelteKit
- **Installation**: `pnpm dlx shadcn-svelte@latest add [component-name]`
- **Priority**: Always prefer shadcn-svelte components over custom implementations
- **Documentation**: [shadcn-svelte.com](https://www.shadcn-svelte.com/)
- **Component Library**: [shadcn-svelte.com/docs/components](https://www.shadcn-svelte.com/docs/components)
- **Agent Guidelines**: If adding a component is complex, provide the user with the command to run manually

**Icons**: `lucide-svelte`
- Consistent, high-quality icon library optimized for Svelte
- **Documentation**: [lucide.dev](https://lucide.dev/)
- **Usage**: Import specific icons as Svelte components

### Content Management System

**Data Structure**: JSON-based content in `src/data/`
- Organized by units (`src/data/unit1/`, `src/data/unit2/`, etc.)
- Structured content format for lessons, quizzes, exams, and study guides
- Source of truth: `src/data/content-menu.json` (derived from `CONTENT.md`)

**Content Types**:
- **Lessons**: `{ title, summary, sections: [{ heading, content }] }`
- **Study Guides**: `{ title, flashcards: [{ front, back }] }` (minimum 6 per lesson)
- **Quizzes**: `{ title, questions: [...] }` (configurable display, 1.5x minimum stored)
- **Exams**: `{ title, questions: [...] }` (configurable display, 1.5x minimum stored)

**Quiz/Exam Configuration**:
- **Quizzes**: Display 5 questions (configurable), store minimum 8 questions (1.5x ratio)
- **Exams**: Display 20 questions (configurable), store minimum 30 questions (1.5x ratio)
- Questions selected randomly from available pool for each attempt

### Legacy Content

**`src/book/` Directory**: Legacy HTML content
- Contains 183+ HTML files with vanilla CSS/JS architecture
- Marked for future removal after content migration
- Available for content reference during migration process
- `index.html` moved from root to `src/book/index.html` as legacy

**Migration Status**:
- **Current**: SvelteKit framework with TypeScript configured
- **Legacy**: HTML-based content system in `src/book/`
- **Target**: Full JSON-based content system in `src/data/`

### Development Environment

**Development Environment**: Node.js 22+ (LTS via `nvm install --lts`)

**Package Manager**: pnpm
- Fast, efficient package management with workspace support
- Lockfile-based dependency management
- Reduced disk space usage compared to npm

**Build System**: Vite (via SvelteKit)
- Fast development server with Hot Module Replacement (HMR)
- Optimized production builds with tree shaking
- Static site generation for GitHub Pages deployment
- TypeScript integration with fast type checking

**Code Quality Tools**:
- **ESLint**: JavaScript/TypeScript linting with SvelteKit rules
- **Prettier**: Code formatting with Svelte support
- **TypeScript**: Type safety and enhanced developer experience
- **Svelte Check**: Component validation and accessibility checks
- **Prism.js**: Syntax highlighting for code blocks in content

### File Structure

```
src/
├── data/                     # Content data (JSON format)
│   ├── unit1/               # Unit-specific content files
│   ├── unit2/               # ...
│   └── content-menu.json    # Navigation structure (source of truth)
├── lib/                     # Shared utilities and components
│   ├── components/          # Reusable Svelte components
│   ├── utils.ts            # Utility functions
│   └── index.ts            # Library exports
├── routes/                  # SvelteKit routes (file-based routing)
│   ├── +layout.svelte      # Global layout
│   ├── +page.svelte        # Home page
│   └── [...other routes]   # Dynamic and static routes
├── app.html                 # HTML template
├── app.d.ts                 # TypeScript declarations
└── book/ (legacy)           # Legacy HTML content for reference
```

### Deployment Architecture

**Target Platform**: GitHub Pages
- Static site generation (SSG) with SvelteKit adapter-static
- Automated deployment via GitHub Actions workflow
- Custom domain support with HTTPS
- CDN-optimized content delivery

**CI/CD Pipeline**:
1. **Validation**: SvelteKit check, lint, bash/python script validation
2. **Build**: Static site generation with optimized assets
3. **Deploy**: Automated GitHub Pages deployment
4. **Dependencies**: Validation workflow dependency for deployment

---

## USER EXPERIENCE STANDARDS

### Mobile-First Design

**Responsive Design Principles**:
- **Breakpoints**: 390px (mobile), 768px (tablet), 1024px+ (desktop)
- **Touch Targets**: Minimum 44px for all interactive elements
- **Typography**: Fluid scaling using CSS `clamp()` and viewport units
- **Layout**: CSS Grid with mobile-first responsive patterns

**Performance Standards**:
- Fast loading times with optimized bundle sizes
- Progressive enhancement for better user experience
- Efficient content loading and caching strategies
- Minimal layout shift during page loads

**Modal Design Standards**:
- **Mobile First**: Full viewport coverage (100vh x 100vw) on mobile devices
- **Desktop**: Large modals (90-95% viewport) with minimal padding for maximum content visibility
- **Touch Targets**: Close buttons and controls easily accessible
- **Content Scrolling**: Vertical scroll for content that exceeds modal height
- **Responsive Behavior**: Adapts seamlessly across all screen sizes
- **Z-Index Management**: Proper layering to ensure modal visibility above all content

### Navigation System

**Hierarchical Structure**:
- **Book Overview** → **Unit Overview** → **Lessons** → **Study Aids** → **Quizzes**
- Breadcrumb navigation showing current position
- Sequential Previous/Next navigation with smart unit boundaries

### User Experience Requirements

**Essential Interactive Elements**:
- **Progress Tracking**: Dual progress bars (unit progress + overall progress) with mobile-optimized display
- **Search Functionality**: Full-text search with instant results and content previews
- **Navigation Controls**: Previous/Next buttons with smart unit boundary detection
- **Quiz/Exam Navigation**: Separate navigation system from page navigation:
  - Question-specific Previous/Next buttons (distinct from page navigation)
  - Progress indicator showing current question number
  - Final results display with Pass/Fail (80% threshold)
  - Restart button (return to question 1) or Continue button

**Interactive Elements**:
- **Mobile**: Collapsible hamburger menu with smooth animations
- **Desktop**: Persistent sidebar with unit toggles and topic lists
- **Search Integration**: Content discovery across all units and lessons

### Content Presentation

**Learning Flow**:
1. **Unit Overview**: Introduction, learning objectives, prerequisites
2. **Lesson Content**: Structured sections with rich HTML content
3. **Study Guides**: Interactive flashcard system (minimum 6 per lesson)
4. **Quizzes**: Randomized questions with explanations
5. **Exams**: Comprehensive unit assessments

**Interactive Features**:
- **Flashcards**: Modal-based review system with expandable fullscreen view for long definitions
- **Quiz Engine**: Single-question display with dedicated navigation controls
- **Exam System**: Comprehensive assessments with progress tracking and scoring
- **Mermaid Diagrams**: GitHub-style expandable diagrams with fullscreen modal
  - Expand icon for fullscreen view that maximizes screen real estate
  - Preferably LR (Left-Right) direction for vertical display
  - Touch/click to expand functionality with full viewport coverage
- **Modal System**: All modals should maximize screen usage
  - Fullscreen on mobile devices (100vh x 100vw)
  - Large modals on desktop with minimal padding
  - Responsive design that adapts to available screen space
  - Close button accessible but non-intrusive
- **Code Highlighting**: Prism.js integration for syntax highlighting
- **Progress Indicators**: Visual feedback on completion status
- **Search Integration**: Content discovery across all units and lessons

---

## DEVELOPMENT GUIDELINES

### Component Development

**shadcn-svelte Priority**:
```bash
# Always check component library first
pnpm dlx shadcn-svelte@latest add [component-name]
```

**Component Architecture**:
- Single-responsibility components with clear interfaces
- Props-based configuration for flexibility
- TypeScript interfaces for all component props
- Consistent naming conventions following SvelteKit patterns

### Content Integration

**JSON Content Loading**:
```typescript
// Example content loading pattern
import type { LessonContent } from '$lib/types';

export async function loadLesson(unitId: string, lessonId: string): Promise<LessonContent> {
  const content = await import(`../data/${unitId}/${lessonId}.json`);
  return content.default;
}
```

**Type Safety**:
- Defined interfaces for all content types
- Runtime validation for content structure
- Error boundaries for missing or malformed content

### Performance Optimization

**Bundle Optimization**:
- Code splitting at route level
- Dynamic imports for content files
- Tree shaking for unused dependencies
- Optimized asset delivery with proper caching headers

**Content Loading**:
- Lazy loading for non-critical components
- Preloading for improved perceived performance
- Progressive enhancement for better user experience

---

## SECURITY CONSIDERATIONS

### Content Security

**Input Sanitization**:
- HTML content sanitization for user-generated content
- XSS prevention measures in dynamic content rendering
- Secure handling of JSON content parsing

**Build Security**:
- Dependency vulnerability scanning in CI/CD pipeline
- Secure build environment with locked dependencies
- Environment variable protection and validation

---

## MIGRATION STRATEGY

### Current Status ✅
- **Framework**: SvelteKit with TypeScript configured
- **Components**: shadcn-svelte setup complete
- **Build System**: Vite with proper configuration
- **CI/CD**: GitHub Actions workflows updated for SvelteKit

### Next Steps
1. **Content Migration**: Convert HTML content to structured JSON format
2. **Component Implementation**: Build content display components
3. **Legacy Cleanup**: Remove `src/book/` after migration completion
4. **Feature Enhancement**: Advanced interactive features and optimizations

---

## VALIDATION AND TESTING

### Automated Validation
- **SvelteKit Check**: Type safety and component validation
- **ESLint**: Code quality and consistency checks
- **Script Validation**: Bash and Python script testing
- **Content Validation**: JSON structure and integrity checks

### Testing Standards
- Unit tests for utility functions and components
- Integration tests for content loading and display
- End-to-end tests for user workflows
- Performance testing for loading times and responsiveness

**Testing Commands**:
```bash
pnpm run check    # SvelteKit validation
pnpm run lint     # Code linting
pnpm run test     # Run test suite
make validate     # Full validation pipeline
```