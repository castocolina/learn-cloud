import type { LessonContent, QuizContent, StudyGuideContent, CodeBlock, Diagram } from "./types";

// Demo code blocks showcasing different languages and features
const demoCodeBlocks: CodeBlock[] = [
	{
		language: "dockerfile",
		code: `# Multi-stage Docker build for production optimization
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS runtime
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

EXPOSE 3000
USER nextjs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]`,
		title: "Production-Ready Multi-stage Docker Build",
		filename: "Dockerfile"
	},
	{
		language: "yaml",
		code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloud-native-app
  namespace: production
  labels:
    app: cloud-native-app
    version: "1.0.0"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: cloud-native-app
  template:
    metadata:
      labels:
        app: cloud-native-app
    spec:
      containers:
      - name: web-app
        image: myregistry/cloud-app:v1.0.0
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: connection-string
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5`,
		title: "Production Kubernetes Deployment with Probes",
		filename: "k8s-deployment.yaml"
	},
	{
		language: "typescript",
		code: `import { z } from "zod";

// Type-safe API client with Zod validation
export class CloudNativeAPIClient {
  private baseURL: string;
  private apiKey: string;

  constructor(config: { baseURL: string; apiKey: string }) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
  }

  // Zod schemas for runtime validation
  private userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().min(1),
    role: z.enum(["admin", "user", "viewer"]),
    createdAt: z.date(),
    profile: z.object({
      avatar: z.string().url().optional(),
      preferences: z.record(z.unknown()).optional(),
    }).optional(),
  });

  private responseSchema = z.object({
    data: z.unknown(),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
    }).optional(),
  });

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: "admin" | "user" | "viewer";
  }): Promise<z.infer<typeof this.userSchema>[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.role) searchParams.set("role", params.role);

      const response = await fetch(
        \`\${this.baseURL}/users?\${searchParams}\`,
        {
          headers: {
            "Authorization": \`Bearer \${this.apiKey}\`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }

      const rawData = await response.json();
      const validatedResponse = this.responseSchema.parse(rawData);

      // Validate each user in the array
      const users = Array.isArray(validatedResponse.data)
        ? validatedResponse.data.map(user => this.userSchema.parse(user))
        : [];

      return users;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(\`Validation failed: \${error.message}\`);
      }
      throw error;
    }
  }

  async createUser(userData: Omit<z.infer<typeof this.userSchema>, "id" | "createdAt">): Promise<z.infer<typeof this.userSchema>> {
    const response = await fetch(\`\${this.baseURL}/users\`, {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${this.apiKey}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(\`Failed to create user: \${response.statusText}\`);
    }

    const rawData = await response.json();
    return this.userSchema.parse(rawData);
  }
}

// Usage example with error handling
export async function demonstrateAPIUsage() {
  const client = new CloudNativeAPIClient({
    baseURL: "https://api.example.com/v1",
    apiKey: process.env.API_KEY!,
  });

  try {
    const users = await client.getUsers({ page: 1, limit: 10, role: "admin" });
    console.log(\`Retrieved \${users.length} admin users\`);

    for (const user of users) {
      console.log(\`User: \${user.name} (\${user.email}) - Role: \${user.role}\`);
    }
  } catch (error) {
    console.error("API Error:", error instanceof Error ? error.message : error);
  }
}`,
		title: "Type-Safe API Client with Zod Validation",
		filename: "api-client.ts"
	},
	{
		language: "javascript",
		code: `// Advanced service worker for offline-first PWA
const CACHE_NAME = 'cloud-native-app-v1.2.0';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/styles/main.css',
  '/scripts/app.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Network-first strategy for API calls, cache-first for static assets
const NETWORK_FIRST_ROUTES = ['/api/', '/auth/'];
const CACHE_FIRST_ROUTES = ['/static/', '/images/', '/fonts/'];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => console.error('Service Worker: Installation failed', error))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log(\`Service Worker: Deleting old cache \${cacheName}\`);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim(); // Take control of all clients
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension URLs
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Network-first strategy for API calls
  if (NETWORK_FIRST_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Cache-first strategy for static assets
  if (CACHE_FIRST_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Stale-while-revalidate for HTML pages
  event.respondWith(staleWhileRevalidateStrategy(request));
});

// Network-first strategy with fallback
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache...', error);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for HTML requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

// Cache-first strategy with network fallback
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache and network both failed:', error);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Fetch in background to update cache
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.log('Background fetch failed:', error);
    return cachedResponse; // Return cached version if available
  });

  // Return cached version immediately, or wait for network
  return cachedResponse || fetchPromise;
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'background-sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Implement offline analytics sync
  console.log('Syncing offline analytics data...');
}`,
		title: "Advanced Service Worker with Caching Strategies",
		filename: "service-worker.js"
	}
];

