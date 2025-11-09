# TASK EXISTING-1: Python Content

## Objective

Develop python content following DOCS/SVELTE-INDEX.md patterns with mobile-first design (≤390px) and comprehensive testing.

## Dependencies

**Requires:**

- TASK 11: Production polish (completed)

**Referenced by:**

- TASK-EXISTING-1-tests.md (test development for this component)

## Deliverables

- [ ] src/lib/components/ThemeSwitch.svelte
- [ ] src/lib/components/search/SearchBox.svelte
- [ ] src/lib/components/search/SearchModal.svelte
- [ ] Mobile-first validation (≤390px tested BEFORE desktop)
- [ ] TypeScript compliance (0 errors, 0 warnings)
- [ ] Component tests passing (see TASK-EXISTING-1-tests.md)

---

## Implementation Details

### EXISTING 1: Unit 1 - Python Lessons Development

**Agent Responsibility:**

You are responsible for developing comprehensive lesson content for Unit 1 (Python for Cloud-Native Backend Development), researching modern Python practices and creating detailed technical content based on CONTENT.md structure and existing materials in src/book/unit1.

**Technical Documents to Review:**

- `CONTENT.md` (Unit 1 structure: 1.1-1.9 lessons)

- `src/book/unit1/` (existing content reference)

- `src/types/content.ts` (content type definitions)

- `src/scripts/content-scaffolding.ts` (content generation)

- `CONTENT-STANDARDS.md` (quality standards)

**Prerequisites:**

- Task 11: Final Integration & Production Polish completed

- Content scaffolding infrastructure ready

**Content Scope:**

- **1.1**: Development Environment & Tooling (pyenv, Poetry, IDE)

- **1.2**: Overview & Foundational Concepts (ecosystem, typing system)

- **1.3**: Code Quality and Standards (PEP 8, Black, Ruff)

- **1.4**: Core Backend Concepts (OOP, databases, ORMs)

- **1.5**: Concurrency and Caching (asyncio, threading, lru_cache)

- **1.6**: Building RESTful API with FastAPI

- **1.7**: Advanced Backend Topics (event-driven, gRPC, microservices)

- **1.8**: Testing Strategies (pytest, mocking, Testcontainers)

- **1.9**: Observability (logging, Prometheus, OpenTelemetry)

**Implementation Details:**

1. Research current Python best practices and cloud-native patterns

2. Generate TypeScript lesson files using scaffolding script

3. Create comprehensive technical content with practical examples

4. Include hands-on exercises and real-world scenarios

5. Ensure mobile-first content design and union compliance

**Expected Output:**

- TypeScript lesson files: `lesson_development-environment.ts`, `lesson_foundational-concepts.ts`, etc.

- Practical code examples with modern Python patterns

- Cloud-native integration examples

- Setup guides and configuration examples

**Final Validations:**

- ✅ All 9 lessons fully developed with technical depth

- ✅ Content follows union-first patterns

- ✅ Practical examples functional and tested

- ✅ Mobile-first content design

- ✅ Integration with existing unit structure

**Documentation to Update:**

- Python development standards

- Cloud-native Python patterns

- FastAPI best practices guide

---

### EXISTING 2: Unit 1 - Python Study Guides Development

**Agent Responsibility:**

You are responsible for creating comprehensive study guides for Unit 1 Python lessons, developing summary materials, quick references, and key concept reinforcement materials using TypeScript content structure.

**Technical Documents to Review:**

- `CONTENT.md` (Unit 1 study guide requirements)

- `src/book/unit1/` (existing study materials reference)

- Completed Unit 1 lesson files

- `CONTENT-STANDARDS.md` (study guide format standards)

**Prerequisites:**

- EXISTING 1: Unit 1 - Python Lessons Development completed

**Content Scope:**

- **Study guides for lessons 1.1-1.9**: Summary cards, key concepts, quick references

- **Concept reinforcement**: Interactive flashcard content

- **Practical checklists**: Setup verification, troubleshooting guides

- **Reference materials**: Command references, code snippets, best practices

**Implementation Details:**

1. Extract key concepts from completed lesson content

2. Create concise summary materials for each lesson

3. Develop interactive study guide content with modal expansion

4. Include practical checklists and troubleshooting guides

5. Design mobile-optimized study materials

