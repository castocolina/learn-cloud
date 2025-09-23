<!--
@component
Question Renderer for Interactive Quiz System

Renders different question types with proper form controls and accessibility:
- Multiple choice questions (single and multi-select)
- True/false questions with radio buttons
- Drag-and-drop questions with visual feedback
- Code completion questions with input fields

Supports user answer tracking, validation states, and responsive design.
-->

<script lang="ts">
	import type {
		QuizQuestion,
		MultipleChoiceQuestion,
		DragAndDropQuestion,
		CodeCompletionQuestion
	} from "$data/demo/content/quizzes/quiz-examples";
	import { Button } from "$ui/button/index.js";
	import { Checkbox } from "$ui/checkbox/index.js";
	import { RadioGroup, RadioGroupItem } from "$ui/radio-group/index.js";
	import { SvelteMap } from "svelte/reactivity";

	interface Props {
		question: QuizQuestion;
		questionNumber: number;
		userAnswer?: unknown;
		onAnswerChange: (answer: unknown) => void;
		allowMultipleSelection?: boolean;
	}

	let {
		question,
		questionNumber,
		userAnswer,
		onAnswerChange,
		allowMultipleSelection = false
	}: Props = $props();

	// Helper function to format question type for display
	function formatQuestionType(type: string): string {
		switch (type) {
			case "multiple-choice":
				return "Multiple Choice";
			case "true-false":
				return "True/False";
			case "drag-and-drop":
				return "Drag & Drop";
			case "code-completion":
				return "Code Completion";
			default:
				return type;
		}
	}

	// Drag and drop state
	// eslint-disable-next-line svelte/no-unnecessary-state-wrap
	let dropTargets = $state(new SvelteMap<string, string>());

	// Code completion state - stores selected values from dropdowns
	let codeInputs = $state<Record<string, string>>({});

	// Initialize user answers
	$effect(() => {
		if (question.type === "drag_and_drop") {
			if (userAnswer && Array.isArray(userAnswer)) {
				const newTargets = new SvelteMap<string, string>();
				userAnswer.forEach((match: { targetId: string; itemId: string }) => {
					newTargets.set(match.targetId, match.itemId);
				});
				dropTargets = newTargets;
			}
		} else if (question.type === "code_completion") {
			if (userAnswer && typeof userAnswer === "object" && userAnswer !== null) {
				codeInputs = { ...(userAnswer as Record<string, string>) };
			} else {
				const ccq = question as CodeCompletionQuestion;
				const inputs: Record<string, string> = {};
				ccq.blanks.forEach((blank) => {
					inputs[blank.id] = "";
				});
				codeInputs = inputs;
			}
		}
	});

	function handleMultipleChoiceChange(optionIndex: number, checked: boolean): void {
		if (allowMultipleSelection) {
			const currentAnswers = Array.isArray(userAnswer) ? [...userAnswer] : [];
			if (checked) {
				if (!currentAnswers.includes(optionIndex)) {
					currentAnswers.push(optionIndex);
				}
			} else {
				const index = currentAnswers.indexOf(optionIndex);
				if (index > -1) {
					currentAnswers.splice(index, 1);
				}
			}
			onAnswerChange(currentAnswers);
		} else {
			onAnswerChange(optionIndex);
		}
	}

	function handleTrueFalseChange(value: boolean): void {
		onAnswerChange(value);
	}

	function handleDragStart(event: DragEvent, itemId: string): void {
		if (event.dataTransfer) {
			event.dataTransfer.setData("text/plain", itemId);
		}
	}

	function handleDragOver(event: DragEvent): void {
		event.preventDefault();
	}

	function handleDrop(event: DragEvent, targetId: string): void {
		event.preventDefault();
		const itemId = event.dataTransfer?.getData("text/plain");
		if (itemId) {
			// Remove item from previous target
			const newTargets = new SvelteMap(dropTargets);
			for (const [target, item] of newTargets.entries()) {
				if (item === itemId) {
					newTargets.delete(target);
				}
			}
			// Add to new target
			newTargets.set(targetId, itemId);
			dropTargets = newTargets;

			// Convert to answer format
			const matches = Array.from(newTargets.entries()).map(([targetId, itemId]) => ({
				itemId,
				targetId
			}));
			onAnswerChange(matches);
		}
	}

	function handleCodeSelectChange(blankId: string, value: string): void {
		codeInputs[blankId] = value;
		onAnswerChange({ ...codeInputs });
	}

	function removeFromTarget(targetId: string): void {
		const newTargets = new SvelteMap(dropTargets);
		newTargets.delete(targetId);
		dropTargets = newTargets;

		const matches = Array.from(newTargets.entries()).map(([targetId, itemId]) => ({
			itemId,
			targetId
		}));
		onAnswerChange(matches);
	}
</script>

