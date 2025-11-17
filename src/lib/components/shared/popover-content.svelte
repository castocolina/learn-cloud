<!--
	Popover Wrapper Component (TASK 8J - Refactored 2025-11-17)

	Purpose: Wrapper extending shadcn-svelte Popover with arrow rendering and SETTINGS integration
	Pattern Type: COMPLEX - Extension wrapper following shadcn Tooltip pattern

	KEY FEATURES:
	=============
	- Arrow rendering (automatic, following Tooltip pattern)
	- SETTINGS integration for all defaults
	- Z-index hierarchy compliance (var(--z-popover) via CSS)
	- Collision detection with configurable padding
	- Mobile-first responsive behavior
	- Touch-friendly (respects SETTINGS.ui.popover.minTouchTarget)

	ARCHITECTURE (FIXED 2025-11-17):
	=================================
	This component follows the EXACT pattern of shadcn-svelte Tooltip:
	1. Imports bits-ui DIRECTLY (not shadcn wrapper)
	2. Uses shadcn popover-content.svelte classes
	3. Adds arrow rendering (shadcn Popover lacks this)
	4. Integrates SETTINGS for defaults

	Pattern hierarchy:
	bits-ui (primitives) → shadcn ui/popover (styles) → shared/Popover.svelte (arrow + SETTINGS)

	USAGE:
	======
	<script>
		import * as Popover from "$lib/components/shared/Popover.svelte";
	</script>

	<Popover.Root>
		<Popover.Trigger><Button>Click</Button></Popover.Trigger>
		<Popover.Content side="bottom" showArrow={true}>
			<p>Content with automatic arrow</p>
		</Popover.Content>
	</Popover.Root>

	ARROW IMPLEMENTATION (copied from shadcn Tooltip):
	====================================================
	Arrow uses ONLY background color (NO borders) - same pattern as Tooltip.

	WHY NO BORDERS?
	Borders on a rotated 45° arrow create visible "fisura" (crack/gap) effect:
	- Arrow = rotated square with half hidden behind content
	- Borders create outline visible on ALL sides (including hidden parts)
	- This creates visual gap between arrow and content = "fisura"
	- Solution: Use only bg-popover (seamless with content background)

	WHY drop-shadow ON ARROW?
	Arrow needs independent shadow for visibility against light backgrounds:
	- Content has shadow-md, but arrow extends OUTSIDE content box
	- Without shadow, white arrow blends with white/light backgrounds
	- drop-shadow (not box-shadow) respects arrow's visible shape
	- Tooltip doesn't need this: uses dark bg-primary (high contrast)

	TECHNICAL DETAILS:
	- Uses Tailwind data variants: data-[side=top]:translate-x-1/2 ...
	- Positioning via transforms only (no border directional logic)
	- Arrow points by POSITION, not by border configuration
	- Pattern copied from TooltipContent with added drop-shadow for visibility

	POSITIONING ASYMMETRY (from Tooltip pattern):
	- top/bottom: Need both X and Y transforms (horizontal centering + vertical positioning)
	- right: Needs X transform to extend arrow beyond edge + Y centering (translate-y-1/2)
	- left: ONLY Y transform needed (bits-ui handles X positioning automatically)
	- Pattern source: TooltipContent.svelte (shadcn-svelte)

	SCROLL JUMP PREVENTION:
	========================
	Default onCloseAutoFocus handler prevents page scroll jump when closing popover.
	When popover closes, bits-ui returns focus to trigger (ARIA compliance).
	Without preventDefault(), browser auto-scrolls trigger into view causing jump.

	DEFAULT BEHAVIOR: e.preventDefault() prevents scroll (can be overridden via prop)

	Related Documentation:
	- docs/WRAPPER-PATTERN-GUIDE.md (wrapper patterns)
	- TASK-8J-popover.md (task specification)
	- shadcn Tooltip component (arrow reference implementation)
-->
<script lang="ts">
	import { Popover as PopoverPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { SETTINGS } from "$config/settings.js";
	import type { PopoverContentProps } from "$types";

	let {
		ref = $bindable(null),
		class: className,
		side = SETTINGS.ui.popover.defaultSide,
		sideOffset = SETTINGS.ui.popover.defaultSideOffset,
		align = SETTINGS.ui.popover.defaultAlign,
		alignOffset = SETTINGS.ui.popover.defaultAlignOffset,
		collisionPadding = SETTINGS.ui.popover.collision.boundaryPadding,
		avoidCollisions = SETTINGS.ui.popover.collision.enabled,
		collisionBoundary,
		showArrow = SETTINGS.ui.popover.showArrow,
		arrowClasses,
		forceMount = false,
		portalProps,
		onCloseAutoFocus = (e: Event) => e.preventDefault(),
		children,
		...restProps
	}: PopoverContentProps & {
		portalProps?: PopoverPrimitive.PortalProps;
		showArrow?: boolean;
		arrowClasses?: string;
	} = $props();
</script>

<PopoverPrimitive.Portal {...portalProps}>
	<PopoverPrimitive.Content
		bind:ref
		data-slot="popover-content"
		{side}
		{sideOffset}
		{align}
		{alignOffset}
		{collisionPadding}
		{avoidCollisions}
		{collisionBoundary}
		{forceMount}
		{onCloseAutoFocus}
		class={cn(
			"z-50 w-72 origin-(--bits-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
			className
		)}
		{...restProps}
	>
		{@render children?.()}

		{#if showArrow}
			<PopoverPrimitive.Arrow>
				{#snippet child({ props })}
					<div
						class={cn(
							"z-50 size-2.5 rotate-45 rounded-[2px] bg-popover drop-shadow-md",
							"data-[side=top]:translate-x-1/2 data-[side=top]:translate-y-[calc(-50%_+_2px)]",
							"data-[side=bottom]:-translate-x-1/2 data-[side=bottom]:-translate-y-[calc(-50%_+_1px)]",
							"data-[side=right]:translate-x-[calc(50%_+_2px)] data-[side=right]:translate-y-1/2",
							"data-[side=left]:-translate-y-[calc(50%_-_3px)]",
							arrowClasses
						)}
						{...props}
					></div>
				{/snippet}
			</PopoverPrimitive.Arrow>
		{/if}
	</PopoverPrimitive.Content>
</PopoverPrimitive.Portal>
