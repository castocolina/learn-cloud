<script lang="ts">
	import Mermaid from "$lib/components/content/shared/Mermaid.svelte";
	import { DiagramType } from "$data/types";
	import type { DiagramBlock } from "$data/types";

	// Test diagram with common patterns that might cause issues
	const testDiagrams: DiagramBlock[] = [
		{
			type: "diagram",
			diagramType: DiagramType.MERMAID,
			definition: `flowchart TD
    Start(["Start Process"])
    Validate{"Validate Input"}
    Process["Process Request"]
    Store["Store Results"]
    Success(["Success Response"])
    Error(["Error Response"])

    Start --> Validate
    Validate -->|"Valid"| Process
    Validate -->|"Invalid"| Error
    Process --> Store
    Store --> Success`,
			title: "Test Process Flow",
			caption: "A test diagram to verify Mermaid rendering"
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
			title: "System Architecture",
			caption: "Architecture diagram with subgraphs"
		},
		{
			type: "diagram",
			diagramType: DiagramType.MERMAID,
			definition: `graph TD
    A["Observability"] --> B("Logs")
    A --> C("Metrics")
    A --> D("Traces")
    
    B --> E["Log Aggregation"]
    C --> F["Metrics Collection"]
    D --> G["Trace Analysis"]`,
			title: "Observability Pillars",
			caption: "The three pillars of observability"
		}
	];
</script>

<div class="container mx-auto max-w-4xl p-4">
	<h1 class="mb-6 text-3xl font-bold">Mermaid Debug Test Page</h1>

	<div class="mb-6 rounded border border-blue-200 bg-blue-50 p-4">
		<p class="font-semibold">🔧 Debug Instructions:</p>
		<p>
			Add <code class="rounded bg-gray-100 px-1">?debug-mermaid=true</code> to the URL to enable verbose
			logging.
		</p>
		<p>
			Example: <code class="rounded bg-gray-100 px-1"
				>http://localhost:5176/test-mermaid?debug-mermaid=true</code
			>
		</p>
	</div>

	<div class="space-y-8">
		{#each testDiagrams as diagram, i}
			<div class="rounded-lg border p-4">
				<h2 class="mb-4 text-xl font-semibold">Test Diagram {i + 1}</h2>
				<Mermaid {diagram} />
			</div>
		{/each}
	</div>
</div>
