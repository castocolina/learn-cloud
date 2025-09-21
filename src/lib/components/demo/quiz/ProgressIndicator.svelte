<!--
@component
Progress Indicator for Interactive Quiz System

Displays quiz progress with visual indicators:
- Current question number and total questions
- Progress percentage with animated progress bar
- Questions answered count with visual feedback
- Responsive design for mobile and desktop
- Accessibility support with proper ARIA attributes

Provides clear visual feedback on quiz completion status.
-->

<script lang="ts">
	interface Props {
		currentQuestion: number;
		totalQuestions: number;
		percentage: number;
		questionsAnswered: number;
		className?: string;
	}

	let {
		currentQuestion,
		totalQuestions,
		percentage,
		questionsAnswered,
		className = ""
	}: Props = $props();

	// Derived state for progress calculations
	let progressWidth = $derived(Math.max(0, Math.min(100, percentage)));
	let isComplete = $derived(questionsAnswered === totalQuestions);
	let progressLabel = $derived(`${questionsAnswered} of ${totalQuestions} questions answered`);
	let completionStatus = $derived(() => {
		if (isComplete) return "Complete";
		if (questionsAnswered > 0) return "In Progress";
		return "Not Started";
	});

	// Progress bar color based on completion
	let progressBarClass = $derived(() => {
		if (isComplete) return "demo-progress-complete";
		if (percentage > 75) return "demo-progress-high";
		if (percentage > 50) return "demo-progress-medium";
		if (percentage > 25) return "demo-progress-low";
		return "demo-progress-minimal";
	});

	// Status indicator color
	let statusClass = $derived(() => {
		if (isComplete) return "demo-progress-status-complete";
		if (questionsAnswered > 0) return "demo-progress-status-active";
		return "demo-progress-status-pending";
	});
</script>

<div
	class="demo-progress-indicator {className}"
	role="region"
	aria-label="Quiz progress information"
>
	<!-- Progress Header -->
	<div class="demo-progress-header">
		<div class="demo-progress-title">
			<h3 class="demo-progress-heading">Quiz Progress</h3>
			<span class="demo-progress-status {statusClass}">
				{completionStatus()}
			</span>
		</div>
		<div class="demo-progress-stats">
			<span class="demo-progress-current">
				Question {currentQuestion} of {totalQuestions}
			</span>
		</div>
	</div>

	<!-- Progress Bar Container -->
	<div class="demo-progress-container">
		<div
			class="demo-progress-track"
			role="progressbar"
			aria-valuenow={percentage}
			aria-valuemin="0"
			aria-valuemax="100"
			aria-label={progressLabel}
		>
			<div class="demo-progress-bar {progressBarClass}" style="width: {progressWidth}%">
				<div class="demo-progress-bar-shimmer"></div>
			</div>
		</div>
		<div class="demo-progress-percentage">
			{Math.round(progressWidth)}%
		</div>
	</div>

	<!-- Progress Details -->
	<div class="demo-progress-details">
		<div class="demo-progress-answered">
			<div class="demo-progress-answered-icon">
				{#if isComplete}
					✅
				{:else if questionsAnswered > 0}
					📝
				{:else}
					❓
				{/if}
			</div>
			<span class="demo-progress-answered-text">
				{questionsAnswered} answered
			</span>
		</div>

		<div class="demo-progress-remaining">
			<div class="demo-progress-remaining-icon">
				{#if isComplete}
					🎉
				{:else}
					⏳
				{/if}
			</div>
			<span class="demo-progress-remaining-text">
				{#if isComplete}
					All done!
				{:else}
					{totalQuestions - questionsAnswered} remaining
				{/if}
			</span>
		</div>
	</div>

	<!-- Question Navigation Dots (Mobile-friendly) -->
	<div class="demo-progress-dots" role="group" aria-label="Question navigation indicators">
		{#each Array(totalQuestions) as _item, index (index)}
			{@const questionNum = index + 1}
			{@const isAnswered = questionsAnswered > index}
			{@const isCurrent = currentQuestion === questionNum}
			<div
				class="demo-progress-dot"
				class:demo-progress-dot-answered={isAnswered}
				class:demo-progress-dot-current={isCurrent}
				class:demo-progress-dot-pending={!isAnswered && !isCurrent}
				aria-label="Question {questionNum} {isAnswered
					? 'answered'
					: isCurrent
						? 'current'
						: 'pending'}"
				role="presentation"
			>
				{#if isAnswered}
					<span class="demo-progress-dot-check">✓</span>
				{:else if isCurrent}
					<span class="demo-progress-dot-number">{questionNum}</span>
				{:else}
					<span class="demo-progress-dot-empty"></span>
				{/if}
			</div>
		{/each}
	</div>
</div>
