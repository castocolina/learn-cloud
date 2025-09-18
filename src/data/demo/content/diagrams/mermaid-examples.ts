/**
 * Comprehensive Mermaid Diagram Examples Library
 *
 * Educational collection of 20+ Mermaid diagrams across all diagram types
 * for cloud-native learning and comprehensive rendering testing.
 *
 * CRITICAL: All diagrams follow MERMAID-STANDARDS.md syntax rules:
 * - All text in double quotes
 * - HTML entities for special characters
 * - Proper escaping of quotes and symbols
 */

export interface MermaidExample {
	id: string;
	title: string;
	description: string;
	type: MermaidDiagramType;
	complexity: ComplexityLevel;
	category: DiagramCategory;
	tags: string[];
	learningObjectives: string[];
	diagram: string;
	explanation: string;
	useCases: string[];
}

export type MermaidDiagramType =
	| "flowchart"
	| "sequence"
	| "class"
	| "er"
	| "state"
	| "gitgraph"
	| "journey"
	| "gantt"
	| "pie"
	| "mindmap"
	| "timeline"
	| "architecture";

export type ComplexityLevel = "basic" | "intermediate" | "advanced";

export type DiagramCategory =
	| "system-architecture"
	| "database-design"
	| "workflow"
	| "development"
	| "user-experience"
	| "project-management"
	| "business-logic"
	| "networking"
	| "security";