**Expected Output:**

- TypeScript study guide files: `study_guide_development-setup.ts`, `study_guide_backend-concepts.ts`, etc.

- Interactive flashcard content for modal display

- Quick reference guides and checklists

- Troubleshooting and FAQ sections

**Final Validations:**

- ✅ Study guides for all 9 lessons completed

- ✅ Content condensed but comprehensive

- ✅ Interactive elements functional

- ✅ Mobile-optimized design

- ✅ Cross-references to lesson content

**Documentation to Update:**

- Study guide design patterns

- Interactive content standards

- Mobile-first study materials guidelines

---

### EXISTING 3: Unit 1 - Python Quizzes and Exam Development

**Agent Responsibility:**

You are responsible for developing comprehensive quizzes for each Unit 1 lesson and the final unit exam, creating assessment materials that test practical knowledge and reinforce learning objectives.

**Technical Documents to Review:**

- `CONTENT.md` (Unit 1 quiz requirements: 1.1-1.9 quizzes + final exam)

- `src/book/unit1/` (existing quiz reference materials)

- Completed Unit 1 lesson and study guide content

- `CONTENT-STANDARDS.md` (assessment standards)

**Prerequisites:**

- EXISTING 2: Unit 1 - Python Study Guides Development completed

**Content Scope:**

- **Individual lesson quizzes**: 1.1-1.9 quizzes testing specific lesson concepts

- **Unit final exam**: Comprehensive assessment covering all Python topics

- **Question types**: Multiple choice, code completion, scenario-based problems

- **Practical assessments**: Code review, debugging, architecture decisions

**Implementation Details:**

1. Create targeted quizzes for each lesson (1.1-1.9)

2. Develop comprehensive final exam covering all unit topics

3. Include various question types and difficulty levels

4. Create practical coding scenarios and problem-solving questions

5. Implement scoring and feedback mechanisms

**Expected Output:**

- TypeScript quiz files: `quiz_development-environment.ts`, `quiz_backend-concepts.ts`, etc.

- Comprehensive final exam: `exam_python-comprehensive.ts`

- Varied question types with detailed explanations

- Scoring rubrics and feedback systems

**Final Validations:**

- ✅ Quizzes for all 9 lessons plus final exam completed

- ✅ Questions test practical application knowledge

- ✅ Varied difficulty levels and question types

- ✅ Clear scoring and feedback mechanisms

- ✅ Alignment with lesson learning objectives

**Documentation to Update:**

- Assessment design standards

- Quiz development guidelines

- Scoring methodology documentation

---

### EXISTING 4: Unit 1 - Python Unit Overview Update

**Agent Responsibility:**

You are responsible for creating a comprehensive unit overview for Unit 1 that synthesizes all lesson content, provides learning path guidance, and serves as the central navigation hub for the Python unit.

**Technical Documents to Review:**

- `CONTENT.md` (Unit 1 complete structure)

- All completed Unit 1 content files (lessons, study guides, quizzes, exam)

- `src/book/unit1/` (existing overview reference)

- `CONTENT-STANDARDS.md` (overview format standards)

**Prerequisites:**

- EXISTING 3: Unit 1 - Python Quizzes and Exam Development completed

**Content Scope:**

- **Unit introduction**: Learning objectives, prerequisites, outcomes

- **Learning path guidance**: Recommended study sequence and timeline

- **Technology overview**: Python ecosystem, tools, and frameworks covered

- **Practical applications**: Real-world use cases and project preparation

- **Navigation hub**: Links to all unit content with progress tracking

**Implementation Details:**

1. Synthesize all Unit 1 content into cohesive overview

2. Create learning path recommendations and study timeline

3. Develop comprehensive unit introduction and objectives

4. Include navigation to all unit content with descriptions

5. Design progress tracking and completion indicators

**Expected Output:**

- Comprehensive unit overview: `overview_python-unit.ts`

- Learning path guidance and study recommendations

- Technology ecosystem overview

- Navigation hub with progress tracking

**Final Validations:**

- ✅ Complete overview covering all unit aspects

- ✅ Clear learning path and study guidance

- ✅ Effective navigation to all unit content

- ✅ Progress tracking integration

- ✅ Motivational and educational unit introduction

**Documentation to Update:**

- Unit overview design patterns

