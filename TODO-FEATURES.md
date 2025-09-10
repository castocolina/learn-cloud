# TODO-FEATURES: New Features and Content Improvements

This file contains new features and content improvements planned for the learn-cloud project.

---

## 🔧 Navigation Fix in Overview Pages

```markdown
## Text-Based Navigation Problem
**Scope:** Frontend navigation system bug fix
**Affected files:** `src/book/overview.html`, `src/book/*/unit*_overview.html`, `src/book/app.js`, `src/book/navigation.js`, `src/book/style.css`

**Identified problem:**
- Current system evaluates clicks based on component text instead of clear references to target file
- Causes problems on mobile where clicks lead to incorrect content (quiz → study aids, content from another topic)
- Lack of consistent identification by URL/ID/name/class
- Problem affects both main overview and individual unit overviews

**Specific tasks:**
1. Review **ALL** overview pages to identify problematic navigation patterns:
   - `src/book/overview.html` (main overview)
   - `src/book/unit1/unit1_overview.html`
   - `src/book/unit2/unit2_overview.html`
   - `src/book/unit3/unit3_overview.html`
   - `src/book/unit4/unit4_overview.html`
   - `src/book/unit5/unit5_overview.html`
   - `src/book/unit6/unit6_overview.html`
   - `src/book/unit7/unit7_overview.html`
   - `src/book/unit8/unit8_overview.html`
   - `src/book/unit9/unit9_overview.html`
2. Analyze JavaScript files (app.js, navigation.js) to understand current routing logic
3. Review CSS to identify text-based selectors that should be attribute-based
4. Establish clear rules for component identification:
   - Use `data-target` attributes for navigation destinations
   - Implement unique IDs for each navigable element
   - Use semantic CSS classes instead of text selection
5. Generate specific prompt for agent to fix navigation
6. Create development rules to avoid future regressions

**Main files to review:**
- `src/book/overview.html` (main navigation structure)
- `src/book/unit*/unit*_overview.html` (unit overviews)
- `src/book/app.js` (routing logic)
- `src/book/navigation.js` (navigation system)
- `src/book/style.css` (CSS selectors)

**Deliverables:**
- Navigation rules document
- Prompt for automatic correction
- Navigation refactoring plan
```

---

## 📚 Content Expansion: Test Coverage for Python and Go

```markdown
## Add Test Coverage to Python and Go Units
**Scope:** Educational content extension - CONTENT.md ONLY
**Affected files:** `CONTENT.md` (NO other files will be modified)

**Content to develop:**

### For Python Unit:
- **Test Coverage with unittest:** Basic configuration and usage
- **Test Coverage with pytest:** Installation, configuration and advanced use cases
- **Coverage tools:**
  - `coverage.py`: Installation, configuration and report generation
  - `pytest-cov`: Plugin for pytest with practical examples
  - Integration with IDE and CI/CD

### For Go Unit:
- **Test Coverage with go test:** Basic commands and coverage flags
- **Complementary tools:**
  - `go tool cover`: Detailed coverage analysis
  - HTML reports and visualization
  - Integration with CI/CD tools

### Popular libraries and tools:
- Comparison of coverage tools
- Best practices for maintaining high coverage
- Interpretation of coverage metrics
- Use cases and practical examples

**Deliverables:**
- Detailed sections in CONTENT.md for both languages (ONLY this file)
- Code and configuration examples (within CONTENT.md)
- Step-by-step implementation guides (within CONTENT.md)

**Note:** This task ONLY modifies CONTENT.md. No HTML files, no directory creation, no other modifications.
```

---

## 📄 HTML Files Update: Test Coverage Python/Go

