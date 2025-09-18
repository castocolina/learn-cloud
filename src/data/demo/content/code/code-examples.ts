/**
 * @file A comprehensive library of code examples for various technologies.
 * @description This file contains a curated list of code snippets for demonstration purposes,
 * covering a wide range of languages and technologies from backend to DevOps.
 * Generated following the ts-morph strategy documented in TECHNICAL-SPECS.md
 */

/**
 * Defines the complexity level of a code example.
 */
export type Complexity = "beginner" | "intermediate" | "advanced";

/**
 * Defines the programming language or technology for a code example.
 */
export type Language =
	| "typescript"
	| "svelte"
	| "javascript"
	| "python"
	| "go"
	| "java"
	| "rust"
	| "php"
	| "hcl" // Terraform
	| "yaml" // Kubernetes, GitHub Actions, AWS SAM
	| "dockerfile"
	| "bash"
	| "sql"
	| "graphql"
	| "cypher" // Neo4j/Cypher
	| "json"
	| "proto" // gRPC
	| "dynamodb";

/**
 * Represents a single code example in the library.
 */
export interface CodeExample {
	/** The title of the code example. */
	title: string;
	/** The programming language or technology. */
	language: Language;
	/** The complexity level of the code. */
	complexity: Complexity;
	/** A brief description of what the code does. */
	description: string;
	/** The code snippet. Must be properly escaped for use in a TypeScript string. */
	code: string;
}

/**
 * A comprehensive library of code examples for various technologies.
 * All code snippets are properly escaped to be used as TypeScript string literals.
 */