- Learning path methodology

- Progress tracking standards

---

### EXISTING 5: Unit 2 - Go Lessons Development

**Agent Responsibility:**

You are responsible for developing comprehensive lesson content for Unit 2 (Go for Cloud-Native Backend Development), researching modern Go practices and creating detailed technical content based on CONTENT.md structure and existing materials in src/book/unit2.

**Technical Documents to Review:**

- `CONTENT.md` (Unit 2 structure: 2.1-2.9 lessons)

- `src/book/unit2/` (existing content reference)

- `src/types/content.ts` (content type definitions)

- `src/scripts/content-scaffolding.ts` (content generation)

- `CONTENT-STANDARDS.md` (quality standards)

**Prerequisites:**

- Task 11: Final Integration & Production Polish completed

- Content scaffolding infrastructure ready

**Content Scope:**

- **2.1**: Development Environment & Tooling (Go toolchain, modules, IDE)

- **2.2**: Overview & Foundational Concepts (performance, concurrency, static binaries)

- **2.3**: Concurrency: The Go Philosophy (goroutines, channels, patterns)

- **2.4**: Code Quality and Standards (idiomatic Go, gofmt, golangci-lint)

- **2.5**: Core Backend Concepts (structs, interfaces, databases, caching)

- **2.6**: Building RESTful API (net/http, frameworks like Gin/Echo)

- **2.7**: Advanced Backend Topics (event-driven, gRPC)

- **2.8**: Testing Strategies (testing package, mocking, Testcontainers)

- **2.9**: Observability (logging, Prometheus, OpenTelemetry)

**Implementation Details:**

1. Research current Go best practices and cloud-native patterns

2. Generate TypeScript lesson files using scaffolding script

3. Create comprehensive technical content with concurrency focus

4. Include hands-on exercises and performance examples

5. Ensure mobile-first content design and union compliance

**Expected Output:**

- TypeScript lesson files: `lesson_go-toolchain.ts`, `lesson_concurrency-philosophy.ts`, etc.

- Practical Go code examples with performance focus

- Concurrency patterns and best practices

- Setup guides and tooling configuration

**Final Validations:**

- ✅ All 9 lessons fully developed with Go-specific depth

- ✅ Content follows union-first patterns

- ✅ Concurrency examples functional and tested

- ✅ Mobile-first content design

- ✅ Integration with existing unit structure

**Documentation to Update:**

- Go development standards

- Concurrency pattern guidelines

- Cloud-native Go practices

---

### EXISTING 6: Unit 2 - Go Study Guides Development

**Agent Responsibility:**

You are responsible for creating comprehensive study guides for Unit 2 Go lessons, developing summary materials focused on Go's unique concurrency model and performance characteristics using TypeScript content structure.

**Technical Documents to Review:**

- `CONTENT.md` (Unit 2 study guide requirements)

- `src/book/unit2/` (existing study materials reference)

- Completed Unit 2 lesson files

- `CONTENT-STANDARDS.md` (study guide format standards)

**Prerequisites:**

- EXISTING 5: Unit 2 - Go Lessons Development completed

**Content Scope:**

- **Study guides for lessons 2.1-2.9**: Go-specific concepts, concurrency patterns

- **Concurrency quick references**: Goroutines, channels, select patterns

- **Performance checklists**: Optimization guides, profiling techniques

- **Idiomatic Go examples**: Code style, best practices, common patterns

**Implementation Details:**

1. Extract key Go concepts from completed lesson content

2. Create concurrency-focused summary materials

3. Develop interactive study guide content with code examples

4. Include performance optimization checklists

5. Design mobile-optimized Go reference materials

**Expected Output:**

- TypeScript study guide files: `study_guide_go-concurrency.ts`, `study_guide_performance.ts`, etc.

- Interactive concurrency pattern examples

- Performance optimization quick references

- Idiomatic Go code samples

**Final Validations:**

- ✅ Study guides for all 9 Go lessons completed

- ✅ Concurrency concepts clearly explained

- ✅ Performance focus maintained

- ✅ Mobile-optimized design

- ✅ Cross-references to lesson content

**Documentation to Update:**

- Go-specific study guide patterns

- Concurrency learning materials

- Performance optimization guides

---

### EXISTING 7: Unit 2 - Go Quizzes and Exam Development

