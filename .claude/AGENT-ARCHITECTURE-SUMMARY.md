# Agent Architecture Summary

**Created**: 2025-01-17
**Status**: Phase 4 Complete - Executable Agent Architecture

---

## Architecture Overview

The project now has a complete modular agent architecture with:

- **6 Skills** (auto-discovered validation capabilities)
- **10 Subagents** (complex reasoning with separate context)
- **8 Hooks** (event-triggered automation)
- **5 MCPs** (external system integration)

---

## 📁 Directory Structure

```
.claude/
├── agents/                           # Subagents (10 total)
│   ├── content-creator.md            # Educational content creation (EE01)
│   ├── frontend-architect.md         # SvelteKit architecture (AF02)
│   ├── ux-consultant.md              # UX/accessibility design (UX03)
│   ├── devops-engineer.md            # Large-scale operations (DO06)
│   ├── issue-debugger.md             # Debug & fix issues (VD04)
│   ├── validation-orchestrator.md    # 3-tier validation (QA05 partial)
│   ├── test-generator.md             # Test creation (QA05 partial)
│   ├── requirements-architect.md     # Requirements decomposition
│   ├── doc-validator.md              # Documentation sync
│   └── code-refactor.md              # AST-based refactoring
├── skills/                           # Skills (6 total)
│   ├── mermaid-validator/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   │   ├── validate-diagram.ts
│   │   │   ├── best-practices-check.ts
│   │   │   └── mobile-optimizer.ts
│   │   ├── reference.md
│   │   └── tsconfig.json
│   ├── test-validator/
│   │   ├── SKILL.md
│   │   ├── scripts/check-patterns.ts
│   │   ├── reference.md
│   │   └── tsconfig.json
│   ├── content-validator/
│   │   ├── SKILL.md
│   │   ├── scripts/validate-content.ts
│   │   ├── reference.md
│   │   └── tsconfig.json
│   ├── component-validator/
│   │   ├── SKILL.md
│   │   ├── scripts/check-component.ts
│   │   ├── reference.md
│   │   └── tsconfig.json
│   ├── code-validator/
│   │   ├── SKILL.md
│   │   ├── scripts/check-quality.ts
│   │   ├── reference.md
│   │   └── tsconfig.json
│   └── security-auditor/
│       ├── SKILL.md
│       ├── scripts/
│       │   ├── check-dependencies.ts
│       │   ├── check-code-patterns.ts
│       │   └── check-auth.ts
│       ├── reference.md
│       └── tsconfig.json
├── hooks/                            # Hooks (8 total)
│   ├── session-start.cjs
│   ├── pre-write-protection.cjs
│   ├── post-edit-format.cjs
│   ├── post-edit-svelte-check.cjs
│   ├── post-edit-json-check.cjs
│   ├── post-edit-ts-quick.cjs
│   ├── post-edit-bash-syntax.cjs
│   └── pre-commit-gate.cjs
├── commands/                         # Slash commands
│   ├── strategist.md                 # Strategic facilitator (refactored)
│   └── planc.md                      # Plan mode command
└── settings.local.json               # Local permissions

.mcp.json                       # MCPs (svelte, filesystem, memory, npm-helper, sequential-thinking)
```

---

## 🎯 Skills (Auto-Discovered Validators)

### 1. mermaid-validator

**Triggers**: `mermaid diagram`, `diagram syntax`, `validate diagram`
**Capabilities**:

- mmdc syntax validation (~95% accuracy)
- Best practices (double quotes, escaping, brackets)
- Mobile optimization (LR layout for ≤390px)
- TypeScript integration (diagram/definition properties)

**Scripts**:

- `validate-diagram.ts` - Main validation with mmdc
- `best-practices-check.ts` - 5 best practices
- `mobile-optimizer.ts` - Layout validation

**Usage**:

```bash
tsx .claude/skills/mermaid-validator/scripts/validate-diagram.ts docs/agents/README.md
```

---

### 2. test-validator

**Triggers**: `test quality`, `validate tests`, `test patterns`
**Capabilities**:

- TestSetup pattern enforcement
- generateConfigId() usage
- cleanupIfPassed() timing
- NO waitForTimeout() in E2E
- Wait-utilities validation
- Coverage ≥90%
- Correct environment (jsdom vs node)