<div class="demo-quiz-question" role="group" aria-labelledby="question-{questionNumber}">
	<!-- Question Header -->
	<div class="demo-quiz-question-header">
		<div class="demo-quiz-question-title-section">
			<h2 id="question-{questionNumber}" class="demo-quiz-question-title">
				Question {questionNumber}
			</h2>
			<div class="demo-quiz-question-meta">
				<span class="demo-quiz-question-type">{formatQuestionType(question.type)}</span>
				<span class="demo-quiz-question-points">{question.points} points</span>
			</div>
		</div>
	</div>

	<!-- Question Content -->
	<div class="demo-quiz-question-content">
		<div class="demo-quiz-question-text-wrapper">
			<p class="demo-quiz-question-text">{question.question}</p>
		</div>

		<!-- Question Type Specific Rendering -->
		{#if question.type === "multiple_choice"}
			{@const mcq = question as MultipleChoiceQuestion}
			<div class="demo-quiz-question-options" role="group" aria-label="Answer options">
				{#if allowMultipleSelection}
					<!-- Multi-select checkboxes -->
					{#each mcq.options as option, index (index)}
						<label class="demo-quiz-option" for="option-{questionNumber}-{index}">
							<Checkbox
								id="option-{questionNumber}-{index}"
								checked={Array.isArray(userAnswer) ? userAnswer.includes(index) : false}
								onCheckedChange={(checked) => handleMultipleChoiceChange(index, checked)}
								class="demo-quiz-option-input"
							/>
							<span class="demo-quiz-option-label">
								{option}
							</span>
						</label>
					{/each}
				{:else}
					<!-- Single-select radio buttons -->
					<RadioGroup
						value={userAnswer?.toString()}
						onValueChange={(value) => handleMultipleChoiceChange(parseInt(value), true)}
						class="demo-quiz-radio-group"
					>
						{#each mcq.options as option, index (index)}
							<label class="demo-quiz-option" for="option-{questionNumber}-{index}">
								<RadioGroupItem
									id="option-{questionNumber}-{index}"
									value={index.toString()}
									class="demo-quiz-option-input"
								/>
								<span class="demo-quiz-option-label">
									{option}
								</span>
							</label>
						{/each}
					</RadioGroup>
				{/if}
			</div>
		{:else if question.type === "true_false"}
			<div class="demo-quiz-question-options" role="group" aria-label="True or False">
				<RadioGroup
					value={userAnswer !== undefined && userAnswer !== null
						? userAnswer.toString()
						: undefined}
					onValueChange={(value) => handleTrueFalseChange(value === "true")}
					class="demo-quiz-radio-group"
				>
					<label class="demo-quiz-option" for="true-{questionNumber}">
						<RadioGroupItem
							id="true-{questionNumber}"
							value="true"
							class="demo-quiz-option-input"
						/>
						<span class="demo-quiz-option-label">True</span>
					</label>
					<label class="demo-quiz-option" for="false-{questionNumber}">
						<RadioGroupItem
							id="false-{questionNumber}"
							value="false"
							class="demo-quiz-option-input"
						/>
						<span class="demo-quiz-option-label">False</span>
					</label>
				</RadioGroup>
			</div>
		{:else if question.type === "drag_and_drop"}
			{@const ddq = question as DragAndDropQuestion}
			<div class="demo-quiz-drag-drop">
				<!-- Draggable items -->
				<div class="demo-quiz-drag-items" role="group" aria-label="Items to drag">
					<h3 class="demo-quiz-drag-title">Items:</h3>
					<div class="demo-quiz-drag-items-list">
						{#each ddq.items as item (item.id)}
							{@const isPlaced = Array.from(dropTargets.values()).includes(item.id)}
							{#if !isPlaced}
								<div
									class="demo-quiz-drag-item"
									draggable="true"
									role="button"
									tabindex="0"
									aria-label="Drag item: {item.content}"
									ondragstart={(e) => handleDragStart(e, item.id)}
								>
									{item.content}
								</div>
							{/if}
						{/each}
					</div>
				</div>

				<!-- Drop targets -->
				<div class="demo-quiz-drop-targets" role="group" aria-label="Drop targets">
					<h3 class="demo-quiz-drag-title">Targets:</h3>
					<div class="demo-quiz-drop-targets-list">
						{#each ddq.targets as target (target.id)}
							{@const placedItem = dropTargets.get(target.id)}
							{@const itemContent = placedItem
								? ddq.items.find((i) => i.id === placedItem)?.content
								: null}
							<div
								class="demo-quiz-drop-target"
								class:demo-quiz-drop-target-filled={placedItem}
								ondragover={handleDragOver}
								ondrop={(e) => handleDrop(e, target.id)}
								role="button"
								tabindex="0"
								aria-label="Drop target: {target.label}"
							>
								<div class="demo-quiz-drop-target-label">{target.label}</div>
								{#if placedItem && itemContent}
									<div class="demo-quiz-dropped-item">
										{itemContent}
										<Button
											variant="ghost"
											size="sm"
											onclick={() => removeFromTarget(target.id)}
											aria-label="Remove item from {target.label}"
											class="demo-quiz-remove-item"
										>
											×
										</Button>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else if question.type === "code_completion"}
			{@const ccq = question as CodeCompletionQuestion}
			<div class="demo-quiz-code-completion">
				<div class="demo-quiz-code-block" role="group" aria-label="Code completion exercise">
					<pre class="demo-quiz-code-pre"><code
							>{#each ccq.codeSnippet.split(/(_{3,})/g) as segment, segmentIndex (segmentIndex)}{#if /^_{3,}$/.test(segment)}{@const blankIndex =
										Math.floor(segmentIndex / 2)}{@const blank =
										ccq.blanks[blankIndex]}{#if blank}<select
											value={codeInputs[blank.id] || ""}
											onchange={(e) => handleCodeSelectChange(blank.id, e.currentTarget.value)}
											aria-label="Fill in blank {blankIndex + 1}"
											class="demo-quiz-code-input">
											<option value="" disabled>Choose...</option>
											{#each blank.options as option, optionIndex (optionIndex)}
												<option value={option}>{option}</option>
											{/each}
										</select>{/if}{:else}{segment}{/if}{/each}</code
						></pre>
				</div>
			</div>
		{/if}
	</div>
</div>
