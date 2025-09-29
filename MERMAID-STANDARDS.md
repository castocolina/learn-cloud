# Mermaid Diagram Standards

**🚨 CRITICAL**: Follow these rules exactly to prevent Mermaid rendering failures in all components and content generation.

> **📚 Related Documentation:**
>
> - [CLAUDE.md](CLAUDE.md) - Complete agent implementation guidelines
> - [CONTENT-STANDARDS.md](CONTENT-STANDARDS.md) - Content creation workflows and educational guidelines
> - [SVELTEKIT-GUIDE.md](SVELTEKIT-GUIDE.md) - Technical architecture standards

> **🎯 Content Creators**: For educational context, accessibility guidelines, and content integration workflows, see [CONTENT-STANDARDS.md - Mermaid Diagrams](CONTENT-STANDARDS.md#mermaid-diagrams).

---

## MERMAID SYNTAX BEST PRACTICES

> **📋 Note on Validation**: These are **best practices for better user experience** rather than mandatory validation rules. The Content Creator validates Mermaid diagrams using **mmdc** (Mermaid CLI) for server-side validation - if it passes that validation, the diagram is functionally correct. **mmdc** provides ~95%+ accuracy compared to browser Mermaid.js rendering without requiring browser dependencies. These practices improve readability, mobile experience, and prevent common issues.

### Best Practice 1: Double Quote All Text

**Recommended: ALL text in nodes and links should be enclosed in double quotes.**

**Why**: This prevents parsing errors when combining special characters, brackets, parentheses, or other symbols. Most Mermaid rendering failures occur when text contains mixed brackets or special characters without proper quoting.

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

### Best Practice 2: Prefer Raw Special Characters in Text

**Recommended: Use raw special characters `<`, `>`, `&` in node and link text. Avoid HTML entities unless absolutely necessary.**

**Why**: Raw special characters produce clearer, more readable diagrams and are supported by the latest Mermaid renderer. HTML entities (`&lt;`, `&gt;`, `&amp;`) are often inserted by AI agents unnecessarily - use them only if you encounter specific rendering issues.

```mermaid
<!-- ✅ PREFERRED: Raw special characters -->
graph LR
    A["API Call <request>"] --> B["Process & Validate"]
    B --> C["Response <data>"]

<!-- ⚠️ LESS PREFERRED: HTML entities -->
graph LR
    A["API Call &lt;request&gt;"] --> B["Process &amp; Validate"]
    B --> C["Response &lt;data&gt;"]
```

> **Note:** Raw special characters produce clearer, more readable diagrams and are supported by the latest Mermaid renderer. Use HTML entities only if you encounter rendering issues in specific environments.

### Best Practice 3: Escape Special Characters

**Recommended: Escape quotes and symbols within text using backslashes.**

**Why**: Proper escaping prevents parsing errors when including quotes within quoted text.

```mermaid
<!-- ✅ CORRECT: Escaped quotes and symbols -->
graph TD
    A["Function: \"getName()\""] --> B["Return: \"User Name\""]

<!-- ❌ INCORRECT: Unescaped quotes break parsing -->
graph TD
    A["Function: "getName()""] --> B["Return: "User Name""]
```

### Best Practice 4: Consistent Node Shape Syntax

**Recommended: Use consistent bracket syntax for different node shapes.**

**Why**: Consistent syntax improves diagram readability and prevents parsing errors from mismatched brackets.

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
    B("Round Edge Node"     <!-- Missing closing bracket -->
    C{Diamond Node}         <!-- Missing closing quote -->
```

### Best Practice 5: Link Text Format

**Recommended: All link text should be enclosed in double quotes.**

**Why**: Consistent quoting of link text prevents parsing errors and improves diagram reliability.

```mermaid
<!-- ✅ CORRECT: Proper link text syntax -->
graph LR
    A["Start"] -->|"Process Data"| B["Middle"]
    B -.->|"Optional Flow"| C["End"]

<!-- ❌ INCORRECT: Missing quotes on link text -->
graph LR
    A["Start"] -->|Process Data| B["Middle"]
```

---

## COMPREHENSIVE DIAGRAM TYPES REFERENCE

### Supported Mermaid.js Diagram Types (v11.11.0)

This section provides a complete reference for all diagram types supported by the project's Mermaid.js version 11.11.0. Each entry includes the diagram name, purpose, and link to official syntax documentation.

**Core Diagram Types:**

1. **[Flowchart](https://mermaid.js.org/syntax/flowchart.html)** - Process flows, decision trees, and system workflows using nodes (geometric shapes) and edges (arrows or lines)

2. **[Sequence Diagram](https://mermaid.js.org/syntax/sequenceDiagram.html)** - Time-ordered interactions between participants showing how processes operate with one another

3. **[Class Diagram](https://mermaid.js.org/syntax/classDiagram.html)** - Static structure diagrams describing system classes, attributes, operations, and relationships among objects

4. **[State Diagram](https://mermaid.js.org/syntax/stateDiagram.html)** - State transitions and system behavior over time, modeling application states and lifecycles

5. **[Entity Relationship Diagram](https://mermaid.js.org/syntax/entityRelationshipDiagram.html)** - Database schema and entity relationships for data modeling and database design

6. **[User Journey](https://mermaid.js.org/syntax/userJourney.html)** - User experience flows with satisfaction scoring and touchpoint analysis

7. **[Gantt Chart](https://mermaid.js.org/syntax/gantt.html)** - Project scheduling and timeline visualization with tasks, dependencies, and milestones

8. **[Pie Chart](https://mermaid.js.org/syntax/pie.html)** - Data visualization for showing proportional relationships and percentages

9. **[Quadrant Chart](https://mermaid.js.org/syntax/quadrantChart.html)** - Strategic analysis tool for plotting items across two dimensions

10. **[Requirement Diagram](https://mermaid.js.org/syntax/requirementDiagram.html)** - Requirements engineering and traceability for system specifications

11. **[GitGraph Diagram](https://mermaid.js.org/syntax/gitgraph.html)** - Version control branching and merging strategies visualization

12. **[C4 Diagram](https://mermaid.js.org/syntax/c4.html)** ⚠️ - Software architecture visualization using the C4 model (use with caution)

13. **[Mindmap](https://mermaid.js.org/syntax/mindmap.html)** - Hierarchical information representation and brainstorming visualization

14. **[Timeline](https://mermaid.js.org/syntax/timeline.html)** - Chronological event sequencing and historical data representation

15. **[ZenUML](https://mermaid.js.org/syntax/zenuml.html)** - Enhanced sequence diagrams with additional UML notation support

**New Diagram Types (Latest Features):**

16. **[Sankey Diagram](https://mermaid.js.org/syntax/sankey.html)** 🔥 - Flow visualization showing quantity relationships between nodes

17. **[XY Chart](https://mermaid.js.org/syntax/xyChart.html)** 🔥 - Scatter plots and coordinate-based data visualization

18. **[Block Diagram](https://mermaid.js.org/syntax/block.html)** 🔥 - System architecture using interconnected blocks and components

19. **[Packet Diagram](https://mermaid.js.org/syntax/packet.html)** 🔥 - Network packet structure and protocol visualization

20. **[Kanban Board](https://mermaid.js.org/syntax/kanban.html)** 🔥 - Agile workflow visualization with columns and task tracking

21. **[Architecture Diagram](https://mermaid.js.org/syntax/architecture.html)** 🔥 - System architecture with services, groups, and connections

22. **[Radar Chart](https://mermaid.js.org/syntax/radar.html)** 🔥 - Multi-dimensional data comparison and skill assessment visualization

23. **[Treemap](https://mermaid.js.org/syntax/treemap.html)** 🔥 - Hierarchical data visualization using nested rectangles

### Usage Guidelines

**Selecting the Right Diagram Type:**

- **Process & Logic**: Use Flowcharts for decision trees and workflows
- **Interactions**: Use Sequence Diagrams for API calls and time-based processes
- **Structure**: Use Class Diagrams for object-oriented design and data modeling
- **States**: Use State Diagrams for application lifecycle and status transitions
- **Data Relationships**: Use ER Diagrams for database design
- **User Experience**: Use User Journey for customer experience mapping
- **Project Management**: Use Gantt Charts for project timelines
- **Proportional Data**: Use Pie Charts for percentage breakdowns
- **Version Control**: Use GitGraph for development workflows

**For Cloud-Native Applications:**

- **System Architecture**: Block Diagrams, Architecture Diagrams, or C4 Diagrams
- **Microservice Communication**: Sequence Diagrams or Architecture Diagrams
- **Data Flow**: Sankey Diagrams for complex data pipelines
- **Network Protocols**: Packet Diagrams for communication protocols
- **Development Workflow**: Kanban Boards and GitGraph Diagrams

---

## DIAGRAM TYPES AND LAYOUT STANDARDS

### Common Mermaid Diagram Types

Mermaid supports multiple diagram types, each optimized for different use cases:

**Flowcharts (`graph`)**

- **Purpose**: Process flows, decision trees, system workflows
- **Best for**: Business logic, algorithms, user journeys
- **Syntax**: `graph TD` or `graph LR`

**Sequence Diagrams (`sequenceDiagram`)**

- **Purpose**: Time-ordered interactions between participants
- **Best for**: API calls, user authentication flows, microservice communication
- **Syntax**: `sequenceDiagram`

**Class Diagrams (`classDiagram`)**

- **Purpose**: Object-oriented system structure and relationships
- **Best for**: Software architecture, domain modeling, inheritance patterns
- **Syntax**: `classDiagram`

**Entity Relationship Diagrams (`erDiagram`)**

- **Purpose**: Database schema and entity relationships
- **Best for**: Database design, data modeling, foreign key relationships
- **Syntax**: `erDiagram`

**State Diagrams (`stateDiagram-v2`)**

- **Purpose**: State transitions and system behavior over time
- **Best for**: Application states, user session management, order lifecycles
- **Syntax**: `stateDiagram-v2`

**Git Graphs (`gitgraph`)**

- **Purpose**: Version control branching and merging strategies
- **Best for**: Development workflows, release planning, branch visualization
- **Syntax**: `gitgraph`

**User Journey Maps (`journey`)**

- **Purpose**: User experience flows with satisfaction scoring
- **Best for**: Customer experience design, touchpoint analysis, service design
- **Syntax**: `journey`

### Layout Direction for Mobile Readability

**Best Practice: Prefer `graph LR` (Left to Right) for better mobile experience.**

**Why**: Left-to-right orientation encourages a linear, horizontal flow that reflows into a more manageable, vertically-scrollable format on narrow mobile screens (≤390px). This prevents horizontal scrolling, which significantly degrades mobile user experience.

```mermaid
<!-- ✅ PREFERRED: Left-to-right layout for mobile -->
graph LR
    A["Start Process"] --> B["Validate Input"]
    B --> C["Process Data"]
    C --> D["Return Result"]

<!-- ⚠️ LESS OPTIMAL: Top-down can cause horizontal scrolling -->
graph TD
    A["Start Process"] --> B["Validate Input"]
    B --> C["Process Data"]
    C --> D["Return Result"]
```

**When to use `graph TD`**: Use Top Down layout only when vertical hierarchy is essential to the diagram's meaning, such as organizational charts or layered architecture diagrams where the vertical relationship is semantically important.

---

## EXPAND FUNCTIONALITY REQUIREMENTS

**MANDATORY: All Mermaid components MUST include expand-to-modal functionality**

### Overview

Every Mermaid diagram component should provide an expand button in the top-right corner that opens the diagram in a full-screen modal dialog. This feature enhances accessibility by allowing users to view complex diagrams at larger sizes and improves the overall user experience.

### Implementation Requirements

1. **Expand Button**: Display an expand icon (using `lucide-svelte` Expand icon) in the top-right corner of the diagram container
2. **Modal Integration**: Use `shadcn-svelte` Dialog component for consistent styling and accessibility
3. **Configurable Size**: Modal should accept a `modalSize` prop (default: 95% of viewport)
4. **Conditional Display**: Expand button only shows when diagram renders successfully (hidden on errors)
5. **Responsive Design**: Modal and expand functionality must work across all screen sizes

### Component Props Interface

```typescript
interface Props {
	diagram: string;
	debug?: boolean;
	title?: string;
	className?: string;
	modalSize?: number; // NEW: Viewport percentage (default: 95)
	showExpandButton?: boolean; // NEW: Toggle expand functionality (default: true)
}
```

### Usage Examples

**Basic Usage with Expand (Default):**

```svelte
<MermaidDiagram diagram={diagramCode} title="System Architecture" />
```

**Custom Modal Size:**

```svelte
<MermaidDiagram diagram={diagramCode} title="Database Schema" modalSize={90} />
```

**Disable Expand Button:**

```svelte
<MermaidDiagram diagram={diagramCode} title="Simple Flow" showExpandButton={false} />
```

### Technical Implementation Details

- **Icon Library**: Use `lucide-svelte` Expand icon for consistency
- **Dialog Component**: Import and use `shadcn-svelte` Dialog components
- **Dual Rendering**: Component must render diagram both in container and modal (separate instances)
- **State Management**: Use Svelte 5 runes (`$state`) for modal open/close state
- **Error Handling**: Expand button hidden when diagram fails to render
- **Accessibility**: Proper ARIA labels and keyboard navigation support

### Styling Guidelines

- **Button Position**: Absolute positioned in top-right corner of diagram header
- **Button Styling**: Use consistent button styling from app.css modular architecture
- **Modal Content**: Full viewport coverage with configurable size constraints
- **Z-Index**: Follow global z-index hierarchy for proper layering

---

## COMPONENT DEBUG REQUIREMENTS

**✅ IMPLEMENTED: Debug capabilities are fully implemented in `MermaidDiagram` component**

The `MermaidDiagram` component (`src/lib/components/demo/MermaidDiagram.svelte`) includes comprehensive debug functionality:

### Implemented Debug Features

1. **✅ Debug Flag Support**: Accepts `debug` prop and checks URL parameter `?debug=true` and global settings
2. **✅ Error Logging**: Logs all rendering errors to console with full diagram source and context
3. **✅ Fallback Content**: Displays detailed error messages with diagram source and retry functionality
4. **✅ Copy & Retry Actions**: Debug mode includes copy diagram source and retry rendering buttons
5. **✅ Orphaned Element Cleanup**: Automatically cleans up DOM elements created during failed renders

### Debug Usage Examples

**Enable debug mode:**

```svelte
<!-- URL parameter approach (automatically detected) -->
Visit: /your-page?debug=true

<!-- Direct prop approach -->
<MermaidDiagram {diagram} debug={true} />

<!-- Global setting (configured in SETTINGS.ui.mermaid.debug) -->
<MermaidDiagram {diagram} />
```

**Debug features include:**

- Detailed error logging with diagram source
- Fallback UI with retry and copy functionality
- Automatic cleanup of failed render artifacts
- Visual error state with collapsible debug details

---

## DIAGRAM EMBEDDING BEST PRACTICES

### HTML Content

- **Preferred:** Embed Mermaid diagrams inside `<script type="text/plain">` tags. This allows raw special characters (`<`, `>`, `&`) and avoids HTML validation errors.

  Example:

  ```html
  <script type="text/plain">
  	graph LR
  	        A["API Call <request>"] --> B["Process & Validate"]
  	        B --> C["Response <data>"]
  </script>
  ```

- **Fallback:** Only use HTML entities (`&lt;`, `&gt;`, `&amp;`) if you cannot use a plain text block and encounter validation errors. This is rare and mostly for legacy content.

### TypeScript Data Sources

- Store Mermaid diagrams as raw strings in `.ts` files (no HTML entities needed).
- Use single or double quotes, and support multiline strings (template literals).
- Example:

  ```typescript
  export const diagramExample = {
  	type: "diagram",
  	diagramType: "mermaid",
  	definition: `graph LR\n    A["API Call <request>"] --> B["Process & Validate"]\n    B --> C["Response <data>"]`
  };
  ```

- Svelte components should handle rendering, error handling, and debug mode. No HTML entity encoding is needed in TypeScript sources.

---

## VALIDATING DIAGRAMS IN TYPESCRIPT

### Why Validation is Essential

Mermaid diagrams with syntax errors can break entire page renders, causing silent failures or rendering exceptions that impact user experience. Automated validation prevents these issues by catching syntax errors before deployment, ensuring all diagrams follow the mandatory syntax rules defined in this document.

### Recommended Technology: mmdc (Mermaid CLI)

**Rationale**: For server-side validation in SvelteKit/TypeScript projects, mmdc provides the optimal solution because:

- **No Browser Dependencies**: Works in Node.js/CLI environments without requiring DOM, Canvas, or other browser-specific APIs
- **High Accuracy**: Provides ~95%+ accuracy compared to browser Mermaid.js rendering
- **Standalone Executable**: Self-contained tool that doesn't require complex JavaScript environment setup
- **Production Reliability**: Ensures diagrams validated by mmdc will render correctly in browser Mermaid.js
- **CI/CD Integration**: Perfect for automated validation in build pipelines and pre-commit hooks

### Recommended Naming Convention

For consistency with Content Creator validation, use these property names for Mermaid diagrams:

```typescript
// ✅ RECOMMENDED: Standard property names
export const flowchartExample = {
	diagram: `graph LR...`
};

export const paymentFlow = {
	definition: `graph TD...`
};

export const systemArchitecture = {
	diagramDefinition: `graph LR...`
};
```

**Supported Property Names**: `diagram`, `definition`, or `diagramDefinition`

**Note**: These naming conventions help with consistency but are not strictly enforced. The Content Creator uses **mmdc** (Mermaid CLI) for server-side validation.

### Validation Script Implementation Steps

The recommended validation script should perform these operations:

1. **Input Handling**: Accept either a single file path or directory path as argument
2. **File Discovery**: If directory provided, recursively scan for `.ts` files; if file provided, validate single file
3. **TypeScript Parsing**: Use TypeScript compiler API to parse files into AST
4. **Pattern Detection**: Identify exported objects with required property names (`diagram`, `definition`, `diagramDefinition`)
5. **Diagram Extraction**: Extract string values from identified properties, handling template literals and concatenated strings
6. **mmdc Validation**: Pass each diagram string to mmdc (Mermaid CLI) for server-side validation
7. **Error Reporting**: For each validation failure, output:
   - **File path**: Relative path to the TypeScript file
   - **Variable name**: The exported variable/property containing the diagram
   - **Line number**: Where the diagram definition starts
   - **Parser error message**: Raw error from mmdc

**Example Output:**

```
❌ src/data/book/diagrams/auth-flow.ts:15 - Variable 'loginSequence.diagram'
   Error: Parse error on line 3: Expecting 'SOLID', 'SEMI', 'NEWLINE', 'EOF', got 'INVALID'

✅ src/data/book/diagrams/user-journey.ts:8 - Variable 'onboardingFlow.definition'
   Valid diagram parsed successfully
```

### Integration Points

- **Pre-commit Hook**: Run validation before code commits
- **Build Process**: Integrate into `pnpm run build` for deployment validation
- **CI/CD Pipeline**: Include in automated testing workflows
- **Development**: Provide `pnpm run validate-diagrams` command for manual validation

This validation strategy ensures diagram quality while maintaining consistency with the project's TypeScript-first architecture and existing development workflows.

---

## TESTING STANDARDS

### Required Tests

**1. Successful Rendering Tests**

```javascript
// Test valid diagram syntax renders correctly
test("renders valid mermaid diagram", async () => {
	const validDiagram = `graph TD
    A["Start"] --> B["Process"]
    B --> C["End"]`;

	// Test successful render
});
```

**2. Error Handling Tests**

```javascript
// Test malformed diagram shows fallback
test("handles malformed diagram with fallback", async () => {
	const invalidDiagram = `graph TD
    A[Invalid syntax without quotes]`;

	// Test error fallback displays
});
```

**3. Debug Mode Tests**

```javascript
// Test debug mode logs errors correctly
test("debug mode logs rendering errors", async () => {
	const consoleSpy = vi.spyOn(console, "error");

	// Test debug logging
	expect(consoleSpy).toHaveBeenCalledWith("Mermaid render failed:", expect.any(Object));
});
```

### Testing Commands

```bash
# Validate Mermaid syntax and error handling
pnpm run dev    # Check rendering in browser console
pnpm run test   # Run component tests including error scenarios
pnpm run check  # TypeScript validation
pnpm run lint   # Linting checks
```

---

## VALIDATION CHECKLIST

> **Note**: The validation script automatically verifies syntax compliance using Mermaid's parser. This checklist includes both automated checks (for reference) and manual validation requirements.

### Pre-Render Validation

Before implementing any Mermaid diagram, verify:

**Automated by validation script:**

- ✅ All node text enclosed in double quotes
- ✅ All link text enclosed in double quotes
- ✅ Proper bracket syntax for node shapes
- ✅ Escaped quotes within text using `\"`
- ✅ Valid Mermaid syntax per parser

**Manual validation required:**

- ✅ **Layout direction optimized for mobile** (`direction LR` preferred unless vertical hierarchy is semantically important)
- ✅ **Diagram type matches intended use case** (flowchart vs sequence vs class vs ER, etc.)
- ✅ **Content clarity**: Node labels are concise and descriptive
- ✅ **Logical flow**: Connections represent actual relationships/processes
- ✅ **Visual balance**: Diagram doesn't have too many nodes causing overcrowding
- ✅ **Raw special characters used** (prefer `<`, `>`, `&` over HTML entities)

### Component Integration Requirements

For all Mermaid components, ensure:

- ✅ Debug mode implemented in component
- ✅ Error handling and fallback content
- ✅ Console logging for debugging
- ✅ Tests for both success and failure scenarios
- ✅ Accessibility attributes (ARIA labels)
- ✅ Responsive design considerations
- ✅ **Expand functionality**: Modal dialog with configurable viewport size (default 95%)

### Content Standards Compliance

Before content generation:

- ✅ **Variable naming** follows required convention (`diagram`, `definition`, `diagramDefinition`)
- ✅ **Educational metadata** included (complexity, learning objectives, use cases)
- ✅ **Mobile-first approach**: Layout works well on narrow screens (≤390px)

---

## COMMON PATTERNS

### Cloud-Native Architecture Diagrams

```mermaid
graph LR
    subgraph "Client Layer"
        UI["Web UI"]
        Mobile["Mobile App"]
    end

    subgraph "API Gateway"
        Gateway["API Gateway"]
        LB["Load Balancer"]
    end

    subgraph "Microservices"
        Auth["Auth Service"]
        User["User Service"]
        Order["Order Service"]
    end

    UI --> Gateway
    Mobile --> Gateway
    Gateway --> LB
    LB --> Auth
    LB --> User
    LB --> Order
```

### Database Relationships

```mermaid
erDiagram
    USER ||--o{ ORDER : "places"
    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER_ITEM }o--|| PRODUCT : "references"
    PRODUCT }o--|| CATEGORY : "belongs_to"

    USER {
        int id PK
        string email UK
        string name
        datetime created_at
    }
```

### Development Workflows

```mermaid
gitgraph
    commit id: "Initial"
    branch feature
    checkout feature
    commit id: "Feature A"
    commit id: "Feature B"
    checkout main
    commit id: "Hotfix"
    merge feature
    commit id: "Release"
```

---

## ERROR PREVENTION CHECKLIST

### Before Content Generation

- [ ] Review syntax rules in this document
- [ ] Validate all text uses double quotes
- [ ] Check layout direction for mobile optimization
- [ ] Verify variable naming convention compliance
- [ ] Confirm diagram type matches use case

### Before Component Implementation

- [ ] Implement debug flag support
- [ ] Add error logging functionality
- [ ] Create fallback content for render failures
- [ ] Write comprehensive test cases
- [ ] Ensure mobile-responsive layout

### Before Deployment

- [ ] **Run automated validation**: `pnpm run validate-diagrams src/data/` to check syntax compliance
- [ ] **Test rendering in browser**: Verify diagrams render correctly with debug mode enabled
- [ ] **Mobile verification**: Test mobile rendering (≤390px width) for layout responsiveness
- [ ] **Console monitoring**: Check browser console for rendering errors or warnings
- [ ] **Accessibility compliance**: Validate ARIA labels and screen reader compatibility

---

**💡 Remember**: Mermaid rendering failures can break entire pages. Always follow these standards to ensure reliable diagram rendering across all components and content, with special attention to mobile user experience.
