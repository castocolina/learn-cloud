<script lang="ts">
	import { DifficultyBadge, ContentTypeBadge } from "$lib/components/demo";
	import { ArrowLeft, ArrowRight } from "lucide-svelte";
	import MermaidShowcase from "./MermaidShowcase.svelte";
	import CodeExamplesShowcase from "./CodeExamplesShowcase.svelte";
	import DiagramViewer from "./DiagramViewer.svelte";
	import CodeBlock from "./ui/CodeBlock.svelte";
	import FlipCard from "./FlipCard.svelte";
	import FlipCardShowcase from "./FlipCardShowcase.svelte";
	import QuizRenderer from "./quiz/QuizRenderer.svelte";
	import { getRandomDiagram } from "$data/demo/content/diagrams/mermaid-examples.js";
	import { getRandomCodeExample } from "$data/demo/content/code/code-examples-utils.js";
	import { getRandomFlipCards } from "$data/demo/content/flipcards/concept-cards.js";
	import { allQuizzes, type Quiz } from "$data/demo/content/quizzes/quiz-examples.js";
	import { Clock, Target, BookOpen, CheckCircle2, ExternalLink } from "lucide-svelte";
	import type { DemoLesson } from "$data/demo/navigation/demo-sidebar-menu.js";

	// Props interface for type safety
	interface Props {
		lesson: DemoLesson;
	}

	let { lesson }: Props = $props();

	/**
	 * Check if this is the Mermaid Diagram Showcase lesson
	 */
	let isMermaidShowcase = $derived(
		lesson.id === "demo-lesson-showcase-1" || lesson.title.includes("Mermaid Diagram Showcase")
	);

	/**
	 * Check if this is the Code Examples Showcase lesson
	 */
	let isCodeExamplesShowcase = $derived(
		lesson.id === "demo-lesson-showcase-2" || lesson.title.includes("Code Examples Showcase")
	);

	/**
	 * Check if this is the Interactive Quiz System lesson
	 */
	let isQuizShowcase = $derived(
		lesson.id === "demo-lesson-showcase-4" || lesson.title.includes("Interactive Quiz System")
	);

	/**
	 * Get a random diagram for regular lessons (not the showcase)
	 */
	let randomDiagram = $derived(
		!isMermaidShowcase && !isCodeExamplesShowcase && !isQuizShowcase ? getRandomDiagram() : null
	);

	/**
	 * Get a random code example for regular lessons (not the code showcase)
	 */
	let randomCodeExample = $derived(
		!isMermaidShowcase && !isCodeExamplesShowcase && !isQuizShowcase ? getRandomCodeExample() : null
	);

	/**
	 * Get random flip cards for regular lessons (not the showcases)
	 */
	let randomFlipCards = $derived(
		!isMermaidShowcase && !isCodeExamplesShowcase && !isQuizShowcase ? getRandomFlipCards(2) : []
	);

	/**
	 * Get a random quiz for the quiz showcase
	 */
	let randomQuiz = $derived(
		isQuizShowcase && allQuizzes.length > 0
			? allQuizzes[Math.floor(Math.random() * allQuizzes.length)]
			: null
	);

	/**
	 * Get estimated reading time for description
	 */
	function getEstimatedReadTime(text: string): number {
		const wordsPerMinute = 200;
		const wordCount = text.split(" ").length;
		return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
	}

	/**
	 * Get content type description
	 */
	function getContentTypeDescription(contentType: string): string {
		switch (contentType) {
			case "code":
				return "This lesson focuses on practical coding examples and implementation";
			case "interactive":
				return "This lesson includes interactive exercises and hands-on activities";
			case "diagram":
				return "This lesson uses visual diagrams and architectural illustrations";
			case "text":
				return "This lesson provides comprehensive theoretical foundation";
			case "mixed":
				return "This lesson combines multiple content types for comprehensive learning";
			default:
				return "This lesson provides essential knowledge for your learning path";
		}
	}
</script>

<svelte:head>
	<title>Lesson: {lesson.title} - Cloud-Native Learning Platform</title>
	<meta name="description" content={lesson.description} />
</svelte:head>

