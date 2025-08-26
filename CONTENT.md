# Book Index: Mastering Cloud-Native Technologies

---

## Unit 1: Python for Cloud-Native Backend Development

*   **1.1: Development Environment & Tooling**
    *   Setup: Installing Python with `pyenv`.
    *   Dependency Management with Poetry.
    *   IDE Integration (VSCode, PyCharm).
    *   Quiz & Flashcards.
*   **1.2: Overview & Foundational Concepts**
    *   Why Python for the cloud? (Ecosystem, libraries, ease of use).
    *   Core Language Features (Data Structures, Control Flow, Functions, Classes).
    *   Python's Typing System (Type Hints, Pydantic).
    *   Quiz & Flashcards.
*   **1.3: Code Quality and Standards**
    *   PEP 8: The Python Code Style Guide.
    *   Formatting with Black.
    *   Linting with Ruff.
    *   Quiz & Flashcards.
*   **1.4: Core Backend Concepts**
    *   Object-Oriented Programming (OOP) in Python.
    *   Direct Relational DB Access (e.g., using `psycopg2`).
    *   Relational Databases with an ORM (SQLAlchemy).
    *   Working with Popular NoSQL Databases (e.g., Redis, MongoDB).
    *   Quiz & Flashcards.
*   **1.5: Concurrency and Caching**
    *   Concurrency with `asyncio` and `threading`.
    *   In-Process Caching with `functools.lru_cache`.
    *   Quiz & Flashcards.
*   **1.6: Building a RESTful API with FastAPI**
    *   Creating a simple API.
    *   Data validation with Pydantic.
    *   Dependency Injection.
    *   Quiz & Flashcards.
*   **1.7: Advanced Backend Topics**
    *   Event-driven architecture with message queues (e.g., RabbitMQ/Kafka).
    *   Working with Protobuf for gRPC communication.
    *   Communicating with other services.
    *   Quiz & Flashcards.
*   **1.8: Testing Strategies**
    *   Unit and Integration testing with `pytest`.
    *   Mocking services and dependencies (`unittest.mock`).
    *   Emulating services with Testcontainers.
    *   Quiz & Flashcards.
*   **1.9: Observability**
    *   Structured logging, Metrics with Prometheus, Tracing with OpenTelemetry.
    *   Quiz & Flashcards.
*   **1.10: Project: Building a Microservice in Python**
*   **1.11: Unit 1 Final Exam**

## Unit 2: Go for Cloud-Native Backend Development

*   **2.1: Development Environment & Tooling**
    *   Setup: Installing the Go toolchain & project structure.
    *   Dependency Management with Go Modules.
    *   IDE Integration (VSCode, GoLand).
    *   Quiz & Flashcards.
*   **2.2: Overview & Foundational Concepts**
    *   Why Go for the cloud? (Performance, concurrency, static binaries).
    *   Core Language Features (Types, Structs, Interfaces, Control Flow).
    *   Quiz & Flashcards.
*   **2.3: Concurrency: The Go Philosophy**
    *   Go's Concurrency Model: Goroutines & Channels.
    *   Common Concurrency Patterns.
    *   Quiz & Flashcards.
*   **2.4: Code Quality and Standards**
    *   Idiomatic Go.
    *   Formatting with `gofmt`.
    *   Linting with `golangci-lint`.
    *   Quiz & Flashcards.
*   **2.5: Core Backend Concepts**
    *   Structs, interfaces, and object-oriented principles in Go.
    *   Direct Relational DB Access (using `database/sql`).
    *   Relational Databases with an ORM (GORM).
    *   Working with Popular NoSQL Databases (e.g., Redis, MongoDB).
    *   Caching Strategies in Go (patterns and libraries).
    *   Quiz & Flashcards.
*   **2.6: Building a RESTful API**
    *   Using the standard library (`net/http`) and frameworks (e.g., Gin, Echo).
    *   Handling JSON data.
    *   Quiz & Flashcards.
*   **2.7: Advanced Backend Topics**
    *   Event-driven architecture with message queues.
    *   Working with Protobuf for gRPC communication.
    *   Quiz & Flashcards.
*   **2.8: Testing Strategies**
    *   Unit and Integration testing with the `testing` package.
    *   Mocking interfaces and using Testcontainers.
    *   Quiz & Flashcards.
*   **2.9: Observability**
    *   Structured logging, Metrics with Prometheus, Tracing with OpenTelemetry.
    *   Quiz & Flashcards.
*   **2.10: Project: Building a Microservice in Go**
*   **2.11: Unit 2 Final Exam**

## Unit 3: DevOps, IaC, and CI/CD

*   **3.1: Terraform for Infrastructure as Code**
    *   Deep dive into HCL syntax.
    *   Managing remote state.
    *   Creating reusable modules.
    *   Provisioning Kubernetes clusters and cloud resources (AWS).
    *   Quiz & Flashcards.
*   **3.2: Kubernetes for Container Orchestration**
    *   Advanced Deployments (Blue/Green, Canary).
    *   StatefulSets and Persistent Volumes.
    *   Network Policies.
    *   Helm for package management.
    *   Quiz & Flashcards.
*   **3.3: GitHub Actions for CI/CD**
    *   Building complex workflows.
    *   Creating reusable actions.
    *   Managing secrets in GitHub Actions.
    *   Building and pushing Docker images.
    *   Deploying to Kubernetes.
    *   Quiz & Flashcards.
