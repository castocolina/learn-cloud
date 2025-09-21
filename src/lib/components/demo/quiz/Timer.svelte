<!--
@component
Timer Component for Interactive Quiz System

Displays countdown timer with visual warnings and states:
- Real-time countdown display in MM:SS format
- Warning state when time is running low
- Critical state for final seconds
- Expired state when time runs out
- Accessible time announcements for screen readers

Supports both timed and untimed quiz modes with responsive design.
-->

<script lang="ts">
	interface Props {
		timeRemaining: number; // Time remaining in seconds
		timeLimit: number; // Total time limit in seconds
		warningThreshold: number; // Warning threshold in seconds
		isExpired: boolean;
		className?: string;
	}

	let { timeRemaining, timeLimit, warningThreshold, isExpired, className = "" }: Props = $props();

	// Timer state
	let lastAnnouncedMinute = $state<number | null>(null);

	// Derived state
	let minutes = $derived(Math.floor(timeRemaining / 60));
	let seconds = $derived(timeRemaining % 60);
	let percentage = $derived(timeLimit > 0 ? (timeRemaining / timeLimit) * 100 : 100);
	let isWarning = $derived(timeRemaining <= warningThreshold && timeRemaining > 0);
	let isCritical = $derived(timeRemaining <= 60 && timeRemaining > 0);
	let formattedTime = $derived(
		`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
	);

	// Timer state classes
	let timerStateClass = $derived(() => {
		if (isExpired) return "demo-timer-expired";
		if (isCritical) return "demo-timer-critical";
		if (isWarning) return "demo-timer-warning";
		return "demo-timer-normal";
	});

	// Progress bar color classes
	let progressBarClass = $derived(() => {
		if (isExpired) return "demo-timer-progress-expired";
		if (isCritical) return "demo-timer-progress-critical";
		if (isWarning) return "demo-timer-progress-warning";
		return "demo-timer-progress-normal";
	});

	// Screen reader announcements for accessibility
	let ariaLabel = $derived(() => {
		if (isExpired) {
			return "Time expired";
		}
		if (isCritical) {
			return `${formattedTime} remaining - Critical time warning`;
		}
		if (isWarning) {
			return `${formattedTime} remaining - Low time warning`;
		}
		return `${formattedTime} remaining`;
	});

	// Announce time warnings for screen readers
	$effect(() => {
		// Announce when entering warning states
		if (timeRemaining === warningThreshold && timeRemaining > 0) {
			announceToScreenReader(`Warning: ${Math.floor(warningThreshold / 60)} minutes remaining`);
		}

		// Announce critical time milestones
		if (timeRemaining === 60) {
			announceToScreenReader("Critical: 1 minute remaining");
		} else if (timeRemaining === 30) {
			announceToScreenReader("Critical: 30 seconds remaining");
		} else if (timeRemaining === 10) {
			announceToScreenReader("Critical: 10 seconds remaining");
		}

		// Announce minute changes during critical time
		if (isCritical && minutes !== lastAnnouncedMinute && minutes > 0) {
			announceToScreenReader(`${minutes} minute${minutes !== 1 ? "s" : ""} remaining`);
			lastAnnouncedMinute = minutes;
		}

		// Announce when time expires
		if (isExpired) {
			announceToScreenReader("Time expired");
		}
	});

	function announceToScreenReader(message: string): void {
		// Create a temporary element for screen reader announcements
		const announcement = document.createElement("div");
		announcement.setAttribute("aria-live", "assertive");
		announcement.setAttribute("aria-atomic", "true");
		announcement.setAttribute("class", "sr-only");
		announcement.textContent = message;

		document.body.appendChild(announcement);

		// Remove after announcement
		setTimeout(() => {
			document.body.removeChild(announcement);
		}, 1000);
	}

	function getTimeStatus(): string {
		if (isExpired) return "Time Expired";
		if (isCritical) return "Critical Time";
		if (isWarning) return "Low Time";
		return "Time Remaining";
	}
</script>

<div
	class="demo-timer {timerStateClass} {className}"
	role="timer"
	aria-label={ariaLabel()}
	aria-live="polite"
	aria-atomic="true"
>
	<!-- Timer Header -->
	<div class="demo-timer-header">
		<div class="demo-timer-icon">
			{#if isExpired}
				⏰
			{:else if isCritical}
				⚠️
			{:else if isWarning}
				⏳
			{:else}
				🕐
			{/if}
		</div>
		<div class="demo-timer-status">
			{getTimeStatus()}
		</div>
	</div>

	<!-- Time Display -->
	<div class="demo-timer-display">
		<span class="demo-timer-time" aria-hidden="true">
			{formattedTime}
		</span>
		{#if !isExpired}
			<span class="demo-timer-label">remaining</span>
		{/if}
	</div>

	<!-- Progress Bar -->
	<div
		class="demo-timer-progress-container"
		role="progressbar"
		aria-valuemin="0"
		aria-valuemax={timeLimit}
		aria-valuenow={timeRemaining}
		aria-label="Time remaining progress"
	>
		<div
			class="demo-timer-progress-bar {progressBarClass}"
			style="width: {Math.max(0, Math.min(100, percentage))}%"
		></div>
	</div>

	<!-- Time Information -->
	{#if !isExpired}
		<div class="demo-timer-info">
			<span class="demo-timer-percentage">
				{Math.round(percentage)}% remaining
			</span>
		</div>
	{/if}

	<!-- Warning Messages -->
	{#if isExpired}
		<div class="demo-timer-message demo-timer-message-expired" role="alert">
			Time has expired. Quiz will be submitted automatically.
		</div>
	{:else if isCritical}
		<div class="demo-timer-message demo-timer-message-critical" role="alert">
			Less than 1 minute remaining!
		</div>
	{:else if isWarning}
		<div class="demo-timer-message demo-timer-message-warning">
			Time is running low. Please complete your answers.
		</div>
	{/if}
</div>
