---
description: Validate educational content quality and TypeScript interface compliance enforcing content status lifecycle (scaffold → draft → final), interactive standards (quizzes 5q/80%, study guides ≥8 flashcards, code completion 5 underscores), measurable learning objectives, and secure code examples per CONTENT-STANDARDS.md
allowed-tools: [Read, Grep, Bash]
triggers:
  - "validate content"
  - "content quality"
  - "educational content"
  - "lesson content"
  - "quiz content"
  - "study guide"
---

# Content Guardian Skill

Validates educational content quality and compliance by enforcing TypeScript interface structure, content status lifecycle, interactive component standards, and educational quality requirements from CONTENT-STANDARDS.md.

## Capabilities

### 1. TypeScript Interface Compliance

**Validates**: All content implements proper TypeScript interfaces from unified type system.

**Checks**:

- ✅ Imports from `$types` or `$lib/types` (NOT direct file imports)
- ✅ Required fields present (title, summary, status, id, etc.)
- ✅ Type matches interface (LessonContent has sections, QuizContent has quiz)
- ❌ No direct imports: `from "$lib/types/types.js"`

**Interfaces enforced**:

- `BaseContent` - title, summary, status, id, unitId, chapterNumber, metadata
- `LessonContent extends BaseContent` - sections, prerequisites, learningObjectives, assessment
- `QuizContent extends BaseContent` - quiz, configuration
- `StudyGuideContent extends BaseContent` - studyGuide, interactiveElements

### 2. Content Status Lifecycle

**Validates**: Content progresses through scaffold → draft → final with proper quality gates.

**Status transitions**:

1. **scaffold → draft**:
   - ✅ No lorem ipsum / template content
   - ✅ Educational value present
   - ✅ Real learning objectives

2. **draft → final**:
   - ✅ Learning objectives defined (specific, measurable)
   - ✅ Prerequisites specified
   - ✅ Lessons have ≥3 sections
   - ✅ Code examples are secure-by-default
   - ✅ Estimated time is realistic
   - ✅ Interactive components meet standards

**Blocking level**:

- **Draft**: Non-blocking (warnings only)
- **Final**: Blocking (must pass all validation)

### 3. Interactive Component Standards

**Validates**: Quizzes, study guides, and code completion meet quality standards.

#### Quiz Standards

- ✅ Exactly 5 questions
- ✅ Passing score: 80%
- ✅ All questions have correct answers
- ✅ Distractors are plausible
- ✅ No ambiguous wording

#### Study Guide Standards

- ✅ Minimum 8 flashcards
- ✅ Front/back content present
- ✅ Concepts well-defined
- ✅ Examples provided

#### Code Completion Standards

- ✅ Exactly 5 underscores per blank (`_____`)
- ✅ Blanks test key concepts
- ✅ Solution provided
- ✅ Hints available

### 4. Educational Quality Requirements

**Validates**: Content meets pedagogical standards.

**Checks**:

- ✅ Learning objectives are specific and measurable
- ✅ Prerequisites clearly stated
- ✅ Content builds progressively
- ✅ Examples are production-ready
- ✅ Code is secure-by-default
- ✅ Cloud-native best practices followed

**Anti-patterns detected**:

```typescript
// ❌ Vague learning objective
learningObjectives: ["Understand containers"];

// ✅ Specific and measurable
learningObjectives: [
	"Build multi-stage Dockerfiles reducing image size by 70%",
	"Implement health checks for container orchestration"
];

// ❌ Insecure code example
const password = "admin123"; // Hardcoded!

// ✅ Secure-by-default
const password = process.env.DB_PASSWORD; // From environment
```

### 5. Metadata Validation

**Validates**: Content metadata is complete and accurate.

**Checks**:

- ✅ Estimated time is realistic (5-45 minutes for lessons)
- ✅ Tags are relevant
- ✅ Difficulty level matches content
- ✅ Last modified timestamp present
- ✅ Author/contributor info (if applicable)

## Auto-Trigger Conditions

This skill activates when:

- Creating/modifying content in `src/data/`
- Content status changes (scaffold → draft → final)
- Before content publication (draft → final transition)
- Adding new lesson/quiz/study guide content
- Manual invocation: `/validate-content [file-path]`

## Validation Report Format

When issues found, provides actionable fixes:

```markdown
## Content Validation Report

### File: src/data/book/unit1/chapter1/lesson.ts

#### TypeScript Interface (HIGH)

- Invalid import path
  Found: from "$lib/types/types.js"
  Fix: Use from "$types" for unified imports

- Missing required field
  Field: learningObjectives
  Fix: Add learningObjectives: string[]

#### Status Lifecycle (BLOCKING for final)

- Template content detected
  Found: "Lorem ipsum dolor sit amet"
  Fix: Replace with real educational content

#### Interactive Standards (BLOCKING for final)

- Quiz question count incorrect
  Found: 3 questions
  Required: Exactly 5 questions
  Fix: Add 2 more questions

#### Educational Quality (HIGH)

- Vague learning objective
  Found: "Understand Docker"
  Fix: Make specific and measurable: "Build multi-stage Dockerfiles..."

- Insecure code example
  Found: Hardcoded credentials on line 42
  Fix: Use environment variables or secrets management

### Summary

- ❌ 2 Interface violations (HIGH)
- ❌ 1 Lifecycle violation (BLOCKING)
- ❌ 1 Interactive standard violation (BLOCKING)
- ⚠️ 2 Educational quality issues (HIGH)
- Status: draft ✓ (non-blocking)
- Final status: BLOCKED until violations fixed
```

## Integration

Works with:

- **mermaid-validator** - Validates diagram blocks in lesson content
- **validation-enforcer** - Content validation in tier 2/3
- **doc-sync-specialist** - Updates content standards documentation

## Success Criteria

1. ✅ All content uses unified TypeScript interfaces
2. ✅ All content follows status lifecycle (scaffold → draft → final)
3. ✅ Quizzes have exactly 5 questions with 80% passing score
4. ✅ Study guides have ≥8 flashcards
5. ✅ Code completion blanks use exactly 5 underscores
6. ✅ Learning objectives are specific and measurable
7. ✅ Code examples are secure-by-default
8. ✅ No template content in draft/final status

## References

- [CONTENT-STANDARDS.md](../../../docs/standards/CONTENT-STANDARDS.md) - Complete content standards
- [Types](../../../src/lib/types/content.ts) - TypeScript content interfaces
- [Content Guardian Agent Spec](../../../docs/agents/content-guardian.md) - Detailed validation rules
