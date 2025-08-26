# Learn Cloud-Native Book

This repository contains the content for a book on learning and mastering cloud-native technologies.

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

    D --> D1[HashiCorp Vault];
    D --> D2[HashiCorp Consul];

    E --> E1[SAST / SCA];
    E --> E2[Container Scanning];
    E --> E3[Vulnerability Management];

    F --> F1[RenovateBot];

    G --> G1[AWS - Lambda];

    H --> H1[Securely Connecting Services];

    I --> I1[Python Project];
    I --> I2[Go Project];
```
