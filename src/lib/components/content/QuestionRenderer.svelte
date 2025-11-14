<script lang="ts">
	/**
	 * Question Renderer Component (Task 8I - Production)
	 *
	 * Encapsulated component for rendering 6 question types:
	 * - single_choice: Radio button selection
	 * - multiple_choice: Checkbox multi-select
	 * - true_false: Boolean radio selection
	 * - code_completion: Dropdown blanks in code template
	 * - drag_and_drop: HTML5 drag API with categories
	 * - short_answer: Text input with validation
	 *
	 * Architecture:
	 * - Svelte 5 runes syntax
	 * - Type-safe discriminated unions
	 * - ShadCN UI components
	 * - Fully encapsulated - receives question, renders UI
	 *
	 * @component QuestionRenderer
	 */

	import type {
		AnyQuestion,
		SingleChoiceQuestion,
		MultipleChoiceQuestion,
		TrueFalseQuestion,
		CodeCompletionQuestion,
		DragAndDropQuestion,
		ShortAnswerQuestion
	} from "$types";
	import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { Label } from "$lib/components/ui/label";
	import { Input } from "$lib/components/ui/input";
	import { Card, CardContent } from "$lib/components/ui/card";
	import { SvelteMap } from "svelte/reactivity";

	interface Props {
		question: AnyQuestion;
		questionNumber: number;
		userAnswer?: unknown;
		onAnswerChange: (answer: unknown) => void;
		disabled?: boolean;
	}

	let { question, questionNumber, userAnswer, onAnswerChange, disabled = false }: Props = $props();

	// ============================================================================
	// SINGLE CHOICE HANDLERS
	// ============================================================================
	function handleSingleChoiceChange(value: string) {
		const index = parseInt(value, 10);
		onAnswerChange(index);
	}

	// ============================================================================
	// MULTIPLE CHOICE HANDLERS
	// ============================================================================
	function handleMultipleChoiceChange(index: number, checked: boolean | "indeterminate") {
		const currentAnswers = Array.isArray(userAnswer) ? [...userAnswer] : [];

		if (checked === true) {
			if (!currentAnswers.includes(index)) {
				currentAnswers.push(index);
			}
		} else {
			const pos = currentAnswers.indexOf(index);
			if (pos > -1) {
				currentAnswers.splice(pos, 1);
			}
		}

		onAnswerChange(currentAnswers);
	}

	// ============================================================================
	// TRUE/FALSE HANDLERS
	// ============================================================================
	function handleTrueFalseChange(value: string) {
		const boolValue = value === "true";
		onAnswerChange(boolValue);
	}

	// ============================================================================
	// CODE COMPLETION HANDLERS
	// ============================================================================
	function handleCodeBlankChange(blankId: string, value: string) {
		const currentAnswers = (userAnswer as Record<string, string>) || {};
		const updatedAnswers = { ...currentAnswers, [blankId]: value };
		onAnswerChange(updatedAnswers);
	}

	// ============================================================================
	// DRAG AND DROP STATE & HANDLERS
	// ============================================================================
	let draggedItemId = $state<string | null>(null);
	let dropTargets = new SvelteMap<string, string>();

	// Initialize drop targets from user answer
	$effect(() => {
		if (question.type === "drag_and_drop" && userAnswer) {
			const answers = userAnswer as Record<string, string>;
			dropTargets.clear();
			Object.entries(answers).forEach(([itemId, categoryId]) => {
				dropTargets.set(itemId, categoryId);
			});
		}
	});

	function handleDragStart(itemId: string) {
		draggedItemId = itemId;
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	function handleDrop(event: DragEvent, categoryId: string) {
		event.preventDefault();

		if (draggedItemId) {
			dropTargets.set(draggedItemId, categoryId);
			draggedItemId = null;

			// Convert SvelteMap to plain object for parent
			const answersObject: Record<string, string> = {};
			dropTargets.forEach((catId, itemId) => {
				answersObject[itemId] = catId;
			});
			onAnswerChange(answersObject);
		}
	}

	function handleRemoveItem(itemId: string) {
		dropTargets.delete(itemId);

		// Convert to object
		const answersObject: Record<string, string> = {};
		dropTargets.forEach((catId, itId) => {
			answersObject[itId] = catId;
		});
		onAnswerChange(answersObject);
	}

	// ============================================================================
	// SHORT ANSWER HANDLERS
	// ============================================================================
	function handleShortAnswerChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onAnswerChange(target.value);
	}

	// ============================================================================
	// HELPER FUNCTIONS
	// ============================================================================
	function renderCodeWithBlanks(
		template: string,
		blanks: Array<{ id: string; expectedAnswer: string; hint?: string; alternatives?: string[] }>,
		answers: Record<string, string>
	): Array<{ type: "text" | "blank"; content: string; blank?: (typeof blanks)[0] }> {
		const parts: Array<{ type: "text" | "blank"; content: string; blank?: (typeof blanks)[0] }> =
			[];
		let remainingTemplate = template;

		blanks.forEach((blank) => {
			const blankMarker = "_____";
			const index = remainingTemplate.indexOf(blankMarker);

			if (index !== -1) {
				// Add text before blank
				if (index > 0) {
					parts.push({ type: "text", content: remainingTemplate.substring(0, index) });
				}

				// Add blank
				parts.push({ type: "blank", content: answers[blank.id] || "", blank });

				// Update remaining template
				remainingTemplate = remainingTemplate.substring(index + blankMarker.length);
			}
		});

		// Add any remaining text
		if (remainingTemplate.length > 0) {
			parts.push({ type: "text", content: remainingTemplate });
		}

		return parts;
	}