// Demo diagrams showcasing complex cloud-native architectures
const demoDiagrams: Diagram[] = [
	{
		type: "mermaid",
		definition: `graph TB
    subgraph "Client Layer"
        Mobile[📱 Mobile App]
        Web[💻 Web App]
        Desktop[🖥️ Desktop App]
    end

    subgraph "CDN & Edge"
        CDN[🌐 CloudFlare CDN]
        Edge[⚡ Edge Computing]
    end

    subgraph "Load Balancing"
        ALB[🔀 Application Load Balancer]
        NLB[⚖️ Network Load Balancer]
    end

    subgraph "Kubernetes Cluster"
        subgraph "Frontend Services"
            ReactApp[⚛️ React App]
            NextJS[🔺 Next.js API]
            StaticAssets[📁 Static Assets]
        end

        subgraph "Backend Services"
            UserAPI[👤 User Service]
            OrderAPI[🛒 Order Service]
            PaymentAPI[💳 Payment Service]
            NotifyAPI[📧 Notification Service]
        end

        subgraph "Message Queue"
            Redis[📮 Redis Queue]
            RabbitMQ[🐰 RabbitMQ]
        end
    end

    subgraph "Data Layer"
        PostgresMain[(🐘 PostgreSQL Main)]
        PostgresRead[(📖 PostgreSQL Read Replica)]
        MongoDB[(🍃 MongoDB)]
        S3[🪣 AWS S3 Storage]
    end

    subgraph "External Services"
        Stripe[💰 Stripe API]
        SendGrid[📨 SendGrid]
        Analytics[📊 Analytics]
    end

    subgraph "Monitoring"
        Prometheus[📈 Prometheus]
        Grafana[📊 Grafana]
        Jaeger[🔍 Jaeger Tracing]
        ELK[📝 ELK Stack]
    end

    Mobile --> CDN
    Web --> CDN
    Desktop --> CDN
    CDN --> Edge
    Edge --> ALB
    ALB --> ReactApp
    ALB --> NextJS
    NextJS --> NLB
    NLB --> UserAPI
    NLB --> OrderAPI
    NLB --> PaymentAPI

    UserAPI --> PostgresMain
    UserAPI --> PostgresRead
    OrderAPI --> PostgresMain
    OrderAPI --> MongoDB
    PaymentAPI --> Stripe
    NotifyAPI --> SendGrid
    NotifyAPI --> RabbitMQ

    OrderAPI --> Redis
    PaymentAPI --> Redis
    Redis --> NotifyAPI

    UserAPI --> Prometheus
    OrderAPI --> Prometheus
    PaymentAPI --> Prometheus
    NotifyAPI --> Prometheus

    Prometheus --> Grafana
    UserAPI --> Jaeger
    OrderAPI --> Jaeger
    StaticAssets --> S3

    classDef client fill:#e1f5fe
    classDef cdn fill:#f3e5f5
    classDef k8s fill:#e8f5e8
    classDef data fill:#fff3e0
    classDef external fill:#fce4ec
    classDef monitoring fill:#f1f8e9

    class Mobile,Web,Desktop client
    class CDN,Edge,ALB,NLB cdn
    class ReactApp,NextJS,StaticAssets,UserAPI,OrderAPI,PaymentAPI,NotifyAPI,Redis,RabbitMQ k8s
    class PostgresMain,PostgresRead,MongoDB,S3 data
    class Stripe,SendGrid,Analytics external
    class Prometheus,Grafana,Jaeger,ELK monitoring`,
		title: "Complete Cloud-Native Architecture",
		caption:
			"Full-scale microservices architecture with Kubernetes, monitoring, and external integrations"
	},
	{
		type: "mermaid",
		definition: `sequenceDiagram
    participant U as 👤 User
    participant W as 💻 Web App
    participant LB as ⚖️ Load Balancer
    participant G as 🔐 Gateway
    participant US as 👤 User Service
    participant OS as 🛒 Order Service
    participant PS as 💳 Payment Service
    participant NS as 📧 Notification Service
    participant Q as 📮 Queue
    participant DB as 🗄️ Database
    participant S as 💰 Stripe

    U->>+W: Place Order Request
    W->>+LB: POST /api/orders
    LB->>+G: Route Request

    Note over G: JWT Validation & Rate Limiting
    G->>+US: Validate User Token
    US->>-G: User Valid ✅

    G->>+OS: Create Order
    OS->>+DB: Save Order (PENDING)
    DB->>-OS: Order ID: 12345
    OS->>+Q: Publish OrderCreated Event
    Q->>-OS: Event Queued
    OS->>-G: Order Created
    G->>-LB: 201 Created
    LB->>-W: Order Response
    W->>-U: Order Confirmation

    Note over Q,NS: Async Processing Begins

    Q->>+NS: OrderCreated Event
    NS->>+US: Get User Details
    US->>-NS: User Email & Preferences
    NS->>NS: Generate Email Template
    NS->>U: 📧 Order Confirmation Email
    NS->>-Q: Event Processed

    Note over U: User initiates payment

    U->>+W: Pay for Order 12345
    W->>+LB: POST /api/payments
    LB->>+G: Route Payment Request
    G->>+PS: Process Payment
    PS->>+S: Create Payment Intent
    S->>-PS: Payment Intent Created
    PS->>+DB: Update Order (PROCESSING)
    DB->>-PS: Order Updated
    PS->>-G: Payment Initiated

    alt Payment Successful
        S->>+PS: Payment Succeeded Webhook
        PS->>+DB: Update Order (PAID)
        DB->>-PS: Order Updated
        PS->>+Q: Publish OrderPaid Event
        Q->>-PS: Event Queued
        PS->>-S: Webhook ACK

        Q->>+NS: OrderPaid Event
        NS->>U: 📧 Payment Success Email
        NS->>-Q: Event Processed

        Q->>+OS: OrderPaid Event
        OS->>+DB: Update Inventory
        DB->>-OS: Inventory Updated
        OS->>+Q: Publish InventoryUpdated Event
        Q->>-OS: Event Queued
        OS->>-Q: Processing Complete

    else Payment Failed
        S->>+PS: Payment Failed Webhook
        PS->>+DB: Update Order (FAILED)
        DB->>-PS: Order Updated
        PS->>+Q: Publish OrderFailed Event
        Q->>-PS: Event Queued

        Q->>+NS: OrderFailed Event
        NS->>U: 📧 Payment Failed Email
        NS->>-Q: Event Processed
    end

    G->>LB: Payment Response
    LB->>W: Payment Status
    W->>U: Payment Confirmation`,
		title: "Complex E-commerce Transaction Flow",
		caption: "End-to-end transaction processing with async events, payments, and notifications"
	},
	{
		type: "mermaid",
		definition: `gitgraph
    commit id: "Initial Commit"
    branch develop
    checkout develop
    commit id: "Setup Project"
    commit id: "Add Basic Components"

    branch feature/user-auth
    checkout feature/user-auth
    commit id: "Add Auth Service"
    commit id: "Add JWT Middleware"
    commit id: "Add Login/Register"

    checkout develop
    merge feature/user-auth
    commit id: "Merge User Auth"

    branch feature/order-system
    checkout feature/order-system
    commit id: "Add Order Model"
    commit id: "Add Order API"
    commit id: "Add Order Tests"

    checkout develop
    branch feature/payment-integration
    checkout feature/payment-integration
    commit id: "Add Stripe SDK"
    commit id: "Add Payment Service"
    commit id: "Add Webhook Handler"

    checkout develop
    merge feature/order-system
    commit id: "Merge Order System"

    branch release/v1.0.0
    checkout release/v1.0.0
    commit id: "Update Version"
    commit id: "Final Testing"

    checkout main
    merge release/v1.0.0
    commit id: "Release v1.0.0" tag: "v1.0.0"

    checkout develop
    merge feature/payment-integration
    commit id: "Merge Payments"

    branch hotfix/security-patch
    checkout hotfix/security-patch
    commit id: "Fix JWT Vulnerability"

    checkout main
    merge hotfix/security-patch
    commit id: "Security Hotfix" tag: "v1.0.1"

    checkout develop
    merge hotfix/security-patch
    commit id: "Merge Security Fix"`,
		title: "GitFlow Branching Strategy",
		caption: "Complete Git workflow with feature branches, releases, and hotfixes"
	},
	{
		type: "mermaid",
		definition: `flowchart TD
    Start([🚀 CI/CD Pipeline Triggered]) --> CheckTrigger{Trigger Type?}

    CheckTrigger -->|Push to main| ProdDeploy[🏭 Production Deployment]
    CheckTrigger -->|Push to develop| StagingDeploy[🧪 Staging Deployment]
    CheckTrigger -->|Pull Request| PRValidation[✅ PR Validation]

    subgraph "Code Quality Checks"
        Lint[🔍 ESLint & Prettier]
        TypeCheck[📝 TypeScript Check]
        UnitTests[🧪 Unit Tests]
        IntegrationTests[🔗 Integration Tests]
        SecurityScan[🛡️ Security Scan]
    end

    PRValidation --> Lint
    Lint --> TypeCheck
    TypeCheck --> UnitTests
    UnitTests --> IntegrationTests
    IntegrationTests --> SecurityScan

    SecurityScan --> CodeQualityGate{All Checks Pass?}
    CodeQualityGate -->|❌ Fail| NotifyFailure[📧 Notify Failure]
    CodeQualityGate -->|✅ Pass| BuildApp[🏗️ Build Application]

    subgraph "Build & Package"
        BuildApp --> CreateDockerImage[🐳 Build Docker Image]
        CreateDockerImage --> ScanImage[🔍 Scan Docker Image]
        ScanImage --> PushRegistry[📦 Push to Registry]
    end

    PushRegistry --> DeployStaging{Deploy to Staging?}

    StagingDeploy --> DeployStaging
    DeployStaging -->|✅ Yes| StagingK8s[☸️ Deploy to Staging K8s]

    subgraph "Staging Environment"
        StagingK8s --> E2ETests[🌐 E2E Tests]
        E2ETests --> PerformanceTests[⚡ Performance Tests]
        PerformanceTests --> AccessibilityTests[♿ Accessibility Tests]
    end

    AccessibilityTests --> StagingGate{Staging Tests Pass?}
    StagingGate -->|❌ Fail| RollbackStaging[⏪ Rollback Staging]
    StagingGate -->|✅ Pass| NotifyStaging[📧 Staging Deployed]

    ProdDeploy --> ProdGate{Production Ready?}
    ProdGate -->|❌ No| WaitApproval[⏳ Wait for Approval]
    ProdGate -->|✅ Yes| BlueGreenDeploy[🔵🟢 Blue-Green Deploy]

    subgraph "Production Deployment"
        BlueGreenDeploy --> HealthCheck[💓 Health Checks]
        HealthCheck --> SmokeTests[💨 Smoke Tests]
        SmokeTests --> TrafficSwitch[🔀 Switch Traffic]
        TrafficSwitch --> MonitorMetrics[📊 Monitor Metrics]
    end

    MonitorMetrics --> ProdSuccess{Deployment Success?}
    ProdSuccess -->|❌ Fail| RollbackProd[⏪ Rollback Production]
    ProdSuccess -->|✅ Success| NotifySuccess[🎉 Notify Success]

    NotifyFailure --> End([🏁 Pipeline Complete])
    RollbackStaging --> End
    NotifyStaging --> End
    RollbackProd --> End
    NotifySuccess --> End

    classDef success fill:#d4edda
    classDef failure fill:#f8d7da
    classDef process fill:#d1ecf1
    classDef decision fill:#fff3cd

    class NotifySuccess,StagingGate,ProdSuccess success
    class NotifyFailure,RollbackStaging,RollbackProd failure
    class BuildApp,CreateDockerImage,ScanImage,PushRegistry,StagingK8s,BlueGreenDeploy process
    class CheckTrigger,CodeQualityGate,DeployStaging,StagingGate,ProdGate,ProdSuccess decision`,
		title: "Advanced CI/CD Pipeline with Blue-Green Deployment",
		caption:
			"Complete DevOps pipeline with staging, testing, security scanning, and production deployment strategies"
	}
];

