/**
 * Mermaid Diagram Examples for Showcase (Task 8G)
 *
 * Curated examples demonstrating various diagram types with GitHub-style zoom controls.
 * Using TypeScript data structure to avoid template string escaping issues.
 *
 * Diagram Types Covered:
 * - Flowchart (LR, TD orientations)
 * - Sequence Diagram
 * - Class Diagram
 * - State Diagram
 * - Entity Relationship (ER) Diagram
 * - Git Graph
 */

export interface DiagramExample {
	id: string;
	type: string;
	title: string;
	description: string;
	diagram: string;
}

export const DIAGRAM_EXAMPLES: DiagramExample[] = [
	{
		id: "flowchart-basic",
		type: "flowchart",
		title: "Flowchart - Microservices Architecture",
		description:
			"Left-to-right flowchart showing request flow through API Gateway, services, and database",
		diagram: `flowchart LR
    A["Client App"] --> B["API Gateway"]
    B --> C["Auth Service"]
    B --> D["User Service"]
    B --> E["Order Service"]
    C --> F[("Auth DB")]
    D --> G[("User DB")]
    E --> H[("Order DB")]
    D --> I["Cache"]
    E --> I`
	},
	{
		id: "sequence-advanced",
		type: "sequence",
		title: "Sequence Diagram - OAuth 2.0 Flow",
		description: "Complex sequence diagram showing OAuth authorization code flow with PKCE",
		diagram: `sequenceDiagram
    participant U as User
    participant C as Client App
    participant A as Auth Server
    participant R as Resource API

    U->>C: Click "Login"
    C->>C: Generate code_verifier
    C->>C: Generate code_challenge
    C->>A: Authorization Request + code_challenge
    A->>U: Login Form
    U->>A: Enter Credentials
    A->>A: Validate User
    A-->>C: Authorization Code
    C->>A: Token Request + code_verifier
    A->>A: Verify code_challenge
    A-->>C: Access Token + Refresh Token
    C->>R: API Request + Access Token
    R-->>C: Protected Resource`
	},
	{
		id: "class-diagram",
		type: "class",
		title: "Class Diagram - Repository Pattern",
		description: "UML class diagram demonstrating repository pattern with dependency injection",
		diagram: `classDiagram
    class IRepository~T~ {
        <<interface>>
        +FindById(id: string) T
        +FindAll() List~T~
        +Create(entity: T) T
        +Update(entity: T) T
        +Delete(id: string) bool
    }

    class UserRepository {
        -dbContext: DbContext
        +FindById(id: string) User
        +FindAll() List~User~
        +Create(user: User) User
        +Update(user: User) User
        +Delete(id: string) bool
        +FindByEmail(email: string) User
    }

    class User {
        +Id: string
        +Email: string
        +Name: string
        +CreatedAt: DateTime
        +UpdatedAt: DateTime
    }

    class UserService {
        -repository: IRepository~User~
        +GetUser(id: string) User
        +CreateUser(user: User) User
        +UpdateUser(user: User) User
        +DeleteUser(id: string) bool
    }

    IRepository~T~ <|.. UserRepository : implements
    UserRepository --> User : manages
    UserService --> IRepository~T~ : depends on`
	},
	{
		id: "state-diagram",
		type: "state",
		title: "State Diagram - Order Processing",
		description: "State machine showing order lifecycle with transitions and conditions",
		diagram: `stateDiagram-v2
    [*] --> Pending: Order Created
    Pending --> PaymentProcessing: Submit Payment
    PaymentProcessing --> Confirmed: Payment Success
    PaymentProcessing --> PaymentFailed: Payment Error
    PaymentFailed --> Pending: Retry Payment
    PaymentFailed --> Cancelled: Cancel Order
    Confirmed --> Processing: Start Fulfillment
    Processing --> Shipped: Ship Order
    Shipped --> Delivered: Confirm Delivery
    Shipped --> InTransit: Track Shipment
    InTransit --> Delivered: Delivery Complete
    Delivered --> [*]
    Cancelled --> [*]

    Confirmed --> Cancelled: Customer Request
    Processing --> Cancelled: Out of Stock`
	},
	{
		id: "er-diagram",
		type: "er",
		title: "ER Diagram - E-Commerce Database",
		description: "Entity-relationship diagram for e-commerce database schema",
		diagram: `erDiagram
    USER ||--o{ ORDER : places
    USER {
        string id PK
        string email UK
        string name
        datetime created_at
    }

    ORDER ||--|{ ORDER_ITEM : contains
    ORDER {
        string id PK
        string user_id FK
        decimal total
        string status
        datetime created_at
    }

    PRODUCT ||--o{ ORDER_ITEM : "ordered in"
    PRODUCT {
        string id PK
        string name
        text description
        decimal price
        int stock
    }

    ORDER_ITEM {
        string id PK
        string order_id FK
        string product_id FK
        int quantity
        decimal price
    }

    USER ||--o{ REVIEW : writes
    PRODUCT ||--o{ REVIEW : receives
    REVIEW {
        string id PK
        string user_id FK
        string product_id FK
        int rating
        text comment
    }`
	},
	{
		id: "gitgraph-workflow",
		type: "gitGraph",
		title: "Git Graph - Feature Branch Workflow",
		description: "Git branching strategy showing feature development and hotfix",
		diagram: `gitGraph
    commit id: "Initial commit"
    commit id: "Add user model"
    branch develop
    checkout develop
    commit id: "Setup database"
    commit id: "Add migrations"
    branch feature/auth
    checkout feature/auth
    commit id: "Add login endpoint"
    commit id: "Add JWT middleware"
    commit id: "Add refresh tokens"
    checkout develop
    merge feature/auth
    commit id: "Update docs"
    branch feature/orders
    checkout feature/orders
    commit id: "Add order model"
    commit id: "Add order endpoints"
    checkout main
    branch hotfix/security
    checkout hotfix/security
    commit id: "Fix auth vulnerability"
    checkout main
    merge hotfix/security tag: "v1.0.1"
    checkout develop
    merge hotfix/security
    checkout feature/orders
    commit id: "Add order validation"
    checkout develop
    merge feature/orders
    checkout main
    merge develop tag: "v1.1.0"`
	},
	{
		id: "flowchart-cicd",
		type: "flowchart",
		title: "Flowchart - CI/CD Pipeline",
		description: "Top-to-bottom flowchart showing automated deployment pipeline",
		diagram: `flowchart TD
    A["Developer Push"] --> B{"Branch?"}
    B -->|main| C["Run Tests"]
    B -->|feature| D["Run Tests"]
    C --> E{Tests Pass?}
    D --> F{Tests Pass?}
    F -->|No| G["Notify Developer"]
    F -->|Yes| H["Build Preview"]
    E -->|No| G
    E -->|Yes| I["Build Docker Image"]
    I --> J["Push to Registry"]
    J --> K["Deploy to Staging"]
    K --> L{Manual Approval?}
    L -->|No| M["Rollback"]
    L -->|Yes| N["Deploy to Production"]
    N --> O["Health Check"]
    O --> P{Healthy?}
    P -->|No| M
    P -->|Yes| Q["Success Notification"]`
	},
	{
		id: "sequence-kubernetes",
		type: "sequence",
		title: "Sequence Diagram - Kubernetes Pod Lifecycle",
		description: "Detailed sequence showing pod creation, scheduling, and startup",
		diagram: `sequenceDiagram
    participant U as kubectl
    participant A as API Server
    participant S as Scheduler
    participant K as Kubelet
    participant C as Container Runtime
    participant P as Pod

    U->>A: Create Pod Request
    A->>A: Validate & Store Pod Spec
    A-->>U: Pod Accepted
    A->>S: Watch for Unscheduled Pods
    S->>A: Query Nodes
    A-->>S: Available Nodes
    S->>S: Run Scheduling Algorithm
    S->>A: Bind Pod to Node
    A-->>S: Binding Confirmed
    A->>K: Watch for Assigned Pods
    K->>A: Acknowledge Pod Assignment
    K->>C: Pull Container Images
    C-->>K: Images Ready
    K->>C: Create Containers
    C->>P: Start Init Containers
    P-->>C: Init Complete
    C->>P: Start Main Containers
    P-->>C: Containers Running
    K->>A: Update Pod Status (Running)
    A-->>U: Pod Status: Running`
	}
];

/**
 * Get example by ID
 */
export function getDiagramExample(id: string): DiagramExample | undefined {
	return DIAGRAM_EXAMPLES.find((example) => example.id === id);
}

/**
 * Get examples by type
 */
export function getDiagramsByType(type: string): DiagramExample[] {
	return DIAGRAM_EXAMPLES.filter((example) => example.type === type);
}

/**
 * Get all diagram types
 */
export function getDiagramTypes(): string[] {
	return Array.from(new Set(DIAGRAM_EXAMPLES.map((example) => example.type)));
}
