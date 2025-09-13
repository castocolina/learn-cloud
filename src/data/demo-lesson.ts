import type { LessonContent, CodeBlock, Diagram } from "./types";

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
		}
	]
};