// Demo lesson content
export const demoLesson: LessonContent = {
	type: "lesson",
	title: "Introduction to Container Orchestration",
	summary:
		"Learn the fundamentals of container orchestration with Kubernetes, including deployments, services, and scaling strategies.",
	estimatedTime: 45,
	prerequisites: [
		"Basic Docker knowledge",
		"Understanding of containerization concepts",
		"Familiarity with YAML syntax"
	],
	learningObjectives: [
		"Understand the role of container orchestration",
		"Learn Kubernetes basic concepts and architecture",
		"Deploy applications using Kubernetes manifests",
		"Implement basic scaling and load balancing"
	],
	sections: [
		{
			heading: "What is Container Orchestration?",
			paragraphs: [
				"Container orchestration is the automated deployment, management, scaling, and networking of containers. As applications grow in complexity and scale, managing individual containers manually becomes impractical.",
				"Orchestration platforms like <strong>Kubernetes</strong> provide a declarative approach to managing containerized applications, allowing you to specify the desired state and letting the platform handle the implementation details.",
				"Key benefits include:"
			],
			callouts: [
				{
					type: "info",
					title: "Why Orchestration Matters",
					content:
						"In production environments, you might need to manage hundreds or thousands of containers across multiple hosts. Orchestration automates tasks like load balancing, service discovery, rolling updates, and failure recovery."
				}
			]
		},
		{
			heading: "Kubernetes Architecture Overview",
			paragraphs: [
				"Kubernetes follows a <em>master-worker</em> architecture where the control plane manages the cluster state, and worker nodes run your application containers.",
				"The main components include:"
			],
			diagrams: [demoDiagrams[0]],
			callouts: [
				{
					type: "warning",
					title: "Learning Curve",
					content:
						"Kubernetes has a steep learning curve, but understanding the core concepts will significantly improve your ability to build scalable applications."
				}
			]
		},
		{
			heading: "Your First Deployment",
			paragraphs: [
				"Let's create a simple deployment that runs multiple replicas of a web application. This example shows how Kubernetes manages application lifecycle:"
			],
			codeBlocks: [demoCodeBlocks[1]],
			callouts: [
				{
					type: "success",
					title: "Best Practice",
					content:
						"Always specify resource limits and requests for your containers to ensure proper resource allocation and prevent resource starvation."
				}
			]
		},
		{
			heading: "Request Flow and Load Balancing",
			paragraphs: [
				"Understanding how requests flow through your Kubernetes cluster is crucial for designing resilient applications. The following diagram illustrates the typical request path:"
			],
			diagrams: [demoDiagrams[1]]
		}
	]
};

