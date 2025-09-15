import type {
	LessonContent,
	ContentSection,
	ContentBlock,
	ParagraphBlock,
	CodeBlock,
	DiagramBlock,
	CalloutBlock
} from "../../types";
import { ContentStatus, DiagramType, CalloutType } from "../../types";

// Generated lesson content for: 1.2: Overview & Foundational Concepts
// STATUS: This is scaffolded content - replace with real educational material
export const lessonContent: LessonContent = {
	type: "lesson",
	title: "1.2: Overview & Foundational Concepts",
	summary:
		"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization,",
	status: ContentStatus.SCAFFOLD,
	estimatedTime: 45,
	prerequisites: [
		"Basic understanding of cloud computing concepts",
		"Familiarity with software development principles",
		"Command line interface experience"
	],
	learningObjectives: [
		"Cloud-native technologies represent a paradigm",
		"Cloud-native technologies represent a paradigm",
		"Cloud-native technologies represent a paradigm",
		"Cloud-native technologies represent a paradigm"
	],
	sections: [
		{
			title: "Section 1: Core Concepts",
			content: [
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
				},
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
				},
				{
					type: "diagram",
					diagramType: DiagramType.MERMAID,
					definition: `graph TB
    subgraph "Client Layer"
        Web["Web Application"]
        Mobile["Mobile Application"]
    end

    subgraph "Load Balancer"
        ALB["Application Load Balancer"]
    end

    subgraph "Kubernetes Cluster"
        API["API Gateway Service"]
        Auth["Authentication Service"]  
        DB["Database Service"]
    end

    Web --> ALB
    Mobile --> ALB
    ALB --> API
    API --> Auth
    API --> DB`,
					title: "System Architecture Diagram",
					caption: "Microservices architecture overview"
				},
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration"
				},
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
				}
			]
		},
		{
			title: "Section 2: Core Concepts",
			content: [
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
				},
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
				},
				{
					type: "diagram",
					diagramType: DiagramType.MERMAID,
					definition: `graph TB
    subgraph "Client Layer"
        Web["Web Application"]
        Mobile["Mobile Application"]
    end

    subgraph "Load Balancer"
        ALB["Application Load Balancer"]
    end

    subgraph "Kubernetes Cluster"
        API["API Gateway Service"]
        Auth["Authentication Service"]  
        DB["Database Service"]
    end

    Web --> ALB
    Mobile --> ALB
    ALB --> API
    API --> Auth
    API --> DB`,
					title: "System Architecture Diagram",
					caption: "Microservices architecture overview"
				},
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration"
				},
				{
					type: "callout",
					calloutType: CalloutType.WARNING,
					title: "Caution",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration"
				},
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
				}
			]
		},
		{
			title: "Section 3: Core Concepts",
			content: [
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
				},
				{
					type: "code",
					language: "typescript",
					code: `# TypeScript example
# This demonstrates basic typescript concepts
# for cloud-native development

def main():
    config = load_configuration()
    service = CloudService(config)

    try:
        # This is an intentionally long line that exceeds 150 columns to demonstrate code formatting and line wrapping practices
        result = service.deploy_application()
        print(f'Deployment successful: {result}')
    except Exception as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    main()`,
					title: "TypeScript Example",
					filename: "example.ts"
				},
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
				},
				{
					type: "diagram",
					diagramType: DiagramType.MERMAID,
					definition: `graph TB
    subgraph "Client Layer"
        Web["Web Application"]
        Mobile["Mobile Application"]
    end

    subgraph "Load Balancer"
        ALB["Application Load Balancer"]
    end

    subgraph "Kubernetes Cluster"
        API["API Gateway Service"]
        Auth["Authentication Service"]  
        DB["Database Service"]
    end

    Web --> ALB
    Mobile --> ALB
    ALB --> API
    API --> Auth
    API --> DB`,
					title: "System Architecture Diagram",
					caption: "Microservices architecture overview"
				},
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration"
				},
				{
					type: "paragraph",
					content:
						"Cloud-native technologies represent a paradigm shift in how we build, deploy, and manage applications in modern distributed systems. This comprehensive approach leverages containerization, microservices architecture, continuous integration and deployment, infrastructure as code, and orchestration platforms to create scalable, resilient, and maintainable software solutions. At the core of cloud-native development lies the concept of containers, which provide consistent runtime environments"
				}
			]
		}
	]
};