**Scripts**:

- `check-patterns.ts` - 7 validation patterns

**Usage**:

```bash
tsx .claude/skills/test-validator/scripts/check-patterns.ts src/test/
```

---

### 3. content-validator

**Triggers**: `validate content`, `content quality`, `educational content`
**Capabilities**:

- TypeScript interface compliance
- Status lifecycle (scaffold → draft → final)
- Interactive standards (quiz: 5q/80%, study guide: ≥8 flashcards)
- Educational quality (specific objectives, secure code)
- Metadata completeness

**Scripts**:

- `validate-content.ts` - Content validation

**Usage**:

```bash
tsx .claude/skills/content-validator/scripts/validate-content.ts src/data/
```

---

### 4. component-validator

**Triggers**: `component integration`, `validate component`, `svelte component`
**Capabilities**:

- Showcase vs production consistency
- Props interface completeness
- Theme compliance (CSS variables)
- Mobile-first (≤390px)
- Accessibility (WCAG 2.1 AA)

**Scripts**:

- `check-component.ts` - Component validation

**Usage**:

```bash
tsx .claude/skills/component-validator/scripts/check-component.ts src/lib/components/
```

---

### 5. code-validator

**Triggers**: `code quality`, `unused code`, `complexity check`
**Capabilities**:

- AST-based unused variable detection
- Code complexity analysis (eslintcc)
- Code duplication detection (jscpd)
- TypeScript compilation check

**Scripts**:

- `check-quality.ts` - Code quality analysis

**Usage**:

```bash
tsx .claude/skills/code-validator/scripts/check-quality.ts src/
```

---

### 6. security-auditor

**Triggers**: `security audit`, `vulnerability scan`, `dependency check`, `XSS detection`, `secret detection`
**Capabilities**:

- Dependency vulnerability scanning (npm audit, CVEs)
- Code pattern security (XSS, SQL injection, hardcoded secrets)
- Authentication/authorization validation (bcrypt, JWT, session security)
- OWASP Top 10 compliance verification

**Scripts**:

- `check-dependencies.ts` - npm audit + license check
- `check-code-patterns.ts` - XSS, injection, weak crypto detection
- `check-auth.ts` - Authentication/authorization security

**Usage**:

```bash
tsx .claude/skills/security-auditor/scripts/check-dependencies.ts
tsx .claude/skills/security-auditor/scripts/check-code-patterns.ts src/
tsx .claude/skills/security-auditor/scripts/check-auth.ts src/
```

---

## 🤖 Subagents (Separate Context)

### 1. validation-enforcer

**Auto-triggers**: After file modifications, before task completion
**Responsibility**: 3-tier validation (check-wip → tests → full)
**Blocking**: Prevents completion on failures

### 2. test-architect

**Auto-triggers**: When features lack tests, visual changes
**Responsibility**: Generate unit + E2E tests
**Hands off to**: test-quality-auditor for validation

### 3. requirements-engineer

**Auto-triggers**: Complex requests (≥3 atomic tasks)
**Responsibility**: Task decomposition, requirements docs
**Output**: `docs/reqs/[plan]/[objective]/[task].md`

### 4. doc-sync-specialist

**Auto-triggers**: Code changes affecting docs
**Responsibility**: Documentation synchronization, cross-references
**Dynamic discovery**: NO hardcoded doc lists

### 5. ts-refactor-master

**Manual only**: User says "refactor", "rename", "restructure"
**Responsibility**: AST-based refactoring with ts-morph
**Safety**: Backups, validation, batch processing (≤50 files)

---

## 🪝 Hooks (Event Automation - JavaScript)

### 1. post-edit-format.js

**Event**: PostEdit, PostWrite
**Action**: Auto-format by file type (Prettier, shfmt)
**Performance**: ~15ms (10x faster than TypeScript)

### 2. pre-write-validation.js

**Event**: PreToolUse (Write, Edit)
**Action**: Block protected files (node_modules, .git, .env)
**Blocking**: Yes (process.exit(1))

### 3. session-start.js

**Event**: SessionStart
**Action**: Display project context, agent status
**Output**: Skills count, hooks count, key configuration

---

## 🔌 MCPs (External Integration)

### 1. svelte ⭐⭐⭐⭐⭐