```markdown
## HTML Files Update for Test Coverage
**Scope:** Update existing HTML files for new topics
**Dependencies:** This task depends on the content being first updated in `CONTENT.md`
**For units:** Python and Go - specific Unit numbers and src/book/unit folders will be determined when someone assigns the order in `CONTENT.md`

**Specific tasks:**
- Update existing HTML files to include new Test Coverage topics
- Verify navigation links include new sections
- Update quiz and study aids if necessary to cover Test Coverage
- Update unit overviews to reflect expanded content
- Update links from index.html and main overview if necessary
- Verify navigation and continuation buttons between contents

**Files to update:**
- Unit folders and files will be determined based on CONTENT.md assignments
- Corresponding navigation links

**Final validation:**
- Validate HTML of modified files
- Verify all navigation links work correctly

**Note:** The specific unit numbers and file paths (Unit X, src/book/unitX) cannot be determined until the content order is established in CONTENT.md
```

---

## 🦀 New Unit: Rust Programming Language

```markdown
## Complete Rust Unit Development
**Scope:** Complete new educational unit creation - CONTENT.md ONLY
**Affected files:** `CONTENT.md` and `Bibliography` (NO other files will be modified)

**Detailed content to develop:**

### Fundamental Concepts
- **Introduction to Rust:** Philosophy, use cases, advantages
- **Installation and toolchain:** rustc, cargo, rustup
- **Basic syntax:** Variables, mutability, shadowing
- **Data types:** Primitives, compounds, custom types
- **Control structures:** if/else, loops, pattern matching

### Advanced Rust-Unique Concepts
- **Ownership system:** Central concept, rules, examples
- **Borrowing:** References, borrowing rules, use cases
- **Lifetimes:** Annotations, elision, complex cases
- **Memory management:** Stack vs heap, RAII, no garbage collector

### Advanced Programming
- **Traits:** Definition, implementation, trait objects
- **Macros:** Declarative and procedural macros
- **Concurrency:** Threads, async/await, channels
- **Error handling:** Result, Option, custom errors

### Ecosystem and Tools
- **Cargo:** Dependency management, workspaces, features
- **Crates.io:** Library discovery and usage
- **Testing:** Unit tests, integration tests, doctests
- **Test Coverage:** Code coverage measurement tools
  - `cargo-tarpaulin`: Native Rust coverage tool
  - `grcov`: Mozilla tool for coverage reports
  - `kcov`: Alternative coverage tool compatible with Rust
  - CI/CD integration and HTML reports
  - Threshold configuration and exclusions
- **Documentation:** rustdoc, documentation comments

### Practical Applications
- **Web development:** Frameworks like Actix, Warp, Axum
- **Databases:** Diesel, SQLx, async connections
- **HTTP clients:** reqwest, networking
- **Streams and events:** Tokio, async streams
- **Performance:** Profiling, optimization, benchmarking

### Practical Exercises
- **REST API:** Complete implementation with database
- **CLI tools:** Command-line tools
- **Microservices:** Distributed architecture
- **Real-time applications:** WebSockets, streaming

### Development Tools
- **IDEs:** VS Code, IntelliJ Rust, configuration
- **Debugging:** gdb, lldb, specific tools
- **CI/CD:** GitHub Actions, automated testing
- **Deployment:** Containerization, cloud deployment

**Deliverables:**
- Complete unit in CONTENT.md (ONLY this file)
- Updated bibliography with Rust terms (ONLY this file)
- Practical exercises with code examples (within CONTENT.md)
- Installation and configuration guides (within CONTENT.md)

**Note:** This task ONLY modifies CONTENT.md and Bibliography. No HTML files, no directory creation, no other modifications.
```

---

## 📁 HTML Structure Creation: Rust Unit

