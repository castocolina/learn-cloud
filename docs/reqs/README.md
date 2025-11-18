# Requirements Engineering Guide

**Task decomposition, atomic requirement generation, and agile task management structure.**

---

## Overview

This directory contains structured requirements for development tasks in the cloud-native learning platform. Requirements are organized hierarchically to support atomic task execution, clear dependency management, and precise estimation.

**Philosophy**: Break large, complex requests into manageable atomic tasks that dev-jr developers can complete independently with minimal clarification.

---

## Directory Structure

```
docs/reqs/
├── README.md                              # This file - overview and guide
├── TEMPLATE.md                            # Task template with all sections
│
├── [plan-id]/                             # User requirement (e.g., "quiz-system", "search-implementation")
│   ├── README.md                          # Plan overview, timeline, dependencies
│   │
│   ├── 01-objective-name/                 # First objective/phase
│   │   ├── 01-task-name.md               # Atomic task (≤500 lines implementation+testing)
│   │   ├── 02-task-name.md               # Atomic task
│   │   └── 03-testing.md                 # Separated testing task (only if >500 lines total)
│   │
│   ├── 02-objective-name/                 # Second objective/phase
│   │   ├── 01-task-name.md
│   │   ├── 02-task-name.md
│   │   └── 03-testing.md
│   │
│   └── 03-objective-name/
│       ├── 01-task-name.md
│       └── 02-testing.md
│
└── [another-plan]/
    ├── README.md
    └── ...
```

### Naming Convention

- **Plan ID**: Descriptive, snake_case
  - ✅ `quiz-system`, `search-implementation`, `navigation-refactor`
  - ❌ `TASK-8`, `feature-x`, `do-this`

- **Objective**: Numbered sequentially with descriptive name
  - `01-data-model`, `02-component-rendering`, `03-integration`

- **Task File**: Numbered sequentially with descriptive name
  - `01-schema-definition.md`, `02-testing.md`

---

## Consolidation Strategy

### When to Consolidate

**CONSOLIDATE** implementation + testing in single file when:

- Total lines (implementation + testing) ≤ 500
- Single, clear objective
- Implementation and tests are tightly coupled
- Can be completed in one session (3-4 hours)

**Example: Consolidated Task**

```
docs/reqs/quiz-system/01-data-model/
└── 01-quiz-schema.md (350 lines total)
    - Objective: Define Quiz TypeScript schema
    - Implementation Details: Create schema file (120 lines)
    - Testing Requirements: Unit tests for validation (100 lines)
    - Acceptance Criteria: Both implementation and testing in one file
```

### When to Split

**SPLIT** testing into separate file when:

- Total lines (implementation + testing) > 500
- Testing is complex or warrants separate focus
- Multiple test scenarios (unit + E2E)
- Testing can be delegated to different developer

**Example: Split Task**

```
docs/reqs/quiz-system/02-renderer/
├── 01-quiz-component.md (400 lines)
│   - Objective: Implement Quiz component
│   - Implementation Details: Full component code
│   - Testing Requirements: (See 02-testing.md)
│
└── 02-testing.md (250 lines)
    - Objective: Comprehensive testing for Quiz component
    - Unit Test Suite: Vitest patterns
    - E2E Test Suite: Playwright patterns
```

### Rationale for Consolidation

1. **Better Context**: Developer sees implementation and tests together
2. **Fewer Files**: Easier navigation and management
3. **Clearer Scope**: Single file = single objective
4. **Faster Review**: Less context switching for reviewers

---

## How to Create Requirements

### Step 1: Analyze Complexity

Evaluate the task to determine if it needs decomposition:

```typescript
interface TaskAnalysis {
	estimatedLines: number; // Implementation + testing
	numberOfFiles: number; // Files to modify/create
	numberOfDependencies: number; // Tasks that must complete first
	acceptanceCriteria: number; // Number of criteria
	estimatedHours: number; // Dev time required
	descriptionConjunctions: number; // Count of " and " in description
}

function isAtomic(analysis: TaskAnalysis): boolean {
	return (
		analysis.estimatedLines <= 500 &&
		analysis.numberOfFiles <= 3 &&
		analysis.acceptanceCriteria <= 5 &&
		analysis.estimatedHours <= 4 &&
		analysis.descriptionConjunctions <= 1 &&
		analysis.numberOfDependencies <= 2
	);
}
```