*   **3.4: Spinnaker for Continuous Delivery**
    *   Advanced pipeline strategies.
    *   Integration with Kubernetes and other cloud providers.
    *   Automated canary analysis.
    *   Quiz & Flashcards.
*   **3.5: Unit 3 Final Exam**

## Unit 4: Secrets and Configuration Management

*   **4.1: HashiCorp Vault**
    *   Vault deployment architecture (HA setup).
    *   Dynamic secrets for databases and cloud providers.
    *   Certificate management.
    *   Integrating Vault with Kubernetes (Vault Agent Injector).
    *   Integrating Vault with applications (Python/Go).
    *   Quiz & Flashcards.
*   **4.2: HashiCorp Consul**
    *   Consul deployment architecture (HA setup).
    *   Service discovery in a microservices environment.
    *   Distributed Key-Value store for configuration.
    *   Consul Connect for service mesh.
    *   Quiz & Flashcards.
*   **4.3: Unit 4 Final Exam**

## Unit 5: DevSecOps

*   **5.1: SAST (Static Application Security Testing)**
    *   For Python: `bandit`.
    *   For Go: `gosec`.
    *   Integrating SAST into CI/CD pipelines.
    *   Quiz & Flashcards.
*   **5.2: SCA (Software Composition Analysis)**
    *   For Python: `pip-audit`, `safety`.
    *   For Go: `govulncheck`.
    *   Integrating SCA into CI/CD pipelines.
    *   Quiz & Flashcards.
*   **5.3: Container Image Scanning**
    *   Tools like Trivy, Grype.
    *   Scanning images in CI/CD pipelines before pushing to a registry.
    *   Quiz & Flashcards.
*   **5.4: Vulnerability Management**
    *   Strategies for tracking and remediating vulnerabilities.
    *   Quiz & Flashcards.
*   **5.5: Unit 5 Final Exam**

## Unit 6: Automation

*   **6.1: RenovateBot for Dependency Automation**
    *   Configuring Renovate for Python projects (`requirements.txt`, `pyproject.toml`).
    *   Configuring Renovate for Go projects (`go.mod`).
    *   Advanced configuration and presets.
    *   Quiz & Flashcards.
*   **6.2: Unit 6 Final Exam**

## Unit 7: The Serverless Ecosystem on AWS

*   **7.1: The Serverless Spectrum**
    *   The Serverless Philosophy.
    *   AWS Lambda: Function as a Service (FaaS).
    *   AWS Fargate: Serverless Containers.
    *   Comparing Lambda vs. Fargate: Use cases, performance, and cost.
    *   Quiz & Flashcards.
*   **7.2: AWS Lambda In-Depth**
    *   Advantages & Limitations (Cost model, scalability, cold starts, duration limits).
    *   Lambda Concurrency Explained (Provisioned vs. On-demand, throttling issues).
    *   Using Lambda with Python vs. Go (Performance, packaging, examples).
    *   Quiz & Flashcards.
*   **7.3: Orchestration and Workflows**
    *   Introduction to AWS Step Functions.
    *   Building complex workflows by integrating Lambda and other AWS services.
    *   Quiz & Flashcards.
*   **7.4: Serverless Deployment & Tooling**
    *   Infrastructure as Code with Serverless Framework and AWS SAM.
    *   Quiz & Flashcards.
*   **7.5: AWS Developer Certification Guide**
    *   Key serverless concepts for the exam.
    *   Quiz & Flashcards.
*   **7.6: Unit 7 Final Exam**

## Unit 8: Systems Integration and Security

*   **8.1: Securely Connecting Services**
    *   Passing credentials without hardcoding:
        *   Using Vault to inject secrets into applications.
        *   Using Kubernetes secrets.
        *   Using AWS Secrets Manager and IAM roles for service accounts.
    *   Secure communication with mTLS.
    *   Quiz & Flashcards.
*   **8.2: Unit 8 Final Exam**

## Unit 9: Capstone Projects

*   **9.1: Project 1: Python-based E-Commerce Microservices**
    *   **Brief:** Build a multi-service e-commerce application backend. It will feature a REST API service (FastAPI) for products and orders, a background worker service for processing payments, and communication via a message queue. The entire system will be deployed on Kubernetes using Terraform, with secrets managed by Vault.
*   **9.2: Project 2: Go-based Real-Time Analytics Pipeline**
    *   **Brief:** Build a high-performance backend system for a real-time analytics platform. It will use gRPC for high-speed internal data ingestion, leverage Go's concurrency for parallel processing, and expose a minimal REST API for querying results. It will be deployed on Kubernetes using the same DevOps stack.

---

## Main Sources & Bibliography

*   **General:** [12 Factor App](https://12factor.net/)
*   **Languages:** [Python Docs](https://docs.python.org/3/), [Go Docs](https://go.dev/doc/)
*   **Tools:** [Terraform Docs](https://developer.hashicorp.com/terraform/docs), [Kubernetes Docs](https://kubernetes.io/docs/), [Vault Docs](https://developer.hashicorp.com/vault/docs), [Consul Docs](https://developer.hashicorp.com/consul/docs), [GitHub Actions Docs](https://docs.github.com/en/actions), [Spinnaker Docs](https://spinnaker.io/docs/), [RenovateBot Docs](https://docs.renovatebot.com/)
*   **Cloud:** [AWS Docs](https://docs.aws.amazon.com/)