**Agent Responsibility:**

You are responsible for developing comprehensive quizzes for each Unit 2 lesson and the final unit exam, focusing on Go's unique features, concurrency patterns, and performance characteristics.

**Technical Documents to Review:**

- `CONTENT.md` (Unit 2 quiz requirements: 2.1-2.9 quizzes + final exam)

- `src/book/unit2/` (existing quiz reference materials)

- Completed Unit 2 lesson and study guide content

- `CONTENT-STANDARDS.md` (assessment standards)

**Prerequisites:**

- EXISTING 6: Unit 2 - Go Study Guides Development completed

**Content Scope:**

- **Individual lesson quizzes**: 2.1-2.9 quizzes testing Go-specific concepts

- **Unit final exam**: Comprehensive assessment covering all Go topics

- **Concurrency assessments**: Goroutine and channel problem-solving

- **Performance scenarios**: Optimization and profiling questions

**Implementation Details:**

1. Create targeted quizzes for each Go lesson (2.1-2.9)

2. Develop comprehensive final exam covering all Go topics

3. Include concurrency pattern recognition and debugging

4. Create performance analysis and optimization scenarios

5. Implement scoring with Go-specific feedback

**Expected Output:**

- TypeScript quiz files: `quiz_go-toolchain.ts`, `quiz_concurrency-patterns.ts`, etc.

- Comprehensive final exam: `exam_go-comprehensive.ts`

- Concurrency debugging scenarios

- Performance analysis questions

**Final Validations:**

- ✅ Quizzes for all 9 Go lessons plus final exam completed

- ✅ Concurrency patterns thoroughly tested

- ✅ Performance scenarios included

- ✅ Go-specific problem-solving focus

- ✅ Alignment with lesson learning objectives

**Documentation to Update:**

- Go assessment methodology

- Concurrency testing patterns

- Performance evaluation standards

---

### EXISTING 8: Unit 2 - Go Unit Overview Update

**Agent Responsibility:**

You are responsible for creating a comprehensive unit overview for Unit 2 that synthesizes all Go content, emphasizes concurrency advantages, and serves as the central navigation hub for the Go unit.

**Technical Documents to Review:**

- `CONTENT.md` (Unit 2 complete structure)

- All completed Unit 2 content files (lessons, study guides, quizzes, exam)

- `src/book/unit2/` (existing overview reference)

- `CONTENT-STANDARDS.md` (overview format standards)

**Prerequisites:**

- EXISTING 7: Unit 2 - Go Quizzes and Exam Development completed

**Content Scope:**

- **Unit introduction**: Go advantages, concurrency focus, cloud-native benefits

- **Learning path guidance**: Concurrency-first learning approach

- **Technology overview**: Go ecosystem, tools, and performance characteristics

- **Practical applications**: Real-world Go use cases and project preparation

- **Navigation hub**: Links to all unit content with Go-specific progress tracking

**Implementation Details:**

1. Synthesize all Unit 2 content into cohesive Go-focused overview

2. Create concurrency-first learning path recommendations

3. Develop comprehensive Go ecosystem introduction

4. Include navigation to all unit content with performance metrics

5. Design progress tracking with Go-specific completion indicators

**Expected Output:**

- Comprehensive unit overview: `overview_go-unit.ts`

- Concurrency-focused learning path guidance

- Go ecosystem and performance overview

- Navigation hub with Go-specific progress tracking

**Final Validations:**

- ✅ Complete overview covering all Go aspects

- ✅ Concurrency advantages clearly highlighted

- ✅ Effective navigation to all unit content

- ✅ Performance-focused progress tracking

- ✅ Motivational Go unit introduction

**Documentation to Update:**

- Go-specific overview patterns

- Concurrency learning methodology

- Performance-focused progress standards

---

## 📚 NEW CONTENT DEVELOPMENT TASKS

### CONTENT 1: Test Coverage Extension for Python and Go Units

**Agent Responsibility:**

You are responsible for extending existing Python and Go units with comprehensive test coverage content, implementing modern testing practices and CI/CD integration patterns using TypeScript content structure.

**Technical Documents to Review:**

- `CONTENT.md` (current Python and Go unit structure)

- `src/types/content.ts` (content type definitions)

