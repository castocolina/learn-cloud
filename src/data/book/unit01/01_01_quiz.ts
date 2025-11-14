export const content = {
	id: "01_01Q",
	type: "quiz",
	title: "Quiz: Cloud-Native Development - 01_01Q",
	summary:
		"Test your knowledge of cloud-native development concepts, containerization, and microservices architecture through this comprehensive quiz.",
	keywords: ["quiz", "assessment", "cloud-native", "testing", "evaluation"],
	difficulty: "intermediate",
	learningObjectives: [
		"Test understanding of cloud-native development principles",
		"Evaluate knowledge of containerization and Docker",
		"Assess comprehension of microservices architecture"
	],
	quiz: {
		passingScore: 70,
		timeLimit: 30,
		questions: [
			{
				id: "q1",
				type: "single_choice",
				question:
					"What is the primary benefit of using containerization in cloud-native applications?",
				options: [
					"Portability and consistency across different environments",
					"Faster internet connection speeds",
					"Automatic code generation",
					"Reduced need for version control"
				],
				correctAnswer: 0,
				explanation:
					"Containerization packages applications with their dependencies, ensuring they run consistently across development, testing, and production environments. This eliminates the 'works on my machine' problem and enables reliable deployments.",
				difficulty: "beginner",
				tags: ["cloud-native", "fundamentals", "containerization"]
			},
			{
				id: "q2",
				type: "multiple_choice",
				question: "Which of the following are cloud-native principles? (Select all that apply)",
				options: [
					"Containerization of applications",
					"Microservices architecture",
					"Monolithic deployment",
					"Infrastructure as Code",
					"Manual scaling processes"
				],
				correctAnswers: [0, 1, 3],
				explanation:
					"Cloud-native principles include containerization for portability, microservices architecture for modularity, and Infrastructure as Code for reproducible deployments. Monolithic deployment and manual scaling are traditional approaches that cloud-native design aims to replace.",
				difficulty: "intermediate",
				tags: ["cloud-native", "fundamentals"]
			},
			{
				id: "q3",
				type: "code_completion",
				question: "Complete the Kubernetes deployment configuration:",
				language: "yaml",
				codeTemplate:
					"apiVersion: apps/v1\nkind: _____\nmetadata:\n  name: web-app\nspec:\n  replicas: _____\n  selector:\n    matchLabels:\n      app: _____",
				blanks: [
					{
						id: "deployment-kind",
						expectedAnswer: "Deployment",
						hint: "Type of Kubernetes resource for managing pods",
						alternatives: ["Service", "Pod", "ConfigMap"]
					},
					{
						id: "replica-count",
						expectedAnswer: "3",
						hint: "Number of pod replicas",
						alternatives: ["1", "5", "10"]
					},
					{
						id: "app-label",
						expectedAnswer: "web-app",
						hint: "Label selector for the application",
						alternatives: ["frontend", "backend", "database"]
					}
				],
				explanation:
					"A Kubernetes Deployment manages a set of identical pods, ensuring the desired number of replicas are running. The selector's matchLabels must align with the pod template labels to enable proper pod management.",
				difficulty: "advanced",
				tags: ["cloud-native", "kubernetes", "yaml"]
			},
			{
				id: "q4",
				type: "true_false",
				question:
					"Containers share the same operating system kernel, making them more lightweight than virtual machines.",
				correctAnswer: true,
				explanation:
					"Containers share the host OS kernel, requiring fewer resources than virtual machines which each run a complete OS. This makes containers faster to start, more portable, and more efficient in resource utilization.",
				difficulty: "beginner",
				tags: ["cloud-native", "containerization", "concepts"]
			},
			{
				id: "q5",
				type: "drag_and_drop",
				question: "Match each cloud-native tool with its primary purpose:",
				items: [
					{
						id: "docker",
						content: "Docker",
						category: "containerization"
					},
					{
						id: "kubernetes",
						content: "Kubernetes",
						category: "orchestration"
					},
					{
						id: "prometheus",
						content: "Prometheus",
						category: "monitoring"
					},
					{
						id: "terraform",
						content: "Terraform",
						category: "infrastructure"
					}
				],
				categories: [
					{
						id: "containerization",
						title: "Containerization",
						description: "Tools for creating and managing containers"
					},
					{
						id: "orchestration",
						title: "Orchestration",
						description: "Tools for managing container clusters"
					},
					{
						id: "monitoring",
						title: "Monitoring",
						description: "Tools for observability and metrics"
					},
					{
						id: "infrastructure",
						title: "Infrastructure as Code",
						description: "Tools for provisioning infrastructure"
					}
				],
				explanation:
					"Each tool serves a specific purpose in the cloud-native ecosystem: Docker packages applications into containers, Kubernetes orchestrates container deployment at scale, Prometheus monitors system health and metrics, and Terraform provisions infrastructure through declarative code.",
				difficulty: "intermediate",
				tags: ["cloud-native", "tools", "architecture"]
			},
			{
				id: "q6",
				type: "single_choice",
				question: "What is the primary purpose of a CI/CD pipeline in cloud-native development?",
				options: [
					"To automate the building, testing, and deployment of applications",
					"To manually review code changes before deployment",
					"To increase the time between releases",
					"To reduce the number of deployments"
				],
				correctAnswer: 0,
				explanation:
					"CI/CD (Continuous Integration/Continuous Deployment) pipelines automate the software delivery process, enabling frequent, reliable releases. They automatically build, test, and deploy code changes, reducing manual errors and accelerating time-to-market.",
				difficulty: "intermediate",
				tags: ["cloud-native", "ci-cd", "automation"]
			},
			{
				id: "q7",
				type: "multiple_choice",
				question:
					"Which are the three pillars of observability in cloud-native systems? (Select all that apply)",
				options: ["Metrics", "Logs", "Traces", "Alerts", "Dashboards"],
				correctAnswers: [0, 1, 2],
				explanation:
					"The three pillars of observability are Metrics (quantitative measurements), Logs (event records), and Traces (request flows across services). Alerts and dashboards are tools built on top of these foundational data types.",
				difficulty: "advanced",
				tags: ["cloud-native", "observability", "monitoring"]
			},
			{
				id: "q8",
				type: "code_completion",
				question: "Complete the Docker command to run a container with port mapping:",
				language: "bash",
				codeTemplate: "docker run -d -p _____:80 --name _____ nginx:_____",
				blanks: [
					{
						id: "host-port",
						expectedAnswer: "8080",
						hint: "Host port to expose",
						alternatives: ["80", "3000", "443"]
					},
					{
						id: "container-name",
						expectedAnswer: "my-nginx",
						hint: "Name for the container",
						alternatives: ["nginx", "web-server", "app"]
					},
					{
						id: "image-tag",
						expectedAnswer: "latest",
						hint: "Image version tag",
						alternatives: ["alpine", "1.21", "stable"]
					}
				],
				explanation:
					"The docker run command with -d runs the container in detached mode, -p maps host port to container port (host:container), --name assigns a container name, and the image tag specifies the version.",
				difficulty: "intermediate",
				tags: ["docker", "containerization", "commands"]
			},
			{
				id: "q9",
				type: "true_false",
				question:
					"In a microservices architecture, each service should have its own dedicated database.",
				correctAnswer: true,
				explanation:
					"Microservices follow the principle of database-per-service, where each service owns its data store. This enables independent scaling, deployment, and technology choices while maintaining loose coupling between services.",
				difficulty: "intermediate",
				tags: ["microservices", "architecture", "databases"]
			},
			{
				id: "q10",
				type: "short_answer",
				question: "What does IaC stand for in cloud-native development?",
				acceptedAnswers: [
					"Infrastructure as Code",
					"infrastructure as code",
					"Infrastructure As Code",
					"IaC"
				],
				caseSensitive: false,
				explanation:
					"Infrastructure as Code (IaC) is the practice of managing infrastructure through machine-readable definition files rather than manual configuration. Tools like Terraform, CloudFormation, and Pulumi enable version-controlled, reproducible infrastructure provisioning.",
				difficulty: "beginner",
				tags: ["cloud-native", "infrastructure", "terminology"]
			}
		],
		shuffleQuestions: false,
		showResults: true,
		allowRetry: true
	}
};