```markdown
## HTML Files Creation for New Rust Unit
**Scope:** Complete HTML file structure creation
**Dependencies:** This task depends on the content being first updated in `CONTENT.md`
**For unit:** Rust - specific Unit number and src/book/unit folder will be determined when someone assigns the order in `CONTENT.md`

**Specific tasks:**
- Create directory structure for new Rust unit (path to be determined from CONTENT.md)
- Create unit overview file with complete unit content
- Create individual content files for each main topic:
  - Rust fundamentals
  - Ownership and borrowing
  - Advanced concepts  
  - Ecosystem and tools
  - Practical applications
  - Exercises and projects
  - Development tools
  - Unit final exam
- Create quiz files for each section
- Create study aids files for each section
- Create `images/` subdirectory for graphic resources
- Update `src/book/overview.html` to include new Rust unit
- Update `index.html` to include link to Rust unit in main menu
- Configure navigation links and continue buttons between all sections

**Initial files (empty except overview):**
- Only unit overview will have initial content
- All other files will be empty, ready for content development

**Final validation:**
- Validate HTML of all created files
- Verify links from index.html and main overview
- Test complete unit navigation

**Note:** The specific unit number and file paths (Unit X, src/book/unitX) cannot be determined until the content order is established in CONTENT.md
```

---

## ✍️ HTML Content Development: Rust Unit

```markdown
## Detailed HTML Content Development for Rust Unit
**Scope:** Self-taught and technically precise content creation
**Dependencies:** This task depends on the HTML structure being created first
**For unit:** Rust - specific Unit number and src/book/unit folder determined from previous HTML structure creation task

**Specific tasks:**
- Develop complete and detailed content for each HTML file in the unit
- Maintain self-taught approach without losing technical precision
- Use creativity in explanations for Rust's new paradigm
- Include practical and functional code examples
- Create hands-on exercises for each concept
- Develop interactive quizzes that reinforce learning
- Create effective study aids with summaries and quick references
- Ensure logical progression between topics
- Include links to relevant external resources
- Integrate real use cases and practical applications

**Files to develop content:**
- Rust fundamentals - Fundamental concepts
- Ownership and borrowing - Rust's unique ownership system
- Advanced concepts - Traits, macros, concurrency
- Ecosystem and tools - Cargo, crates, testing, coverage
- Practical applications - Web dev, databases, networking
- Exercises and projects - Complete practical projects
- Development tools - IDEs, debugging, CI/CD
- Unit final exam - Comprehensive exam
- All corresponding quiz files
- All corresponding study aids files

**Final validation:**
- Validate HTML of all files with content
- Verify functionality of all internal and external links
- Test complete navigation and user experience

**Note:** Specific file names and paths will be determined from the HTML structure creation task
```

## 🌐 Single Page Application (SPA) Conversion

```markdown
## SPA Migration with Friendly URLs
**Scope:** Complete frontend architecture refactoring
**Affected files:** `src/book/app.js`, `src/book/navigation.js`, `index.html`, complete navigation structure

**Required functionalities:**

### Routing System
- Implement native JavaScript router or lightweight library
- Friendly URLs for each section/unit/content
- Support for browser back/forward button navigation
- URL state synchronized with displayed content

### State Management
- Navigation state handling without page reloads
- State preservation during navigation
- Intelligent caching of loaded content

### Shareable URLs
- Each page/section must have unique URL
- URLs must be bookmark-friendly
- Ability to share direct links to specific content
- Functional deep linking

### Specific functionalities:
- Menu/button click → unique URL generated
- Open direct URL → loads correct content
- No page reloads during navigation
- Maintain existing functionality of quizzes and study aids

**Technical considerations:**
- Maintain compatibility with current file structure
- Preserve existing search and navigation functionality
- Optimize initial loading performance

**Deliverables:**
- Implemented routing system
- Friendly URLs for all content
- New architecture documentation
```

---

## ☁️ New Unit: Cloud Databases (DynamoDB and Neptune)