export const mermaidExamples: MermaidExample[] = [
	// FLOWCHARTS (5 examples: simple to complex)
	{
		id: "flowchart-basic-process",
		title: "Basic User Authentication Flow",
		description: "Simple flowchart showing user login process with decision points",
		type: "flowchart",
		complexity: "basic",
		category: "business-logic",
		tags: ["authentication", "user-flow", "security"],
		learningObjectives: [
			"Understand basic flowchart syntax",
			"Learn decision diamond usage",
			"Practice conditional flow representation"
		],
		diagram: `graph TD
    A["User Login"] --> B{"Credentials Valid?"}
    B -->|"Yes"| C["Dashboard Access"]
    B -->|"No"| D["Error Message"]
    D --> A
    C --> E["End Session"]`,
		explanation:
			"This flowchart demonstrates basic authentication logic with decision points and loop-back flows.",
		useCases: ["User authentication systems", "Basic decision trees", "Simple process flows"]
	},
	{
		id: "flowchart-microservices",
		title: "Microservices Architecture Flow",
		description: "Complex flowchart showing microservices communication patterns",
		type: "flowchart",
		complexity: "intermediate",
		category: "system-architecture",
		tags: ["microservices", "api-gateway", "load-balancing"],
		learningObjectives: [
			"Understand microservices architecture",
			"Learn service communication patterns",
			"Practice complex flowchart design"
		],
		diagram: `graph TB
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
        Payment["Payment Service"]
    end

    subgraph "Data Layer"
        AuthDB[("Auth Database")]
        UserDB[("User Database")]
        OrderDB[("Order Database")]
    end

    UI --> Gateway
    Mobile --> Gateway
    Gateway --> LB
    LB --> Auth
    LB --> User
    LB --> Order
    LB --> Payment
    Auth --> AuthDB
    User --> UserDB
    Order --> OrderDB`,
		explanation:
			"This diagram illustrates a complete microservices architecture with client interfaces, API gateway, service layer, and data persistence.",
		useCases: [
			"Microservices design",
			"System architecture documentation",
			"Service communication mapping"
		]
	},
	{
		id: "flowchart-ci-cd-pipeline",
		title: "CI/CD Pipeline Workflow",
		description: "Advanced flowchart showing continuous integration and deployment process",
		type: "flowchart",
		complexity: "advanced",
		category: "development",
		tags: ["ci-cd", "devops", "automation", "testing"],
		learningObjectives: [
			"Understand CI/CD pipeline stages",
			"Learn automated testing workflows",
			"Practice advanced flowchart patterns"
		],
		diagram: `graph TD
    A["Code Commit"] --> B["Trigger Build"]
    B --> C["Unit Tests"]
    C --> D{"Tests Pass?"}
    D -->|"No"| E["Notify Developer"]
    D -->|"Yes"| F["Integration Tests"]
    F --> G{"Integration OK?"}
    G -->|"No"| E
    G -->|"Yes"| H["Security Scan"]
    H --> I{"Vulnerabilities?"}
    I -->|"Yes"| E
    I -->|"No"| J["Build Docker Image"]
    J --> K["Push to Registry"]
    K --> L["Deploy to Staging"]
    L --> M["Acceptance Tests"]
    M --> N{"Tests Pass?"}
    N -->|"No"| E
    N -->|"Yes"| O{"Manual Approval?"}
    O -->|"No"| P["Auto Deploy to Prod"]
    O -->|"Yes"| Q["Wait for Approval"]
    Q --> R["Deploy to Production"]
    P --> S["Monitor &amp; Alert"]
    R --> S
    E --> T["End - Fix Required"]`,
		explanation:
			"This comprehensive CI/CD pipeline shows automated testing, security scanning, and deployment stages with multiple decision points and feedback loops.",
		useCases: [
			"DevOps pipeline design",
			"Automated deployment workflows",
			"Quality assurance processes"
		]
	},
	{
		id: "flowchart-error-handling",
		title: "API Error Handling Strategy",
		description: "Flowchart demonstrating robust error handling patterns",
		type: "flowchart",
		complexity: "intermediate",
		category: "system-architecture",
		tags: ["error-handling", "resilience", "api-design"],
		learningObjectives: [
			"Understand error handling strategies",
			"Learn retry patterns",
			"Practice resilience design"
		],
		diagram: `graph TD
    A["API Request"] --> B["Rate Limit Check"]
    B --> C{"Within Limits?"}
    C -->|"No"| D["Return 429 Error"]
    C -->|"Yes"| E["Validate Input"]
    E --> F{"Valid Input?"}
    F -->|"No"| G["Return 400 Error"]
    F -->|"Yes"| H["Process Request"]
    H --> I{"Processing Success?"}
    I -->|"No"| J["Check Error Type"]
    J --> K{"Retryable Error?"}
    K -->|"Yes"| L["Increment Retry Count"]
    L --> M{"Max Retries?"}
    M -->|"No"| N["Wait &amp; Retry"]
    N --> H
    M -->|"Yes"| O["Return 503 Error"]
    K -->|"No"| P["Return 500 Error"]
    I -->|"Yes"| Q["Return Success Response"]`,
		explanation:
			"This flowchart shows comprehensive error handling including rate limiting, input validation, retry logic, and appropriate HTTP status codes.",
		useCases: ["API resilience design", "Error handling strategies", "Service reliability patterns"]
	},
	{
		id: "flowchart-data-processing",
		title: "Data Processing Pipeline",
		description: "Complex data transformation and validation workflow",
		type: "flowchart",
		complexity: "advanced",
		category: "workflow",
		tags: ["data-processing", "etl", "validation", "transformation"],
		learningObjectives: [
			"Understand data processing pipelines",
			"Learn ETL workflow patterns",
			"Practice complex data validation"
		],
		diagram: `graph TB
    subgraph "Data Ingestion"
        A["Raw Data Input"]
        B["Data Validation"]
        C["Schema Check"]
    end

    subgraph "Transformation"
        D["Data Cleaning"]
        E["Format Conversion"]
        F["Business Rules"]
        G["Aggregation"]
    end

    subgraph "Quality Assurance"
        H["Quality Checks"]
        I["Anomaly Detection"]
        J["Data Profiling"]
    end

    subgraph "Output"
        K["Processed Data"]
        L["Error Reports"]
        M["Quality Metrics"]
    end

    A --> B
    B --> C
    C --> N{"Valid Schema?"}
    N -->|"No"| O["Log Error"]
    N -->|"Yes"| D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> P{"Quality Pass?"}
    P -->|"No"| Q["Quarantine Data"]
    P -->|"Yes"| K
    O --> L
    Q --> L
    J --> M`,
		explanation:
			"This advanced pipeline demonstrates comprehensive data processing with validation, transformation, quality assurance, and error handling stages.",
		useCases: ["ETL pipeline design", "Data quality workflows", "Big data processing systems"]
	},

	// SEQUENCE DIAGRAMS (4 examples: API flows, user interactions)
	{
		id: "sequence-api-authentication",
		title: "OAuth 2.0 Authentication Flow",
		description: "Sequence diagram showing OAuth 2.0 authorization code flow",
		type: "sequence",
		complexity: "intermediate",
		category: "security",
		tags: ["oauth", "authentication", "security", "api"],
		learningObjectives: [
			"Understand OAuth 2.0 flow",
			"Learn sequence diagram syntax",
			"Practice security protocol documentation"
		],
		diagram: `sequenceDiagram
    participant User
    participant Client as "Client App"
    participant Auth as "Auth Server"
    participant API as "Resource Server"

    User->>Client: "Login Request"
    Client->>Auth: "Authorization Request"
    Auth->>User: "Login Page"
    User->>Auth: "Credentials"
    Auth->>User: "Authorization Code"
    User->>Client: "Authorization Code"
    Client->>Auth: "Exchange Code for Token"
    Auth->>Client: "Access Token"
    Client->>API: "API Request + Token"
    API->>Auth: "Validate Token"
    Auth->>API: "Token Valid"
    API->>Client: "Protected Resource"
    Client->>User: "Display Data"`,
		explanation:
			"This sequence diagram illustrates the complete OAuth 2.0 authorization code flow with all participants and message exchanges.",
		useCases: [
			"OAuth implementation",
			"Security protocol documentation",
			"API authentication design"
		]
	},
	{
		id: "sequence-microservice-communication",
		title: "Microservice Inter-Service Communication",
		description: "Complex sequence showing microservice interactions with error handling",
		type: "sequence",
		complexity: "advanced",
		category: "system-architecture",
		tags: ["microservices", "service-mesh", "error-handling", "distributed-systems"],
		learningObjectives: [
			"Understand microservice communication patterns",
			"Learn distributed system interactions",
			"Practice complex sequence modeling"
		],
		diagram: `sequenceDiagram
    participant Client
    participant Gateway as "API Gateway"
    participant Auth as "Auth Service"
    participant Order as "Order Service"
    participant Payment as "Payment Service"
    participant Inventory as "Inventory Service"
    participant Notification as "Notification Service"

    Client->>Gateway: "Create Order"
    Gateway->>Auth: "Validate Token"
    Auth->>Gateway: "Token Valid"
    Gateway->>Order: "Process Order"
    Order->>Inventory: "Check Stock"
    Inventory->>Order: "Stock Available"
    Order->>Payment: "Process Payment"

    alt Payment Success
        Payment->>Order: "Payment Confirmed"
        Order->>Inventory: "Reserve Items"
        Inventory->>Order: "Items Reserved"
        Order->>Notification: "Send Confirmation"
        Notification->>Client: "Order Confirmed"
        Order->>Gateway: "Order Created"
        Gateway->>Client: "Success Response"
    else Payment Failed
        Payment->>Order: "Payment Failed"
        Order->>Gateway: "Order Failed"
        Gateway->>Client: "Payment Error"
    end`,
		explanation:
			"This diagram shows complex microservice interactions including authentication, business logic, and error handling paths.",
		useCases: [
			"Microservice orchestration",
			"Distributed transaction modeling",
			"Service dependency mapping"
		]
	},
	{
		id: "sequence-user-journey",
		title: "E-commerce User Purchase Journey",
		description: "End-to-end user interaction sequence for online purchase",
		type: "sequence",
		complexity: "intermediate",
		category: "user-experience",
		tags: ["user-journey", "e-commerce", "frontend", "backend"],
		learningObjectives: [
			"Understand user interaction flows",
			"Learn frontend-backend communication",
			"Practice user experience modeling"
		],
		diagram: `sequenceDiagram
    participant User
    participant Browser
    participant Frontend as "Frontend App"
    participant Backend as "Backend API"
    participant DB as "Database"

    User->>Browser: "Browse Products"
    Browser->>Frontend: "Load Product Page"
    Frontend->>Backend: "GET /products"
    Backend->>DB: "Query Products"
    DB->>Backend: "Product Data"
    Backend->>Frontend: "Product List"
    Frontend->>Browser: "Render Products"
    Browser->>User: "Display Products"

    User->>Browser: "Add to Cart"
    Browser->>Frontend: "Add Item"
    Frontend->>Backend: "POST /cart/items"
    Backend->>DB: "Update Cart"
    DB->>Backend: "Cart Updated"
    Backend->>Frontend: "Cart Response"
    Frontend->>Browser: "Update UI"

    User->>Browser: "Checkout"
    Browser->>Frontend: "Start Checkout"
    Frontend->>Backend: "POST /orders"
    Backend->>DB: "Create Order"
    DB->>Backend: "Order Created"
    Backend->>Frontend: "Order Confirmation"
    Frontend->>Browser: "Success Page"
    Browser->>User: "Order Complete"`,
		explanation:
			"This sequence demonstrates a complete user purchase journey from product browsing to order completion.",
		useCases: [
			"User experience design",
			"Frontend-backend integration",
			"E-commerce workflow modeling"
		]
	},
	{
		id: "sequence-real-time-chat",
		title: "Real-time Chat System",
		description: "WebSocket-based real-time messaging sequence",
		type: "sequence",
		complexity: "advanced",
		category: "system-architecture",
		tags: ["websockets", "real-time", "messaging", "distributed-systems"],
		learningObjectives: [
			"Understand real-time communication",
			"Learn WebSocket protocols",
			"Practice event-driven architecture"
		],
		diagram: `sequenceDiagram
    participant UserA as "User A"
    participant ClientA as "Client A"
    participant Server as "Chat Server"
    participant ClientB as "Client B"
    participant UserB as "User B"
    participant DB as "Message DB"

    UserA->>ClientA: "Connect to Chat"
    ClientA->>Server: "WebSocket Connect"
    Server->>ClientA: "Connection Established"

    UserB->>ClientB: "Connect to Chat"
    ClientB->>Server: "WebSocket Connect"
    Server->>ClientB: "Connection Established"

    UserA->>ClientA: "Send Message"
    ClientA->>Server: "Message Data"
    Server->>DB: "Store Message"
    DB->>Server: "Message Stored"

    par Broadcast to All Clients
        Server->>ClientA: "Message Delivered"
    and
        Server->>ClientB: "New Message"
    end

    ClientB->>UserB: "Display Message"

    Note over Server: "Handle Disconnection"
    ClientA->>Server: "Disconnect"
    Server->>ClientB: "User A Offline"`,
		explanation:
			"This sequence shows real-time messaging with WebSocket connections, message persistence, and broadcast patterns.",
		useCases: ["Real-time applications", "Chat system design", "WebSocket implementation"]
	},

	// CLASS DIAGRAMS (3 examples: OOP structures)
	{
		id: "class-payment-system",
		title: "Payment System Class Structure",
		description: "Object-oriented design for payment processing system",
		type: "class",
		complexity: "intermediate",
		category: "system-architecture",
		tags: ["oop", "design-patterns", "payment-processing"],
		learningObjectives: [
			"Understand class diagram notation",
			"Learn inheritance and composition",
			"Practice OOP design principles"
		],
		diagram: `classDiagram
    class PaymentProcessor {
        <<abstract>>
        +processPayment(amount: decimal, method: PaymentMethod): PaymentResult
        +validatePayment(details: PaymentDetails): boolean
        #logTransaction(transaction: Transaction): void
    }

    class CreditCardProcessor {
        -gateway: PaymentGateway
        -validator: CardValidator
        +processPayment(amount: decimal, method: PaymentMethod): PaymentResult
        +validateCard(cardNumber: string): boolean
        -encryptCardData(data: string): string
    }

    class PayPalProcessor {
        -apiClient: PayPalClient
        -tokenManager: TokenManager
        +processPayment(amount: decimal, method: PaymentMethod): PaymentResult
        +refreshToken(): string
        -makeAPICall(endpoint: string, data: object): APIResponse
    }

    class PaymentMethod {
        <<interface>>
        +getType(): string
        +getDetails(): PaymentDetails
    }

    class CreditCard {
        -cardNumber: string
        -expiryDate: Date
        -cvv: string
        -holderName: string
        +getType(): string
        +getDetails(): PaymentDetails
        +isExpired(): boolean
    }

    class PaymentResult {
        +transactionId: string
        +status: PaymentStatus
        +message: string
        +timestamp: DateTime
        +amount: decimal
    }

    PaymentProcessor <|-- CreditCardProcessor
    PaymentProcessor <|-- PayPalProcessor
    PaymentMethod <|.. CreditCard
    CreditCardProcessor ..> PaymentResult : "creates"
    PayPalProcessor ..> PaymentResult : "creates"
    CreditCardProcessor ..> CreditCard : "processes"`,
		explanation:
			"This class diagram demonstrates inheritance, interfaces, and composition in a payment processing system.",
		useCases: ["Payment system design", "OOP architecture", "Design pattern implementation"]
	},
	{
		id: "class-user-management",
		title: "User Management System",
		description: "Comprehensive user and role management class structure",
		type: "class",
		complexity: "advanced",
		category: "system-architecture",
		tags: ["user-management", "rbac", "security", "domain-modeling"],
		learningObjectives: [
			"Understand role-based access control",
			"Learn complex class relationships",
			"Practice domain modeling"
		],
		diagram: `classDiagram
    class User {
        -id: UUID
        -email: string
        -passwordHash: string
        -profile: UserProfile
        -roles: List<Role>
        -createdAt: DateTime
        -lastLoginAt: DateTime
        +authenticate(password: string): boolean
        +hasPermission(permission: Permission): boolean
        +addRole(role: Role): void
        +removeRole(role: Role): void
        +updateProfile(profile: UserProfile): void
    }

    class UserProfile {
        -firstName: string
        -lastName: string
        -avatar: string
        -phoneNumber: string
        -preferences: UserPreferences
        +getFullName(): string
        +updateAvatar(avatarUrl: string): void
    }

    class Role {
        -id: UUID
        -name: string
        -description: string
        -permissions: List<Permission>
        -isActive: boolean
        +hasPermission(permission: Permission): boolean
        +addPermission(permission: Permission): void
        +removePermission(permission: Permission): void
    }

    class Permission {
        -id: UUID
        -name: string
        -resource: string
        -action: PermissionAction
        -description: string
        +matches(resource: string, action: PermissionAction): boolean
    }

    class UserSession {
        -sessionId: string
        -userId: UUID
        -createdAt: DateTime
        -expiresAt: DateTime
        -ipAddress: string
        -userAgent: string
        +isValid(): boolean
        +extend(duration: TimeSpan): void
        +invalidate(): void
    }

    class AuthenticationService {
        -userRepository: UserRepository
        -sessionManager: SessionManager
        +login(email: string, password: string): AuthResult
        +logout(sessionId: string): boolean
        +refreshSession(sessionId: string): UserSession
        +resetPassword(email: string): boolean
    }

    User "1" *-- "1" UserProfile : "has"
    User "*" -- "*" Role : "has"
    Role "*" -- "*" Permission : "contains"
    User "1" -- "*" UserSession : "has"
    AuthenticationService ..> User : "manages"
    AuthenticationService ..> UserSession : "manages"`,
		explanation:
			"This advanced class diagram shows a complete user management system with roles, permissions, sessions, and authentication services.",
		useCases: ["User management systems", "RBAC implementation", "Authentication service design"]
	},
	{
		id: "class-inventory-management",
		title: "Inventory Management System",
		description: "Product and inventory tracking class structure",
		type: "class",
		complexity: "intermediate",
		category: "business-logic",
		tags: ["inventory", "product-management", "business-logic"],
		learningObjectives: [
			"Understand business domain modeling",
			"Learn aggregation patterns",
			"Practice inventory system design"
		],
		diagram: `classDiagram
    class Product {
        -id: UUID
        -sku: string
        -name: string
        -description: string
        -category: Category
        -supplier: Supplier
        -unitPrice: decimal
        -weight: decimal
        +updatePrice(newPrice: decimal): void
        +getDisplayName(): string
    }

    class Category {
        -id: UUID
        -name: string
        -parentCategory: Category
        -subcategories: List<Category>
        +getFullPath(): string
        +addSubcategory(category: Category): void
    }

    class Supplier {
        -id: UUID
        -name: string
        -contactInfo: ContactInfo
        -products: List<Product>
        +addProduct(product: Product): void
        +getActiveProducts(): List<Product>
    }

    class InventoryItem {
        -id: UUID
        -product: Product
        -warehouse: Warehouse
        -quantity: integer
        -reservedQuantity: integer
        -reorderLevel: integer
        -lastUpdated: DateTime
        +getAvailableQuantity(): integer
        +reserve(quantity: integer): boolean
        +release(quantity: integer): void
        +needsReorder(): boolean
    }

    class Warehouse {
        -id: UUID
        -name: string
        -location: Address
        -capacity: integer
        -inventoryItems: List<InventoryItem>
        +getTotalItems(): integer
        +getUtilization(): decimal
        +findItem(productId: UUID): InventoryItem
    }

    class StockMovement {
        -id: UUID
        -inventoryItem: InventoryItem
        -movementType: MovementType
        -quantity: integer
        -reason: string
        -timestamp: DateTime
        -performedBy: string
    }

    Product "*" -- "1" Category : "belongs to"
    Product "*" -- "1" Supplier : "supplied by"
    InventoryItem "*" -- "1" Product : "tracks"
    Warehouse "1" *-- "*" InventoryItem : "contains"
    StockMovement "*" -- "1" InventoryItem : "records for"`,
		explanation:
			"This class diagram models a complete inventory management system with products, categories, suppliers, warehouses, and stock movements.",
		useCases: ["Inventory system design", "Product management", "Warehouse management systems"]
	},

	// ER DIAGRAMS (3 examples: database designs)
	{
		id: "er-ecommerce-database",
		title: "E-commerce Database Schema",
		description: "Comprehensive database design for e-commerce platform",
		type: "er",
		complexity: "advanced",
		category: "database-design",
		tags: ["database", "e-commerce", "normalization", "relationships"],
		learningObjectives: [
			"Understand database normalization",
			"Learn entity relationships",
			"Practice complex schema design"
		],
		diagram: `erDiagram
    CUSTOMER ||--o{ ORDER : "places"
    ORDER ||--o{ ORDER_ITEM : "contains"
    ORDER_ITEM }o--|| PRODUCT : "references"
    PRODUCT }o--|| CATEGORY : "belongs_to"
    PRODUCT }o--|| SUPPLIER : "supplied_by"
    CUSTOMER ||--o{ REVIEW : "writes"
    PRODUCT ||--o{ REVIEW : "reviewed"
    CUSTOMER ||--o{ CART_ITEM : "has"
    CART_ITEM }o--|| PRODUCT : "contains"
    ORDER ||--|| PAYMENT : "has"
    ORDER ||--|| SHIPPING : "has"

    CUSTOMER {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string phone
        json address
        datetime created_at
        datetime updated_at
        boolean is_active
    }

    CATEGORY {
        uuid id PK
        string name UK
        string description
        uuid parent_id FK
        string slug UK
        integer sort_order
        boolean is_active
    }

    SUPPLIER {
        uuid id PK
        string name UK
        string contact_email
        string contact_phone
        json address
        string payment_terms
        decimal rating
        boolean is_active
    }

    PRODUCT {
        uuid id PK
        string sku UK
        string name
        text description
        uuid category_id FK
        uuid supplier_id FK
        decimal price
        decimal cost
        integer stock_quantity
        integer reserved_quantity
        decimal weight
        json images
        json specifications
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    ORDER {
        uuid id PK
        string order_number UK
        uuid customer_id FK
        decimal subtotal
        decimal tax_amount
        decimal shipping_amount
        decimal total_amount
        string status
        json billing_address
        json shipping_address
        datetime created_at
        datetime updated_at
    }

    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
        decimal total_price
    }

    CART_ITEM {
        uuid id PK
        uuid customer_id FK
        uuid product_id FK
        integer quantity
        datetime created_at
        datetime updated_at
    }

    REVIEW {
        uuid id PK
        uuid customer_id FK
        uuid product_id FK
        integer rating
        string title
        text comment
        boolean is_verified
        datetime created_at
    }

    PAYMENT {
        uuid id PK
        uuid order_id FK
        string payment_method
        string transaction_id
        decimal amount
        string status
        json gateway_response
        datetime processed_at
    }

    SHIPPING {
        uuid id PK
        uuid order_id FK
        string carrier
        string tracking_number
        string method
        decimal cost
        datetime shipped_at
        datetime delivered_at
        string status
    }`,
		explanation:
			"This comprehensive ER diagram shows a fully normalized e-commerce database with customers, products, orders, payments, and reviews.",
		useCases: [
			"E-commerce platform design",
			"Database architecture",
			"Complex relationship modeling"
		]
	},
	{
		id: "er-blog-platform",
		title: "Blog Platform Database",
		description: "Content management system database design",
		type: "er",
		complexity: "intermediate",
		category: "database-design",
		tags: ["cms", "blog", "content-management", "user-generated-content"],
		learningObjectives: [
			"Understand content management systems",
			"Learn hierarchical data modeling",
			"Practice many-to-many relationships"
		],
		diagram: `erDiagram
    USER ||--o{ POST : "authors"
    POST ||--o{ COMMENT : "has"
    USER ||--o{ COMMENT : "writes"
    COMMENT ||--o{ COMMENT : "replies_to"
    POST }o--o{ TAG : "tagged_with"
    POST }o--|| CATEGORY : "belongs_to"
    USER ||--o{ USER_FOLLOW : "follows"
    USER ||--o{ USER_FOLLOW : "followed_by"
    POST ||--o{ POST_LIKE : "liked"
    USER ||--o{ POST_LIKE : "likes"

    USER {
        uuid id PK
        string username UK
        string email UK
        string password_hash
        string display_name
        text bio
        string avatar_url
        string website
        boolean is_verified
        boolean is_active
        datetime created_at
        datetime last_login_at
    }

    CATEGORY {
        uuid id PK
        string name UK
        string slug UK
        text description
        string color
        integer post_count
        boolean is_active
    }

    TAG {
        uuid id PK
        string name UK
        string slug UK
        integer usage_count
        string color
    }

    POST {
        uuid id PK
        string title
        string slug UK
        text excerpt
        text content
        uuid author_id FK
        uuid category_id FK
        string status
        string featured_image
        integer view_count
        integer like_count
        integer comment_count
        boolean is_featured
        datetime published_at
        datetime created_at
        datetime updated_at
    }

    POST_TAG {
        uuid post_id FK
        uuid tag_id FK
    }

    COMMENT {
        uuid id PK
        uuid post_id FK
        uuid author_id FK
        uuid parent_id FK
        text content
        string status
        string author_ip
        datetime created_at
        datetime updated_at
    }

    POST_LIKE {
        uuid id PK
        uuid post_id FK
        uuid user_id FK
        datetime created_at
    }

    USER_FOLLOW {
        uuid id PK
        uuid follower_id FK
        uuid following_id FK
        datetime created_at
    }`,
		explanation:
			"This ER diagram models a complete blog platform with users, posts, comments, categories, tags, and social features.",
		useCases: ["Blog platform development", "Content management systems", "Social media features"]
	},
	{
		id: "er-learning-management",
		title: "Learning Management System",
		description: "Educational platform database schema",
		type: "er",
		complexity: "advanced",
		category: "database-design",
		tags: ["lms", "education", "course-management", "assessment"],
		learningObjectives: [
			"Understand educational system modeling",
			"Learn assessment and progress tracking",
			"Practice complex academic relationships"
		],
		diagram: `erDiagram
    INSTRUCTOR ||--o{ COURSE : "teaches"
    COURSE ||--o{ MODULE : "contains"
    MODULE ||--o{ LESSON : "includes"
    LESSON ||--o{ CONTENT : "has"
    STUDENT }o--o{ COURSE : "enrolled_in"
    STUDENT ||--o{ ASSIGNMENT_SUBMISSION : "submits"
    ASSIGNMENT ||--|| ASSIGNMENT_SUBMISSION : "submitted_for"
    MODULE ||--o{ ASSIGNMENT : "contains"
    STUDENT ||--o{ QUIZ_ATTEMPT : "attempts"
    LESSON ||--o{ QUIZ : "includes"
    QUIZ ||--|| QUIZ_ATTEMPT : "attempted"
    STUDENT ||--o{ PROGRESS : "tracks"
    LESSON ||--|| PROGRESS : "measured_for"

    INSTRUCTOR {
        uuid id PK
        string employee_id UK
        string email UK
        string first_name
        string last_name
        text bio
        string specialization
        string qualification
        decimal rating
        boolean is_active
        datetime created_at
    }

    STUDENT {
        uuid id PK
        string student_id UK
        string email UK
        string first_name
        string last_name
        date date_of_birth
        string phone
        json address
        datetime enrollment_date
        boolean is_active
    }

    COURSE {
        uuid id PK
        string course_code UK
        string title
        text description
        uuid instructor_id FK
        integer credits
        string difficulty_level
        decimal price
        string duration
        integer max_students
        integer enrolled_count
        datetime start_date
        datetime end_date
        boolean is_active
    }

    MODULE {
        uuid id PK
        uuid course_id FK
        string title
        text description
        integer order_sequence
        integer estimated_hours
        boolean is_mandatory
    }

    LESSON {
        uuid id PK
        uuid module_id FK
        string title
        text description
        string lesson_type
        integer duration_minutes
        integer order_sequence
        boolean is_published
    }

    CONTENT {
        uuid id PK
        uuid lesson_id FK
        string content_type
        string title
        text description
        string file_url
        json metadata
        integer order_sequence
    }

    ASSIGNMENT {
        uuid id PK
        uuid module_id FK
        string title
        text description
        text instructions
        integer max_points
        datetime due_date
        boolean allow_late_submission
        integer max_attempts
    }

    ASSIGNMENT_SUBMISSION {
        uuid id PK
        uuid assignment_id FK
        uuid student_id FK
        text submission_text
        string file_url
        integer points_earned
        string feedback
        string status
        datetime submitted_at
        datetime graded_at
    }

    QUIZ {
        uuid id PK
        uuid lesson_id FK
        string title
        text description
        integer max_points
        integer time_limit_minutes
        integer max_attempts
        boolean randomize_questions
    }

    QUIZ_ATTEMPT {
        uuid id PK
        uuid quiz_id FK
        uuid student_id FK
        integer score
        integer total_points
        json answers
        datetime started_at
        datetime completed_at
        boolean is_completed
    }

    ENROLLMENT {
        uuid student_id FK
        uuid course_id FK
        datetime enrolled_at
        string status
        decimal progress_percentage
        decimal final_grade
    }

    PROGRESS {
        uuid id PK
        uuid student_id FK
        uuid lesson_id FK
        boolean is_completed
        integer time_spent_minutes
        datetime completed_at
        datetime last_accessed
    }`,
		explanation:
			"This comprehensive LMS database design includes courses, modules, lessons, assignments, quizzes, and detailed progress tracking.",
		useCases: [
			"Learning management systems",
			"Educational platform development",
			"Student progress tracking"
		]
	},

	// STATE DIAGRAMS (2 examples: application states)
	{
		id: "state-order-lifecycle",
		title: "Order Lifecycle State Machine",
		description: "State transitions for e-commerce order processing",
		type: "state",
		complexity: "intermediate",
		category: "business-logic",
		tags: ["state-machine", "order-processing", "business-logic"],
		learningObjectives: [
			"Understand state machine concepts",
			"Learn state transition modeling",
			"Practice business process states"
		],
		diagram: `stateDiagram-v2
    [*] --> Draft : "Create Order"

    Draft --> Pending : "Submit Order"
    Draft --> Cancelled : "Cancel Draft"

    Pending --> PaymentProcessing : "Process Payment"
    Pending --> Cancelled : "Cancel Order"

    PaymentProcessing --> PaymentFailed : "Payment Declined"
    PaymentProcessing --> PaymentConfirmed : "Payment Success"

    PaymentFailed --> Pending : "Retry Payment"
    PaymentFailed --> Cancelled : "Cancel Order"

    PaymentConfirmed --> Processing : "Start Fulfillment"

    Processing --> Shipped : "Ship Order"
    Processing --> Cancelled : "Cancel Before Ship"

    Shipped --> InTransit : "In Transit"

    InTransit --> Delivered : "Delivery Confirmed"
    InTransit --> Lost : "Package Lost"

    Delivered --> Completed : "Auto Complete"
    Delivered --> Returned : "Return Requested"

    Returned --> Refunded : "Process Refund"
    Lost --> Refunded : "Process Refund"

    Cancelled --> [*]
    Completed --> [*]
    Refunded --> [*]

    note right of PaymentProcessing
        Payment gateway
        processing timeout: 5min
    end note

    note right of InTransit
        Tracking updates
        from carrier API
    end note`,
		explanation:
			"This state diagram models the complete lifecycle of an e-commerce order from creation to completion, including error states and transitions.",
		useCases: ["Order management systems", "Business process modeling", "Workflow automation"]
	},
	{
		id: "state-user-session",
		title: "User Session State Management",
		description: "Authentication and session state transitions",
		type: "state",
		complexity: "advanced",
		category: "security",
		tags: ["authentication", "session-management", "security"],
		learningObjectives: [
			"Understand session state management",
			"Learn authentication flows",
			"Practice security state modeling"
		],
		diagram: `stateDiagram-v2
    [*] --> Anonymous : "Initial Visit"

    Anonymous --> Authenticating : "Login Attempt"
    Anonymous --> Registering : "Sign Up"

    Authenticating --> AuthenticationFailed : "Invalid Credentials"
    Authenticating --> MFARequired : "Valid Credentials + MFA"
    Authenticating --> Authenticated : "Valid Credentials"

    AuthenticationFailed --> Anonymous : "Return to Login"

    Registering --> PendingVerification : "Account Created"

    PendingVerification --> Anonymous : "Verification Failed"
    PendingVerification --> Authenticated : "Email Verified"

    MFARequired --> MFAFailed : "Invalid MFA Code"
    MFARequired --> Authenticated : "Valid MFA Code"

    MFAFailed --> Anonymous : "Max Attempts Exceeded"
    MFAFailed --> MFARequired : "Retry MFA"

    Authenticated --> SessionExpiring : "Session Timeout Warning"
    Authenticated --> Locked : "Security Violation"
    Authenticated --> Anonymous : "Logout"

    SessionExpiring --> Authenticated : "Refresh Session"
    SessionExpiring --> Anonymous : "Session Expired"

    Locked --> Anonymous : "Account Unlocked"

    state Authenticated {
        [*] --> Active
        Active --> Idle : "User Inactive"
        Idle --> Active : "User Activity"
        Active --> PasswordChangeRequired : "Password Expired"
        PasswordChangeRequired --> Active : "Password Updated"
    }

    note right of MFARequired
        Time limit: 5 minutes
        Max attempts: 3
    end note

    note right of Locked
        Auto-unlock after
        30 minutes or
        admin intervention
    end note`,
		explanation:
			"This advanced state diagram shows user authentication, session management, security states, and nested states for authenticated users.",
		useCases: ["Authentication systems", "Session management", "Security state modeling"]
	},

	// GITGRAPH (2 examples: branching strategies)
	{
		id: "gitgraph-feature-workflow",
		title: "Feature Branch Workflow",
		description: "Git branching strategy for feature development",
		type: "gitgraph",
		complexity: "intermediate",
		category: "development",
		tags: ["git", "branching", "workflow", "collaboration"],
		learningObjectives: [
			"Understand Git branching strategies",
			"Learn feature branch workflow",
			"Practice version control visualization"
		],
		diagram: `gitGraph
    commit id: "Initial Commit"
    commit id: "Setup Project"

    branch feature/user-auth
    checkout feature/user-auth
    commit id: "Add User Model"
    commit id: "Implement Login"
    commit id: "Add JWT Auth"

    checkout main
    commit id: "Update Dependencies"

    branch feature/product-catalog
    checkout feature/product-catalog
    commit id: "Add Product Model"
    commit id: "Create Product API"

    checkout feature/user-auth
    commit id: "Add Password Reset"

    checkout main
    merge feature/user-auth
    commit id: "Release v1.1.0"

    checkout feature/product-catalog
    commit id: "Add Product Search"
    commit id: "Implement Pagination"

    checkout main
    merge feature/product-catalog
    commit id: "Release v1.2.0"

    branch hotfix/security-patch
    checkout hotfix/security-patch
    commit id: "Fix Auth Vulnerability"

    checkout main
    merge hotfix/security-patch
    commit id: "Release v1.2.1"`,
		explanation:
			"This Git workflow demonstrates feature branch development, merging strategies, releases, and hotfix handling.",
		useCases: ["Team development workflows", "Git strategy documentation", "Release management"]
	},
	{
		id: "gitgraph-gitflow-strategy",
		title: "GitFlow Branching Strategy",
		description: "Complete GitFlow workflow with develop, feature, and release branches",
		type: "gitgraph",
		complexity: "advanced",
		category: "development",
		tags: ["gitflow", "branching-strategy", "release-management"],
		learningObjectives: [
			"Understand GitFlow methodology",
			"Learn complex branching strategies",
			"Practice release branch management"
		],
		diagram: `gitGraph
    commit id: "Initial"

    branch develop
    checkout develop
    commit id: "Setup Dev Environment"

    branch feature/shopping-cart
    checkout feature/shopping-cart
    commit id: "Add Cart Model"
    commit id: "Cart Add/Remove"
    commit id: "Cart Persistence"

    checkout develop
    merge feature/shopping-cart
    commit id: "Integrate Shopping Cart"

    branch feature/payment-gateway
    checkout feature/payment-gateway
    commit id: "Payment Integration"
    commit id: "Error Handling"

    checkout develop
    merge feature/payment-gateway
    commit id: "Integrate Payments"

    branch release/v2.0.0
    checkout release/v2.0.0
    commit id: "Version Bump"
    commit id: "Update Docs"
    commit id: "Bug Fixes"

    checkout main
    merge release/v2.0.0
    commit id: "Release v2.0.0"

    checkout develop
    merge release/v2.0.0

    branch hotfix/critical-bug
    checkout hotfix/critical-bug
    commit id: "Fix Critical Issue"

    checkout main
    merge hotfix/critical-bug
    commit id: "Hotfix v2.0.1"

    checkout develop
    merge hotfix/critical-bug`,
		explanation:
			"This GitFlow diagram shows the complete workflow with develop, feature, release, and hotfix branches following GitFlow conventions.",
		useCases: ["Enterprise development workflows", "Release management", "Large team collaboration"]
	},

	// JOURNEY MAP (1 example: user experience)
	{
		id: "journey-customer-onboarding",
		title: "Customer Onboarding Journey",
		description: "User experience journey for new customer onboarding",
		type: "journey",
		complexity: "intermediate",
		category: "user-experience",
		tags: ["user-journey", "onboarding", "ux", "customer-experience"],
		learningObjectives: [
			"Understand user journey mapping",
			"Learn customer experience design",
			"Practice touchpoint identification"
		],
		diagram: `journey
    title "Customer Onboarding Journey"
    section "Discovery"
      Visit Website: 5: Customer
      Browse Products: 4: Customer
      Read Reviews: 3: Customer
      Compare Prices: 2: Customer
    section "Registration"
      Click Sign Up: 4: Customer
      Fill Registration Form: 3: Customer
      Email Verification: 2: Customer
      Account Activated: 5: Customer
    section "First Purchase"
      Browse Catalog: 4: Customer
      Add to Cart: 5: Customer
      Checkout Process: 3: Customer
      Payment Completion: 4: Customer
      Order Confirmation: 5: Customer
    section "Onboarding"
      Welcome Email: 5: Customer, System
      Product Recommendations: 4: Customer, System
      Tutorial Walkthrough: 3: Customer
      First Support Contact: 2: Customer, Support
    section "Retention"
      Loyalty Program Signup: 4: Customer
      First Repeat Purchase: 5: Customer
      Referral Invitation: 3: Customer
      Feedback Survey: 2: Customer`,
		explanation:
			"This customer journey map tracks the complete onboarding experience from discovery to retention, showing satisfaction scores and involved actors.",
		useCases: ["UX design", "Customer experience optimization", "Service design"]
	}
];