</script>

<div
	class="question-renderer"
	role="region"
	aria-label="Question {questionNumber}"
	data-question-type={question.type}
>
	<!-- Question Text -->
	<div class="question-header">
		<h4 class="question-title">{question.question}</h4>
		{#if question.difficulty}
			<span class="difficulty-badge difficulty-badge--{question.difficulty}">
				{question.difficulty}
			</span>
		{/if}
	</div>

	<!-- Question Type Rendering -->
	<div class="question-content">
		<!-- ============================================================================ -->
		<!-- SINGLE CHOICE -->
		<!-- ============================================================================ -->
		{#if question.type === "single_choice"}
			{@const scq = question as SingleChoiceQuestion}
			<RadioGroup
				value={userAnswer !== undefined && userAnswer !== null ? userAnswer.toString() : undefined}
				onValueChange={handleSingleChoiceChange}
				{disabled}
			>
				{#each scq.options as option, index (index)}
					<div
						class="question-option"
						onclick={() => handleSingleChoiceChange(index.toString())}
						onkeydown={(e) => e.key === "Enter" && handleSingleChoiceChange(index.toString())}
						role="button"
						tabindex="0"
					>
						<RadioGroupItem value={index.toString()} id="sc-{questionNumber}-{index}" />
						<Label for="sc-{questionNumber}-{index}" class="question-option-label">
							{option}
						</Label>
					</div>
				{/each}
			</RadioGroup>

			<!-- ============================================================================ -->
			<!-- MULTIPLE CHOICE -->
			<!-- ============================================================================ -->
		{:else if question.type === "multiple_choice"}
			{@const mcq = question as MultipleChoiceQuestion}
			<div class="question-options-group">
				{#each mcq.options as option, index (index)}
					<div
						class="question-option"
						onclick={() => {
							const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
							handleMultipleChoiceChange(index, !currentAnswers.includes(index));
						}}
						onkeydown={(e) => {
							if (e.key === "Enter") {
								const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
								handleMultipleChoiceChange(index, !currentAnswers.includes(index));
							}
						}}
						role="button"
						tabindex="0"
					>
						<Checkbox
							checked={Array.isArray(userAnswer) ? userAnswer.includes(index) : false}
							onCheckedChange={(checked) => handleMultipleChoiceChange(index, checked)}
							id="mc-{questionNumber}-{index}"
							{disabled}
						/>
						<Label for="mc-{questionNumber}-{index}" class="question-option-label">
							{option}
						</Label>
					</div>
				{/each}
			</div>

			<!-- ============================================================================ -->
			<!-- TRUE/FALSE -->
			<!-- ============================================================================ -->
		{:else if question.type === "true_false"}
			{@const _tfq = question as TrueFalseQuestion}
			<RadioGroup
				value={userAnswer !== undefined && userAnswer !== null ? userAnswer.toString() : undefined}
				onValueChange={handleTrueFalseChange}
				{disabled}
			>
				<div
					class="question-option"
					onclick={() => handleTrueFalseChange("true")}
					onkeydown={(e) => e.key === "Enter" && handleTrueFalseChange("true")}
					role="button"
					tabindex="0"
				>
					<RadioGroupItem value="true" id="tf-{questionNumber}-true" />
					<Label for="tf-{questionNumber}-true" class="question-option-label">True</Label>
				</div>
				<div
					class="question-option"
					onclick={() => handleTrueFalseChange("false")}
					onkeydown={(e) => e.key === "Enter" && handleTrueFalseChange("false")}
					role="button"
					tabindex="0"
				>
					<RadioGroupItem value="false" id="tf-{questionNumber}-false" />
					<Label for="tf-{questionNumber}-false" class="question-option-label">False</Label>
				</div>
			</RadioGroup>

			<!-- ============================================================================ -->
			<!-- CODE COMPLETION -->
			<!-- ============================================================================ -->
		{:else if question.type === "code_completion"}
			{@const ccq = question as CodeCompletionQuestion}
			{@const answers = (userAnswer as Record<string, string>) || {}}
			{@const codeParts = renderCodeWithBlanks(ccq.codeTemplate, ccq.blanks, answers)}

			<div class="code-completion-container">
				<div class="code-block language-{ccq.language}">
					<pre class="code-pre"><code class="code-content"
							>{#each codeParts as part, index (index)}{#if part.type === "text"}{part.content}{:else if part.blank}<select
										class="code-blank-select"
										value={answers[part.blank.id] || ""}
										onchange={(e) =>
											handleCodeBlankChange(part.blank!.id, (e.target as HTMLSelectElement).value)}
										{disabled}
										aria-label={part.blank.hint || "Code blank"}>
									<option value="">_____</option>
									<option value={part.blank.expectedAnswer}>{part.blank.expectedAnswer}</option>
									{#if part.blank.alternatives}
											{#each part.blank.alternatives as alt (alt)}
												<option value={alt}>{alt}</option>
											{/each}
										{/if}
								</select>{/if}{/each}</code
						></pre>
				</div>

				<!-- Hints -->
				{#if ccq.blanks.some((b) => b.hint)}
					<div class="code-hints">
						<p class="code-hints-title">Hints:</p>
						<ul class="code-hints-list">
							{#each ccq.blanks as blank (blank.id)}
								{#if blank.hint}
									<li class="code-hint-item">{blank.hint}</li>
								{/if}
							{/each}
						</ul>
					</div>
				{/if}
			</div>

			<!-- ============================================================================ -->
			<!-- DRAG AND DROP -->
			<!-- ============================================================================ -->
		{:else if question.type === "drag_and_drop"}
			{@const ddq = question as DragAndDropQuestion}

			<div class="drag-drop-container">
				<!-- Available Items -->
				<div class="drag-items-pool">
					<h5 class="drag-section-title">Available Items</h5>
					<div class="drag-items-list">
						{#each ddq.items as item (item.id)}
							{#if !dropTargets.has(item.id)}
								<div
									class="drag-item"
									draggable={!disabled}
									ondragstart={() => handleDragStart(item.id)}
									role="button"
									tabindex={disabled ? -1 : 0}
									aria-label="Drag {item.content}"
								>
									{item.content}
								</div>
							{/if}
						{/each}
					</div>
				</div>

				<!-- Drop Categories -->
				<div class="drag-categories">
					{#each ddq.categories as category (category.id)}
						<Card class="drag-category-card">
							<CardContent class="drag-category-content">
								<div class="drag-category-header">
									<h6 class="drag-category-title">{category.title}</h6>
									{#if category.description}
										<p class="drag-category-description">{category.description}</p>
									{/if}
								</div>

								<div
									class="drag-drop-zone"
									ondragover={handleDragOver}
									ondrop={(e) => handleDrop(e, category.id)}
									role="region"
									aria-label="Drop zone for {category.title}"
								>
									{#each ddq.items as item (item.id)}
										{#if dropTargets.get(item.id) === category.id}
											<div class="drag-item drag-item-placed">
												{item.content}
												{#if !disabled}
													<button
														class="drag-item-remove"
														onclick={() => handleRemoveItem(item.id)}
														aria-label="Remove {item.content}"
													>
														×
													</button>
												{/if}
											</div>
										{/if}
									{/each}

									{#if !ddq.items.some((item) => dropTargets.get(item.id) === category.id)}
										<p class="drag-drop-placeholder">Drop items here</p>
									{/if}
								</div>
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>

			<!-- ============================================================================ -->
			<!-- SHORT ANSWER -->
			<!-- ============================================================================ -->
		{:else if question.type === "short_answer"}
			{@const saq = question as ShortAnswerQuestion}
			<div class="short-answer-container">
				<Input
					type="text"
					value={(userAnswer as string) || ""}
					oninput={handleShortAnswerChange}
					placeholder="Type your answer here..."
					{disabled}
					class="short-answer-input"
					aria-label="Short answer input"
				/>
				{#if saq.caseSensitive}
					<p class="short-answer-note">Note: Answer is case-sensitive</p>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Tags (Optional) -->
	{#if question.tags && question.tags.length > 0}
		<div class="question-tags">
			{#each question.tags as tag (tag)}
				<span class="question-tag">{tag}</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.question-renderer {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.question-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.question-title {
		flex: 1;
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.6;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.question-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* ============================================================================ */
	/* SINGLE & MULTIPLE CHOICE STYLES */
	/* ============================================================================ */
	.question-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
	}

	/* Zebra stripes - alternating row backgrounds for visual differentiation */
	.question-option:nth-child(odd) {
		background: hsl(var(--accent) / 0.3);
	}

	.question-option:nth-child(even) {
		background: hsl(var(--accent) / 0.1);
	}

	/* Hover state - overlays zebra background */
	.question-option:hover {
		background-color: hsl(var(--accent) / 0.5);
	}

	.question-option-label {
		flex: 1;
		font-size: 0.9375rem;
		line-height: 1.6;
		cursor: pointer;
		user-select: none;
	}

	.question-options-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* ============================================================================ */
	/* CODE COMPLETION STYLES */
	/* ============================================================================ */
	.code-completion-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.code-block {
		padding: 1rem;
		background: hsl(var(--muted));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
		overflow-x: auto;
	}

	.code-pre {
		margin: 0;
		font-family: "Fira Code", "Courier New", monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		background: transparent !important; /* Force pre to use parent code-block background */
		color: inherit; /* Inherit text color from parent for theme consistency */
	}

	.code-content {
		display: inline;
		white-space: pre-wrap;
		word-break: break-word;
	}

	/* Enhanced code completion - migrated from demo styles for visual polish */
	.code-blank-select {
		display: inline-block;
		min-width: 120px;
		padding: 4px 8px;
		margin: 0 2px;
		font-family: inherit;
		font-size: inherit;
		font-weight: 600;
		color: hsl(var(--foreground));
		background: hsl(
			var(--muted)
		); /* Matches code block background for consistency in both themes */
		border: 2px solid hsl(var(--primary));
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px hsl(var(--primary) / 0.3);
		vertical-align: baseline;
		line-height: 1.5;
	}

	.code-blank-select:hover:not(:disabled) {
		border-color: hsl(var(--primary) / 0.8);
	}

	.code-blank-select:focus {
		outline: none;
		border-color: hsl(var(--slate-600));
		box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
		/* Use margin instead of transform to avoid stacking context (THEME-008) */
		margin-top: -1px;
		margin-bottom: 1px;
	}

	.code-blank-select:disabled {
		color: hsl(var(--muted-foreground));
		background: hsl(var(--muted) / 0.5);
		cursor: not-allowed;
	}

	.code-blank-select::placeholder {
		color: hsl(var(--muted-foreground));
		font-style: italic;
	}

	.code-hints {
		padding: 1rem;
		background: hsl(var(--muted) / 0.5);
		border-left: 3px solid hsl(var(--primary));
		border-radius: 0.25rem;
	}

	.code-hints-title {
		margin: 0 0 0.5rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}

	.code-hints-list {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
	}

	.code-hint-item {
		margin: 0.25rem 0;
	}

	/* ============================================================================ */
	/* DRAG AND DROP STYLES */
	/* ============================================================================ */
	.drag-drop-container {
		display: flex;
		flex-direction: row;
		gap: 1.5rem;
		align-items: flex-start;
	}

	.drag-items-pool {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		flex: 0 0 280px;
		min-width: 280px;
	}

	.drag-section-title {
		font-size: 1rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.drag-items-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.drag-item {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		background: hsl(var(--primary));
		color: hsl(var(--primary-foreground));
		border-radius: 0.375rem;
		cursor: grab;
		user-select: none;
		transition: all 0.2s ease-in-out;
	}

	/* Drag active state - uses background opacity instead of filter to avoid stacking context */
	.drag-item:active {
		cursor: grabbing;
		background: hsl(var(--accent) / 0.6);
	}

	.drag-item:hover {
		margin-top: -2px;
		margin-bottom: 2px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.drag-item-placed {
		position: relative;
		padding-right: 2rem;
		cursor: default;
		background: hsl(var(--primary) / 0.8);
	}

	.drag-item-placed:hover {
		box-shadow: none;
	}

	.drag-item-remove {
		position: absolute;
		top: 0.25rem;
		right: 0.5rem;
		width: 1.25rem;
		height: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.25rem;
		font-weight: bold;
		color: hsl(var(--primary-foreground));
		background: transparent;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		transition: background-color 0.2s ease-in-out;
	}

	.drag-item-remove:hover {
		background: hsl(var(--destructive) / 0.3);
	}

	.drag-categories {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		flex: 1;
	}

	.drag-category-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
	}

	.drag-category-header {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.drag-category-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.drag-category-description {
		font-size: 0.8125rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	.drag-drop-zone {
		min-height: 4rem;
		padding: 0.75rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		background: hsl(var(--muted) / 0.3);
		border: 2px dashed hsl(var(--border));
		border-radius: 0.375rem;
		transition: all 0.2s ease-in-out;
	}

	.drag-drop-zone:hover {
		border-color: hsl(var(--primary));
		background: hsl(var(--muted) / 0.5);
	}

	.drag-drop-placeholder {
		width: 100%;
		text-align: center;
		font-size: 0.875rem;
		color: hsl(var(--muted-foreground));
		margin: auto 0;
	}

	/* ============================================================================ */
	/* SHORT ANSWER STYLES */
	/* ============================================================================ */
	.short-answer-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.short-answer-input {
		font-size: 1rem;
	}

	.short-answer-note {
		font-size: 0.8125rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	/* ============================================================================ */
	/* QUESTION TAGS */
	/* ============================================================================ */
	.question-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid hsl(var(--border));
	}

	.question-tag {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		line-height: 1;
		border: 1px solid hsl(var(--border));
		border-radius: 0.375rem;
		background: transparent;
		color: hsl(var(--foreground));
		transition: all 0.2s ease-in-out;
	}

	/* ============================================================================ */
	/* MOBILE RESPONSIVE */
	/* ============================================================================ */
	@media (max-width: 390px) {
		.question-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.question-title {
			font-size: 1rem;
		}

		.question-option {
			padding: 0.5rem;
		}

		.code-block {
			padding: 0.75rem;
		}

		.code-pre {
			font-size: 0.8125rem;
		}

		.drag-drop-container {
			flex-direction: column;
		}

		.drag-items-pool {
			flex: 1;
			min-width: 100%;
		}

		.drag-categories {
			grid-template-columns: 1fr;
		}

		.drag-items-list {
			flex-direction: column;
		}

		.drag-item {
			width: 100%;
			text-align: center;
		}
	}
</style>