// Demo quiz content with comprehensive cloud-native questions
export const demoQuiz: QuizContent = {
	type: "quiz",
	title: "Cloud-Native Architecture Mastery Quiz",
	summary:
		"Comprehensive assessment covering container orchestration, microservices, CI/CD, monitoring, and cloud-native best practices. Test your expertise across the full spectrum of modern cloud architectures.",
	quiz: {
		passingScore: 75,
		questions: [
			{
				question:
					"What is the primary advantage of using container orchestration platforms like Kubernetes over manual container management?",
				options: [
					"Containers run faster",
					"Automatic scaling, self-healing, and declarative configuration management",
					"Reduced memory usage",
					"Better security by default"
				],
				correct: 1,
				explanation:
					"Container orchestration provides automatic scaling based on demand, self-healing capabilities when containers fail, and declarative configuration that ensures the desired state is maintained. This eliminates the complexity of manual container lifecycle management at scale."
			},
			{
				question:
					"Which of the following are essential components of a cloud-native application architecture? (Select all that apply)",
				options: [
					"Microservices architecture",
					"Container-based deployment",
					"Infrastructure as Code (IaC)",
					"Monolithic database",
					"CI/CD pipelines",
					"Service mesh for communication"
				],
				correct: [0, 1, 2, 4, 5],
				explanation:
					"Cloud-native applications typically use microservices for modularity, containers for consistency, IaC for reproducibility, CI/CD for rapid delivery, and service mesh for secure communication. Monolithic databases contradict the distributed nature of cloud-native architectures."
			},
			{
				question:
					"In a Kubernetes deployment, what is the relationship between Deployments, ReplicaSets, and Pods?",
				options: [
					"They are independent resources with no relationship",
					"Deployment manages ReplicaSets, which manage Pods",
					"Pods manage ReplicaSets, which manage Deployments",
					"All three are created manually and managed separately"
				],
				correct: 1,
				explanation:
					"Kubernetes follows a hierarchical management model: Deployments define the desired state and manage ReplicaSets, ReplicaSets ensure the specified number of Pod replicas are running, and Pods are the actual running containers. This abstraction enables rolling updates and rollbacks."
			},
			{
				question:
					"What is the primary benefit of implementing a service mesh like Istio in a microservices architecture?",
				options: [
					"Faster application startup times",
					"Reduced code complexity by handling cross-cutting concerns at the infrastructure level",
					"Automatic database optimization",
					"Built-in user authentication"
				],
				correct: 1,
				explanation:
					"Service mesh handles cross-cutting concerns like service discovery, load balancing, encryption, observability, traceability, and authentication/authorization at the infrastructure level. This removes these complexities from application code and provides consistent policies across all services."
			},
			{
				question:
					"Which monitoring strategy is most effective for distributed cloud-native applications?",
				options: [
					"Log aggregation only",
					"Server monitoring only",
					"The three pillars: Metrics, Logs, and Distributed Tracing",
					"Database performance monitoring only"
				],
				correct: 2,
				explanation:
					"The 'Three Pillars of Observability' (metrics for quantitative data, logs for detailed events, and distributed tracing for request flows) provide comprehensive visibility into distributed systems. Each pillar complements the others to give a complete picture of system health and performance."
			},
			{
				question:
					"In a CI/CD pipeline, what is the primary purpose of implementing Blue-Green deployment?",
				options: [
					"To use different colors for the UI",
					"To enable zero-downtime deployments and quick rollbacks",
					"To separate development and production environments",
					"To reduce infrastructure costs"
				],
				correct: 1,
				explanation:
					"Blue-Green deployment maintains two identical production environments. Traffic switches from the current version (Blue) to the new version (Green) instantly, enabling zero-downtime deployments. If issues arise, traffic can be quickly switched back, providing immediate rollback capability."
			},
			{
				question:
					"What are the key characteristics of a well-designed microservice? (Select all that apply)",
				options: [
					"Single responsibility principle",
					"Database per service",
					"Communicates via well-defined APIs",
					"Shares code libraries with other services",
					"Independently deployable",
					"Owns its data and business logic"
				],
				correct: [0, 1, 2, 4, 5],
				explanation:
					"Well-designed microservices follow the single responsibility principle, own their data (database per service), communicate via APIs, are independently deployable, and encapsulate their business logic. Sharing code libraries creates coupling and contradicts microservice principles."
			},
			{
				question:
					"Which of the following best describes the concept of 'Infrastructure as Code' (IaC)?",
				options: [
					"Writing application code that runs on infrastructure",
					"Managing and provisioning infrastructure through machine-readable definition files",
					"Converting infrastructure documentation to code comments",
					"Using infrastructure monitoring tools"
				],
				correct: 1,
				explanation:
					"Infrastructure as Code (IaC) treats infrastructure configuration as software code, using declarative definition files (like Terraform, CloudFormation, or Kubernetes YAML) to provision and manage infrastructure. This enables version control, reproducibility, and automated deployment of infrastructure changes."
			},
			{
				question:
					"What is the main advantage of using container registries like Docker Hub or Amazon ECR?",
				options: [
					"They automatically fix security vulnerabilities",
					"Centralized storage, versioning, and distribution of container images",
					"They provide runtime orchestration",
					"They replace the need for Kubernetes"
				],
				correct: 1,
				explanation:
					"Container registries provide centralized, versioned storage for container images with secure access control. They enable sharing images across teams, environments, and deployments, often including vulnerability scanning and image signing capabilities for security."
			},
			{
				question:
					"In a cloud-native architecture, what is the primary purpose of implementing health checks?",
				options: [
					"To monitor developer productivity",
					"To enable automatic service discovery and traffic routing decisions",
					"To reduce infrastructure costs",
					"To improve code quality"
				],
				correct: 1,
				explanation:
					"Health checks (liveness and readiness probes) allow orchestration platforms to make intelligent decisions about traffic routing, service discovery, and automatic recovery. They enable the platform to detect unhealthy services, stop routing traffic to them, and potentially restart them automatically."
			},
			{
				question:
					"Which cloud-native pattern best addresses the challenge of managing configuration across multiple environments?",
				options: [
					"Hardcoding configuration in application code",
					"Using environment variables and external configuration stores",
					"Storing configuration in databases",
					"Embedding configuration in container images"
				],
				correct: 1,
				explanation:
					"The Twelve-Factor App methodology recommends storing configuration in environment variables and external configuration stores (like Kubernetes ConfigMaps/Secrets, HashiCorp Vault, or AWS Parameter Store). This separates configuration from code, enabling the same container to run in different environments with different configurations."
			},
			{
				question:
					"What is the primary benefit of implementing distributed tracing in a microservices architecture?",
				options: [
					"Faster database queries",
					"Ability to track requests across multiple services to identify bottlenecks",
					"Reduced network latency",
					"Automatic error fixing"
				],
				correct: 1,
				explanation:
					"Distributed tracing tracks requests as they flow through multiple services, creating a trace that shows the complete request journey. This enables identification of performance bottlenecks, error sources, and service dependencies, which is crucial for debugging and optimizing distributed systems."
			}
		]
	}
};