export const codeExamples: CodeExample[] = [
	// TypeScript/Svelte Examples
	{
		title: "Svelte 5 State Management",
		language: "svelte",
		complexity: "beginner",
		description: "A simple Svelte 5 component demonstrating reactive state with runes.",
		code: `<script lang="ts">
	let count = $state(0);

	function increment() {
		count++;
	}
</script>

<button onclick={increment}>
	Clicks: {count}
</button>`
	},
	{
		title: "Svelte 5 Derived State",
		language: "svelte",
		complexity: "intermediate",
		description: "Demonstrates creating a derived value from state in Svelte 5.",
		code: `<script lang="ts">
	let count = $state(0);
	const doubled = $derived(count * 2);
</script>

<p>{count} * 2 = {doubled}</p>`
	},
	{
		title: "Svelte 5 Effects",
		language: "svelte",
		complexity: "intermediate",
		description: "Using effects for side effects in Svelte 5.",
		code: `<script lang="ts">
	let name = $state('');
	let greeting = $state('');

	$effect(() => {
		greeting = name ? \`Hello, \${name}!\` : '';
	});
</script>

<input bind:value={name} placeholder="Enter your name" />
<p>{greeting}</p>`
	},
	{
		title: "TypeScript Interface",
		language: "typescript",
		complexity: "beginner",
		description: "Example of a basic TypeScript interface for a User object.",
		code: `interface User {
	id: number;
	name: string;
	email?: string; // Optional property
}`
	},
	{
		title: "TypeScript Generic Function",
		language: "typescript",
		complexity: "intermediate",
		description: "A generic function that can work with any type.",
		code: `function identity<T>(arg: T): T {
	return arg;
}

let output = identity<string>("myString");`
	},
	{
		title: "TypeScript Union Types",
		language: "typescript",
		complexity: "intermediate",
		description: "Using union types for flexible type definitions.",
		code: `type Status = 'pending' | 'completed' | 'cancelled';

interface Task {
	id: number;
	title: string;
	status: Status;
}

function updateTaskStatus(task: Task, newStatus: Status): Task {
	return { ...task, status: newStatus };
}`
	},

	// JavaScript Examples
	{
		title: "JavaScript Async/Await",
		language: "javascript",
		complexity: "beginner",
		description: "Fetching data from an API using async/await syntax.",
		code: `async function fetchData(url) {
	try {
		const response = await fetch(url);
		const data = await response.json();
		console.log(data);
	} catch (error) {
		console.error('Error fetching data:', error);
	}
}`
	},
	{
		title: "JavaScript Array Map",
		language: "javascript",
		complexity: "beginner",
		description: "Using the .map() method to create a new array.",
		code: `const numbers = [1, 2, 3, 4];
const squares = numbers.map(n => n * n);
// squares is [1, 4, 9, 16]`
	},
	{
		title: "JavaScript Class",
		language: "javascript",
		complexity: "intermediate",
		description: "A simple class definition in JavaScript.",
		code: `class Person {
	constructor(name, age) {
		this.name = name;
		this.age = age;
	}

	greet() {
		return \`Hello, my name is \${this.name}\`;
	}
}`
	},
	{
		title: "JavaScript Destructuring",
		language: "javascript",
		complexity: "beginner",
		description: "Using destructuring assignment to unpack values from objects.",
		code: `const user = {
	firstName: 'John',
	lastName: 'Doe'
};

const { firstName, lastName } = user;
console.log(firstName); // "John"`
	},

	// Python Examples
	{
		title: "Python FastAPI Endpoint",
		language: "python",
		complexity: "intermediate",
		description: "A simple GET endpoint in a FastAPI application.",
		code: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
	id: int
	name: str
	email: str

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
	return User(id=user_id, name="John Doe", email="john@example.com")`
	},
	{
		title: "Python List Comprehension",
		language: "python",
		complexity: "beginner",
		description: "A concise way to create lists.",
		code: `squares = [x**2 for x in range(10)]
# squares = [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]`
	},
	{
		title: "Python Pydantic Model",
		language: "python",
		complexity: "intermediate",
		description: "Data validation using Pydantic.",
		code: `from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
	id: int
	name: str
	email: EmailStr
	age: Optional[int] = None

# Usage
user = User(id=1, name="Alice", email="alice@example.com")`
	},
	{
		title: "Python Class with Methods",
		language: "python",
		complexity: "beginner",
		description: "A simple class in Python with proper method definition.",
		code: `class Dog:
	def __init__(self, name):
		self.name = name

	def bark(self):
		return "Woof!"

# Usage
my_dog = Dog("Buddy")
print(my_dog.bark())`
	},
	{
		title: "Python Context Manager",
		language: "python",
		complexity: "advanced",
		description: "Custom context manager for resource management.",
		code: `from contextlib import contextmanager
import logging

@contextmanager
def database_transaction():
	logging.info("Starting transaction")
	try:
		# Setup
		yield "db_connection"
	except Exception as e:
		logging.error(f"Rolling back transaction: {e}")
		raise
	finally:
		logging.info("Closing transaction")

# Usage
with database_transaction() as db:
	# Do database operations
	pass`
	},

	// Go Examples
	{
		title: "Go HTTP Server",
		language: "go",
		complexity: "intermediate",
		description: "A basic HTTP server in Go.",
		code: `package main

import (
	"fmt"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World")
}

func main() {
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}`
	},
	{
		title: "Go Goroutine",
		language: "go",
		complexity: "intermediate",
		description: "Using a goroutine for concurrent execution.",
		code: `package main

import (
	"fmt"
	"time"
)

func say(s string) {
	for i := 0; i < 5; i++ {
		time.Sleep(100 * time.Millisecond)
		fmt.Println(s)
	}
}

func main() {
	go say("world")
	say("hello")
}`
	},
	{
		title: "Go Struct",
		language: "go",
		complexity: "beginner",
		description: "Defining a struct in Go.",
		code: `package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

func main() {
	p := Person{Name: "Alice", Age: 30}
	fmt.Println(p.Name)
}`
	},
	{
		title: "Go Microservice with Health Check",
		language: "go",
		complexity: "advanced",
		description: "Go HTTP server optimized for containerized deployment with health checks.",
		code: `package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"
)

type HealthResponse struct {
	Status  string \`json:"status"\`
	Version string \`json:"version"\`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{Status: "healthy", Version: "1.0.0"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", healthHandler)

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	// Graceful shutdown
	go func() {
		log.Println("Server starting on :8080")
		if err := server.ListenAndServe(); err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	server.Shutdown(ctx)
}`
	},

	// Java Examples
	{
		title: "Java Spring Boot Controller",
		language: "java",
		complexity: "intermediate",
		description: "A simple REST controller in a Spring Boot application.",
		code: `package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

	@GetMapping("/")
	public String index() {
		return "Greetings from Spring Boot!";
	}
}`
	},
	{
		title: "Java Class",
		language: "java",
		complexity: "beginner",
		description: "A simple class in Java.",
		code: `public class Dog {
	private String name;

	public Dog(String name) {
		this.name = name;
	}

	public void bark() {
		System.out.println("Woof!");
	}
}`
	},
	{
		title: "Java Stream API",
		language: "java",
		complexity: "intermediate",
		description: "Using Java Streams to filter a list.",
		code: `import java.util.List;
import java.util.stream.Collectors;

List<String> names = List.of("Alice", "Bob", "Charlie");
List<String> longNames = names.stream()
						  .filter(name -> name.length() > 5)
						  .collect(Collectors.toList());`
	},
	{
		title: "Java Record",
		language: "java",
		complexity: "beginner",
		description: "A simple data carrier class using Java Records (JDK 16+).",
		code: `public record User(int id, String name, String email) {}`
	},
	{
		title: "Java Spring Boot Service",
		language: "java",
		complexity: "advanced",
		description: "Service class with dependency injection and error handling.",
		code: `package com.example.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Optional;

@Service
public class UserService {

	@Autowired
	private UserRepository userRepository;

	public Optional<User> findUserById(Long id) {
		try {
			return userRepository.findById(id);
		} catch (Exception e) {
			log.error("Error finding user with id: " + id, e);
			return Optional.empty();
		}
	}

	public User createUser(User user) {
		validateUser(user);
		return userRepository.save(user);
	}

	private void validateUser(User user) {
		if (user.getName() == null || user.getName().trim().isEmpty()) {
			throw new IllegalArgumentException("User name cannot be empty");
		}
	}
}`
	},

	// Rust Examples
	{
		title: "Rust Hello World",
		language: "rust",
		complexity: "beginner",
		description: 'A simple "Hello, world!" program in Rust.',
		code: `fn main() {
	println!("Hello, world!");
}`
	},
	{
		title: "Rust Struct and Impl",
		language: "rust",
		complexity: "intermediate",
		description: "Defining a struct and implementing methods for it.",
		code: `struct Rectangle {
	width: u32,
	height: u32,
}

impl Rectangle {
	fn area(&self) -> u32 {
		self.width * self.height
	}
}`
	},
	{
		title: "Rust Ownership",
		language: "rust",
		complexity: "advanced",
		description: "A simple example of Rust's ownership system.",
		code: `fn main() {
	let s1 = String::from("hello");
	let s2 = s1; // s1 is moved to s2

	// println!("{}", s1); // This would cause a compile error
	println!("{}", s2);
}`
	},

	// PHP Examples
	{
		title: "PHP Class with Constructor",
		language: "php",
		complexity: "beginner",
		description: "A simple class in PHP with proper property access.",
		code: `<?php
class User {
	public $name;

	public function __construct($name) {
		$this->name = $name;
	}

	public function greet() {
		return "Hello, " . $this->name;
	}
}`
	},
	{
		title: "PHP Modern API Endpoint",
		language: "php",
		complexity: "intermediate",
		description: "Modern PHP API endpoint with proper error handling.",
		code: `<?php
declare(strict_types=1);

class UserController {
	public function getUser(int $userId): array {
		try {
			$user = $this->userRepository->find($userId);

			if (!$user) {
				http_response_code(404);
				return ['error' => 'User not found'];
			}

			return [
				'id' => $user->getId(),
				'name' => $user->getName(),
				'email' => $user->getEmail()
			];
		} catch (Exception $e) {
			http_response_code(500);
			return ['error' => 'Internal server error'];
		}
	}
}`
	},

	// Terraform Examples
	{
		title: "Terraform AWS S3 Bucket",
		language: "hcl",
		complexity: "beginner",
		description: "A simple Terraform configuration to create an AWS S3 bucket.",
		code: `resource "aws_s3_bucket" "main" {
	bucket = "my-unique-bucket-name"
}

resource "aws_s3_bucket_versioning" "main" {
	bucket = aws_s3_bucket.main.id
	versioning_configuration {
		status = "Enabled"
	}
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
	bucket = aws_s3_bucket.main.id

	rule {
		apply_server_side_encryption_by_default {
			sse_algorithm = "AES256"
		}
	}
}`
	},
	{
		title: "Terraform with Provider Versioning",
		language: "hcl",
		complexity: "advanced",
		description: "Terraform configuration with provider versioning and remote state.",
		code: `terraform {
	required_version = ">= 1.0"
	required_providers {
		aws = {
			source  = "hashicorp/aws"
			version = "~> 5.0"
		}
	}

	backend "s3" {
		bucket = "my-terraform-state"
		key    = "infrastructure/terraform.tfstate"
		region = "us-west-2"
	}
}

provider "aws" {
	region = var.aws_region
}

variable "aws_region" {
	description = "AWS region for resources"
	type        = string
	default     = "us-west-2"
}

resource "aws_vpc" "main" {
	cidr_block           = "10.0.0.0/16"
	enable_dns_hostnames = true
	enable_dns_support   = true

	tags = {
		Name        = "main-vpc"
		Environment = var.environment
	}
}`
	},

	// Kubernetes Examples
	{
		title: "Kubernetes Deployment",
		language: "yaml",
		complexity: "intermediate",
		description: "A basic Kubernetes Deployment configuration for an Nginx app.",
		code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80`
	},
	{
		title: "Kubernetes Service",
		language: "yaml",
		complexity: "intermediate",
		description: "A Kubernetes Service to expose a Deployment.",
		code: `apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer`
	},
	{
		title: "Kubernetes ConfigMap",
		language: "yaml",
		complexity: "intermediate",
		description: "ConfigMap for application configuration in Kubernetes.",
		code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  database_url: "postgresql://localhost:5432/myapp"
  log_level: "info"
  redis_url: "redis://localhost:6379"
  config.yaml: |
    server:
      port: 8080
      timeout: 30s
    features:
      feature_a: true
      feature_b: false`
	},

	// GitHub Actions Examples
	{
		title: "GitHub Actions CI Workflow",
		language: "yaml",
		complexity: "intermediate",
		description: "A simple GitHub Actions workflow to run tests.",
		code: `name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Run a one-line script
      run: echo Hello, world!
    - name: Run a multi-line script
      run: |
        echo Add other actions to build,
        echo test, and deploy your project.`
	},
	{
		title: "GitHub Actions Matrix Strategy",
		language: "yaml",
		complexity: "advanced",
		description: "Using a matrix strategy in GitHub Actions to test on multiple versions.",
		code: `jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: \${{ matrix.node-version }}
    - run: npm ci
    - run: npm test`
	},
	{
		title: "Complete CI/CD Pipeline",
		language: "yaml",
		complexity: "advanced",
		description: "Complete CI/CD pipeline with testing, building, and deployment.",
		code: `name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    - run: npm ci
    - run: npm test
    - run: npm run lint

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v4
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: \${{ env.REGISTRY }}
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:latest`
	},

	// Docker Examples
	{
		title: "Dockerfile for Node.js",
		language: "dockerfile",
		complexity: "intermediate",
		description: "A simple Dockerfile for a Node.js application.",
		code: `FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "server.js" ]`
	},
	{
		title: "Multi-stage Dockerfile",
		language: "dockerfile",
		complexity: "advanced",
		description: "A multi-stage Dockerfile for a Go application to create a small final image.",
		code: `FROM golang:1.19 AS build
WORKDIR /app
COPY . .
RUN go build -o main .

FROM gcr.io/distroless/base-debian11
WORKDIR /app
COPY --from=build /app/main .
CMD ["/app/main"]`
	},
	{
		title: "Docker Compose for Development",
		language: "yaml",
		complexity: "intermediate",
		description: "Docker Compose setup for local development with services.",
		code: `version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:`
	},

	// Bash Examples
	{
		title: "Bash Script to Count Files",
		language: "bash",
		complexity: "beginner",
		description: "A simple bash script to count files in the current directory.",
		code: `#!/bin/bash
echo "File count in current directory:"
ls -1 | wc -l`
	},
	{
		title: "Bash Script with Error Handling",
		language: "bash",
		complexity: "intermediate",
		description: "A bash script with proper error handling and logging.",
		code: `#!/bin/bash
set -euo pipefail

LOG_FILE="/var/log/deploy.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

deploy_app() {
    log "Starting deployment..."

    if ! command -v docker &> /dev/null; then
        log "ERROR: Docker not found"
        exit 1
    fi

    log "Pulling latest image..."
    docker pull myapp:latest || {
        log "ERROR: Failed to pull image"
        exit 1
    }

    log "Deployment completed successfully"
}

deploy_app "$@"`
	},

	// SQL Examples
	{
		title: "SQL SELECT Statement",
		language: "sql",
		complexity: "beginner",
		description: "A basic SQL query to select all columns from a users table.",
		code: `SELECT * FROM users;`
	},
	{
		title: "SQL JOIN with Aggregation",
		language: "sql",
		complexity: "intermediate",
		description: "A SQL query to join tables with aggregation functions.",
		code: `SELECT
    u.name,
    COUNT(o.id) as order_count,
    SUM(o.total_amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2023-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC;`
	},

	// GraphQL Examples
	{
		title: "GraphQL Query",
		language: "graphql",
		complexity: "beginner",
		description: "A simple GraphQL query to fetch a user by ID.",
		code: `query GetUser {
  user(id: "1") {
    id
    name
    email
  }
}`
	},
	{
		title: "GraphQL Mutation",
		language: "graphql",
		complexity: "intermediate",
		description: "A GraphQL mutation to create a new user.",
		code: `mutation CreateUser {
  createUser(input: {name: "Jane Doe", email: "jane.doe@example.com"}) {
    id
    name
    email
  }
}`
	},
	{
		title: "GraphQL with Variables",
		language: "graphql",
		complexity: "intermediate",
		description: "GraphQL query using variables and fragments.",
		code: `query GetUserPosts($userId: ID!, $limit: Int = 10) {
  user(id: $userId) {
    ...UserInfo
    posts(first: $limit) {
      edges {
        node {
          id
          title
          content
          createdAt
        }
      }
    }
  }
}

fragment UserInfo on User {
  id
  name
  email
  avatar
}`
	},

	// Cypher Examples
	{
		title: "Cypher Match Node",
		language: "cypher",
		complexity: "beginner",
		description: "A Cypher query to find a node in a Neo4j graph database.",
		code: `MATCH (p:Person {name: 'Alice'}) RETURN p;`
	},
	{
		title: "Cypher Create Relationship",
		language: "cypher",
		complexity: "intermediate",
		description: "A Cypher query to create a relationship between two nodes.",
		code: `MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'})
MERGE (a)-[r:KNOWS]->(b)
RETURN type(r);`
	},

	// DynamoDB Examples
	{
		title: "DynamoDB PutItem",
		language: "dynamodb",
		complexity: "intermediate",
		description: "An example of a PutItem operation for AWS DynamoDB using the AWS CLI.",
		code: `aws dynamodb put-item \\
    --table-name Music \\
    --item '{ "Artist": {"S": "No One You Know"}, "SongTitle": {"S": "Call Me Today"}, "AlbumTitle": {"S": "Somewhat Famous"} }'`
	},
	{
		title: "DynamoDB Query",
		language: "dynamodb",
		complexity: "intermediate",
		description: "An example of a Query operation for AWS DynamoDB using the AWS CLI.",
		code: `aws dynamodb query \\
    --table-name Music \\
    --key-condition-expression "Artist = :artist" \\
    --expression-attribute-values  '{ ":artist": {"S": "No One You Know"} }'`
	},

	// JSON Examples
	{
		title: "JSON Configuration",
		language: "json",
		complexity: "beginner",
		description: "A JSON configuration file for an application.",
		code: `{
  "server": {
    "port": 8080,
    "host": "localhost"
  },
  "database": {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "name": "myapp"
  },
  "features": {
    "authentication": true,
    "logging": true
  }
}`
	},
	{
		title: "JSON API Response",
		language: "json",
		complexity: "intermediate",
		description: "A structured JSON API response with pagination.",
		code: `{
  "data": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    },
    {
      "id": 2,
      "name": "Bob",
      "email": "bob@example.com"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 25,
    "total_pages": 3
  },
  "meta": {
    "timestamp": "2023-12-01T10:00:00Z",
    "version": "1.0"
  }
}`
	},

	// gRPC Examples
	{
		title: "gRPC Service Definition",
		language: "proto",
		complexity: "intermediate",
		description: "A .proto file defining a simple gRPC service.",
		code: `syntax = "proto3";

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}`
	},
	{
		title: "gRPC with Complex Types",
		language: "proto",
		complexity: "advanced",
		description: "A more complex .proto file with imports, enums, and streaming.",
		code: `syntax = "proto3";

import "google/protobuf/timestamp.proto";

service UserService {
  rpc GetUser (GetUserRequest) returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
  rpc UpdateUserStatus (UpdateStatusRequest) returns (User);
}

message User {
  enum Status {
    ACTIVE = 0;
    INACTIVE = 1;
    PENDING = 2;
  }
  string user_id = 1;
  string display_name = 2;
  string email = 3;
  Status status = 4;
  google.protobuf.Timestamp created_at = 5;
}

message GetUserRequest {
  string user_id = 1;
}

message ListUsersRequest {
  int32 page_size = 1;
  string page_token = 2;
}

message UpdateStatusRequest {
  string user_id = 1;
  User.Status new_status = 2;
}`
	},

	// AWS SAM Examples
	{
		title: "AWS SAM Template",
		language: "yaml",
		complexity: "intermediate",
		description: "An AWS SAM template for a serverless application.",
		code: `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  sam-app

Resources:
  HelloWorldFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: hello_world/
      Handler: app.lambda_handler
      Runtime: python3.9
      Events:
        HelloWorld:
          Type: Api
          Properties:
            Path: /hello
            Method: get`
	},
	{
		title: "AWS SAM with API Gateway",
		language: "yaml",
		complexity: "advanced",
		description: "An AWS SAM template with an API Gateway and multiple Lambda functions.",
		code: `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: An AWS SAM application with API Gateway.

Globals:
  Function:
    Runtime: nodejs18.x
    MemorySize: 128
    Timeout: 30

Resources:
  MyApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      Cors:
        AllowMethods: "'GET,POST,PUT,DELETE'"
        AllowHeaders: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
        AllowOrigin: "'*'"

  GetUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: users.get
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /users/{id}
            Method: GET
            RestApiId: !Ref MyApi

  CreateUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: users.create
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /users
            Method: POST
            RestApiId: !Ref MyApi

Outputs:
  ApiUrl:
    Description: "API Gateway endpoint URL"
    Value: !Sub "https://\${MyApi}.execute-api.\${AWS::Region}.amazonaws.com/prod/"`
	}
];
