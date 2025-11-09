export const content = {
	type: "overview",
	title: "Unit Overview: Cloud-Native Development",
	summary:
		"Comprehensive overview of cloud-native development principles, technologies, and practices covered in this unit.",
	status: "scaffold",
	estimatedTime: 45,
	prerequisites: [
		"Basic understanding of cloud computing concepts",
		"Familiarity with software development principles",
		"Command line interface experience"
	],
	learningObjectives: [
		"Gain a comprehensive understanding of cloud-native architecture principles",
		"Explore the ecosystem of cloud-native tools and technologies",
		"Understand the benefits and challenges of cloud-native development",
		"Preview key concepts that will be covered throughout this unit"
	],
	difficulty: "beginner",
	sections: [
		{
			title: "Section 1: Core Concepts",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				},
				{
					type: "code",
					language: "dockerfile",
					code: '# Multi-stage Docker build for Node.js application\nFROM node:18-alpine AS builder\n\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\n\nFROM node:18-alpine AS production\n\n# Add security: create non-root user\nRUN addgroup -g 1001 -S nodejs && \\\n    adduser -S nextjs -u 1001\n\n# Set working directory\nWORKDIR /app\n\n# Copy built application\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --chown=nextjs:nodejs . .\n\n# Switch to non-root user\nUSER nextjs\n\n# Expose port\nEXPOSE 3000\n\n# Health check\nHEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\\n  CMD curl -f http://localhost:3000/health || exit 1\n\n# Start application\nCMD ["npm", "start"]',
					title: "Production Dockerfile",
					filename: "Dockerfile"
				},
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				},
				{
					type: "diagram",
					diagramType: "mermaid",
					definition:
						'gitGraph\n    commit id: "Initial Commit"\n    commit id: "Setup Project"\n\n    branch feature/user-auth\n    checkout feature/user-auth\n    commit id: "Add User Model"\n    commit id: "Implement Login"\n    commit id: "Add JWT Auth"\n\n    checkout main\n    commit id: "Update Dependencies"\n\n    branch feature/product-catalog\n    checkout feature/product-catalog\n    commit id: "Add Product Model"\n    commit id: "Create Product API"\n\n    checkout feature/user-auth\n    commit id: "Add Password Reset"\n\n    checkout main\n    merge feature/user-auth\n    commit id: "Release v1.1.0"\n\n    checkout feature/product-catalog\n    commit id: "Add Product Search"\n\n    checkout main\n    merge feature/product-catalog\n    commit id: "Release v1.2.0"',
					title: "Development Workflow",
					caption: "Git branching strategy and release workflow"
				},
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "Key Concept",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration"
						}
					]
				},
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				}
			]
		},
		{
			title: "Section 2: Implementation Details",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "Key Concept",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration"
						}
					]
				},
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				}
			]
		},
		{
			title: "Section 3: Best Practices",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "Key Concept",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration"
						}
					]
				},
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				}
			]
		},
		{
			title: "Section 4: Advanced Topics",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "Key Concept",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration"
						}
					]
				},
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				}
			]
		},
		{
			title: "Section 5: Real-world Applications",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				},
				{
					type: "callout",
					calloutType: "info",
					title: "Key Concept",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration"
						}
					]
				},
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							content:
								"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
						}
					]
				}
			]
		}
	]
};