- `src/scripts/content-scaffolding.ts` (content generation)

- `CONTENT-STANDARDS.md` (content quality standards)

**Prerequisites:**

- Task 11: Final Integration & Production Polish completed

- Content scaffolding scripts functional

**Content Scope:**

- **Python Extensions**: unittest, pytest, coverage.py, pytest-cov

- **Go Extensions**: go test, go tool cover, HTML reports

- **CI/CD Integration**: GitHub Actions, automation patterns

- **Best Practices**: Coverage metrics, performance testing

**Implementation Details:**

1. Update CONTENT.md with test coverage sections

2. Run scaffolding script to generate TypeScript files

3. Research and implement comprehensive testing content

4. Create practical examples and CI/CD workflows

5. Validate content with mobile-first approach

**Expected Output:**

- Updated CONTENT.md with test coverage structure

- TypeScript content files in `src/data/book/unit-python/` and `src/data/book/unit-go/`

- Practical examples with working test configurations

- CI/CD integration guides

**Final Validations:**

- ✅ Content follows union-first patterns

- ✅ TypeScript compilation successful

- ✅ Mobile responsive content design

- ✅ Practical examples functional

- ✅ Integration with existing unit structure

**Documentation to Update:**

- Content development log

- Testing best practices guide

- CI/CD integration patterns

---

### CONTENT 2: Rust Programming Language Unit

**Agent Responsibility:**

You are responsible for creating a comprehensive Rust programming unit with modern systems programming focus, emphasizing memory safety, performance, and practical cloud-native applications using TypeScript content structure.

**Technical Documents to Review:**

- `CONTENT.md` (structure and content standards)

- `src/types/content.ts` (content type definitions)

- `src/scripts/content-scaffolding.ts` (content generation)

- `CONTENT-STANDARDS.md` (quality standards)

- Official Rust documentation and best practices

**Prerequisites:**

- Task 11: Final Integration & Production Polish completed

- Content scaffolding infrastructure ready

**Content Scope:**

- **Rust Fundamentals**: Ownership, borrowing, lifetimes, memory safety

- **Advanced Programming**: Traits, async/await, error handling, macros

- **Cloud-Native Development**: Web frameworks (Axum, Actix), microservices

- **Database Integration**: SQLx, Diesel, async patterns

- **DevOps Integration**: Docker optimization, CI/CD, testing coverage

**Implementation Details:**

1. Define comprehensive Rust unit structure in CONTENT.md

2. Generate TypeScript content files using scaffolding script

3. Research and implement cutting-edge Rust practices

4. Create practical cloud-native projects and examples

5. Develop comprehensive testing and performance content

**Expected Output:**

- Complete Rust unit in CONTENT.md

- TypeScript content files in `src/data/book/unit-rust/`

- Practical microservice projects with Docker

- Performance optimization and testing examples

**Final Validations:**

- ✅ Rust best practices followed

- ✅ Cloud-native focus maintained

- ✅ TypeScript content structure compliance

- ✅ Mobile-first content design

- ✅ Practical examples functional

**Documentation to Update:**

- Rust development standards

- Cloud-native architecture patterns

- Performance optimization guidelines

---

### CONTENT 3: Cloud Databases Unit (DynamoDB and Neptune)

**Agent Responsibility:**

You are responsible for creating a specialized cloud databases unit focusing on AWS NoSQL and graph database services, emphasizing practical implementation patterns, local development, and production deployment strategies.

**Technical Documents to Review:**

- `CONTENT.md` (structure standards)

- `src/types/content.ts` (content type definitions)

- `src/scripts/content-scaffolding.ts` (content generation)

- AWS documentation for DynamoDB and Neptune

- `CONTENT-STANDARDS.md` (quality requirements)

**Prerequisites:**

- Task 11: Final Integration & Production Polish completed

- Understanding of NoSQL and graph database concepts

**Content Scope:**

- **DynamoDB Mastery**: Data modeling, partition strategies, GSI/LSI patterns

- **Neptune Graph Databases**: Gremlin traversals, SPARQL queries, use cases

- **Local Development**: DynamoDB Local, TinkerGraph, testing strategies

- **AWS Integration**: SDK patterns, IAM policies, CloudWatch monitoring

- **Production Patterns**: Scalability, backup strategies, performance optimization