**If atomic**: Create single task file
**If complex**: Proceed to Step 2

### Step 2: Decompose Into Objectives

Break large task into phases:

```
Large Task: "Implement quiz system with navigation, progress tracking, and results"

Objectives:
1. 01-data-model - Quiz schema and data structures
2. 02-renderer - Quiz component and content rendering
3. 03-navigation - Quiz navigation (previous/next)
4. 04-progress - Progress tracking and state management
5. 05-results - Results display and scoring
```

### Step 3: Create Atomic Tasks

For each objective, define 1-3 atomic tasks:

```
01-data-model/
├── 01-quiz-schema.md (consolidate: ~350 lines)
│   Implementation: Quiz interface, validation (150 lines)
│   Testing: Unit tests (100 lines)
│   Total: 250 lines → CONSOLIDATE ✅

02-renderer/
├── 01-quiz-component.md (implementation: 400 lines)
├── 02-testing.md (testing: 250 lines)
│   Total: 650 lines → SPLIT ✅ (exceeds 500)

03-navigation/
└── 01-navigation.md (consolidate: ~300 lines)
   Implementation: Navigation logic (120 lines)
   Testing: Unit + E2E (80 lines)
   Total: 200 lines → CONSOLIDATE ✅
```

### Step 4: Use Template

Copy [TEMPLATE.md](./TEMPLATE.md) for each task file and complete all sections:

1. **Objective** - Single-sentence goal
2. **Context & Background** - Why this matters
3. **Dependencies** - Requires/blocks/related
4. **Deliverables** - Files to create/modify
5. **Scope** - In/out boundaries
6. **Implementation Details** - What to build, patterns, references
7. **Acceptance Criteria** - Given/When/Then format
8. **Testing Requirements** - Unit + E2E (consolidated if ≤500 lines)
9. **Estimation** - T-shirt size, hours, complexity (1-10)
10. **Technical Notes** - Implementation hints, pitfalls
11. **Validation Criteria** - Tier 1/2/3 checks
12. **References** - Related docs, examples

### Step 5: Create Plan Overview

For each plan, create a `README.md` with:

```markdown
# Quiz System - Plan Overview

## Objective

Implement comprehensive interactive quiz system with progress tracking and results.

## Timeline

- Phase 1 (Data Model): 4 hours
- Phase 2 (Renderer): 8 hours
- Phase 3 (Navigation): 6 hours
- Phase 4 (Progress): 4 hours
- Phase 5 (Results): 4 hours
  **Total: ~26 hours**

## Phases

1. **01-data-model** - Quiz schema definition
   - Task: 01-quiz-schema.md
   - Effort: 4h, Complexity: 3/10

2. **02-renderer** - Quiz component implementation
   - Tasks: 01-quiz-component.md, 02-testing.md
   - Effort: 8h, Complexity: 6/10

...

## Dependency Graph
```

01-data-model
↓
02-renderer
↓
03-navigation + 04-progress (parallel)
↓
05-results

```

## Success Criteria

- [ ] All atomic tasks complete
- [ ] All validation gates pass (Tier 1/2/3)
- [ ] Mobile-first testing verified (≤390px)
- [ ] Documentation updated
```

---

## Atomicity Criteria

Each task MUST satisfy ALL criteria:

### 1. Single Objective

- ❌ "Implement component AND add tests AND update docs"
- ✅ "Implement Dialog component" (tests/docs in same file if consolidated)

### 2. Clear Scope

- ❌ "Make navigation better"
- ✅ "Add keyboard navigation to Dialog component (Tab, Enter, Escape)"

### 3. Measurable Outcomes

- ❌ "Complete the feature"
- ✅ "Create Dialog component with open/close functionality, all acceptance criteria passing"

### 4. Minimal Clarification

- ✅ Dev-jr can start without asking (≤2 clarifications max)
- ❌ "Implement navigation" (needs: which components? which patterns? mobile requirements?)

### 5. Estimable

- ✅ "Add TypeScript validation to Quiz component (~2 hours, S)"
- ❌ "Implement quiz system" (too large, vague)

### 6. Testable

- ✅ "Dialog opens when trigger button clicked (E2E test verifies)"
- ❌ "Dialog looks good" (subjective, not testable)

### 7. Minimal Dependencies

- ✅ "Depends on: 01-quiz-schema.md"
- ❌ "Depends on: 5 other tasks, some unfinished"

---

## Developer-Junior Friendly Criteria

