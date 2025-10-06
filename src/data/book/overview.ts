/**
 * Book Overview - Cloud-Native Learning Platform
 *
 * Main landing page content for the comprehensive cloud-native technologies book.
 * Provides introduction, learning objectives, platform navigation guide, and course structure.
 *
 * This overview is NOT part of any unit - it serves as the entry point for the entire book.
 */

export const content = {
	type: "overview",
	title: "Welcome to Mastering Cloud-Native Technologies",
	summary:
		"Your comprehensive guide to designing, building, and deploying robust, scalable, and secure applications using modern cloud-native practices.",
	status: "draft",
	estimatedTime: 15,
	prerequisites: [
		"Experience with at least one programming language (Java, PHP, C#, or similar)",
		"Basic understanding of web development concepts",
		"Familiarity with command-line interfaces",
		"Eagerness to learn modern cloud-native technologies"
	],
	learningObjectives: [
		"Master backend development with Python, Go, and Rust for cloud-native applications",
		"Understand and implement Infrastructure as Code using Terraform",
		"Deploy and manage containerized applications with Kubernetes",
		"Build robust CI/CD pipelines with GitHub Actions",
		"Implement secure secrets management with HashiCorp Vault",
		"Apply DevSecOps principles to integrate security throughout the development lifecycle",
		"Design and deploy serverless architectures on AWS",
		"Integrate and secure complex distributed systems"
	],
	difficulty: "intermediate",
	sections: [
		{
			title: "Who Is This Book For?",
			content: [
				{
					type: "paragraph",
					content: [
						{
							text: "This book is designed for experienced programmers who are new to the cloud-native stack. If you have a background in languages like Java or PHP and want to transition your skills to the modern world of microservices, containers, and orchestration, you're in the right place."
						}
					]
				},
				{
					type: "paragraph",
					content: [
						{
							text: "We assume you understand fundamental programming concepts—variables, functions, control flow, and object-oriented design—and are comfortable working in a terminal environment. What we don't assume is prior knowledge of cloud platforms, containerization, or modern DevOps practices. We'll build that knowledge together, step by step."
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "Teaching Philosophy",
					content: [
						{
							text: "Every topic starts with fundamental principles before moving to advanced concepts. We bridge your existing programming knowledge to the cloud-native ecosystem, highlighting key differences and advantages. This isn't just theory—all examples are production-ready code following industry best practices."
						}
					]
				}
			]
		},
		{
			title: "What You'll Learn",
			content: [
				{
					type: "paragraph",
					content: [
						{
							text: "This comprehensive course covers the full spectrum of cloud-native development, from backend programming languages to deployment automation and security:"
						}
					]
				},
				{
					type: "list",
					ordered: false,
					items: [
						"Backend development with Python and Go",
						"Infrastructure as Code (IaC) with Terraform",
						"Container orchestration with Kubernetes",
						"CI/CD pipelines with GitHub Actions",
						"Secrets management with HashiCorp Vault",
						"DevSecOps practices and security integration",
						"Automated dependency management and workflows",
						"Serverless architectures on AWS",
						"Systems integration and secure service connections"
					]
				},
				{
					type: "callout",
					calloutType: "tip",
					title: "Hands-On Learning",
					content: [
						{
							text: "Each unit includes interactive quizzes, study guides with flashcards, and real-world projects. You'll not only learn concepts but apply them in practical scenarios that mirror production environments."
						}
					]
				}
			]
		},
		{
			title: "How to Use This Platform",
			content: [
				{
					type: "paragraph",
					content: [
						{
							text: "Use the navigation menu on the left to browse through the units and topics. Your progress will be tracked automatically as you complete lessons and assessments. Each topic includes:"
						}
					]
				},
				{
					type: "list",
					ordered: true,
					items: [
						"Comprehensive lessons with code examples and diagrams",
						"Study guides with interactive flashcards for key concepts",
						"Quizzes to test your understanding",
						"Hands-on projects to apply your knowledge",
						"Sequential navigation to guide your learning path"
					]
				},
				{
					type: "paragraph",
					content: [
						{
							text: "The platform supports both light and dark themes, and all content is optimized for mobile devices. Use keyboard shortcuts (like Cmd+B or Ctrl+B) to toggle the sidebar for distraction-free reading."
						}
					]
				}
			]
		},
		{
			title: "Course Structure",
			content: [
				{
					type: "paragraph",
					content: [
						{
							text: "The curriculum is organized into 9 comprehensive units, each building upon previous knowledge to create a complete cloud-native skillset:"
						}
					]
				},
				{
					type: "diagram",
					diagramType: "mermaid",
					definition: `graph TB
    subgraph "Foundation"
        U1["Unit 1: Python<br/>Backend Development"]
        U2["Unit 2: Go<br/>Backend Development"]
    end

    subgraph "Infrastructure"
        U3["Unit 3: DevOps, IaC & CI/CD<br/>Terraform, GitHub Actions"]
        U4["Unit 4: Secrets Management<br/>HashiCorp Vault"]
    end

    subgraph "Security & Automation"
        U5["Unit 5: DevSecOps<br/>Security Integration"]
        U6["Unit 6: Automation<br/>Workflows & Dependencies"]
    end

    subgraph "Cloud & Integration"
        U7["Unit 7: Serverless on AWS<br/>Lambda, API Gateway"]
        U8["Unit 8: Systems Integration<br/>Service Connections"]
    end

    subgraph "Mastery"
        U9["Unit 9: Capstone Projects<br/>Real-World Applications"]
    end

    U1 --> U3
    U2 --> U3
    U3 --> U4
    U4 --> U5
    U5 --> U6
    U6 --> U7
    U7 --> U8
    U8 --> U9

    style U1 fill:#3b82f6
    style U2 fill:#3b82f6
    style U3 fill:#10b981
    style U4 fill:#10b981
    style U5 fill:#f59e0b
    style U6 fill:#f59e0b
    style U7 fill:#8b5cf6
    style U8 fill:#8b5cf6
    style U9 fill:#ef4444`,
					title: "Learning Pathway",
					caption:
						"Progressive curriculum building from fundamentals to advanced cloud-native mastery"
				}
			]
		},
		{
			title: "Course Units Overview",
			content: [
				{
					type: "paragraph",
					content: [
						{
							text: "Here's a detailed breakdown of what each unit covers:"
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "📚 Unit 1: Python for Cloud-Native Backend Development",
					content: [
						{
							text: "Master Python development for modern cloud-native applications. Covers development environment setup, tooling, best practices, and building production-ready backend services. "
						},
						{
							text: "10 comprehensive topics",
							bold: true
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "⚡ Unit 2: Go for Cloud-Native Backend Development",
					content: [
						{
							text: "Learn Go programming for high-performance cloud services. Explore Go's concurrency model, performance characteristics, and idiomatic patterns for scalable backend systems. "
						},
						{
							text: "10 comprehensive topics",
							bold: true
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "🛠️ Unit 3: DevOps, Infrastructure as Code, and CI/CD",
					content: [
						{
							text: "Infrastructure automation and deployment pipelines. Master Terraform for IaC and GitHub Actions for continuous integration and deployment. "
						},
						{
							text: "4 comprehensive topics",
							bold: true
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "🔒 Unit 4: Secrets and Configuration Management",
					content: [
						{
							text: "Secure secrets management with HashiCorp Vault and Consul. Learn best practices for handling sensitive data in distributed systems. "
						},
						{
							text: "2 comprehensive topics",
							bold: true
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "🛡️ Unit 5: DevSecOps - Security Integration",
					content: [
						{
							text: "Security integration throughout the development lifecycle. Implement automated security scanning, vulnerability management, and compliance checks. "
						},
						{
							text: "4 comprehensive topics",
							bold: true
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "🤖 Unit 6: Automation & Dependency Management",
					content: [
						{
							text: "Automated dependency management and workflow optimization. Tools like Renovate and Dependabot for keeping systems up-to-date and secure. "
						},
						{
							text: "1 comprehensive topic",
							bold: true
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "☁️ Unit 7: Serverless Architectures on AWS",
					content: [
						{
							text: "Modern serverless architectures and deployment strategies. AWS Lambda, API Gateway, and event-driven patterns for scalable applications. "
						},
						{
							text: "5 comprehensive topics",
							bold: true
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "🔗 Unit 8: Systems Integration & Service Connections",
					content: [
						{
							text: "Secure service connections and credential management in distributed systems. API integration, authentication patterns, and inter-service communication. "
						},
						{
							text: "2 comprehensive topics",
							bold: true
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "🏆 Unit 9: Capstone Projects",
					content: [
						{
							text: "Real-world projects integrating all learned concepts. Build production-grade applications demonstrating mastery of cloud-native technologies. "
						},
						{
							text: "2 comprehensive projects",
							bold: true
						}
					]
				},
				{
					type: "paragraph",
					content: [
						{
							text: "Ready to begin your cloud-native journey? "
						},
						{
							text: "Start with Unit 1 to build your foundation in Python for cloud-native development, or explore the navigation menu to jump to a specific topic.",
							bold: true
						}
					]
				}
			]
		}
	]
};