**Implementation Details:**

1. Define cloud databases unit structure in CONTENT.md

2. Generate TypeScript content files using scaffolding

3. Create comprehensive AWS database content with local development

4. Develop practical projects: e-commerce catalog, social network

5. Implement production-ready deployment patterns

**Expected Output:**

- Complete cloud databases unit in CONTENT.md

- TypeScript content files in `src/data/book/unit-cloud-databases/`

- Local development setup guides with Docker

- Production deployment and monitoring strategies

**Final Validations:**

- ✅ AWS best practices implemented

- ✅ Local development workflows functional

- ✅ Production deployment patterns verified

- ✅ TypeScript content structure compliance

- ✅ Mobile-first design approach

**Documentation to Update:**

- AWS database integration patterns

- Local development best practices

- Production deployment guidelines

---

---

### CONTENT 4: GraphQL with Amazon AppSync Unit

**Agent Responsibility:**

You are responsible for creating a comprehensive GraphQL unit with modern API development patterns, emphasizing AWS AppSync integration, real-time capabilities, and production-ready implementation strategies.

**Technical Documents to Review:**

- `CONTENT.md` (structure standards)

- `src/types/content.ts` (content type definitions)

- `src/scripts/content-scaffolding.ts` (content generation)

- GraphQL and AWS AppSync official documentation

- `CONTENT-STANDARDS.md` (quality requirements)

**Prerequisites:**

- Task 11: Final Integration & Production Polish completed

- Understanding of API design and real-time systems

**Content Scope:**

- **GraphQL Mastery**: Schema design, resolvers, advanced query patterns

- **AppSync Integration**: Data sources, VTL templates, direct resolvers

- **Real-time Features**: Subscriptions, WebSocket connections, offline sync

- **AWS Ecosystem**: DynamoDB, Neptune, Lambda, Cognito integration

- **Development Workflow**: Local setup, testing, deployment automation

**Implementation Details:**

1. Define comprehensive GraphQL unit structure in CONTENT.md

2. Generate TypeScript content files using scaffolding

3. Create advanced GraphQL content with AWS integration

4. Develop real-time applications: chat, social network, analytics

5. Implement production deployment and monitoring strategies

**Expected Output:**

- Complete GraphQL unit in CONTENT.md

- TypeScript content files in `src/data/book/unit-graphql/`

- Local development setup with Apollo Server

- Production AppSync deployment patterns with monitoring

**Final Validations:**

- ✅ GraphQL best practices followed

- ✅ Real-time features functional

- ✅ AWS integration patterns verified

- ✅ TypeScript content structure compliance

- ✅ Mobile-first API design approach

**Documentation to Update:**

- GraphQL API design patterns

- Real-time application architecture

- AWS AppSync deployment strategies

---

---

## ✅ DEVELOPMENT STATUS

### Foundation-First Migration Tasks:

**Architecture Tasks (Sequential):**

- [ ] TASK 1: Documentation Foundation Setup

- [ ] TASK 2: TypeScript Foundation Setup

- [ ] TASK 3: Foundation Scripts Development

- [ ] TASK 4: SPA Architecture Implementation

- [ ] TASK 5: Theme System Implementation

- [ ] TASK 6: shadcn-svelte UI Components

- [ ] TASK 7: Content Renderers with Differentiated Headers

- [ ] TASK 8: Enhanced Features (Search, Diagrams, Code)

- [ ] TASK 9: Content Migration to Clean Structure

- [ ] TASK 10: Quality Assurance & Validation Pipeline

- [ ] TASK 11: Final Integration & Production Polish

**Content Development Tasks (After Foundation):**

- [ ] CONTENT 1: Test Coverage Extension for Python and Go Units

- [ ] CONTENT 2: Rust Programming Language Unit

- [ ] CONTENT 3: Cloud Databases Unit (DynamoDB and Neptune)

- [ ] CONTENT 4: GraphQL with Amazon AppSync Unit

## Task Execution Rules:

**Sequential Dependencies:**

- Each foundation task must be completed before next task starts

- Content tasks can only begin after Task 11 completion

- All tasks follow "You are responsible for..." prompt structure

**Quality Gates:**

- ✅ Zero TypeScript errors

- ✅ Union compliance verified (no hardcoded strings)

