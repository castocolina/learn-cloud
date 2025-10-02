<!--
	Button Wrapper Component (Basic Pattern Example)

	Purpose: Demonstrates basic wrapper pattern for shadcn-svelte components
	Pattern Type: BASIC - Simple wrapper with union type constraints

	Key Patterns Demonstrated:
	- Svelte 5 runes syntax ($props, snippets)
	- Union type-first TypeScript (ButtonVariant from types.ts)
	- Clean props interface with type safety
	- Pass-through pattern to underlying shadcn component

	Usage Example:
	<script lang="ts">
		import { Button } from "$lib/components/shared";
	</script>

	<Button variant="default" size="default">
		Click me
	</Button>

	Related Documentation:
	- docs/WRAPPER-PATTERN-GUIDE.md (wrapper patterns)
	- SVELTEKIT-GUIDE.md (Svelte 5 runes, union-first types)
-->
<script lang="ts">
	import { Button as ShadcnButton } from "$lib/components/ui/button";
	import type { ButtonProps } from "$types/ui";

	// Svelte 5 runes syntax: destructure props with defaults
	let {
		variant = "default",
		size = "default",
		class: className,
		disabled = false,
		type = "button",
		href,
		children
	}: ButtonProps = $props();
</script>

<!--
	Pass all props to shadcn Button component
	This wrapper adds type safety without changing behavior
-->
<ShadcnButton {variant} {size} class={className} {disabled} {type} {href}>
	{@render children()}
</ShadcnButton>