**Provider**: @sveltejs/mcp (Official Svelte team)
**Usage**: Svelte 5 & SvelteKit documentation, code analysis, autofixer
**Capabilities**:

- `list-sections` - Navigate documentation
- `get-documentation` - Retrieve specific docs
- `svelte-autofixer` - Static code analysis & suggestions
- `playground-link` - Generate Svelte Playground links

### 2. filesystem ⭐⭐⭐

**Provider**: @modelcontextprotocol/server-filesystem (Official Anthropic)
**Usage**: Secure file operations, directory monitoring
**Scope**: `.` (current project directory)

### 3. memory ⭐⭐⭐⭐⭐

**Provider**: @modelcontextprotocol/server-memory (Official Anthropic)
**Usage**: Knowledge graph for tracking student progress, educational resources
**Capabilities**: Entities, relations, observations for persistent memory

### 4. npm-helper ⭐⭐⭐

**Provider**: @pinkpixel/npm-helper-mcp (Community)
**Usage**: npm package search, dependency updates, maintenance status
**Capabilities**: Search registry, check outdated deps, package metadata

### 5. sequential-thinking ⭐⭐⭐

**Provider**: @modelcontextprotocol/server-sequential-thinking (Official Anthropic)
**Usage**: Dynamic problem-solving through thought sequences
**Capabilities**: Step-by-step complex problem resolution

---

## 🔄 Collaboration Graph

```
User Request
    │
    ├─ Complex (≥3 tasks) → requirements-architect (subagent)
    │
    ├─ Implementation changes files → Hooks
    │   ├─ post-edit-format.cjs (auto-format)
    │   ├─ post-edit-svelte-check.cjs (component-validator)
    │   ├─ post-edit-json-check.cjs (content-validator)
    │   └─ post-edit-ts-quick.cjs (quick TypeScript check)
    │
    ├─ Mermaid diagram → mermaid-validator (skill)
    │
    ├─ Tests generated → test-generator (subagent)
    │   └─ test-validator (skill) validates
    │
    ├─ Content modified → content-validator (skill)
    │
    ├─ Component created → component-validator (skill)
    │
    ├─ Security audit needed → security-auditor (skill)
    │
    ├─ Code changes docs → doc-validator (subagent)
    │
    └─ Before completion → validation-orchestrator (subagent)
        ├─ Tier 1: make check-wip (includes security-auditor)
        ├─ Tier 2: pnpm test
        └─ Tier 3: format + lint + check
```

---

## ✅ Testing Instructions

### Test Skills Directly

```bash
# Mermaid validator
tsx .claude/skills/mermaid-validator/scripts/validate-diagram.ts docs/agents/README.md

# Test validator
tsx .claude/skills/test-validator/scripts/check-patterns.ts src/test/

# Content validator
tsx .claude/skills/content-validator/scripts/validate-content.ts src/data/

# Component validator
tsx .claude/skills/component-validator/scripts/check-component.ts src/lib/components/

# Code validator
tsx .claude/skills/code-validator/scripts/check-quality.ts src/

# Security auditor
tsx .claude/skills/security-auditor/scripts/check-dependencies.ts
tsx .claude/skills/security-auditor/scripts/check-code-patterns.ts src/
tsx .claude/skills/security-auditor/scripts/check-auth.ts src/
```

### Test Skills in Claude Code

```
# Should auto-activate skills
User: "Validate Mermaid diagrams in docs/agents/README.md"
User: "Check test quality in src/test/"
User: "Validate content in src/data/"
User: "Check component integration in src/lib/components/"
User: "Audit security vulnerabilities in dependencies"
User: "Check for XSS vulnerabilities in src/"
```

### Test Hooks

Hooks execute automatically on events (PostEdit, PreToolUse, SessionStart)

### Test MCPs

```
User: "Check npm package @modelcontextprotocol/server-npm info"
User: "Analyze GitHub repository activity"
```

---

## 🚀 Architecture Complete

✅ **strategist.md** - Refactored to facilitator with semantic discovery
✅ **6 skills** - All validation capabilities implemented (including security-auditor)
✅ **10 agents** - Complete coverage of original vision
✅ **8 hooks** - Granular validation + pre-commit gate

---

**Last Updated**: 2025-01-18
