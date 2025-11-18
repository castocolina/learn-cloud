## Content Guardian - Reference Documentation

### Standards and Guidelines

- **[CONTENT-STANDARDS.md](../../../docs/standards/CONTENT-STANDARDS.md)** - Complete content creation standards
- **[Content Types](../../../src/lib/types/content.ts)** - TypeScript content interfaces
- **[Types System](../../../src/lib/types/types.ts)** - Base types and utilities

### 5 Validation Categories

#### 1. TypeScript Interface Compliance

- Use unified imports: `from "$types"` (NOT `from "$lib/types/types.js"`)
- Implement proper interfaces: LessonContent, QuizContent, StudyGuideContent
- Required fields: title, summary, status, id, unitId, chapterNumber

#### 2. Content Status Lifecycle

**scaffold → draft → final**

**scaffold → draft**:

- No lorem ipsum / template content
- Educational value present
- Real learning objectives

**draft → final**:

- Specific, measurable learning objectives
- Prerequisites defined
- Lessons have ≥3 sections
- Secure code examples
- Realistic estimated time

#### 3. Interactive Component Standards

**Quiz** (blocking for final):

- Exactly 5 questions
- Passing score: 80%
- All questions have correct answers

**Study Guide** (blocking for final):

- Minimum 8 flashcards
- Front/back content complete
- Clear concept definitions

**Code Completion**:

- Exactly 5 underscores per blank: `_____`
- Solution provided
- Tests key concepts

#### 4. Educational Quality

**Learning Objectives**:

```typescript
// ❌ Vague
"Understand Docker";

// ✅ Specific and measurable
"Build multi-stage Dockerfiles reducing image size by 70%";
```

**Code Security**:

```typescript
// ❌ Insecure
const apiKey = "sk-1234567890";

// ✅ Secure
const apiKey = process.env.API_KEY;
```

#### 5. Metadata Completeness

- estimatedMinutes (5-45 for lessons)
- lastModified timestamp
- Tags and difficulty level
- Prerequisites array

### Validation Script

#### validate-content.ts

Main validation script for all content categories.

**Usage**:

```bash
# Single file
node scripts/validate-content.ts src/data/book/unit1/lesson.ts

# Directory
node scripts/validate-content.ts src/data/
```

**Exit codes**:

- 0: All checks passed
- 1: Blocking issues found (status=final only)

### Blocking Levels

| Status   | Blocking Behavior               |
| -------- | ------------------------------- |
| scaffold | No blocking (development phase) |
| draft    | No blocking (warnings logged)   |
| final    | Blocking (must pass all checks) |

### Integration

Works with:

- **mermaid-validator** - Validates diagram blocks in lesson content
- **validation-enforcer** - Content validation in tier 2/3
- **doc-sync-specialist** - Updates content standards docs

### Success Criteria

- ✅ All content uses unified TypeScript interfaces
- ✅ Content follows lifecycle (scaffold → draft → final)
- ✅ Quizzes: 5 questions, 80% passing
- ✅ Study guides: ≥8 flashcards
- ✅ Code completion: exactly 5 underscores
- ✅ Learning objectives: specific and measurable
- ✅ Code examples: secure-by-default
- ✅ No template content in draft/final