```markdown
## Cloud Databases Unit Development
**Scope:** New specialized cloud database unit - CONTENT.md ONLY
**Affected files:** `CONTENT.md` and `Bibliography` (NO other files will be modified)

**Content to develop:**

### Amazon DynamoDB
- **Fundamental concepts:** NoSQL, key-value, document store
- **Data model:** Partition key, sort key, LSI, GSI
- **CRUD operations:** PutItem, GetItem, UpdateItem, DeleteItem
- **Advanced queries:** Query, Scan, FilterExpression
- **Scalability:** Auto-scaling, on-demand vs provisioned
- **Consistency:** Eventually consistent vs strongly consistent

### Amazon Neptune
- **Graph databases:** Fundamental concepts, use cases
- **Supported models:** Property Graph (Gremlin), RDF (SPARQL)
- **Gremlin queries:** Traversals, predicates, projections
- **SPARQL queries:** Basic and advanced syntax
- **Use cases:** Social networks, recommendations, fraud detection

### Local Development and Testing
- **DynamoDB Local:** Installation, configuration, usage
- **Neptune Local:** Alternatives like TinkerGraph, Gremlin Server
- **Docker containers:** Development configuration
- **Testing strategies:** Unit tests, integration tests

### Integration and Practical Cases
- **AWS SDK:** Basic configuration and usage
- **IAM policies:** Specific permissions for each service
- **Monitoring:** CloudWatch, important metrics
- **Backup and restore:** Strategies for each database

### Practical Examples
- **E-commerce application:** DynamoDB catalog
- **Social network:** Neptune relationships
- **Recommendation engine:** Combination of both
- **Analytics pipeline:** Integration with other AWS services

**Deliverables:**
- Complete section in CONTENT.md (ONLY this file)
- Updated bibliography (ONLY this file)
- Local installation guides (within CONTENT.md)
- Practical exercises with code (within CONTENT.md)
- Real use cases (within CONTENT.md)

**Note:** This task ONLY modifies CONTENT.md and Bibliography. No HTML files, no directory creation, no other modifications.
```

---

## 📁 HTML Structure Creation: Cloud Databases Unit

```markdown
## HTML Files Creation for New Cloud Databases Unit
**Scope:** Complete HTML file structure creation
**Dependencies:** This task depends on the content being first updated in `CONTENT.md`
**For unit:** Cloud Databases - specific Unit number and src/book/unit folder will be determined when someone assigns the order in `CONTENT.md`

**Specific tasks:**
- Create directory structure for new Cloud Databases unit (path to be determined from CONTENT.md)
- Create unit overview file with complete unit content
- Create individual content files for each main topic:
  - DynamoDB fundamentals
  - DynamoDB operations
  - Neptune graph databases
  - Local development and testing
  - AWS integration practices
  - Practical examples and projects
  - Monitoring and optimization
  - Unit final exam
- Create quiz files for each section
- Create study aids files for each section
- Create `images/` subdirectory for graphic resources
- Update `src/book/overview.html` to include new Cloud Databases unit
- Update `index.html` to include link to Cloud Databases unit in main menu
- Configure navigation links and continue buttons between all sections

**Initial files (empty except overview):**
- Only unit overview will have initial content
- All other files will be empty, ready for content development

**Final validation:**
- Validate HTML of all created files
- Verify links from index.html and main overview
- Test complete unit navigation

**Note:** The specific unit number and file paths (Unit X, src/book/unitX) cannot be determined until the content order is established in CONTENT.md
```

---

## ✍️ HTML Content Development: Cloud Databases Unit

```markdown
## Detailed HTML Content Development for Cloud Databases Unit
**Scope:** Self-taught and technically precise content creation
**Dependencies:** This task depends on the HTML structure being created first
**For unit:** Cloud Databases - specific Unit number and src/book/unit folder determined from previous HTML structure creation task

**Specific tasks:**
- Develop complete and detailed content for each HTML file in the unit
- Maintain self-taught approach without losing technical precision
- Include practical examples of DynamoDB and Neptune
- Create hands-on exercises with local configuration
- Develop interactive quizzes that reinforce learning
- Create effective study aids with summaries and quick references
- Include step-by-step guides for local installation
- Integrate real use cases of e-commerce and social networks
- Include AWS SDK code examples
- Cover security and performance best practices

**Files to develop content:**
- DynamoDB fundamentals - NoSQL concepts and data model
- DynamoDB operations - CRUD, queries, scalability
- Neptune graph databases - Gremlin, SPARQL, use cases
- Local development and testing - DynamoDB Local, Neptune alternatives
- AWS integration practices - SDK, IAM, monitoring
- Practical examples and projects - Complete end-to-end projects
- Monitoring and optimization - CloudWatch, performance tuning
- Unit final exam - Comprehensive exam
- All corresponding quiz files
- All corresponding study aids files

**Final validation:**
- Validate HTML of all files with content
- Verify functionality of all internal and external links
- Test complete navigation and user experience

**Note:** Specific file names and paths will be determined from the HTML structure creation task
```

