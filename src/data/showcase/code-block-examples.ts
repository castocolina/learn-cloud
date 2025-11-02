/**
 * Code Block Examples for Showcase (Task 8F)
 *
 * Curated examples demonstrating syntax highlighting for 12 programming languages.
 * Using TypeScript data structure to avoid template string escaping issues.
 */

import type { ProgrammingLanguage } from "$types";

export interface CodeExample {
	language: ProgrammingLanguage;
	title: string;
	code: string;
}

export const CODE_EXAMPLES: CodeExample[] = [
	{
		language: "typescript",
		title: "TypeScript - Complex Types & Generics",
		code: `// Generic Promise wrapper with type inference
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  const data = await response.json();

  return {
    data: data as T,
    status: response.status,
    message: response.ok ? "Success" : "Error"
  };
}

// Usage with type inference
const userResponse = await fetchData<{ id: number; name: string }>("/api/user/1");
console.log(userResponse.data.name); // Type-safe access`
	},
	{
		language: "python",
		title: "Python - Decorators & Async/Await",
		code: `# Function decorator with metadata
from functools import wraps
from typing import Callable, Any
import asyncio

def retry(max_attempts: int = 3):
    """Retry decorator for async functions"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    await asyncio.sleep(2 ** attempt)
        return wrapper
    return decorator

@retry(max_attempts=5)
async def fetch_user_data(user_id: int) -> dict:
    """Fetch user data with automatic retry"""
    async with aiohttp.ClientSession() as session:
        async with session.get(f"/api/users/{user_id}") as response:
            return await response.json()`
	},
	{
		language: "rust",
		title: "Rust - Lifetimes, Traits & Pattern Matching",
		code: `// Generic trait with lifetime bounds
use std::fmt::Display;

trait Validator<'a> {
    fn validate(&self, input: &'a str) -> Result<&'a str, String>;
}

struct EmailValidator;

impl<'a> Validator<'a> for EmailValidator {
    fn validate(&self, input: &'a str) -> Result<&'a str, String> {
        match input.contains('@') && input.contains('.') {
            true => Ok(input),
            false => Err("Invalid email format".to_string()),
        }
    }
}

// Pattern matching with enum
enum ApiResult<T> {
    Success(T),
    Error { code: u16, message: String },
    Pending,
}

fn process_result<T: Display>(result: ApiResult<T>) -> String {
    match result {
        ApiResult::Success(data) => format!("Success: {}", data),
        ApiResult::Error { code, message } => format!("Error {}: {}", code, message),
        ApiResult::Pending => "Still processing...".to_string(),
    }
}`
	},
	{
		language: "go",
		title: "Go - Goroutines, Channels & Interfaces",
		code: `// Worker pool pattern with goroutines
package main

import (
  "context"
  "fmt"
  "sync"
)

type Job struct {
  ID   int
  Data string
}

type Result struct {
  JobID int
  Value string
  Error error
}

type Worker interface {
  Process(ctx context.Context, job Job) (string, error)
}

func runWorkerPool(ctx context.Context, workers int, jobs <-chan Job, results chan<- Result, worker Worker) {
  var wg sync.WaitGroup

  for i := 0; i < workers; i++ {
    wg.Add(1)
    go func(workerID int) {
      defer wg.Done()
      for job := range jobs {
        select {
        case <-ctx.Done():
          return
        default:
          value, err := worker.Process(ctx, job)
          results <- Result{JobID: job.ID, Value: value, Error: err}
        }
      }
    }(i)
  }

  wg.Wait()
  close(results)
}`
	},
	{
		language: "sql",
		title: "SQL - CTEs, Window Functions & JSON",
		code: `-- Complex analytics query with CTEs and window functions
WITH user_activity AS (
  SELECT
    user_id,
    action_type,
    created_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as recent_rank,
    LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at) as prev_action_time
  FROM user_actions
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
),
user_metrics AS (
  SELECT
    user_id,
    COUNT(*) as total_actions,
    COUNT(DISTINCT action_type) as unique_actions,
    EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / 3600 as activity_hours,
    json_agg(
      json_build_object(
        'action', action_type,
        'timestamp', created_at
      ) ORDER BY created_at DESC
    ) FILTER (WHERE recent_rank <= 5) as recent_actions
  FROM user_activity
  GROUP BY user_id
)
SELECT
  u.email,
  um.total_actions,
  um.unique_actions,
  ROUND(um.activity_hours::numeric, 2) as hours_active,
  um.recent_actions
FROM users u
INNER JOIN user_metrics um ON u.id = um.user_id
WHERE um.total_actions >= 10
ORDER BY um.total_actions DESC
LIMIT 100;`
	},
	{
		language: "yaml",
		title: "YAML - Kubernetes Deployment",
		code: `# Kubernetes Deployment with resource limits and health checks
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
  labels:
    app: web-app
    environment: production
    version: v2.1.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
        version: v2.1.0
    spec:
      containers:
      - name: app
        image: myregistry.io/web-app:2.1.0
        ports:
        - containerPort: 8080
          name: http
          protocol: TCP
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: REDIS_HOST
          value: redis-service.production.svc.cluster.local
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5`
	},
	{
		language: "javascript",
		title: "JavaScript - Modern ES6+ Features",
		code: `// Modern JavaScript patterns and features
class UserService {
  #apiClient; // Private field

  constructor(apiClient) {
    this.#apiClient = apiClient;
  }

  // Async iterator for pagination
  async *fetchAllUsers() {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.#apiClient.get(\`/users?page=\${page}\`);
      yield* response.data;

      hasMore = response.hasNextPage;
      page++;
    }
  }

  // Pipeline operations with reduce
  async processUsers(filterFn, transformFn) {
    const users = [];

    for await (const user of this.fetchAllUsers()) {
      if (filterFn(user)) {
        users.push(transformFn(user));
      }
    }

    return users;
  }

  // Optional chaining and nullish coalescing
  getUserEmail(user) {
    return user?.contact?.email ?? 'No email provided';
  }
}

// Usage
const service = new UserService(apiClient);
const activeAdmins = await service.processUsers(
  user => user.role === 'admin' && user.isActive,
  user => ({ id: user.id, email: user.contact.email })
);`
	},
	{
		language: "graphql",
		title: "GraphQL - Schema & Complex Queries",
		code: `# GraphQL schema with types, interfaces, and directives
type Query {
  user(id: ID!): User
  users(
    first: Int = 10
    after: String
    filter: UserFilter
    orderBy: UserOrderBy
  ): UserConnection!

  searchContent(
    query: String!
    types: [ContentType!]
    limit: Int = 20
  ): [SearchResult!]!
}

interface Node {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type User implements Node {
  id: ID!
  email: String!
  name: String!
  role: UserRole!
  posts: [Post!]!
  comments: [Comment!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Post implements Node {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User!
  tags: [Tag!]!
  comments: [Comment!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum UserRole {
  ADMIN
  MODERATOR
  USER
  GUEST
}

input UserFilter {
  role: UserRole
  createdAfter: DateTime
  search: String
}

enum UserOrderBy {
  CREATED_AT_ASC
  CREATED_AT_DESC
  NAME_ASC
  NAME_DESC
}

union SearchResult = User | Post | Comment

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}`
	},
	{
		language: "bash",
		title: "Bash - Advanced Scripting",
		code: `#!/bin/bash
# Advanced deployment script with error handling and logging

set -euo pipefail  # Exit on error, undefined vars, pipe failures
IFS=$'\\n\\t'      # Set field separator

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="/var/log/deploy-$(date +%Y%m%d-%H%M%S).log"
readonly MAX_RETRIES=3
readonly TIMEOUT=300

# Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG_FILE" >&2
}

# Error handler
cleanup() {
    local exit_code=$?
    log_info "Cleanup triggered with exit code: $exit_code"

    if [[ $exit_code -ne 0 ]]; then
        log_error "Deployment failed! Rolling back..."
        kubectl rollout undo deployment/web-app -n production
    fi

    exit "$exit_code"
}

trap cleanup EXIT ERR

# Retry function
retry() {
    local max_attempts=$1
    shift
    local cmd=("$@")
    local attempt=1

    until "\${cmd[@]}"; do
        if (( attempt >= max_attempts )); then
            log_error "Command failed after $attempt attempts: \${cmd[*]}"
            return 1
        fi

        log_info "Attempt $attempt failed. Retrying in $((2 ** attempt)) seconds..."
        sleep $((2 ** attempt))
        ((attempt++))
    done
}

# Main deployment
main() {
    log_info "Starting deployment..."

    # Build and push image
    retry $MAX_RETRIES docker build -t myapp:latest .
    retry $MAX_RETRIES docker push myapp:latest

    # Deploy to Kubernetes
    kubectl apply -f k8s/deployment.yaml
    kubectl rollout status deployment/web-app -n production --timeout="\${TIMEOUT}s"

    # Health check
    local endpoint="https://api.example.com/health"
    if ! curl -sf "$endpoint" > /dev/null; then
        log_error "Health check failed at $endpoint"
        return 1
    fi

    log_info "Deployment successful!"
}

main "$@"`
	},
	{
		language: "java",
		title: "Java - Streams, Annotations & Generics",
		code: `// Modern Java with Streams API, Annotations, and Generics
package com.example.service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;

@Service
public class UserService<T extends BaseEntity> {

    private final UserRepository repository;
    private final EventPublisher eventPublisher;

    public UserService(UserRepository repository, EventPublisher eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Find users matching criteria with streaming and transformation
     */
    @Transactional(readOnly = true)
    public List<UserDTO> findUsersByCriteria(SearchCriteria criteria) {
        return repository.findAll(criteria.toSpecification())
            .stream()
            .filter(user -> user.isActive() && !user.isDeleted())
            .map(this::enrichUserData)
            .sorted(Comparator.comparing(UserDTO::getLastLoginDate).reversed())
            .limit(criteria.getMaxResults())
            .collect(Collectors.toList());
    }

    /**
     * Async batch processing with CompletableFuture
     */
    public CompletableFuture<BatchResult<User>> processBatch(List<UserRequest> requests) {
        return CompletableFuture.supplyAsync(() -> {
            List<User> successful = new ArrayList<>();
            List<ProcessingError> errors = new ArrayList<>();

            requests.parallelStream()
                .forEach(request -> {
                    try {
                        User user = createUser(request);
                        successful.add(user);
                        eventPublisher.publish(new UserCreatedEvent(user));
                    } catch (Exception e) {
                        errors.add(new ProcessingError(request.getId(), e.getMessage()));
                    }
                });

            return new BatchResult<>(successful, errors);
        });
    }

    private UserDTO enrichUserData(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .role(user.getRole())
            .metadata(fetchUserMetadata(user.getId()))
            .build();
    }
}`
	},
	{
		language: "hcl",
		title: "HCL - Terraform Infrastructure",
		code: `# Terraform configuration for AWS EKS cluster with networking
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  backend "s3" {
    bucket         = "terraform-state-prod"
    key            = "eks/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# VPC Configuration
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "\${var.environment}-vpc"
  cidr = var.vpc_cidr

  azs             = data.aws_availability_zones.available.names
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway   = true
  single_nat_gateway   = var.environment != "production"
  enable_dns_hostnames = true

  tags = merge(
    var.common_tags,
    {
      "kubernetes.io/cluster/\${local.cluster_name}" = "shared"
    }
  )
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = local.cluster_name
  cluster_version = var.kubernetes_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    general = {
      name           = "general-nodes"
      instance_types = ["t3.large"]

      min_size     = var.min_nodes
      max_size     = var.max_nodes
      desired_size = var.desired_nodes

      labels = {
        workload = "general"
      }

      tags = {
        Environment = var.environment
      }
    }
  }

  tags = var.common_tags
}`
	},
	{
		language: "dockerfile",
		title: "Dockerfile - Multi-Stage Build",
		code: `# Multi-stage Docker build for Node.js application
# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && \\
    npm cache clean --force

# Stage 2: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
ENV NODE_ENV=production
RUN npm run build && \\
    npm prune --production

# Stage 3: Runner
FROM node:20-alpine AS runner

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 appuser

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \\
    PORT=3000 \\
    HOSTNAME="0.0.0.0"

# Copy built application
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node healthcheck.js || exit 1

# Start application
CMD ["node", "dist/server.js"]`
	},
	{
		language: "json",
		title: "JSON - Complex Configuration",
		code: `{
  "name": "cloud-native-platform",
  "version": "2.1.0",
  "description": "Microservices platform for cloud-native applications",
  "services": {
    "api-gateway": {
      "port": 8080,
      "instances": 3,
      "resources": {
        "cpu": "500m",
        "memory": "512Mi"
      },
      "routes": [
        {
          "path": "/api/v1/users",
          "target": "user-service:8081",
          "methods": ["GET", "POST", "PUT", "DELETE"],
          "rateLimit": {
            "requests": 100,
            "window": "1m"
          }
        },
        {
          "path": "/api/v1/orders",
          "target": "order-service:8082",
          "methods": ["GET", "POST"],
          "auth": {
            "type": "jwt",
            "scopes": ["orders:read", "orders:write"]
          }
        }
      ]
    },
    "user-service": {
      "port": 8081,
      "database": {
        "type": "postgresql",
        "host": "postgres.internal",
        "port": 5432,
        "database": "users",
        "pool": {
          "min": 5,
          "max": 20,
          "idleTimeout": 30000
        }
      },
      "cache": {
        "type": "redis",
        "host": "redis.internal",
        "port": 6379,
        "ttl": 3600
      }
    }
  },
  "monitoring": {
    "enabled": true,
    "metrics": {
      "prometheus": {
        "port": 9090,
        "path": "/metrics",
        "interval": "15s"
      },
      "jaeger": {
        "enabled": true,
        "endpoint": "http://jaeger-collector:14268/api/traces",
        "samplingRate": 0.1
      }
    },
    "logging": {
      "level": "info",
      "format": "json",
      "outputs": ["stdout", "elasticsearch"],
      "elasticsearch": {
        "hosts": ["http://elasticsearch:9200"],
        "index": "app-logs"
      }
    }
  }
}`
	}
];

export const EDGE_CASES: CodeExample[] = [
	{
		title: "Edge Case: Syntax Error (Intentional)",
		language: "typescript",
		code: `// This code has intentional syntax errors
function broken(
  const x = 10;  // Wrong: const in parameter list
  y: string = "hello"  // Missing closing paren
) {
  return x + y  // Missing semicolon
  console.log("unreachable")
`
	},
	{
		title: "Edge Case: Empty Code Block",
		language: "javascript",
		code: ""
	},
	{
		title: "Edge Case: Very Long Code (scroll testing)",
		language: "python",
		code: Array.from(
			{ length: 100 },
			(_, i) => `# Line ${i + 1}
def function_${i}():
    """Docstring for function ${i}"""
    x = ${i} * 2
    y = x + ${i}
    return x + y

result_${i} = function_${i}()
print(f"Result ${i}: {result_${i}}")
`
		).join("\n")
	}
];