<!-- Lesson View Container -->
<div class="lesson-view">
	<!-- Lesson Header -->
	<header class="lesson-header">
		<div class="lesson-header-content">
			<div class="lesson-hero">
				<div class="lesson-icon-large">{lesson.icon}</div>
				<div class="lesson-hero-text">
					<h1 class="lesson-title">{lesson.title}</h1>
					<p class="lesson-description">{lesson.description}</p>

					<!-- Lesson Metadata -->
					<div class="lesson-metadata">
						<div class="metadata-item">
							<ContentTypeBadge contentType={lesson.contentType} />
						</div>
						<div class="metadata-item">
							<DifficultyBadge difficulty={lesson.difficulty} />
						</div>
						<div class="metadata-item">
							<Clock size={16} />
							<span>{lesson.duration}</span>
						</div>
						<div class="metadata-item">
							<Target size={16} />
							<span>~{getEstimatedReadTime(lesson.description)} min read</span>
						</div>
					</div>

					<!-- Content Type Description -->
					<div class="content-type-info">
						<p class="content-type-description">
							{getContentTypeDescription(lesson.contentType)}
						</p>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Lesson Content -->
	<main class="lesson-content">
		<div class="lesson-content-inner">
			<!-- Prerequisites Section -->
			{#if lesson.prerequisites && lesson.prerequisites.length > 0}
				<section class="lesson-section prerequisites-section">
					<div class="section-header">
						<h2 class="section-title">
							<BookOpen size={20} />
							Prerequisites
						</h2>
						<p class="section-description">
							Make sure you understand these concepts before proceeding.
						</p>
					</div>

					<div class="prerequisites-grid">
						{#each lesson.prerequisites as prerequisite (prerequisite)}
							<div class="prerequisite-item">
								<CheckCircle2 size={16} class="prerequisite-check" />
								<span class="prerequisite-text">{prerequisite}</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Learning Objectives Section -->
			{#if lesson.learningObjectives && lesson.learningObjectives.length > 0}
				<section class="lesson-section objectives-section">
					<div class="section-header">
						<h2 class="section-title">
							<Target size={20} />
							Learning Objectives
						</h2>
						<p class="section-description">
							By the end of this lesson, you will be able to accomplish these goals.
						</p>
					</div>

					<div class="objectives-list">
						{#each lesson.learningObjectives as objective (objective)}
							<div class="objective-item">
								<div class="objective-number">
									{lesson.learningObjectives.indexOf(objective) + 1}
								</div>
								<div class="objective-content">
									<p class="objective-text">{objective}</p>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<!-- Main Lesson Content -->
			<section class="lesson-section main-content-section">
				<div class="section-header">
					<h2 class="section-title">
						<BookOpen size={20} />
						Lesson Content
					</h2>
					<p class="section-description">
						Comprehensive content covering all key concepts for this lesson.
					</p>
				</div>

				<div class="main-content">
					{#if isMermaidShowcase}
						<!-- Mermaid Showcase Content -->
						<div class="content-block">
							<h3 class="content-heading">Interactive Mermaid Diagram Collection</h3>
							<p class="content-paragraph">
								Welcome to our comprehensive collection of educational Mermaid diagrams designed
								specifically for cloud-native learning. This interactive showcase contains 20+
								carefully crafted diagrams covering flowcharts, sequence diagrams, class diagrams,
								entity relationship diagrams, and more.
							</p>
							<p class="content-paragraph">
								Each diagram follows strict <strong>MERMAID-STANDARDS.md</strong> guidelines, ensuring
								mobile-first design with left-to-right layouts optimized for narrow screens (≤390px).
								All diagrams include educational metadata, complexity levels, and real-world use cases
								to enhance your learning experience.
							</p>
						</div>

						<!-- Embedded Mermaid Showcase -->
						<div class="component-container">
							<MermaidShowcase showStats={true} />
						</div>

						<!-- Usage Instructions -->
						<div class="content-block">
							<h3 class="content-heading">How to Use This Showcase</h3>
							<p class="content-paragraph">
								Use the search and filter controls to explore diagrams by type, complexity, or
								category. Each diagram card includes:
							</p>
							<ul class="content-list">
								<li>
									<strong>Type and Complexity Badges:</strong> Quick identification of diagram characteristics
								</li>
								<li><strong>Tags:</strong> Relevant keywords for easy discovery</li>
								<li><strong>Learning Objectives:</strong> Clear goals for each diagram</li>
								<li><strong>Use Cases:</strong> Real-world applications and scenarios</li>
								<li>
									<strong>Detailed Explanations:</strong> Educational context and implementation guidance
								</li>
							</ul>
							<p class="content-paragraph">
								For debugging purposes, append <code>?debug=true</code> to the URL to enable detailed
								error logging and diagnostic information for any diagram rendering issues.
							</p>
						</div>
					{:else if isCodeExamplesShowcase}
						<!-- Code Examples Showcase Content -->
						<div class="content-block">
							<h3 class="content-heading">Interactive Code Examples Library</h3>
							<p class="content-paragraph">
								Welcome to our comprehensive collection of 56+ production-ready code examples
								spanning multiple programming languages and technologies. This interactive showcase
								covers everything from frontend frameworks like Svelte 5 and TypeScript to backend
								languages like Go, Python, Java, and Rust, plus infrastructure technologies like
								Terraform, Kubernetes, and Docker.
							</p>
							<p class="content-paragraph">
								Each code example follows <strong>industry best practices</strong> and includes proper
								syntax highlighting, copy-to-clipboard functionality, and educational metadata. Examples
								are organized by language, complexity level, and include detailed descriptions to help
								you understand real-world implementation patterns.
							</p>
						</div>

						<!-- Embedded Code Examples Showcase -->
						<div class="component-container">
							<CodeExamplesShowcase showStats={true} />
						</div>

						<!-- Usage Instructions -->
						<div class="content-block">
							<h3 class="content-heading">How to Use This Showcase</h3>
							<p class="content-paragraph">
								Use the search bar to find specific technologies or concepts, or apply filters by
								programming language and complexity level. Each code example card includes:
							</p>
							<ul class="content-list">
								<li>
									<strong>Language and Complexity Badges:</strong> Quick identification of technology
									and skill level
								</li>
								<li><strong>Syntax Highlighting:</strong> Powered by Shiki with theme support</li>
								<li>
									<strong>Line Numbers:</strong> Easy reference for discussing specific code sections
								</li>
								<li>
									<strong>Copy to Clipboard:</strong> One-click copying for easy experimentation
								</li>
								<li>
									<strong>Show/Hide Toggle:</strong> Collapsible code blocks for better overview
								</li>
							</ul>
							<p class="content-paragraph">
								All examples are designed to be <strong>production-ready</strong> and follow security
								best practices. They're perfect for learning new technologies, understanding implementation
								patterns, or as starting points for your own projects.
							</p>
						</div>
					{:else if isQuizShowcase}
						<!-- Interactive Quiz System Content -->
						<div class="content-block">
							<h3 class="content-heading">Interactive Quiz System</h3>
							<p class="content-paragraph">
								Welcome to our comprehensive quiz system designed for interactive learning and
								assessment. This system features multiple question types including multiple choice,
								true/false, drag-and-drop, and code completion questions. Each quiz includes
								real-time progress tracking, timer functionality, and detailed results analysis.
							</p>
							<p class="content-paragraph">
								The quiz system is built with accessibility in mind, featuring proper ARIA labels,
								keyboard navigation support, and mobile-first responsive design. All quizzes are
								automatically scored and provide detailed feedback to help you understand the
								concepts better.
							</p>
						</div>

						<!-- Embedded Quiz Renderer -->
						{#if randomQuiz}
							<div class="component-container">
								<h4 class="content-subheading">Demo Quiz: {randomQuiz.title}</h4>
								<p class="content-paragraph quiz-intro">
									{randomQuiz.description}
								</p>
								<QuizRenderer
									quiz={randomQuiz}
									onComplete={(results: any) => {
										console.log("Quiz completed:", results);
									}}
								/>
							</div>
						{/if}

						<!-- Quiz System Features -->
						<div class="content-block">
							<h3 class="content-heading">Quiz System Features</h3>
							<p class="content-paragraph">
								Our interactive quiz system includes the following advanced features:
							</p>
							<ul class="content-list">
								<li>
									<strong>Multiple Question Types:</strong> Support for multiple choice, true/false,
									drag-and-drop, and code completion questions
								</li>
								<li>
									<strong>Real-time Timer:</strong> Optional time limits with visual progress indicators
								</li>
								<li>
									<strong>Progress Tracking:</strong> Visual progress bars and question navigation
								</li>
								<li>
									<strong>Detailed Results:</strong> Comprehensive scoring with performance analysis
								</li>
								<li>
									<strong>Mobile Responsive:</strong> Optimized for all device sizes and orientations
								</li>
								<li>
									<strong>Accessibility Features:</strong> Full keyboard navigation and screen reader
									support
								</li>
							</ul>
							<p class="content-paragraph">
								All quizzes are designed to reinforce learning objectives and provide immediate
								feedback to help you identify areas for improvement and consolidate your
								understanding.
							</p>
						</div>
					{:else}
						<!-- Default Lesson Content -->
						<!-- Introduction -->
						<div class="content-block">
							<h3 class="content-heading">Introduction</h3>
							<p class="content-paragraph">
								Welcome to this comprehensive lesson on {lesson.title.toLowerCase()}. This lesson is
								designed to provide you with both theoretical understanding and practical examples
								to help you master the key concepts and apply them in real-world scenarios.
							</p>
							<p class="content-paragraph">
								Throughout this lesson, you'll explore fundamental principles, best practices, and
								common implementation patterns. Each section builds upon the previous one, ensuring
								a structured learning experience that prepares you for advanced cloud-native
								development.
							</p>
							<p class="content-paragraph">
								The content includes interactive diagrams, code examples, and detailed explanations
								to reinforce your understanding and provide practical insights you can immediately
								apply in your projects.
							</p>
						</div>

						<!-- Interactive Diagram Section -->
						{#if randomDiagram}
							<div class="content-block">
								<h3 class="content-heading">Visual Learning: Interactive Diagram</h3>
								<p class="content-paragraph">
									This lesson includes an interactive Mermaid diagram to help visualize key
									concepts. The diagram below demonstrates practical applications and relationships
									that are essential for understanding {lesson.title.toLowerCase()}.
								</p>
								<p class="content-paragraph">
									<strong>Study Tip:</strong> Click the expand button to view the diagram in full-screen
									mode for better detail. You can also copy the diagram source code using the copy button
									in the expanded view.
								</p>
							</div>

							<!-- Embedded Random Diagram -->
							<div class="component-container">
								<DiagramViewer diagram={randomDiagram} showMetadata={true} />
							</div>

							<div class="content-block">
								<p class="content-paragraph">
									<strong>Learning Integration:</strong> Study the diagram above and consider how
									its concepts relate to the {lesson.title.toLowerCase()} principles we'll explore in
									the following sections. This visual foundation will help you better understand the
									theoretical concepts and their practical applications.
								</p>
							</div>
						{/if}

						<!-- Interactive Code Example Section -->
						{#if randomCodeExample}
							<div class="content-block">
								<h3 class="content-heading">Practical Learning: Code Example</h3>
								<p class="content-paragraph">
									This lesson includes a practical code example to demonstrate real-world
									implementation patterns. The example below shows how the concepts from
									{lesson.title.toLowerCase()} are applied in production environments.
								</p>
								<p class="content-paragraph">
									<strong>Study Tip:</strong> Use the copy button to experiment with this code in your
									own development environment. Try modifying the example to better understand how the
									different components work together.
								</p>
							</div>

							<!-- Embedded Random Code Example -->
							<div class="component-container">
								<CodeBlock
									example={randomCodeExample}
									showLineNumbers={true}
									showCopyButton={true}
									showMetadata={true}
								/>
							</div>

							<div class="content-block">
								<p class="content-paragraph">
									<strong>Implementation Notes:</strong> This {randomCodeExample.language} example demonstrates
									{randomCodeExample.complexity}-level concepts that complement the theoretical
									knowledge from this lesson. Consider how you might adapt this pattern for your
									specific use cases and requirements.
								</p>
							</div>
						{/if}

						<!-- Interactive Flip Cards Section -->
						{#if randomFlipCards.length > 0}
							<div class="content-block">
								<h3 class="content-heading">Interactive Learning: Concept Cards</h3>
								<p class="content-paragraph">
									Test your understanding with these interactive flip cards. Each card presents a
									key concept related to {lesson.title.toLowerCase()} and reveals detailed explanations
									when clicked. Track your progress as you master each concept.
								</p>
								<p class="content-paragraph">
									<strong>Study Tip:</strong> Click each card to reveal the answer and learning objectives.
									Use the progress indicators to track which concepts you've viewed, flipped, and mastered.
									Mark concepts as "mastered" using the eye icon when you feel confident about the topic.
								</p>
							</div>

							<!-- Embedded Random Flip Cards -->
							<div class="component-container">
								<div class="demo-flipcard-container">
									{#each randomFlipCards as flipCard (flipCard.id)}
										<FlipCard card={flipCard} showMetadata={true} showProgress={true} />
									{/each}
								</div>
							</div>

							<div class="content-block">
								<p class="content-paragraph">
									<strong>Learning Integration:</strong> These flip cards cover {randomFlipCards
										.map((card) => card.category.replace(/-/g, " "))
										.join(" and ")} concepts that directly relate to {lesson.title.toLowerCase()}.
									Each card includes estimated learning time and learning objectives to help you
									structure your study sessions effectively.
								</p>
							</div>
						{/if}
					{/if}

					<!-- Core Concepts -->
					<div class="content-block">
						<h3 class="content-heading">Core Concepts</h3>
						<p class="content-paragraph">
							At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
							voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint
							occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt
							mollitia animi, id est laborum et dolorum fuga.
						</p>
						<p class="content-paragraph">
							Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum
							soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat
							facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus
							autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et
							voluptates repudiandae sint et molestiae non recusandae.
						</p>
						<p class="content-paragraph">
							Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus
							maiores alias consequatur aut perferendis doloribus asperiores repellat. Lorem ipsum
							dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
							labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
							ullamco laboris.
						</p>
					</div>

					<!-- Practical Implementation -->
					<div class="content-block">
						<h3 class="content-heading">Practical Implementation</h3>
						<p class="content-paragraph">
							Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
							voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
							cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
							Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
							laudantium.
						</p>
						<p class="content-paragraph">
							Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto
							beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
							aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
							voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit
							amet.
						</p>
						<p class="content-paragraph">
							Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore
							et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
							exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
							consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam
							nihil molestiae consequatur.
						</p>
					</div>

					<!-- Advanced Topics -->
					<div class="content-block">
						<h3 class="content-heading">Advanced Topics</h3>
						<p class="content-paragraph">
							Vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus
							et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque
							corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non
							provident, similique sunt in culpa qui officia deserunt mollitia animi.
						</p>
						<p class="content-paragraph">
							Id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita
							distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
							impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda
							est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut
							rerum necessitatibus.
						</p>
						<p class="content-paragraph">
							Saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque
							earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores
							alias consequatur aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit
							amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
							dolore magna aliqua.
						</p>
					</div>

					<!-- Best Practices -->
					<div class="content-block">
						<h3 class="content-heading">Best Practices</h3>
						<p class="content-paragraph">
							Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
							ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
							cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
							proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut
							perspiciatis unde omnis iste natus error.
						</p>
						<p class="content-paragraph">
							Sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
							ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
							Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
							consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
						</p>
						<p class="content-paragraph">
							Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
							velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam
							aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem
							ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
						</p>
					</div>

					<!-- Common Pitfalls -->
					<div class="content-block">
						<h3 class="content-heading">Common Pitfalls</h3>
						<p class="content-paragraph">
							Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
							molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.
							At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
							voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint
							occaecati cupiditate non provident.
						</p>
						<p class="content-paragraph">
							Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum
							fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore,
							cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime
							placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
						</p>
						<p class="content-paragraph">
							Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe
							eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum
							rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias
							consequatur aut perferendis doloribus asperiores repellat.
						</p>
					</div>

					<!-- Real-World Applications -->
					<div class="content-block">
						<h3 class="content-heading">Real-World Applications</h3>
						<p class="content-paragraph">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
							incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
							exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
							dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
						</p>
						<p class="content-paragraph">
							Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
							mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit
							voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab
							illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
						</p>
						<p class="content-paragraph">
							Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
							consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
							quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
							quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat
							voluptatem.
						</p>
					</div>

					<!-- Performance Considerations -->
					<div class="content-block">
						<h3 class="content-heading">Performance Considerations</h3>
						<p class="content-paragraph">
							Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit
							laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure
							reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel
							illum qui dolorem eum fugiat quo voluptas nulla pariatur.
						</p>
						<p class="content-paragraph">
							At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
							voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint
							occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt
							mollitia animi, id est laborum et dolorum fuga.
						</p>
						<p class="content-paragraph">
							Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum
							soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat
							facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus
							autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.
						</p>
					</div>

					<!-- Security Implications -->
					<div class="content-block">
						<h3 class="content-heading">Security Implications</h3>
						<p class="content-paragraph">
							Ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic
							tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur
							aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit amet, consectetur
							adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
						</p>
						<p class="content-paragraph">
							Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
							ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
							cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
							proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
						</p>
						<p class="content-paragraph">
							Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
							laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
							architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas
							sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.
						</p>
					</div>

					<!-- Scalability Factors -->
					<div class="content-block">
						<h3 class="content-heading">Scalability Factors</h3>
						<p class="content-paragraph">
							Qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum
							quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi
							tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad
							minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.
						</p>
						<p class="content-paragraph">
							Nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui
							in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum
							fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos
							ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.
						</p>
						<p class="content-paragraph">
							Quos dolores et quas molestias excepturi sint occaecati cupiditate non provident,
							similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum
							fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore,
							cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
						</p>
					</div>

					<!-- Monitoring and Troubleshooting -->
					<div class="content-block">
						<h3 class="content-heading">Monitoring and Troubleshooting</h3>
						<p class="content-paragraph">
							Id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor
							repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum
							necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non
							recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
							voluptatibus maiores alias consequatur.
						</p>
						<p class="content-paragraph">
							Aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit amet, consectetur
							adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
							enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
							commodo consequat. Duis aute irure dolor in reprehenderit in voluptate.
						</p>
						<p class="content-paragraph">
							Velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
							non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut
							perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
							laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
							architecto.
						</p>
					</div>

					<!-- Industry Standards -->
					<div class="content-block">
						<h3 class="content-heading">Industry Standards</h3>
						<p class="content-paragraph">
							Beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
							aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
							voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit
							amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.
						</p>
						<p class="content-paragraph">
							Ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
							nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea
							commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit
							esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas
							nulla pariatur.
						</p>
						<p class="content-paragraph">
							At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
							voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint
							occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt
							mollitia animi, id est laborum et dolorum fuga.
						</p>
					</div>

					<!-- Future Developments -->
					<div class="content-block">
						<h3 class="content-heading">Future Developments</h3>
						<p class="content-paragraph">
							Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum
							soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat
							facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus
							autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et
							voluptates repudiandae sint.
						</p>
						<p class="content-paragraph">
							Et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut
							aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus
							asperiores repellat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
							eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
							quis nostrud exercitation ullamco laboris.
						</p>
						<p class="content-paragraph">
							Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
							voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
							cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
							Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
							laudantium.
						</p>
					</div>

					<!-- Conclusion -->
					<div class="content-block">
						<h3 class="content-heading">Conclusion</h3>
						<p class="content-paragraph">
							Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto
							beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
							aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione
							voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit
							amet, consectetur, adipisci velit.
						</p>
						<p class="content-paragraph">
							Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam
							quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam
							corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem
							vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae
							consequatur.
						</p>
						<p class="content-paragraph">
							Vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. This comprehensive
							lesson has covered all the essential concepts and practical implementations necessary
							for mastering this topic within the broader context of cloud-native technologies.
							Continue practicing these concepts and applying them in real-world scenarios to deepen
							your understanding.
						</p>
					</div>
				</div>
			</section>

			<!-- Additional Resources -->
			<section class="lesson-section resources-section">
				<div class="section-header">
					<h2 class="section-title">
						<ExternalLink size={20} />
						Additional Resources
					</h2>
					<p class="section-description">
						Explore these resources to deepen your understanding of the concepts covered.
					</p>
				</div>

				<div class="resources-grid">
					<div class="resource-card">
						<div class="resource-header">
							<div class="resource-icon">📚</div>
							<h3 class="resource-title">Documentation</h3>
						</div>
						<p class="resource-description">
							Official documentation and comprehensive guides for further reading.
						</p>
					</div>

					<div class="resource-card">
						<div class="resource-header">
							<div class="resource-icon">💻</div>
							<h3 class="resource-title">Code Examples</h3>
						</div>
						<p class="resource-description">
							Practical code examples and implementation samples to try yourself.
						</p>
					</div>

					<div class="resource-card">
						<div class="resource-header">
							<div class="resource-icon">🎥</div>
							<h3 class="resource-title">Video Tutorials</h3>
						</div>
						<p class="resource-description">
							Visual learning resources and step-by-step tutorial videos.
						</p>
					</div>

					<div class="resource-card">
						<div class="resource-header">
							<div class="resource-icon">🧪</div>
							<h3 class="resource-title">Practice Labs</h3>
						</div>
						<p class="resource-description">
							Hands-on lab exercises to practice and reinforce your skills.
						</p>
					</div>
				</div>
			</section>

			<!-- Navigation -->
			<section class="lesson-navigation">
				<div class="nav-actions">
					<button class="nav-button nav-button--secondary" type="button">
						<ArrowLeft size={16} />
						Previous Lesson
					</button>

					<div class="nav-progress">
						<span class="nav-progress-text">Lesson Progress</span>
						<div class="nav-progress-bar">
							<div class="nav-progress-fill" style="width: 100%"></div>
						</div>
						<span class="nav-progress-percentage">100%</span>
					</div>

					<button class="nav-button nav-button--primary" type="button">
						Next Lesson
						<ArrowRight size={16} />
					</button>
				</div>
			</section>
		</div>
	</main>
</div>

<style>
	/* Lesson View Container */
	.lesson-view {
		min-height: 100%;
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	/* Lesson Header */
	.lesson-header {
		background: linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--secondary) / 0.05));
		border-bottom: 1px solid hsl(var(--border));
		padding: 2.5rem 2rem;
	}

	.lesson-header-content {
		max-width: 1000px;
		margin: 0 auto;
	}

	.lesson-hero {
		display: flex;
		align-items: flex-start;
		gap: 2rem;
	}

	.lesson-icon-large {
		font-size: 3.5rem;
		flex-shrink: 0;
		line-height: 1;
	}

	.lesson-hero-text {
		flex: 1;
		min-width: 0;
	}

	.lesson-title {
		font-size: 2.25rem;
		font-weight: 800;
		margin: 0 0 1rem 0;
		color: hsl(var(--foreground));
		line-height: 1.2;
	}

	.lesson-description {
		font-size: 1.125rem;
		color: hsl(var(--muted-foreground));
		margin: 0 0 1.5rem 0;
		line-height: 1.6;
	}

	.lesson-metadata {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		margin-bottom: 1.5rem;
	}

	.metadata-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		color: hsl(var(--muted-foreground));
	}

	.content-type-info {
		background: hsl(var(--muted) / 0.3);
		border-radius: 8px;
		padding: 1rem;
		border-left: 4px solid hsl(var(--primary));
	}

	.content-type-description {
		color: hsl(var(--foreground));
		font-size: 0.95rem;
		line-height: 1.5;
		margin: 0;
		font-style: italic;
	}

	/* Lesson Content */
	.lesson-content {
		padding: 3rem 2rem;
	}

	.lesson-content-inner {
		max-width: 1000px;
		margin: 0 auto;
	}

	.lesson-section {
		margin-bottom: 4rem;
	}

	.section-header {
		margin-bottom: 2rem;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.75rem 0;
		color: hsl(var(--foreground));
	}

	.section-description {
		font-size: 1.1rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
		line-height: 1.6;
	}

	/* Prerequisites */
	.prerequisites-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.prerequisite-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 8px;
		border-left: 4px solid hsl(var(--primary));
	}

	.prerequisite-item :global(svg) {
		color: hsl(var(--primary));
		flex-shrink: 0;
	}

	.prerequisite-text {
		color: hsl(var(--foreground));
		font-weight: 500;
	}

	/* Learning Objectives */
	.objectives-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.objective-item {
		display: flex;
		gap: 1.5rem;
		padding: 1.5rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
	}

	.objective-number {
		width: 40px;
		height: 40px;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		flex-shrink: 0;
	}

	.objective-content {
		flex: 1;
	}

	.objective-text {
		font-size: 1rem;
		color: hsl(var(--foreground));
		line-height: 1.6;
		margin: 0;
	}

	/* Main Content */
	.main-content {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 16px;
		padding: 2rem;
	}

	.content-block {
		margin-bottom: 2.5rem;
	}

	.content-block:last-child {
		margin-bottom: 0;
	}

	.content-heading {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0 0 1.5rem 0;
		color: hsl(var(--foreground));
		padding-bottom: 0.75rem;
		border-bottom: 2px solid hsl(var(--border));
	}

	.content-paragraph {
		font-size: 1rem;
		line-height: 1.8;
		color: hsl(var(--muted-foreground));
		margin: 0 0 1.5rem 0;
		text-align: justify;
	}

	.content-paragraph:last-child {
		margin-bottom: 0;
	}

	.content-list {
		font-size: 1rem;
		line-height: 1.8;
		color: hsl(var(--muted-foreground));
		margin: 1rem 0 1.5rem 1.5rem;
		padding: 0;
	}

	.content-list li {
		margin-bottom: 0.75rem;
	}

	.content-list li:last-child {
		margin-bottom: 0;
	}

	.content-list strong {
		color: hsl(var(--foreground));
		font-weight: 600;
	}

	.content-paragraph code {
		background: hsl(var(--muted));
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.9em;
		color: hsl(var(--foreground));
	}

	/* Generic Component Container */
	.component-container {
		margin: 2rem 0;
		padding: 0;
		border-radius: 12px;
		overflow: hidden;
		background: hsl(var(--background));
	}

	/* Resources */
	.resources-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.resource-card {
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 12px;
		padding: 1.5rem;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.resource-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px hsl(var(--primary) / 0.1);
		border-color: hsl(var(--primary) / 0.3);
	}

	.resource-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.resource-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.resource-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
		color: hsl(var(--foreground));
	}

	.resource-description {
		color: hsl(var(--muted-foreground));
		line-height: 1.5;
		margin: 0;
	}

	/* Navigation */
	.lesson-navigation {
		padding: 3rem 2rem;
		background: hsl(var(--muted) / 0.3);
		border-top: 1px solid hsl(var(--border));
	}

	.nav-actions {
		max-width: 1000px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.nav-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		transition: all 0.2s ease;
		border: none;
		cursor: pointer;
	}

	.nav-button--primary {
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
	}

	.nav-button--primary:hover {
		background: hsl(var(--primary) / 0.9);
		transform: translateY(-1px);
	}

	.nav-button--secondary {
		background: hsl(var(--secondary));
		color: hsl(var(--secondary-foreground));
	}

	.nav-button--secondary:hover {
		background: hsl(var(--secondary) / 0.8);
		transform: translateY(-1px);
	}

	.nav-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		max-width: 300px;
	}

	.nav-progress-text {
		font-size: 0.85rem;
		color: hsl(var(--muted-foreground));
		font-weight: 500;
	}

	.nav-progress-bar {
		width: 100%;
		height: 8px;
		background: hsl(var(--border));
		border-radius: 4px;
		overflow: hidden;
	}

	.nav-progress-fill {
		height: 100%;
		background: hsl(var(--primary));
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.nav-progress-percentage {
		font-size: 0.8rem;
		font-weight: 600;
		color: hsl(var(--primary));
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.lesson-header {
			padding: 2rem 1rem;
		}

		.lesson-hero {
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: 1.5rem;
		}

		.lesson-title {
			font-size: 1.875rem;
		}

		.lesson-description {
			font-size: 1rem;
		}

		.lesson-metadata {
			justify-content: center;
			gap: 1rem;
		}

		.lesson-content {
			padding: 2rem 1rem;
		}

		.section-title {
			font-size: 1.5rem;
		}

		.main-content {
			padding: 1.5rem;
		}

		.content-heading {
			font-size: 1.25rem;
		}

		.content-paragraph {
			text-align: left;
		}

		.prerequisites-grid {
			grid-template-columns: 1fr;
		}

		.resources-grid {
			grid-template-columns: 1fr;
		}

		.nav-actions {
			flex-direction: column;
			gap: 1.5rem;
		}

		.nav-progress {
			order: -1;
			max-width: 100%;
		}
	}

	@media (max-width: 480px) {
		.lesson-hero {
			gap: 1rem;
		}

		.lesson-icon-large {
			font-size: 2.5rem;
		}

		.lesson-title {
			font-size: 1.5rem;
		}

		.lesson-description {
			font-size: 0.95rem;
		}

		.lesson-metadata {
			flex-direction: column;
			align-items: center;
			gap: 0.5rem;
		}

		.main-content {
			padding: 1rem;
		}

		.content-heading {
			font-size: 1.125rem;
		}

		.nav-button {
			padding: 0.75rem 1rem;
			font-size: 0.9rem;
		}
	}
</style>