---

## 🔗 New Unit: GraphQL with Amazon AppSync

```markdown
## Complete GraphQL Unit Development
**Scope:** New specialized technical unit - CONTENT.md ONLY
**Affected files:** `CONTENT.md` and `Bibliography` (NO other files will be modified)

**Comprehensive content to develop:**

### GraphQL Fundamentals
- **Core concepts:** Queries, mutations, subscriptions
- **Schema definition:** Types, scalars, enums, interfaces
- **Resolvers:** Implementation and best practices
- **Introspection:** Schema exploration and tooling

### Data Types and Relationships
- **Scalar types:** String, Int, Float, Boolean, ID
- **Object types:** Custom types, nested objects
- **Input types:** For mutations and arguments
- **Relationships:** One-to-one, one-to-many, many-to-many

### Advanced Operations
- **Fragments:** Query reusability
- **Variables:** Dynamic parametrization
- **Directives:** @include, @skip, custom directives
- **Pagination:** Cursor-based, offset-based

### Amazon AppSync
- **Configuration:** Initial setup, authentication
- **Data sources:** DynamoDB, Lambda, HTTP, RDS
- **Mapping templates:** VTL (Velocity Template Language)
- **Real-time subscriptions:** WebSocket connections
- **Offline capabilities:** Local storage, sync

### AWS Services Integration
- **DynamoDB integration:** Direct resolver mapping
- **Neptune integration:** Gremlin queries via Lambda
- **Lambda resolvers:** Custom business logic
- **Cognito authentication:** User management

### Tools and Ecosystem
- **Apollo Server:** Setup and configuration
- **GraphiQL:** Schema exploration
- **Apollo Client:** Frontend integration
- **Code generation:** Automatic types

### Local Development
- **Local GraphQL server:** Apollo Server setup
- **Neptune local:** TinkerGraph integration
- **DynamoDB local:** Testing environment
- **Mocking:** Schema-first development

### Practical Exercises
- **Blog API:** CRUD operations with DynamoDB
- **Social graph:** Neptune + GraphQL
- **Real-time chat:** Subscriptions with AppSync
- **E-commerce:** Inventory management
- **Analytics dashboard:** Complex queries and aggregations

### Authentication and Authorization
- **JWT tokens:** Implementation and validation
- **Field-level security:** Resolver-level permissions
- **Rate limiting:** Query complexity analysis
- **Audit logging:** Request tracking

**Deliverables:**
- Complete unit in CONTENT.md (ONLY this file)
- Updated bibliography with GraphQL terms (ONLY this file)
- Local installation guides (within CONTENT.md)
- Practical exercises with local playground (within CONTENT.md)
- Step-by-step AWS services integration (within CONTENT.md)
- Complete and functional code examples (within CONTENT.md)

**Note:** This task ONLY modifies CONTENT.md and Bibliography. No HTML files, no directory creation, no other modifications.
```

---

## 📁 HTML Structure Creation: GraphQL Unit

