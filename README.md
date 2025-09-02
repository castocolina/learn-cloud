# Learn Cloud-Native Book

This repository contains the content for a comprehensive book on learning and mastering cloud-native technologies. The book aims to guide experienced programmers through the cloud-native stack, bridging their existing knowledge with new concepts, tools, and best practices.

## Status

[![HTML Link Check](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/validation.yml?branch=master&label=HTML%20Link%20Check)](https://github.com/castocolina/learn-cloud/actions/workflows/validation.yml)
[![Mermaid Diagram Check](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/validation.yml?branch=master&label=Mermaid%20Diagram%20Check)](https://github.com/castocolina/learn-cloud/actions/workflows/validation.yml)
[![Deployment](https://img.shields.io/github/actions/workflow/status/castocolina/learn-cloud/deploy.yml?branch=master&label=Deployment)](https://github.com/castocolina/learn-cloud/actions/workflows/deploy.yml)

## Getting Started

To set up the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/castocolina/learn-cloud.git
    cd learn-cloud
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Serve the content (for local viewing):**
    You can use a simple HTTP server to view the book content. If you don't have one, you can install `http-server`:
    ```bash
    npm install -g http-server
    http-server . -p 8080
    ```
    Then, open your browser and navigate to `http://localhost:8080`.

## Mind Map

Here is a high-level overview of the topics covered in this book:

```mermaid
graph LR
    A[Cloud-Native] --> B[Programming Languages];
    A --> C[DevOps & CI/CD];
    A --> D[Secrets & Configuration];
    A --> E[Security - DevSecOps];
    A --> F[Automation];
    A --> G[Cloud Computing];
    A --> H[Systems Integration];
    A --> I[Capstone Projects];

    B --> B1[Python];
    B --> B2[Go];

    B1 --> B1b[Development Environment];
    B1 --> B1a[Fundamentals];
    B1 --> B1c[Backend Patterns];
    B1 --> B1d[Advanced Concepts];
    B1 --> B1e[Testing & Observability];

    B2 --> B2b[Development Environment];
    B2 --> B2a[Fundamentals];
    B2 --> B2c[Backend Patterns];
    B2 --> B2d[Advanced Concepts];
    B2 --> B2e[Testing & Observability];

    C --> C1[Terraform - IaC];
    C --> C2[Kubernetes];
    C --> C3[GitHub Actions - CI/CD];
    C --> C4[Spinnaker - CD];

    D --> D1[HashiCorp Consul];
    D --> D2[HashiCorp Vault];

    E --> E1[SAST / SCA];
    E --> E2[Container Scanning];
    E --> E3[Vulnerability Management];

    F --> F1[RenovateBot];

    G --> G1[AWS - Lambda];

    H --> H1[Securely Connecting Services];

    I --> I1[Python Project];
    I --> I2[Go Project];
```