Each task must satisfy:

- ✅ **Clear objective** - No ambiguity what needs doing
- ✅ **Complete context** - All background information provided
- ✅ **Specific scope** - In/out boundaries clearly defined
- ✅ **Measurable** - Acceptance criteria are testable
- ✅ **Self-contained** - Minimal questions needed
- ✅ **Estimated** - T-shirt sizing + hours + complexity
- ✅ **Referenced** - Links to patterns, examples, docs

**Anti-pattern**: Tasks requiring "constant Slack messages every 5 minutes"

---

## Template Usage

### Quick Start

1. Copy `TEMPLATE.md`
2. Rename to descriptive filename (e.g., `01-dialog-component.md`)
3. Fill sections 1-3 (Objective, Context, Dependencies)
4. Estimate complexity (Section 9)
5. Define scope (Section 5)
6. Detail implementation (Section 6)
7. Write acceptance criteria (Section 7)
8. Specify testing (Section 8)
9. Fill technical notes (Section 10)
10. List references (Section 12)
11. Set validation criteria (Section 11)

### Example Task

See [TEMPLATE.md](./TEMPLATE.md) for complete example or:

- **Real Example**: `docs/todo/TASK-8L-navigation-coordinator.md`
- **Real Testing Example**: `docs/todo/TASK-8L-tests.md`

---

## Task States

```
draft (requirements-engineer creating)
    ↓
ready (all fields complete, estimable)
    ↓
in-progress (developer assigned, work started)
    ↓
blocked (waiting on dependency, needs clarification)
    ↓
testing (implementation complete, tests running)
    ↓
review (validation, peer review)
    ↓
complete (merged, task done)
```

---

## Best Practices

### DO

- ✅ Create one task per objective
- ✅ Consolidate if ≤500 lines total
- ✅ Split testing if >500 lines
- ✅ Reference specific documentation
- ✅ Include code examples
- ✅ Provide acceptance criteria in Given/When/Then format
- ✅ Update timestamps when modified
- ✅ Link to related tasks

### DON'T

- ❌ Create mega-tasks (>500 lines)
- ❌ Combine unrelated objectives
- ❌ Forget to define scope
- ❌ Skip acceptance criteria
- ❌ Leave estimation vague
- ❌ Reference non-existent files
- ❌ Create hardcoded step-by-step instructions
- ❌ Assume context the dev doesn't have

---

## Examples

### Simple Consolidated Task

**File**: `docs/reqs/buttons/01-styling/01-primary-button.md`

```markdown
# Primary Button Component

## Objective

Implement a primary button component with Tailwind styling and TypeScript props interface.

## Context & Background

Buttons are fundamental UI elements used throughout the platform. This task establishes the primary button pattern that other button variants extend.

## Dependencies

- Requires: Tailwind CSS v4 configured
- Blocks: Secondary button (variant), Icon button (extension)

## Deliverables

- [ ] src/lib/components/Button.svelte
- [ ] src/test/unit/Button.test.ts (consolidated testing)
- [ ] TypeScript compliance (0 errors)
- [ ] Mobile-first tested (≤390px)

## Scope

- **In**: Primary button styling, props interface, click handling
- **Out**: Secondary variants (future task), accessibility (basic only)

## Implementation Details

### Agent Responsibility

Create a Button component that...

### Technical Documents to Review

- docs/SVELTE-COMPONENTS.md
- docs/SVELTE-STYLING.md

... rest of sections ...

**Total Estimated Lines**: ~280 (implementation + testing consolidated) ✅ CONSOLIDATE

**Last Updated:** 2025-01-17
```

---

## Related Documentation

- **[Template](./TEMPLATE.md)** - Full task template with all sections
- **[Requirements Engineer Agent](../agents/requirements-engineer.md)** - Automatic decomposition
- **[Task Examples](../todo/)** - Real-world completed tasks
- **[Agent Architecture](../agents/README.md)** - How requirements flow through agents

---

## Migration Notes

### From TASK-N Format

Old TASK format:

```
docs/todo/TASK-8L-navigation-coordinator.md
```

Maps to new structure:

```
docs/reqs/[plan]/[objective]/[task].md

Example:
docs/reqs/navigation-system/01-navigation/01-coordinator.md
```

All existing TASK files remain in `docs/todo/` for historical reference. New requirements use `docs/reqs/` structure.

---

**Last Updated:** 2025-01-17