```markdown
## HTML Files Creation for New GraphQL Unit
**Scope:** Complete HTML file structure creation
**Dependencies:** This task depends on the content being first updated in `CONTENT.md`
**For unit:** GraphQL - specific Unit number and src/book/unit folder will be determined when someone assigns the order in `CONTENT.md`

**Specific tasks:**
- Create directory structure for new GraphQL unit (path to be determined from CONTENT.md)
- Create unit overview file with complete unit content
- Create individual content files for each main topic:
  - GraphQL fundamentals
  - Schemas, types and relations
  - Queries, mutations and subscriptions
  - Amazon AppSync
  - AWS services integration
  - Local development and tools
  - Practical projects
  - Authentication and authorization
  - Unit final exam
- Create quiz files for each section
- Create study aids files for each section
- Create `images/` subdirectory for graphic resources
- Update `src/book/overview.html` to include new GraphQL unit
- Update `index.html` to include link to GraphQL unit in main menu
- Configure navigation links and continue buttons between all sections

**Initial files (empty except overview):**
- Only unit overview will have initial content
- All other files will be empty, ready for content development

**Final validation:**
- Validate HTML of all created files
- Verify links from index.html and main overview
- Test complete unit navigation

**Note:** The specific unit number and file paths (Unit X, src/book/unitX) cannot be determined until the content order is established in CONTENT.md
```

---

## ✍️ HTML Content Development: GraphQL Unit

```markdown
## Detailed HTML Content Development for GraphQL Unit
**Scope:** Self-taught and technically precise content creation
**Dependencies:** This task depends on the HTML structure being created first
**For unit:** GraphQL - specific Unit number and src/book/unit folder determined from previous HTML structure creation task

**Specific tasks:**
- Develop complete and detailed content for each HTML file in the unit
- Maintain self-taught approach without losing technical precision
- Include practical examples of queries, mutations and subscriptions
- Create hands-on exercises with Apollo Server and AppSync
- Develop interactive quizzes that reinforce learning
- Create effective study aids with summaries and quick references
- Include complete integration with DynamoDB and Neptune
- Cover real use cases: blog, social network, e-commerce
- Include functional local playground
- Cover authentication, authorization and security

**Files to develop content:**
- GraphQL fundamentals - Core concepts, REST comparison
- Schemas, types and relations - Schema definition and relationships
- Queries, mutations and subscriptions - Main operations
- Amazon AppSync - AppSync configuration and usage
- AWS services integration - DynamoDB, Neptune, Lambda
- Local development and tools - Apollo Server, GraphiQL, mocking
- Practical projects - Complete end-to-end projects
- Authentication and authorization - Security and permissions
- Unit final exam - Comprehensive exam
- All corresponding quiz files
- All corresponding study aids files

**Final validation:**
- Validate HTML of all files with content
- Verify functionality of all internal and external links
- Test complete navigation and user experience

**Note:** Specific file names and paths will be determined from the HTML structure creation task
```

---

## ✅ DEVELOPMENT STATUS

### Main Tasks:
- [ ] 🔧 Navigation Fix in Overview Pages
- [ ] 📚 Content Expansion: Test Coverage for Python and Go
- [ ] 🌐 Single Page Application (SPA) Conversion
- [ ] 🦀 New Unit: Rust Programming Language
- [ ] ☁️ New Unit: Cloud Databases (DynamoDB and Neptune)
- [ ] 🔗 New Unit: GraphQL with Amazon AppSync

### HTML File Tasks:
- [ ] 📄 HTML Files Update: Test Coverage Python/Go
- [ ] 📁 HTML Structure Creation: Rust Unit (Unit10)
- [ ] ✍️ HTML Content Development: Rust Unit (Unit10)
- [ ] 📁 HTML Structure Creation: Cloud Databases Unit (Unit11)
- [ ] ✍️ HTML Content Development: Cloud Databases Unit (Unit11)
- [ ] 📁 HTML Structure Creation: GraphQL Unit (Unit12)
- [ ] ✍️ HTML Content Development: GraphQL Unit (Unit12)

---

**Creation date:** September 10, 2025  
**Project:** learn-cloud  
**Branch:** feature/promt  
**Type:** New features and content expansion