- ✅ Mobile responsive confirmed (≤390px)

- ✅ Documentation updated

- ✅ Integration tests passing

### Target Architecture:

- **Foundation**: Union-first TypeScript with shadcn-svelte SPA

- **Content Format**: TypeScript files in `src/data/book/unit-{name}/`

- **File Naming**: `{chapterType}_{kebab-case-id}.ts` (union-based)

- **Rendering**: ChapterType-based renderers with differentiated headers

- **Validation**: Comprehensive testing with mobile-first approach

---

## 🔧 TECHNICAL DEBT - ESLint Cleanup & Component Refactoring

**Context:**

During ESLint configuration optimization (September 2024), specific components were temporarily excluded from linting to focus on core functionality development. These components require refactoring and cleanup to meet project standards.

### Technical Debt Items

**TASK 8F: ThemeSwitcher Component ESLint Cleanup**

- **File**: `src/lib/components/ThemeSwitch.svelte`

- **Issues**: Unused imports, incorrect Svelte 5 syntax, theme integration issues

- **Priority**: High (Theme system dependency)

- **Effort**: 2-3 hours

- **Dependencies**: Theme system completion (Task 5)

**TASK 8D: Search Components ESLint Cleanup**

- **Files**:
  - `src/lib/components/search/SearchBox.svelte`

  - `src/lib/components/search/SearchModal.svelte`

- **Issues**: XSS vulnerabilities (`{@html}` usage), missing keys in each blocks, `any` types

- **Priority**: High (Security and functionality)

- **Effort**: 4-6 hours

- **Dependencies**: Search system completion

**TASK 8X: Swipe Actions ESLint Cleanup**

- **File**: `src/lib/actions/swipe.ts`

- **Issues**: `any` types, unused parameters, unresolved navigation calls

- **Priority**: Medium (Interactive features)

- **Effort**: 2-3 hours

- **Dependencies**: Navigation system completion

**Demo Content Removal**

- **Files**: `src/data/demo/**`, `src/lib/components/demo/**`, `src/routes/demo/**`

- **Action**: Complete removal after migration to production content structure

- **Priority**: Medium (Cleanup)

- **Effort**: 1-2 hours

- **Dependencies**: Content migration completion (Task 9)

### Cleanup Strategy

1. **Immediate Actions** (Completed):
   - ✅ ESLint configured to ignore problematic components

   - ✅ Husky pre-commit optimization (removed slow tests)

   - ✅ Demo content excluded from linting

   - ✅ Test files cleaned of ESLint errors

2. **Future Integration**:
   - Technical debt items will be resolved as part of their respective TASK completion

   - Each TASK completion must include ESLint compliance verification

   - No new technical debt should be introduced

3. **Quality Gates**:
   - All TASK completions must pass `pnpm run lint` without errors

   - Security vulnerabilities must be resolved before production

   - Type safety (`any` types) must be eliminated

### Monitoring

- Technical debt tracked in each TASK's "Final Validations" section

- ESLint compliance required for TASK completion

- Regular debt review during milestone completions

---

**Last Updated:** September 23, 2025

**Project:** learn-cloud

**Branch:** feature/svelte

**Architecture:** Foundation-First SvelteKit 5 SPA Migration

**Approach:** Agent-based task execution with structured prompts

---

## Validation Criteria

- [ ] Tier 1: `make check-wip` passes (5-15s) - modified files only
- [ ] Tier 2: Unit tests pass - `pnpm run test src/test/...` (see TASK-EXISTING-1-tests.md)
- [ ] Tier 3: Full validation - `pnpm run format` && `pnpm run lint` && `pnpm run check`
- [ ] Mobile-first: Tested at ≤390px BEFORE desktop testing
- [ ] TypeScript: 0 errors, 0 warnings
- [ ] Accessibility: Focus management, keyboard navigation, ARIA attributes

## References

- **Implementation Guide:** @docs/SVELTE-COMPONENTS.md
- **Development Patterns:** @docs/SVELTE-DEVELOPMENT.md
- **Testing Guide:** @docs/TESTING.md

- **Architecture:** @docs/SVELTE-ARCHITECTURE.md
- **Styling:** @docs/SVELTE-STYLING.md

---

**Last Updated:** 2025-01-08
**Status:** Ready for implementation
