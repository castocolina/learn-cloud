import type { QuizContent } from "./types";

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
			}
		]
	}
};
