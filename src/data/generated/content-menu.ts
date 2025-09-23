import type { MenuStructure } from "$types";

export const contentMenu: MenuStructure = {
	metadata: {
		title: "Mastering Cloud-Native Technologies",
		totalUnits: 9,
		totalChapters: 120,
		version: "2.0.0"
	},
	units: [
		{
			id: "unit_1",
			title: "Unit 1: Python for Cloud-Native Backend Development",
			description: "Python for Cloud-Native Backend Development",
			icon: "Box",
			emoji: "🐍",
			technologyUnit: "python",
			unitNumber: 1,
			chapters: [
				{
					id: "01_01",
					title: "1.1: Development Environment & Tooling",
					icon: "Settings",
					emoji: "⚙️",
					type: "lesson",
					chapterNumber: "1.1",
					chapterLink: "book/unit/01/01_01_lesson_development_environment_tooling.html",
					chapterDataLink: "book/unit01/01_01_lesson_development_environment_tooling.ts",
					estimatedTime: 45,
					difficulty: "beginner",
					learningObjectives: [
						"Set up Python development environment",
						"Configure dependency management with Poetry",
						"Integrate development tools"
					],
					description:
						"Set up Python development environment, Configure dependency management with Poetry, Integrate development tools"
				},
				{
					id: "01_01",
					title: "1.1: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "1.1",
					chapterLink: "book/unit/01/01_01_study_guide.html",
					chapterDataLink: "book/unit01/01_01_study_guide.ts",
					estimatedTime: 15,
					difficulty: "beginner",
					learningObjectives: ["Review key concepts from development environment setup"],
					description: "Review key concepts from development environment setup"
				},
				{
					id: "01_01",
					title: "1.1: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "1.1",
					chapterLink: "book/unit/01/01_01_quiz.html",
					chapterDataLink: "book/unit01/01_01_quiz.ts",
					estimatedTime: 10,
					difficulty: "beginner",
					learningObjectives: ["Assess understanding of development environment concepts"],
					description: "Assess understanding of development environment concepts"
				},
				{
					id: "01_02",
					title: "1.2: Overview & Foundational Concepts",
					icon: "BookOpen",
					emoji: "📖",
					type: "lesson",
					chapterNumber: "1.2",
					chapterLink: "book/unit/01/01_02_lesson_overview_foundational_concepts.html",
					chapterDataLink: "book/unit01/01_02_lesson_overview_foundational_concepts.ts",
					estimatedTime: 60,
					difficulty: "beginner",
					learningObjectives: [
						"Understand Python's role in cloud-native development",
						"Master core language features",
						"Learn typing system with Pydantic"
					],
					description:
						"Understand Python's role in cloud-native development, Master core language features, Learn typing system with Pydantic"
				},
				{
					id: "01_02",
					title: "1.2: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "1.2",
					chapterLink: "book/unit/01/01_02_study_guide.html",
					chapterDataLink: "book/unit01/01_02_study_guide.ts",
					estimatedTime: 20,
					difficulty: "beginner",
					learningObjectives: ["Review Python fundamentals and cloud-native concepts"],
					description: "Review Python fundamentals and cloud-native concepts"
				},
				{
					id: "01_02",
					title: "1.2: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "1.2",
					chapterLink: "book/unit/01/01_02_quiz.html",
					chapterDataLink: "book/unit01/01_02_quiz.ts",
					estimatedTime: 15,
					difficulty: "beginner",
					learningObjectives: ["Test knowledge of Python basics and typing"],
					description: "Test knowledge of Python basics and typing"
				},
				{
					id: "01_03",
					title: "1.3: Code Quality and Standards",
					icon: "CheckCircle",
					emoji: "✅",
					type: "lesson",
					chapterNumber: "1.3",
					chapterLink: "book/unit/01/01_03_lesson_code_quality_and_standards.html",
					chapterDataLink: "book/unit01/01_03_lesson_code_quality_and_standards.ts",
					estimatedTime: 40,
					difficulty: "beginner",
					learningObjectives: [
						"Master PEP 8 style guidelines",
						"Configure code formatting with Black",
						"Implement linting with Ruff"
					],
					description:
						"Master PEP 8 style guidelines, Configure code formatting with Black, Implement linting with Ruff"
				},
				{
					id: "01_03",
					title: "1.3: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "1.3",
					chapterLink: "book/unit/01/01_03_study_guide.html",
					chapterDataLink: "book/unit01/01_03_study_guide.ts",
					estimatedTime: 15,
					difficulty: "beginner",
					learningObjectives: ["Review code quality best practices and tools"],
					description: "Review code quality best practices and tools"
				},
				{
					id: "01_03",
					title: "1.3: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "1.3",
					chapterLink: "book/unit/01/01_03_quiz.html",
					chapterDataLink: "book/unit01/01_03_quiz.ts",
					estimatedTime: 10,
					difficulty: "beginner",
					learningObjectives: ["Evaluate code quality knowledge"],
					description: "Evaluate code quality knowledge"
				},
				{
					id: "01_04",
					title: "1.4: Core Backend Concepts",
					icon: "Database",
					emoji: "🗄️",
					type: "lesson",
					chapterNumber: "1.4",
					chapterLink: "book/unit/01/01_04_lesson_core_backend_concepts.html",
					chapterDataLink: "book/unit01/01_04_lesson_core_backend_concepts.ts",
					estimatedTime: 90,
					difficulty: "intermediate",
					learningObjectives: [
						"Implement OOP principles in Python",
						"Work with relational databases using ORM",
						"Integrate NoSQL databases"
					],
					description:
						"Implement OOP principles in Python, Work with relational databases using ORM, Integrate NoSQL databases"
				},
				{
					id: "01_04",
					title: "1.4: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "1.4",
					chapterLink: "book/unit/01/01_04_study_guide.html",
					chapterDataLink: "book/unit01/01_04_study_guide.ts",
					estimatedTime: 25,
					difficulty: "intermediate",
					learningObjectives: ["Review backend architecture concepts"],
					description: "Review backend architecture concepts"
				},
				{
					id: "01_04",
					title: "1.4: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "1.4",
					chapterLink: "book/unit/01/01_04_quiz.html",
					chapterDataLink: "book/unit01/01_04_quiz.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Test backend development skills"],
					description: "Test backend development skills"
				},
				{
					id: "01_05",
					title: "1.5: Concurrency and Caching",
					icon: "Zap",
					emoji: "⚡",
					type: "lesson",
					chapterNumber: "1.5",
					chapterLink: "book/unit/01/01_05_lesson_concurrency_and_caching.html",
					chapterDataLink: "book/unit01/01_05_lesson_concurrency_and_caching.ts",
					estimatedTime: 75,
					difficulty: "intermediate",
					learningObjectives: [
						"Master asyncio concurrency patterns",
						"Implement threading strategies",
						"Design caching solutions"
					],
					description:
						"Master asyncio concurrency patterns, Implement threading strategies, Design caching solutions"
				},
				{
					id: "01_05",
					title: "1.5: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "1.5",
					chapterLink: "book/unit/01/01_05_study_guide.html",
					chapterDataLink: "book/unit01/01_05_study_guide.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Review concurrency and caching concepts"],
					description: "Review concurrency and caching concepts"
				},
				{
					id: "01_05",
					title: "1.5: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "1.5",
					chapterLink: "book/unit/01/01_05_quiz.html",
					chapterDataLink: "book/unit01/01_05_quiz.ts",
					estimatedTime: 15,
					difficulty: "intermediate",
					learningObjectives: ["Assess concurrency understanding"],
					description: "Assess concurrency understanding"
				},
				{
					id: "01_06",
					title: "1.6: Building a RESTful API with FastAPI",
					icon: "Globe",
					emoji: "🌐",
					type: "lesson",
					chapterNumber: "1.6",
					chapterLink: "book/unit/01/01_06_lesson_building_a_restful_api_with_fastapi.html",
					chapterDataLink: "book/unit01/01_06_lesson_building_a_restful_api_with_fastapi.ts",
					estimatedTime: 120,
					difficulty: "intermediate",
					learningObjectives: [
						"Create production-ready APIs",
						"Implement data validation with Pydantic",
						"Master dependency injection"
					],
					description:
						"Create production-ready APIs, Implement data validation with Pydantic, Master dependency injection"
				},
				{
					id: "01_06",
					title: "1.6: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "1.6",
					chapterLink: "book/unit/01/01_06_study_guide.html",
					chapterDataLink: "book/unit01/01_06_study_guide.ts",
					estimatedTime: 30,
					difficulty: "intermediate",
					learningObjectives: ["Review API development best practices"],
					description: "Review API development best practices"
				},
				{
					id: "01_06",
					title: "1.6: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "1.6",
					chapterLink: "book/unit/01/01_06_quiz.html",
					chapterDataLink: "book/unit01/01_06_quiz.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Test API development knowledge"],
					description: "Test API development knowledge"
				},
				{
					id: "01_07",
					title: "1.7: Advanced Backend Topics",
					icon: "Code",
					emoji: "💻",
					type: "lesson",
					chapterNumber: "1.7",
					chapterLink: "book/unit/01/01_07_lesson_advanced_backend_topics.html",
					chapterDataLink: "book/unit01/01_07_lesson_advanced_backend_topics.ts",
					estimatedTime: 90,
					difficulty: "advanced",
					learningObjectives: [
						"Design event-driven architectures",
						"Implement gRPC communication",
						"Integrate microservices"
					],
					description:
						"Design event-driven architectures, Implement gRPC communication, Integrate microservices"
				},
				{
					id: "01_07",
					title: "1.7: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "1.7",
					chapterLink: "book/unit/01/01_07_study_guide.html",
					chapterDataLink: "book/unit01/01_07_study_guide.ts",
					estimatedTime: 25,
					difficulty: "advanced",
					learningObjectives: ["Review advanced backend patterns"],
					description: "Review advanced backend patterns"
				},
				{
					id: "01_07",
					title: "1.7: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "1.7",
					chapterLink: "book/unit/01/01_07_quiz.html",
					chapterDataLink: "book/unit01/01_07_quiz.ts",
					estimatedTime: 20,
					difficulty: "advanced",
					learningObjectives: ["Evaluate advanced concepts"],
					description: "Evaluate advanced concepts"
				},
				{
					id: "01_08",
					title: "1.8: Testing Strategies",
					icon: "TestTube",
					emoji: "🧪",
					type: "lesson",
					chapterNumber: "1.8",
					chapterLink: "book/unit/01/01_08_lesson_testing_strategies.html",
					chapterDataLink: "book/unit01/01_08_lesson_testing_strategies.ts",
					estimatedTime: 80,
					difficulty: "intermediate",
					learningObjectives: [
						"Master pytest framework",
						"Implement mocking strategies",
						"Use Testcontainers for integration tests"
					],
					description:
						"Master pytest framework, Implement mocking strategies, Use Testcontainers for integration tests"
				},
				{
					id: "01_08",
					title: "1.8: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "1.8",
					chapterLink: "book/unit/01/01_08_study_guide.html",
					chapterDataLink: "book/unit01/01_08_study_guide.ts",
					estimatedTime: 25,
					difficulty: "intermediate",
					learningObjectives: ["Review testing methodologies"],
					description: "Review testing methodologies"
				},
				{
					id: "01_08",
					title: "1.8: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "1.8",
					chapterLink: "book/unit/01/01_08_quiz.html",
					chapterDataLink: "book/unit01/01_08_quiz.ts",
					estimatedTime: 15,
					difficulty: "intermediate",
					learningObjectives: ["Test testing knowledge"],
					description: "Test testing knowledge"
				},
				{
					id: "01_09",
					title: "1.9: Observability",
					icon: "BarChart3",
					emoji: "📊",
					type: "lesson",
					chapterNumber: "1.9",
					chapterLink: "book/unit/01/01_09_lesson_observability.html",
					chapterDataLink: "book/unit01/01_09_lesson_observability.ts",
					estimatedTime: 70,
					difficulty: "intermediate",
					learningObjectives: [
						"Implement structured logging",
						"Set up Prometheus metrics",
						"Configure OpenTelemetry tracing"
					],
					description:
						"Implement structured logging, Set up Prometheus metrics, Configure OpenTelemetry tracing"
				},
				{
					id: "01_09",
					title: "1.9: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "1.9",
					chapterLink: "book/unit/01/01_09_study_guide.html",
					chapterDataLink: "book/unit01/01_09_study_guide.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Review observability practices"],
					description: "Review observability practices"
				},
				{
					id: "01_09",
					title: "1.9: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "1.9",
					chapterLink: "book/unit/01/01_09_quiz.html",
					chapterDataLink: "book/unit01/01_09_quiz.ts",
					estimatedTime: 15,
					difficulty: "intermediate",
					learningObjectives: ["Assess observability understanding"],
					description: "Assess observability understanding"
				},
				{
					id: "01_10",
					title: "1.10: Project: Building a Microservice in Python",
					icon: "Rocket",
					emoji: "🚀",
					type: "project",
					chapterNumber: "1.10",
					chapterLink:
						"book/unit/01/01_10_project_110_project_building_a_microservice_in_python.html",
					chapterDataLink:
						"book/unit01/01_10_project_110_project_building_a_microservice_in_python.ts",
					estimatedTime: 240,
					difficulty: "advanced",
					learningObjectives: [
						"Build complete microservice",
						"Integrate all learned concepts",
						"Deploy production-ready solution"
					],
					description:
						"Build complete microservice, Integrate all learned concepts, Deploy production-ready solution"
				},
				{
					id: "01_11",
					title: "1.11: Unit 1 Final Exam",
					icon: "Target",
					emoji: "🎯",
					type: "exam",
					chapterNumber: "1.11",
					chapterLink: "book/unit/01/01_99_exam_unit_1_final_exam.html",
					chapterDataLink: "book/unit01/01_99_exam_unit_1_final_exam.ts",
					estimatedTime: 60,
					difficulty: "intermediate",
					learningObjectives: ["Comprehensive assessment of Unit 1 content"],
					description: "Comprehensive assessment of Unit 1 content"
				}
			]
		},
		{
			id: "unit_2",
			title: "Unit 2: Go for Cloud-Native Backend Development",
			description: "Go for Cloud-Native Backend Development",
			icon: "Cpu",
			emoji: "🔧",
			technologyUnit: "go",
			unitNumber: 2,
			chapters: [
				{
					id: "02_01",
					title: "2.1: Development Environment & Tooling",
					icon: "Settings",
					emoji: "⚙️",
					type: "lesson",
					chapterNumber: "2.1",
					chapterLink: "book/unit/02/02_01_lesson_development_environment_tooling.html",
					chapterDataLink: "book/unit02/02_01_lesson_development_environment_tooling.ts",
					estimatedTime: 50,
					difficulty: "beginner",
					learningObjectives: [
						"Install Go toolchain and configure project structure",
						"Master Go modules for dependency management",
						"Integrate with development environments"
					],
					description:
						"Install Go toolchain and configure project structure, Master Go modules for dependency management, Integrate with development environments"
				},
				{
					id: "02_01",
					title: "2.1: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "2.1",
					chapterLink: "book/unit/02/02_01_study_guide.html",
					chapterDataLink: "book/unit02/02_01_study_guide.ts",
					estimatedTime: 15,
					difficulty: "beginner",
					learningObjectives: ["Review Go environment setup and tooling"],
					description: "Review Go environment setup and tooling"
				},
				{
					id: "02_01",
					title: "2.1: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "2.1",
					chapterLink: "book/unit/02/02_01_quiz.html",
					chapterDataLink: "book/unit02/02_01_quiz.ts",
					estimatedTime: 10,
					difficulty: "beginner",
					learningObjectives: ["Test Go development environment knowledge"],
					description: "Test Go development environment knowledge"
				},
				{
					id: "02_02",
					title: "2.2: Overview & Foundational Concepts",
					icon: "BookOpen",
					emoji: "📖",
					type: "lesson",
					chapterNumber: "2.2",
					chapterLink: "book/unit/02/02_02_lesson_overview_foundational_concepts.html",
					chapterDataLink: "book/unit02/02_02_lesson_overview_foundational_concepts.ts",
					estimatedTime: 70,
					difficulty: "beginner",
					learningObjectives: [
						"Understand Go's advantages for cloud development",
						"Master core language features and type system",
						"Learn interfaces and control flow"
					],
					description:
						"Understand Go's advantages for cloud development, Master core language features and type system, Learn interfaces and control flow"
				},
				{
					id: "02_02",
					title: "2.2: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "2.2",
					chapterLink: "book/unit/02/02_02_study_guide.html",
					chapterDataLink: "book/unit02/02_02_study_guide.ts",
					estimatedTime: 20,
					difficulty: "beginner",
					learningObjectives: ["Review Go fundamentals and cloud-native benefits"],
					description: "Review Go fundamentals and cloud-native benefits"
				},
				{
					id: "02_02",
					title: "2.2: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "2.2",
					chapterLink: "book/unit/02/02_02_quiz.html",
					chapterDataLink: "book/unit02/02_02_quiz.ts",
					estimatedTime: 15,
					difficulty: "beginner",
					learningObjectives: ["Assess Go language basics"],
					description: "Assess Go language basics"
				},
				{
					id: "02_03",
					title: "2.3: Concurrency: The Go Philosophy",
					icon: "Zap",
					emoji: "⚡",
					type: "lesson",
					chapterNumber: "2.3",
					chapterLink: "book/unit/02/02_03_lesson_concurrency.html",
					chapterDataLink: "book/unit02/02_03_lesson_concurrency.ts",
					estimatedTime: 100,
					difficulty: "intermediate",
					learningObjectives: [
						"Master goroutines and channels",
						"Implement concurrent patterns",
						"Design scalable concurrent systems"
					],
					description:
						"Master goroutines and channels, Implement concurrent patterns, Design scalable concurrent systems"
				},
				{
					id: "02_03",
					title: "2.3: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "2.3",
					chapterLink: "book/unit/02/02_03_study_guide.html",
					chapterDataLink: "book/unit02/02_03_study_guide.ts",
					estimatedTime: 30,
					difficulty: "intermediate",
					learningObjectives: ["Review Go concurrency concepts and patterns"],
					description: "Review Go concurrency concepts and patterns"
				},
				{
					id: "02_03",
					title: "2.3: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "2.3",
					chapterLink: "book/unit/02/02_03_quiz.html",
					chapterDataLink: "book/unit02/02_03_quiz.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Test concurrency understanding"],
					description: "Test concurrency understanding"
				},
				{
					id: "02_04",
					title: "2.4: Code Quality and Standards",
					icon: "CheckCircle",
					emoji: "✅",
					type: "lesson",
					chapterNumber: "2.4",
					chapterLink: "book/unit/02/02_04_lesson_code_quality_and_standards.html",
					chapterDataLink: "book/unit02/02_04_lesson_code_quality_and_standards.ts",
					estimatedTime: 45,
					difficulty: "beginner",
					learningObjectives: [
						"Write idiomatic Go code",
						"Master formatting with gofmt",
						"Implement linting with golangci-lint"
					],
					description:
						"Write idiomatic Go code, Master formatting with gofmt, Implement linting with golangci-lint"
				},
				{
					id: "02_04",
					title: "2.4: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "2.4",
					chapterLink: "book/unit/02/02_04_study_guide.html",
					chapterDataLink: "book/unit02/02_04_study_guide.ts",
					estimatedTime: 15,
					difficulty: "beginner",
					learningObjectives: ["Review Go code quality practices"],
					description: "Review Go code quality practices"
				},
				{
					id: "02_04",
					title: "2.4: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "2.4",
					chapterLink: "book/unit/02/02_04_quiz.html",
					chapterDataLink: "book/unit02/02_04_quiz.ts",
					estimatedTime: 10,
					difficulty: "beginner",
					learningObjectives: ["Evaluate Go coding standards"],
					description: "Evaluate Go coding standards"
				},
				{
					id: "02_05",
					title: "2.5: Core Backend Concepts",
					icon: "Database",
					emoji: "🗄️",
					type: "lesson",
					chapterNumber: "2.5",
					chapterLink: "book/unit/02/02_05_lesson_core_backend_concepts.html",
					chapterDataLink: "book/unit02/02_05_lesson_core_backend_concepts.ts",
					estimatedTime: 95,
					difficulty: "intermediate",
					learningObjectives: [
						"Master Go interfaces and struct patterns",
						"Implement database access with database/sql",
						"Integrate GORM and NoSQL databases"
					],
					description:
						"Master Go interfaces and struct patterns, Implement database access with database/sql, Integrate GORM and NoSQL databases"
				},
				{
					id: "02_05",
					title: "2.5: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "2.5",
					chapterLink: "book/unit/02/02_05_study_guide.html",
					chapterDataLink: "book/unit02/02_05_study_guide.ts",
					estimatedTime: 25,
					difficulty: "intermediate",
					learningObjectives: ["Review Go backend architecture"],
					description: "Review Go backend architecture"
				},
				{
					id: "02_05",
					title: "2.5: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "2.5",
					chapterLink: "book/unit/02/02_05_quiz.html",
					chapterDataLink: "book/unit02/02_05_quiz.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Test Go backend development skills"],
					description: "Test Go backend development skills"
				},
				{
					id: "02_06",
					title: "2.6: Building a RESTful API",
					icon: "Globe",
					emoji: "🌐",
					type: "lesson",
					chapterNumber: "2.6",
					chapterLink: "book/unit/02/02_06_lesson_building_a_restful_api.html",
					chapterDataLink: "book/unit02/02_06_lesson_building_a_restful_api.ts",
					estimatedTime: 110,
					difficulty: "intermediate",
					learningObjectives: [
						"Build APIs with standard library",
						"Master frameworks like Gin and Echo",
						"Handle JSON data efficiently"
					],
					description:
						"Build APIs with standard library, Master frameworks like Gin and Echo, Handle JSON data efficiently"
				},
				{
					id: "02_06",
					title: "2.6: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "2.6",
					chapterLink: "book/unit/02/02_06_study_guide.html",
					chapterDataLink: "book/unit02/02_06_study_guide.ts",
					estimatedTime: 25,
					difficulty: "intermediate",
					learningObjectives: ["Review Go API development techniques"],
					description: "Review Go API development techniques"
				},
				{
					id: "02_06",
					title: "2.6: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "2.6",
					chapterLink: "book/unit/02/02_06_quiz.html",
					chapterDataLink: "book/unit02/02_06_quiz.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Assess Go API knowledge"],
					description: "Assess Go API knowledge"
				},
				{
					id: "02_07",
					title: "2.7: Advanced Backend Topics",
					icon: "Code",
					emoji: "💻",
					type: "lesson",
					chapterNumber: "2.7",
					chapterLink: "book/unit/02/02_07_lesson_advanced_backend_topics.html",
					chapterDataLink: "book/unit02/02_07_lesson_advanced_backend_topics.ts",
					estimatedTime: 85,
					difficulty: "advanced",
					learningObjectives: [
						"Design event-driven architectures in Go",
						"Implement gRPC with Protobuf",
						"Build microservice communication"
					],
					description:
						"Design event-driven architectures in Go, Implement gRPC with Protobuf, Build microservice communication"
				},
				{
					id: "02_07",
					title: "2.7: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "2.7",
					chapterLink: "book/unit/02/02_07_study_guide.html",
					chapterDataLink: "book/unit02/02_07_study_guide.ts",
					estimatedTime: 25,
					difficulty: "advanced",
					learningObjectives: ["Review advanced Go backend patterns"],
					description: "Review advanced Go backend patterns"
				},
				{
					id: "02_07",
					title: "2.7: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "2.7",
					chapterLink: "book/unit/02/02_07_quiz.html",
					chapterDataLink: "book/unit02/02_07_quiz.ts",
					estimatedTime: 20,
					difficulty: "advanced",
					learningObjectives: ["Test advanced Go concepts"],
					description: "Test advanced Go concepts"
				},
				{
					id: "02_08",
					title: "2.8: Testing Strategies",
					icon: "TestTube",
					emoji: "🧪",
					type: "lesson",
					chapterNumber: "2.8",
					chapterLink: "book/unit/02/02_08_lesson_testing_strategies.html",
					chapterDataLink: "book/unit02/02_08_lesson_testing_strategies.ts",
					estimatedTime: 75,
					difficulty: "intermediate",
					learningObjectives: [
						"Master Go testing package",
						"Implement interface mocking",
						"Use Testcontainers for integration"
					],
					description:
						"Master Go testing package, Implement interface mocking, Use Testcontainers for integration"
				},
				{
					id: "02_08",
					title: "2.8: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "2.8",
					chapterLink: "book/unit/02/02_08_study_guide.html",
					chapterDataLink: "book/unit02/02_08_study_guide.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Review Go testing methodologies"],
					description: "Review Go testing methodologies"
				},
				{
					id: "02_08",
					title: "2.8: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "2.8",
					chapterLink: "book/unit/02/02_08_quiz.html",
					chapterDataLink: "book/unit02/02_08_quiz.ts",
					estimatedTime: 15,
					difficulty: "intermediate",
					learningObjectives: ["Evaluate Go testing knowledge"],
					description: "Evaluate Go testing knowledge"
				},
				{
					id: "02_09",
					title: "2.9: Observability",
					icon: "BarChart3",
					emoji: "📊",
					type: "lesson",
					chapterNumber: "2.9",
					chapterLink: "book/unit/02/02_09_lesson_observability.html",
					chapterDataLink: "book/unit02/02_09_lesson_observability.ts",
					estimatedTime: 65,
					difficulty: "intermediate",
					learningObjectives: [
						"Implement structured logging in Go",
						"Set up Prometheus metrics",
						"Configure OpenTelemetry tracing"
					],
					description:
						"Implement structured logging in Go, Set up Prometheus metrics, Configure OpenTelemetry tracing"
				},
				{
					id: "02_09",
					title: "2.9: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "2.9",
					chapterLink: "book/unit/02/02_09_study_guide.html",
					chapterDataLink: "book/unit02/02_09_study_guide.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Review Go observability practices"],
					description: "Review Go observability practices"
				},
				{
					id: "02_09",
					title: "2.9: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "2.9",
					chapterLink: "book/unit/02/02_09_quiz.html",
					chapterDataLink: "book/unit02/02_09_quiz.ts",
					estimatedTime: 15,
					difficulty: "intermediate",
					learningObjectives: ["Test Go observability understanding"],
					description: "Test Go observability understanding"
				},
				{
					id: "02_10",
					title: "2.10: Project: Building a Microservice in Go",
					icon: "Rocket",
					emoji: "🚀",
					type: "project",
					chapterNumber: "2.10",
					chapterLink: "book/unit/02/02_10_project_210_project_building_a_microservice_in_go.html",
					chapterDataLink: "book/unit02/02_10_project_210_project_building_a_microservice_in_go.ts",
					estimatedTime: 250,
					difficulty: "advanced",
					learningObjectives: [
						"Build complete Go microservice",
						"Apply concurrent patterns",
						"Deploy high-performance solution"
					],
					description:
						"Build complete Go microservice, Apply concurrent patterns, Deploy high-performance solution"
				},
				{
					id: "02_11",
					title: "2.11: Unit 2 Final Exam",
					icon: "Target",
					emoji: "🎯",
					type: "exam",
					chapterNumber: "2.11",
					chapterLink: "book/unit/02/02_99_exam_unit_2_final_exam.html",
					chapterDataLink: "book/unit02/02_99_exam_unit_2_final_exam.ts",
					estimatedTime: 60,
					difficulty: "intermediate",
					learningObjectives: ["Comprehensive Go development assessment"],
					description: "Comprehensive Go development assessment"
				}
			]
		},
		{
			id: "unit_3",
			title: "Unit 3: DevOps, IaC, and CI/CD",
			description: "DevOps, IaC, and CI/CD",
			icon: "Settings",
			emoji: "⚙️",
			technologyUnit: "microservices",
			unitNumber: 3,
			chapters: [
				{
					id: "03_01",
					title: "3.1: Terraform for Infrastructure as Code",
					icon: "Cloud",
					emoji: "☁️",
					type: "lesson",
					chapterNumber: "3.1",
					chapterLink: "book/unit/03/03_01_lesson_terraform_for_infrastructure_as_code.html",
					chapterDataLink: "book/unit03/03_01_lesson_terraform_for_infrastructure_as_code.ts",
					estimatedTime: 120,
					difficulty: "intermediate",
					learningObjectives: [
						"Master HCL syntax and Terraform fundamentals",
						"Manage remote state and modules",
						"Provision Kubernetes clusters and AWS resources"
					],
					description:
						"Master HCL syntax and Terraform fundamentals, Manage remote state and modules, Provision Kubernetes clusters and AWS resources"
				},
				{
					id: "03_01",
					title: "3.1: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "3.1",
					chapterLink: "book/unit/03/03_01_study_guide.html",
					chapterDataLink: "book/unit03/03_01_study_guide.ts",
					estimatedTime: 30,
					difficulty: "intermediate",
					learningObjectives: ["Review Terraform concepts and best practices"],
					description: "Review Terraform concepts and best practices"
				},
				{
					id: "03_01",
					title: "3.1: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "3.1",
					chapterLink: "book/unit/03/03_01_quiz.html",
					chapterDataLink: "book/unit03/03_01_quiz.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Test Infrastructure as Code knowledge"],
					description: "Test Infrastructure as Code knowledge"
				},
				{
					id: "03_02",
					title: "3.2: Kubernetes for Container Orchestration",
					icon: "Container",
					emoji: "📦",
					type: "lesson",
					chapterNumber: "3.2",
					chapterLink: "book/unit/03/03_02_lesson_kubernetes_for_container_orchestration.html",
					chapterDataLink: "book/unit03/03_02_lesson_kubernetes_for_container_orchestration.ts",
					estimatedTime: 140,
					difficulty: "advanced",
					learningObjectives: [
						"Implement advanced deployment strategies",
						"Master StatefulSets and persistent volumes",
						"Configure network policies and Helm packages"
					],
					description:
						"Implement advanced deployment strategies, Master StatefulSets and persistent volumes, Configure network policies and Helm packages"
				},
				{
					id: "03_02",
					title: "3.2: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "3.2",
					chapterLink: "book/unit/03/03_02_study_guide.html",
					chapterDataLink: "book/unit03/03_02_study_guide.ts",
					estimatedTime: 35,
					difficulty: "advanced",
					learningObjectives: ["Review Kubernetes orchestration concepts"],
					description: "Review Kubernetes orchestration concepts"
				},
				{
					id: "03_02",
					title: "3.2: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "3.2",
					chapterLink: "book/unit/03/03_02_quiz.html",
					chapterDataLink: "book/unit03/03_02_quiz.ts",
					estimatedTime: 25,
					difficulty: "advanced",
					learningObjectives: ["Assess Kubernetes expertise"],
					description: "Assess Kubernetes expertise"
				},
				{
					id: "03_03",
					title: "3.3: GitHub Actions for CI/CD",
					icon: "GitBranch",
					emoji: "🔀",
					type: "lesson",
					chapterNumber: "3.3",
					chapterLink: "book/unit/03/03_03_lesson_github_actions_for_cicd.html",
					chapterDataLink: "book/unit03/03_03_lesson_github_actions_for_cicd.ts",
					estimatedTime: 100,
					difficulty: "intermediate",
					learningObjectives: [
						"Build complex CI/CD workflows",
						"Create reusable actions",
						"Manage secrets and deploy to Kubernetes"
					],
					description:
						"Build complex CI/CD workflows, Create reusable actions, Manage secrets and deploy to Kubernetes"
				},
				{
					id: "03_03",
					title: "3.3: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "3.3",
					chapterLink: "book/unit/03/03_03_study_guide.html",
					chapterDataLink: "book/unit03/03_03_study_guide.ts",
					estimatedTime: 25,
					difficulty: "intermediate",
					learningObjectives: ["Review GitHub Actions best practices"],
					description: "Review GitHub Actions best practices"
				},
				{
					id: "03_03",
					title: "3.3: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "3.3",
					chapterLink: "book/unit/03/03_03_quiz.html",
					chapterDataLink: "book/unit03/03_03_quiz.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Test CI/CD implementation knowledge"],
					description: "Test CI/CD implementation knowledge"
				},
				{
					id: "03_04",
					title: "3.4: Spinnaker for Continuous Delivery",
					icon: "Workflow",
					emoji: "🔄",
					type: "lesson",
					chapterNumber: "3.4",
					chapterLink: "book/unit/03/03_04_lesson_spinnaker_for_continuous_delivery.html",
					chapterDataLink: "book/unit03/03_04_lesson_spinnaker_for_continuous_delivery.ts",
					estimatedTime: 90,
					difficulty: "advanced",
					learningObjectives: [
						"Design advanced pipeline strategies",
						"Integrate with cloud providers",
						"Implement automated canary analysis"
					],
					description:
						"Design advanced pipeline strategies, Integrate with cloud providers, Implement automated canary analysis"
				},
				{
					id: "03_04",
					title: "3.4: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "3.4",
					chapterLink: "book/unit/03/03_04_study_guide.html",
					chapterDataLink: "book/unit03/03_04_study_guide.ts",
					estimatedTime: 25,
					difficulty: "advanced",
					learningObjectives: ["Review Spinnaker deployment patterns"],
					description: "Review Spinnaker deployment patterns"
				},
				{
					id: "03_04",
					title: "3.4: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "3.4",
					chapterLink: "book/unit/03/03_04_quiz.html",
					chapterDataLink: "book/unit03/03_04_quiz.ts",
					estimatedTime: 20,
					difficulty: "advanced",
					learningObjectives: ["Evaluate continuous delivery expertise"],
					description: "Evaluate continuous delivery expertise"
				},
				{
					id: "03_05",
					title: "3.5: Unit 3 Final Exam",
					icon: "Target",
					emoji: "🎯",
					type: "exam",
					chapterNumber: "3.5",
					chapterLink: "book/unit/03/03_99_exam_unit_3_final_exam.html",
					chapterDataLink: "book/unit03/03_99_exam_unit_3_final_exam.ts",
					estimatedTime: 60,
					difficulty: "intermediate",
					learningObjectives: ["Comprehensive DevOps and CI/CD assessment"],
					description: "Comprehensive DevOps and CI/CD assessment"
				}
			]
		},
		{
			id: "unit_4",
			title: "Unit 4: Secrets and Configuration Management",
			description: "Secrets and Configuration Management",
			icon: "Lock",
			emoji: "🔐",
			technologyUnit: "microservices",
			unitNumber: 4,
			chapters: [
				{
					id: "04_01",
					title: "4.1: HashiCorp Consul",
					icon: "Server",
					emoji: "🖥️",
					type: "lesson",
					chapterNumber: "4.1",
					chapterLink: "book/unit/04/04_01_lesson_hashicorp_consul.html",
					chapterDataLink: "book/unit04/04_01_lesson_hashicorp_consul.ts",
					estimatedTime: 90,
					difficulty: "intermediate",
					learningObjectives: [
						"Master Consul deployment architecture",
						"Implement service discovery",
						"Configure distributed Key-Value store"
					],
					description:
						"Master Consul deployment architecture, Implement service discovery, Configure distributed Key-Value store"
				},
				{
					id: "04_01",
					title: "4.1: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "4.1",
					chapterLink: "book/unit/04/04_01_study_guide.html",
					chapterDataLink: "book/unit04/04_01_study_guide.ts",
					estimatedTime: 25,
					difficulty: "intermediate",
					learningObjectives: ["Review Consul concepts and service mesh integration"],
					description: "Review Consul concepts and service mesh integration"
				},
				{
					id: "04_01",
					title: "4.1: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "4.1",
					chapterLink: "book/unit/04/04_01_quiz.html",
					chapterDataLink: "book/unit04/04_01_quiz.ts",
					estimatedTime: 15,
					difficulty: "intermediate",
					learningObjectives: ["Test Consul knowledge and service discovery"],
					description: "Test Consul knowledge and service discovery"
				},
				{
					id: "04_02",
					title: "4.2: HashiCorp Vault",
					icon: "Shield",
					emoji: "🛡️",
					type: "lesson",
					chapterNumber: "4.2",
					chapterLink: "book/unit/04/04_02_lesson_hashicorp_vault.html",
					chapterDataLink: "book/unit04/04_02_lesson_hashicorp_vault.ts",
					estimatedTime: 120,
					difficulty: "advanced",
					learningObjectives: [
						"Deploy Vault HA setup",
						"Manage dynamic secrets",
						"Integrate with Kubernetes and applications"
					],
					description:
						"Deploy Vault HA setup, Manage dynamic secrets, Integrate with Kubernetes and applications"
				},
				{
					id: "04_02",
					title: "4.2: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "4.2",
					chapterLink: "book/unit/04/04_02_study_guide.html",
					chapterDataLink: "book/unit04/04_02_study_guide.ts",
					estimatedTime: 30,
					difficulty: "advanced",
					learningObjectives: ["Review Vault architecture and secret management"],
					description: "Review Vault architecture and secret management"
				},
				{
					id: "04_02",
					title: "4.2: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "4.2",
					chapterLink: "book/unit/04/04_02_quiz.html",
					chapterDataLink: "book/unit04/04_02_quiz.ts",
					estimatedTime: 20,
					difficulty: "advanced",
					learningObjectives: ["Assess Vault configuration and integration skills"],
					description: "Assess Vault configuration and integration skills"
				},
				{
					id: "04_03",
					title: "4.3: Unit 4 Final Exam",
					icon: "Target",
					emoji: "🎯",
					type: "exam",
					chapterNumber: "4.3",
					chapterLink: "book/unit/04/04_99_exam_unit_4_final_exam.html",
					chapterDataLink: "book/unit04/04_99_exam_unit_4_final_exam.ts",
					estimatedTime: 60,
					difficulty: "intermediate",
					learningObjectives: ["Comprehensive assessment of secrets and configuration management"],
					description: "Comprehensive assessment of secrets and configuration management"
				}
			]
		},
		{
			id: "unit_5",
			title: "Unit 5: DevSecOps",
			description: "DevSecOps",
			icon: "ShieldCheck",
			emoji: "🛡️",
			technologyUnit: "microservices",
			unitNumber: 5,
			chapters: [
				{
					id: "05_01",
					title: "5.1: Secure Communication with mTLS",
					icon: "ShieldCheck",
					emoji: "🔐",
					type: "lesson",
					chapterNumber: "5.1",
					chapterLink: "book/unit/05/05_01_lesson_secure_communication_with_mtls.html",
					chapterDataLink: "book/unit05/05_01_lesson_secure_communication_with_mtls.ts",
					estimatedTime: 80,
					difficulty: "advanced",
					learningObjectives: [
						"Implement mutual TLS authentication",
						"Configure certificate management",
						"Secure service-to-service communication"
					],
					description:
						"Implement mutual TLS authentication, Configure certificate management, Secure service-to-service communication"
				},
				{
					id: "05_01",
					title: "5.1: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "5.1",
					chapterLink: "book/unit/05/05_01_study_guide.html",
					chapterDataLink: "book/unit05/05_01_study_guide.ts",
					estimatedTime: 20,
					difficulty: "advanced",
					learningObjectives: ["Review mTLS concepts and implementation strategies"],
					description: "Review mTLS concepts and implementation strategies"
				},
				{
					id: "05_01",
					title: "5.1: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "5.1",
					chapterLink: "book/unit/05/05_01_quiz.html",
					chapterDataLink: "book/unit05/05_01_quiz.ts",
					estimatedTime: 15,
					difficulty: "advanced",
					learningObjectives: ["Test secure communication knowledge"],
					description: "Test secure communication knowledge"
				},
				{
					id: "05_02",
					title: "5.2: SCA (Software Composition Analysis)",
					icon: "Search",
					emoji: "🔍",
					type: "lesson",
					chapterNumber: "5.2",
					chapterLink: "book/unit/05/05_02_lesson_sca_software_composition_analysis.html",
					chapterDataLink: "book/unit05/05_02_lesson_sca_software_composition_analysis.ts",
					estimatedTime: 70,
					difficulty: "intermediate",
					learningObjectives: [
						"Master pip-audit and safety for Python",
						"Use govulncheck for Go",
						"Integrate SCA into CI/CD pipelines"
					],
					description:
						"Master pip-audit and safety for Python, Use govulncheck for Go, Integrate SCA into CI/CD pipelines"
				},
				{
					id: "05_02",
					title: "5.2: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "5.2",
					chapterLink: "book/unit/05/05_02_study_guide.html",
					chapterDataLink: "book/unit05/05_02_study_guide.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Review software composition analysis tools and practices"],
					description: "Review software composition analysis tools and practices"
				},
				{
					id: "05_02",
					title: "5.2: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "5.2",
					chapterLink: "book/unit/05/05_02_quiz.html",
					chapterDataLink: "book/unit05/05_02_quiz.ts",
					estimatedTime: 15,
					difficulty: "intermediate",
					learningObjectives: ["Assess SCA implementation skills"],
					description: "Assess SCA implementation skills"
				},
				{
					id: "05_03",
					title: "5.3: Container Image Scanning",
					icon: "ScanLine",
					emoji: "📷",
					type: "lesson",
					chapterNumber: "5.3",
					chapterLink: "book/unit/05/05_03_lesson_container_image_scanning.html",
					chapterDataLink: "book/unit05/05_03_lesson_container_image_scanning.ts",
					estimatedTime: 60,
					difficulty: "intermediate",
					learningObjectives: [
						"Deploy Trivy and Grype scanners",
						"Integrate scanning into CI/CD pipelines",
						"Implement security gates"
					],
					description:
						"Deploy Trivy and Grype scanners, Integrate scanning into CI/CD pipelines, Implement security gates"
				},
				{
					id: "05_03",
					title: "5.3: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "5.3",
					chapterLink: "book/unit/05/05_03_study_guide.html",
					chapterDataLink: "book/unit05/05_03_study_guide.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Review container security scanning methodologies"],
					description: "Review container security scanning methodologies"
				},
				{
					id: "05_03",
					title: "5.3: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "5.3",
					chapterLink: "book/unit/05/05_03_quiz.html",
					chapterDataLink: "book/unit05/05_03_quiz.ts",
					estimatedTime: 15,
					difficulty: "intermediate",
					learningObjectives: ["Test container scanning knowledge"],
					description: "Test container scanning knowledge"
				},
				{
					id: "05_04",
					title: "5.4: Vulnerability Management",
					icon: "AlertTriangle",
					emoji: "⚠️",
					type: "lesson",
					chapterNumber: "5.4",
					chapterLink: "book/unit/05/05_04_lesson_vulnerability_management.html",
					chapterDataLink: "book/unit05/05_04_lesson_vulnerability_management.ts",
					estimatedTime: 85,
					difficulty: "advanced",
					learningObjectives: [
						"Design vulnerability tracking strategies",
						"Implement remediation workflows",
						"Manage security debt"
					],
					description:
						"Design vulnerability tracking strategies, Implement remediation workflows, Manage security debt"
				},
				{
					id: "05_04",
					title: "5.4: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "5.4",
					chapterLink: "book/unit/05/05_04_study_guide.html",
					chapterDataLink: "book/unit05/05_04_study_guide.ts",
					estimatedTime: 25,
					difficulty: "advanced",
					learningObjectives: ["Review vulnerability management best practices"],
					description: "Review vulnerability management best practices"
				},
				{
					id: "05_04",
					title: "5.4: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "5.4",
					chapterLink: "book/unit/05/05_04_quiz.html",
					chapterDataLink: "book/unit05/05_04_quiz.ts",
					estimatedTime: 20,
					difficulty: "advanced",
					learningObjectives: ["Evaluate vulnerability management expertise"],
					description: "Evaluate vulnerability management expertise"
				},
				{
					id: "05_05",
					title: "5.5: Unit 5 Final Exam",
					icon: "Target",
					emoji: "🎯",
					type: "exam",
					chapterNumber: "5.5",
					chapterLink: "book/unit/05/05_99_exam_unit_5_final_exam.html",
					chapterDataLink: "book/unit05/05_99_exam_unit_5_final_exam.ts",
					estimatedTime: 60,
					difficulty: "intermediate",
					learningObjectives: ["Comprehensive DevSecOps assessment"],
					description: "Comprehensive DevSecOps assessment"
				}
			]
		},
		{
			id: "unit_6",
			title: "Unit 6: Automation",
			description: "Automation",
			icon: "Bot",
			emoji: "🤖",
			technologyUnit: "microservices",
			unitNumber: 6,
			chapters: [
				{
					id: "06_01",
					title: "6.1: RenovateBot for Dependency Automation",
					icon: "RefreshCw",
					emoji: "🔄",
					type: "lesson",
					chapterNumber: "6.1",
					chapterLink: "book/unit/06/06_01_lesson_renovatebot_for_dependency_automation.html",
					chapterDataLink: "book/unit06/06_01_lesson_renovatebot_for_dependency_automation.ts",
					estimatedTime: 100,
					difficulty: "intermediate",
					learningObjectives: [
						"Configure Renovate for Python projects",
						"Set up Go module automation",
						"Master advanced configuration presets"
					],
					description:
						"Configure Renovate for Python projects, Set up Go module automation, Master advanced configuration presets"
				},
				{
					id: "06_01",
					title: "6.1: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "6.1",
					chapterLink: "book/unit/06/06_01_study_guide.html",
					chapterDataLink: "book/unit06/06_01_study_guide.ts",
					estimatedTime: 25,
					difficulty: "intermediate",
					learningObjectives: ["Review dependency automation strategies and best practices"],
					description: "Review dependency automation strategies and best practices"
				},
				{
					id: "06_01",
					title: "6.1: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "6.1",
					chapterLink: "book/unit/06/06_01_quiz.html",
					chapterDataLink: "book/unit06/06_01_quiz.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Test RenovateBot configuration and automation skills"],
					description: "Test RenovateBot configuration and automation skills"
				},
				{
					id: "06_02",
					title: "6.2: Unit 6 Final Exam",
					icon: "Target",
					emoji: "🎯",
					type: "exam",
					chapterNumber: "6.2",
					chapterLink: "book/unit/06/06_99_exam_unit_6_final_exam.html",
					chapterDataLink: "book/unit06/06_99_exam_unit_6_final_exam.ts",
					estimatedTime: 45,
					difficulty: "intermediate",
					learningObjectives: ["Comprehensive automation assessment"],
					description: "Comprehensive automation assessment"
				}
			]
		},
		{
			id: "unit_7",
			title: "Unit 7: The Serverless Ecosystem on AWS",
			description: "The Serverless Ecosystem on AWS",
			icon: "Zap",
			emoji: "☁️",
			technologyUnit: "microservices",
			unitNumber: 7,
			chapters: [
				{
					id: "07_01",
					title: "7.1: The Serverless Spectrum",
					icon: "Cloud",
					emoji: "☁️",
					type: "lesson",
					chapterNumber: "7.1",
					chapterLink: "book/unit/07/07_01_lesson_the_serverless_spectrum.html",
					chapterDataLink: "book/unit07/07_01_lesson_the_serverless_spectrum.ts",
					estimatedTime: 90,
					difficulty: "beginner",
					learningObjectives: [
						"Understand serverless philosophy",
						"Compare Lambda vs Fargate",
						"Analyze use cases and cost models"
					],
					description:
						"Understand serverless philosophy, Compare Lambda vs Fargate, Analyze use cases and cost models"
				},
				{
					id: "07_01",
					title: "7.1: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "7.1",
					chapterLink: "book/unit/07/07_01_study_guide.html",
					chapterDataLink: "book/unit07/07_01_study_guide.ts",
					estimatedTime: 25,
					difficulty: "beginner",
					learningObjectives: ["Review serverless concepts and service comparison"],
					description: "Review serverless concepts and service comparison"
				},
				{
					id: "07_01",
					title: "7.1: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "7.1",
					chapterLink: "book/unit/07/07_01_quiz.html",
					chapterDataLink: "book/unit07/07_01_quiz.ts",
					estimatedTime: 15,
					difficulty: "beginner",
					learningObjectives: ["Test serverless ecosystem knowledge"],
					description: "Test serverless ecosystem knowledge"
				},
				{
					id: "07_02",
					title: "7.2: AWS Lambda In-Depth",
					icon: "CloudLightning",
					emoji: "⚡",
					type: "lesson",
					chapterNumber: "7.2",
					chapterLink: "book/unit/07/07_02_lesson_aws_lambda_in-depth.html",
					chapterDataLink: "book/unit07/07_02_lesson_aws_lambda_in-depth.ts",
					estimatedTime: 120,
					difficulty: "intermediate",
					learningObjectives: [
						"Master Lambda limitations and advantages",
						"Configure concurrency models",
						"Optimize Python and Go performance"
					],
					description:
						"Master Lambda limitations and advantages, Configure concurrency models, Optimize Python and Go performance"
				},
				{
					id: "07_02",
					title: "7.2: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "7.2",
					chapterLink: "book/unit/07/07_02_study_guide.html",
					chapterDataLink: "book/unit07/07_02_study_guide.ts",
					estimatedTime: 30,
					difficulty: "intermediate",
					learningObjectives: ["Review Lambda architecture and optimization strategies"],
					description: "Review Lambda architecture and optimization strategies"
				},
				{
					id: "07_02",
					title: "7.2: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "7.2",
					chapterLink: "book/unit/07/07_02_quiz.html",
					chapterDataLink: "book/unit07/07_02_quiz.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Assess Lambda implementation skills"],
					description: "Assess Lambda implementation skills"
				},
				{
					id: "07_03",
					title: "7.3: Orchestration and Workflows",
					icon: "Workflow",
					emoji: "🔀",
					type: "lesson",
					chapterNumber: "7.3",
					chapterLink: "book/unit/07/07_03_lesson_orchestration_and_workflows.html",
					chapterDataLink: "book/unit07/07_03_lesson_orchestration_and_workflows.ts",
					estimatedTime: 100,
					difficulty: "advanced",
					learningObjectives: [
						"Design Step Functions workflows",
						"Integrate Lambda with AWS services",
						"Build complex orchestration patterns"
					],
					description:
						"Design Step Functions workflows, Integrate Lambda with AWS services, Build complex orchestration patterns"
				},
				{
					id: "07_03",
					title: "7.3: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "7.3",
					chapterLink: "book/unit/07/07_03_study_guide.html",
					chapterDataLink: "book/unit07/07_03_study_guide.ts",
					estimatedTime: 25,
					difficulty: "advanced",
					learningObjectives: ["Review workflow orchestration and Step Functions"],
					description: "Review workflow orchestration and Step Functions"
				},
				{
					id: "07_03",
					title: "7.3: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "7.3",
					chapterLink: "book/unit/07/07_03_quiz.html",
					chapterDataLink: "book/unit07/07_03_quiz.ts",
					estimatedTime: 20,
					difficulty: "advanced",
					learningObjectives: ["Test orchestration and workflow knowledge"],
					description: "Test orchestration and workflow knowledge"
				},
				{
					id: "07_04",
					title: "7.4: Serverless Deployment & Tooling",
					icon: "Settings",
					emoji: "⚙️",
					type: "lesson",
					chapterNumber: "7.4",
					chapterLink: "book/unit/07/07_04_lesson_serverless_deployment_tooling.html",
					chapterDataLink: "book/unit07/07_04_lesson_serverless_deployment_tooling.ts",
					estimatedTime: 110,
					difficulty: "intermediate",
					learningObjectives: [
						"Master Serverless Framework and AWS SAM",
						"Implement Infrastructure as Code for serverless",
						"Deploy production workloads"
					],
					description:
						"Master Serverless Framework and AWS SAM, Implement Infrastructure as Code for serverless, Deploy production workloads"
				},
				{
					id: "07_04",
					title: "7.4: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "7.4",
					chapterLink: "book/unit/07/07_04_study_guide.html",
					chapterDataLink: "book/unit07/07_04_study_guide.ts",
					estimatedTime: 30,
					difficulty: "intermediate",
					learningObjectives: ["Review serverless deployment tools and strategies"],
					description: "Review serverless deployment tools and strategies"
				},
				{
					id: "07_04",
					title: "7.4: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "7.4",
					chapterLink: "book/unit/07/07_04_quiz.html",
					chapterDataLink: "book/unit07/07_04_quiz.ts",
					estimatedTime: 20,
					difficulty: "intermediate",
					learningObjectives: ["Assess serverless deployment expertise"],
					description: "Assess serverless deployment expertise"
				},
				{
					id: "07_05",
					title: "7.5: AWS Developer Certification Guide",
					icon: "Award",
					emoji: "🏆",
					type: "lesson",
					chapterNumber: "7.5",
					chapterLink: "book/unit/07/07_05_lesson_aws_developer_certification_guide.html",
					chapterDataLink: "book/unit07/07_05_lesson_aws_developer_certification_guide.ts",
					estimatedTime: 80,
					difficulty: "advanced",
					learningObjectives: [
						"Master key serverless exam concepts",
						"Practice certification scenarios",
						"Review AWS best practices"
					],
					description:
						"Master key serverless exam concepts, Practice certification scenarios, Review AWS best practices"
				},
				{
					id: "07_05",
					title: "7.5: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "7.5",
					chapterLink: "book/unit/07/07_05_study_guide.html",
					chapterDataLink: "book/unit07/07_05_study_guide.ts",
					estimatedTime: 25,
					difficulty: "advanced",
					learningObjectives: ["Review certification exam topics and strategies"],
					description: "Review certification exam topics and strategies"
				},
				{
					id: "07_05",
					title: "7.5: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "7.5",
					chapterLink: "book/unit/07/07_05_quiz.html",
					chapterDataLink: "book/unit07/07_05_quiz.ts",
					estimatedTime: 20,
					difficulty: "advanced",
					learningObjectives: ["Test certification readiness"],
					description: "Test certification readiness"
				},
				{
					id: "07_06",
					title: "7.6: Unit 7 Final Exam",
					icon: "Target",
					emoji: "🎯",
					type: "exam",
					chapterNumber: "7.6",
					chapterLink: "book/unit/07/07_99_exam_unit_7_final_exam.html",
					chapterDataLink: "book/unit07/07_99_exam_unit_7_final_exam.ts",
					estimatedTime: 75,
					difficulty: "intermediate",
					learningObjectives: ["Comprehensive serverless ecosystem assessment"],
					description: "Comprehensive serverless ecosystem assessment"
				}
			]
		},
		{
			id: "unit_8",
			title: "Unit 8: Systems Integration and Security",
			description: "Systems Integration and Security",
			icon: "Shield",
			emoji: "🔗",
			technologyUnit: "microservices",
			unitNumber: 8,
			chapters: [
				{
					id: "08_01",
					title: "8.1: Securely Connecting Services",
					icon: "Link",
					emoji: "🔗",
					type: "lesson",
					chapterNumber: "8.1",
					chapterLink: "book/unit/08/08_01_lesson_securely_connecting_services.html",
					chapterDataLink: "book/unit08/08_01_lesson_securely_connecting_services.ts",
					estimatedTime: 110,
					difficulty: "advanced",
					learningObjectives: [
						"Implement Vault secret injection",
						"Configure Kubernetes secrets",
						"Deploy AWS Secrets Manager with IAM roles",
						"Establish mTLS communication"
					],
					description:
						"Implement Vault secret injection, Configure Kubernetes secrets, Deploy AWS Secrets Manager with IAM roles, Establish mTLS communication"
				},
				{
					id: "08_01",
					title: "8.1: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "8.1",
					chapterLink: "book/unit/08/08_01_study_guide.html",
					chapterDataLink: "book/unit08/08_01_study_guide.ts",
					estimatedTime: 30,
					difficulty: "advanced",
					learningObjectives: ["Review secure service connection patterns and best practices"],
					description: "Review secure service connection patterns and best practices"
				},
				{
					id: "08_01",
					title: "8.1: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "8.1",
					chapterLink: "book/unit/08/08_01_quiz.html",
					chapterDataLink: "book/unit08/08_01_quiz.ts",
					estimatedTime: 20,
					difficulty: "advanced",
					learningObjectives: ["Test secure service integration skills"],
					description: "Test secure service integration skills"
				},
				{
					id: "08_02",
					title: "8.2: Secure Credential Management in CI/CD and IaC",
					icon: "Key",
					emoji: "🔑",
					type: "lesson",
					chapterNumber: "8.2",
					chapterLink:
						"book/unit/08/08_02_lesson_secure_credential_management_in_cicd_and_iac.html",
					chapterDataLink:
						"book/unit08/08_02_lesson_secure_credential_management_in_cicd_and_iac.ts",
					estimatedTime: 125,
					difficulty: "advanced",
					learningObjectives: [
						"Secure CI/CD pipeline credentials",
						"Configure Terraform Cloud security",
						"Implement Kubernetes OIDC integration",
						"Manage AWS IAM roles"
					],
					description:
						"Secure CI/CD pipeline credentials, Configure Terraform Cloud security, Implement Kubernetes OIDC integration, Manage AWS IAM roles"
				},
				{
					id: "08_02",
					title: "8.2: Study Guide",
					icon: "BookOpen",
					emoji: "📚",
					type: "study_guide",
					chapterNumber: "8.2",
					chapterLink: "book/unit/08/08_02_study_guide.html",
					chapterDataLink: "book/unit08/08_02_study_guide.ts",
					estimatedTime: 35,
					difficulty: "advanced",
					learningObjectives: ["Review CI/CD security and credential management strategies"],
					description: "Review CI/CD security and credential management strategies"
				},
				{
					id: "08_02",
					title: "8.2: Quiz",
					icon: "HelpCircle",
					emoji: "❓",
					type: "quiz",
					chapterNumber: "8.2",
					chapterLink: "book/unit/08/08_02_quiz.html",
					chapterDataLink: "book/unit08/08_02_quiz.ts",
					estimatedTime: 25,
					difficulty: "advanced",
					learningObjectives: ["Assess CI/CD security implementation expertise"],
					description: "Assess CI/CD security implementation expertise"
				},
				{
					id: "08_03",
					title: "8.3: Unit 8 Final Exam",
					icon: "Target",
					emoji: "🎯",
					type: "exam",
					chapterNumber: "8.3",
					chapterLink: "book/unit/08/08_99_exam_unit_8_final_exam.html",
					chapterDataLink: "book/unit08/08_99_exam_unit_8_final_exam.ts",
					estimatedTime: 70,
					difficulty: "advanced",
					learningObjectives: ["Comprehensive systems integration and security assessment"],
					description: "Comprehensive systems integration and security assessment"
				}
			]
		},
		{
			id: "unit_9",
			title: "Unit 9: Capstone Projects",
			description: "Capstone Projects",
			icon: "GraduationCap",
			emoji: "🎓",
			technologyUnit: "microservices",
			unitNumber: 9,
			chapters: [
				{
					id: "09_01",
					title: "9.1: Project 1: Python-based E-Commerce Microservices",
					icon: "Rocket",
					emoji: "🚀",
					type: "project",
					chapterNumber: "9.1",
					chapterLink:
						"book/unit/09/09_01_project_91_project_1_python-based_e-commerce_microservices.html",
					chapterDataLink:
						"book/unit09/09_01_project_91_project_1_python-based_e-commerce_microservices.ts",
					estimatedTime: 480,
					difficulty: "expert",
					learningObjectives: [
						"Build multi-service e-commerce backend with FastAPI",
						"Implement message queue communication",
						"Deploy on Kubernetes with Terraform and Vault"
					],
					description:
						"Build multi-service e-commerce backend with FastAPI, Implement message queue communication, Deploy on Kubernetes with Terraform and Vault"
				},
				{
					id: "09_02",
					title: "9.2: Project 2: Go-based Real-Time Analytics Pipeline",
					icon: "Rocket",
					emoji: "🚀",
					type: "project",
					chapterNumber: "9.2",
					chapterLink:
						"book/unit/09/09_02_project_92_project_2_go-based_real-time_analytics_pipeline.html",
					chapterDataLink:
						"book/unit09/09_02_project_92_project_2_go-based_real-time_analytics_pipeline.ts",
					estimatedTime: 420,
					difficulty: "expert",
					learningObjectives: [
						"Develop high-performance analytics platform with gRPC",
						"Master Go concurrency for parallel processing",
						"Deploy scalable system with DevOps stack"
					],
					description:
						"Develop high-performance analytics platform with gRPC, Master Go concurrency for parallel processing, Deploy scalable system with DevOps stack"
				}
			]
		}
	]
};