// Demo study guide content
export const demoStudyGuide: StudyGuideContent = {
	type: "study_guide",
	title: "Cloud-Native Architecture Mastery",
	summary:
		"Comprehensive study guide covering container orchestration, microservices, CI/CD, monitoring, and cloud-native patterns with interactive flashcards.",
	studyGuide: {
		description:
			"Comprehensive study guide covering container orchestration, microservices, CI/CD, monitoring, and cloud-native patterns",
		minimumCards: 12,
		flashcards: [
			{
				front: "What is Kubernetes and why is it essential for cloud-native applications?",
				back: "Kubernetes is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications across clusters. It's essential because it provides declarative configuration, self-healing capabilities, horizontal scaling, service discovery, and load balancing - all critical for managing microservices at scale.",
				tags: ["kubernetes", "orchestration", "cloud-native"]
			},
			{
				front: "Explain the difference between a Pod, Deployment, and Service in Kubernetes",
				back: "• **Pod**: Smallest deployable unit containing one or more containers sharing storage/network\n• **Deployment**: Manages Pod replicas, rolling updates, and rollbacks declaratively\n• **Service**: Provides stable networking endpoint and load balancing to access Pods, abstracting away Pod IP changes",
				tags: ["kubernetes", "pods", "deployments", "services"]
			},
			{
				front: "What are the key differences between StatefulSets and Deployments?",
				back: "**StatefulSets** provide:\n• Stable, unique network identifiers\n• Persistent storage that follows the Pod\n• Ordered deployment and scaling\n• Ordered rolling updates\n\n**Deployments** are for stateless applications with interchangeable Pods, while StatefulSets are for stateful applications like databases that need persistent identity and storage.",
				tags: ["kubernetes", "statefulsets", "deployments"]
			},
			{
				front: "What is the Twelve-Factor App methodology and its key principles?",
				back: "The Twelve-Factor App is a methodology for building SaaS applications. Key principles:\n• **Codebase**: One codebase, many deploys\n• **Dependencies**: Explicitly declare dependencies\n• **Config**: Store config in environment\n• **Processes**: Execute as stateless processes\n• **Logs**: Treat logs as event streams\n• **Disposability**: Fast startup and graceful shutdown",
				tags: ["twelve-factor", "architecture", "best-practices"]
			},
			{
				front: "What is Service Mesh and how does it solve microservices communication challenges?",
				back: "A Service Mesh is a dedicated infrastructure layer that handles service-to-service communication. It provides:\n• **Traffic Management**: Load balancing, routing, retries\n• **Security**: mTLS, authentication, authorization\n• **Observability**: Metrics, tracing, logging\n• **Policy Enforcement**: Rate limiting, circuit breaking\n\nPopular implementations: Istio, Linkerd, Consul Connect",
				tags: ["service-mesh", "microservices", "istio"]
			},
			{
				front: "Explain Container Registry security best practices",
				back: "**Security Best Practices**:\n• **Image Scanning**: Scan for vulnerabilities before deployment\n• **Signed Images**: Use Docker Content Trust or Cosign\n• **Private Registries**: Keep sensitive images private\n• **Minimal Base Images**: Use distroless or scratch images\n• **Regular Updates**: Keep base images and dependencies updated\n• **Access Controls**: Implement RBAC and image policies",
				tags: ["security", "containers", "registries"]
			},
			{
				front: "What are Kubernetes Operators and when should you use them?",
				back: "**Operators** extend Kubernetes API to manage complex, stateful applications using custom resources and controllers. They encode operational knowledge into software.\n\n**Use Cases**:\n• Database management (PostgreSQL, MongoDB)\n• Monitoring stack deployment (Prometheus)\n• Certificate management (cert-manager)\n• Backup and recovery automation\n\n**Benefits**: Automate Day 2 operations, reduce operational complexity",
				tags: ["kubernetes", "operators", "automation"]
			},
			{
				front: "What is GitOps and how does it improve deployment practices?",
				back: "**GitOps** uses Git as the single source of truth for declarative infrastructure and applications.\n\n**Core Principles**:\n• **Declarative**: System described declaratively\n• **Versioned**: Stored in version control (Git)\n• **Automated**: Changes applied automatically\n• **Monitored**: Continuous drift detection\n\n**Tools**: ArgoCD, Flux, Jenkins X\n**Benefits**: Improved security, auditability, and rollback capabilities",
				tags: ["gitops", "deployment", "ci-cd"]
			},
			{
				front: "Explain the Circuit Breaker pattern and its implementation in microservices",
				back: "**Circuit Breaker** prevents cascading failures by monitoring service calls and 'opening' when failure threshold is reached.\n\n**States**:\n• **Closed**: Normal operation, calls pass through\n• **Open**: Calls fail immediately, service recovery time\n• **Half-Open**: Limited calls to test service recovery\n\n**Implementation**: Hystrix, resilience4j, Istio\n**Benefits**: Prevents cascade failures, faster failure detection, graceful degradation",
				tags: ["patterns", "resilience", "microservices"]
			},
			{
				front: "What are the key components of observability in cloud-native systems?",
				back: "**Three Pillars of Observability**:\n\n• **Metrics**: Quantitative data (CPU, memory, request rate)\n• **Logs**: Discrete events with context\n• **Traces**: Request flow across distributed services\n\n**Additional Components**:\n• **SLOs/SLIs**: Service level objectives and indicators\n• **Alerting**: Proactive issue notification\n• **Dashboards**: Visual representation of system health\n\n**Tools**: Prometheus, Grafana, Jaeger, ELK Stack",
				tags: ["observability", "monitoring", "metrics"]
			},
			{
				front: "What is Progressive Delivery and how does it differ from traditional deployment?",
				back: "**Progressive Delivery** gradually rolls out changes to reduce risk.\n\n**Strategies**:\n• **Blue-Green**: Switch between two environments\n• **Canary**: Gradual traffic shift to new version\n• **Feature Flags**: Control feature visibility\n• **A/B Testing**: Compare user behavior between versions\n\n**Benefits**: Risk mitigation, faster feedback, improved reliability\n**Tools**: Flagger, Argo Rollouts, Spinnaker",
				tags: ["deployment", "progressive-delivery", "blue-green"]
			},
			{
				front: "Explain Container Security scanning and vulnerability management",
				back: "**Container Security Layers**:\n\n• **Image Scanning**: Static analysis for known vulnerabilities\n• **Runtime Security**: Monitor container behavior for anomalies\n• **Network Policies**: Control pod-to-pod communication\n• **Pod Security Standards**: Enforce security contexts\n• **Supply Chain Security**: Verify image provenance and signatures\n\n**Tools**: Trivy, Clair, Twistlock, Falco, OPA Gatekeeper\n**Best Practice**: Shift-left security, continuous scanning",
				tags: ["security", "scanning", "vulnerabilities"]
			},
			{
				front: "What is Infrastructure as Code (IaC) and what are its core benefits?",
				back: "**Infrastructure as Code** treats infrastructure configuration as software code using declarative definition files.\n\n**Core Benefits**:\n• **Version Control**: Track infrastructure changes\n• **Reproducibility**: Consistent environments\n• **Automation**: Reduced manual errors\n• **Documentation**: Code serves as documentation\n• **Testing**: Infrastructure can be tested\n\n**Tools**: Terraform, CloudFormation, Pulumi, Ansible\n**Best Practice**: Use immutable infrastructure patterns",
				tags: ["iac", "terraform", "automation"]
			},
			{
				front: "Explain the difference between Horizontal and Vertical Pod Autoscaling",
				back: "**Horizontal Pod Autoscaler (HPA)**:\n• Scales the number of Pod replicas\n• Based on CPU, memory, or custom metrics\n• Good for stateless applications\n• Handles increased load by adding more instances\n\n**Vertical Pod Autoscaler (VPA)**:\n• Adjusts CPU and memory requests/limits\n• Modifies resource allocation per Pod\n• Good for applications with varying resource needs\n• Optimizes resource usage efficiency",
				tags: ["kubernetes", "scaling", "hpa", "vpa"]
			},
			{
				front: "What are Kubernetes ConfigMaps and Secrets, and when should you use each?",
				back: "**ConfigMaps**:\n• Store non-confidential configuration data\n• Key-value pairs, configuration files\n• Mounted as volumes or environment variables\n• Plain text, version controlled\n\n**Secrets**:\n• Store sensitive data (passwords, tokens, keys)\n• Base64 encoded (not encrypted by default)\n• Should be encrypted at rest and in transit\n• Limited access via RBAC\n\n**Best Practice**: Use external secret management for production",
				tags: ["kubernetes", "config", "secrets"]
			},
			{
				front: "What is the role of Container Storage Interface (CSI) in Kubernetes?",
				back: "**Container Storage Interface (CSI)** is a standard for exposing arbitrary block and file storage systems to containerized workloads.\n\n**Benefits**:\n• **Vendor Agnostic**: Works with any storage provider\n• **Dynamic Provisioning**: Automatic volume creation\n• **Lifecycle Management**: Volume creation, attachment, mounting\n• **Plugin Architecture**: Extensible storage ecosystem\n\n**Examples**: AWS EBS, Azure Disk, GCP Persistent Disk, NFS, Ceph",
				tags: ["kubernetes", "storage", "csi"]
			},
			{
				front: "Explain the concept of Immutable Infrastructure and its advantages",
				back: "**Immutable Infrastructure** treats servers as disposable resources that are never modified after deployment.\n\n**Key Principles**:\n• **Replace, Don't Modify**: Deploy new instances instead of updating\n• **Consistent State**: All instances are identical\n• **Automated Deployment**: Infrastructure as Code\n\n**Advantages**:\n• **Reliability**: Eliminates configuration drift\n• **Security**: Reduced attack surface\n• **Scalability**: Easy horizontal scaling\n• **Rollback**: Simple revert to previous version",
				tags: ["infrastructure", "immutable", "devops"]
			},
			{
				front: "What is the difference between Ingress and Load Balancer services in Kubernetes?",
				back: "**Load Balancer Service**:\n• Layer 4 (TCP/UDP) load balancing\n• One external IP per service\n• Works with cloud provider load balancers\n• Simple but can be expensive at scale\n\n**Ingress**:\n• Layer 7 (HTTP/HTTPS) load balancing\n• Single entry point for multiple services\n• URL-based routing, SSL termination\n• More cost-effective for multiple services\n• Requires Ingress Controller (nginx, Traefik, Istio)",
				tags: ["kubernetes", "networking", "ingress"]
			},
			{
				front: "What is Helm and how does it solve Kubernetes application management challenges?",
				back: "**Helm** is the package manager for Kubernetes that simplifies application deployment and management.\n\n**Key Features**:\n• **Charts**: Packaged Kubernetes manifests\n• **Templating**: Dynamic value injection\n• **Release Management**: Track deployment history\n• **Dependency Management**: Handle chart dependencies\n• **Rollback**: Easy revert to previous versions\n\n**Benefits**: Simplified deployments, reusability, version control of applications",
				tags: ["helm", "kubernetes", "package-management"]
			},
			{
				front: "Explain the concept of Zero-Trust Security in cloud-native environments",
				back: "**Zero-Trust Security** assumes no implicit trust and continuously validates every transaction.\n\n**Core Principles**:\n• **Never Trust, Always Verify**: Authenticate and authorize everything\n• **Least Privilege Access**: Minimal necessary permissions\n• **Micro-segmentation**: Isolate network segments\n• **Continuous Monitoring**: Real-time security assessment\n\n**Implementation**:\n• Service mesh with mTLS\n• Network policies\n• RBAC and admission controllers\n• Runtime security monitoring",
				tags: ["security", "zero-trust", "cloud-native"]
			}
		]
	}
};

// Export all demo data
export const demoContent = {
	lesson: demoLesson,
	quiz: demoQuiz,
	studyGuide: demoStudyGuide
} as const;