export const getDiagramsByType = (type: MermaidDiagramType): MermaidExample[] => {
	return mermaidExamples.filter((diagram) => diagram.type === type);
};

export const getDiagramsByComplexity = (complexity: ComplexityLevel): MermaidExample[] => {
	return mermaidExamples.filter((diagram) => diagram.complexity === complexity);
};

export const getDiagramsByCategory = (category: DiagramCategory): MermaidExample[] => {
	return mermaidExamples.filter((diagram) => diagram.category === category);
};

export const getDiagramsByTag = (tag: string): MermaidExample[] => {
	return mermaidExamples.filter((diagram) => diagram.tags.includes(tag));
};

export const searchDiagrams = (query: string): MermaidExample[] => {
	const searchTerm = query.toLowerCase();
	return mermaidExamples.filter(
		(diagram) =>
			diagram.title.toLowerCase().includes(searchTerm) ||
			diagram.description.toLowerCase().includes(searchTerm) ||
			diagram.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
			diagram.learningObjectives.some((objective) => objective.toLowerCase().includes(searchTerm))
	);
};

export const getDiagramStats = () => {
	const stats = {
		total: mermaidExamples.length,
		byType: {} as Record<MermaidDiagramType, number>,
		byComplexity: {} as Record<ComplexityLevel, number>,
		byCategory: {} as Record<DiagramCategory, number>
	};

	mermaidExamples.forEach((diagram) => {
		stats.byType[diagram.type] = (stats.byType[diagram.type] || 0) + 1;
		stats.byComplexity[diagram.complexity] = (stats.byComplexity[diagram.complexity] || 0) + 1;
		stats.byCategory[diagram.category] = (stats.byCategory[diagram.category] || 0) + 1;
	});

	return stats;
};

export const getRandomDiagram = (): MermaidExample => {
	const randomIndex = Math.floor(Math.random() * mermaidExamples.length);
	return mermaidExamples[randomIndex];
};

export const getRandomDiagramByType = (type: MermaidDiagramType): MermaidExample | null => {
	const filteredDiagrams = getDiagramsByType(type);
	if (filteredDiagrams.length === 0) return null;

	const randomIndex = Math.floor(Math.random() * filteredDiagrams.length);
	return filteredDiagrams[randomIndex];
};

export const getRandomDiagramByComplexity = (
	complexity: ComplexityLevel
): MermaidExample | null => {
	const filteredDiagrams = getDiagramsByComplexity(complexity);
	if (filteredDiagrams.length === 0) return null;

	const randomIndex = Math.floor(Math.random() * filteredDiagrams.length);
	return filteredDiagrams[randomIndex];
};
