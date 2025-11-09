/**
 * Application Configuration Settings
 *
 * Centralized, type-safe configuration for the entire application.
 * This file exports a single SETTINGS object that contains all
 * global application parameters.
 *
 * Type definitions are now centralized in the unified type system
 * at src/lib/types/config.ts and imported via the $types alias.
 */

import type { AppSettings } from "$types";

// Export a single, constant object with all settings.
export const SETTINGS: AppSettings = {
	ui: {
		/**
		 * Theme System Configuration
		 *
		 * Centralized theme configuration including color palettes, modes, and validation.
		 * Provides robust dark mode support with localStorage persistence and system preference detection.
		 *
		 * Color Palettes (shadcn-svelte compatible):
		 * - "slate": Blue-gray tones (current/default) - professional, technical feel
		 * - "gray": Pure gray tones - neutral, balanced
		 * - "zinc": Cool gray tones - modern, clean
		 * - "neutral": Warm gray tones - softer, warmer
		 * - "stone": Warm brown-gray tones - organic, earthy
		 *
		 * Reference: https://ui.shadcn.com/themes
		 */
		theme: {
			/**
			 * Default theme mode on first load
			 * @default "light" - Force light theme (dark theme under development)
			 */
			defaultMode: "light" as const,

			/**
			 * localStorage key for persisting user's theme preference
			 * @default "theme"
			 */
			storageKey: "theme",

			/**
			 * Selected color palette for the application
			 * Changes require updating CSS variables in src/app.css
			 * @default "slate"
			 */
			colorPalette: "slate" as const,

			/**
			 * Border radius in rem units
			 * @default 0.625 (10px at 16px base font size)
			 */
			radius: 0.625,

			/**
			 * Theme validation configuration
			 */
			validation: {
				/**
				 * Enable theme validation during development/build
				 * @default true
				 */
				enabled: true,

				/**
				 * Strict mode: Prevent anti-patterns
				 * - Hardcoded z-index values (must use var(--z-*))
				 * - @apply in component <style> blocks (Tailwind v4 incompatible)
				 * @default true
				 */
				strictMode: true,

				/**
				 * Check WCAG AA color contrast compliance
				 * - Normal text: 4.5:1 minimum
				 * - Large text: 3:1 minimum
				 * @default true
				 */
				checkColorContrast: true,

				/**
				 * Verify stacking context violations
				 * - Detect transform/opacity on navigation elements
				 * - Prevent z-index conflicts
				 * @default true
				 */
				checkStackingContext: true,

				/**
				 * Check for inline styles (style="...") in component templates
				 * - HIGH SEVERITY: Violates modular CSS architecture
				 * - Use Tailwind utility classes or app.css instead
				 * @default true
				 */
				checkInlineStyles: true,

				/**
				 * Check for <style> blocks in components
				 * - WARNING: Suggests modular CSS architecture violation
				 * - Becomes ERROR in strict mode
				 * - Exceptions allowed via severityRules
				 * @default true
				 */
				checkComponentStyleBlocks: true,

				/**
				 * Path-based severity rules for downgrading errors in legacy/demo code
				 * to informational level while maintaining strict validation for production.
				 *
				 * Patterns use String.includes() matching for flexibility.
				 */
				severityRules: [
					{
						pattern: "src/lib/components/search/SearchModal.svelte",
						severity: "info" as const,
						description: "Legacy SearchModal component (to be refactored)"
					},
					{
						pattern: "src/lib/components/ui/",
						severity: "info" as const,
						description: "ShadCN UI components (external library code)"
					},
					{
						pattern: "src/book/",
						severity: "info" as const,
						description: "Legacy HTML content (reference only, not production code)"
					},
					{
						pattern: "demo",
						severity: "info" as const,
						description: "Demo components (not production code)"
					},
					{
						pattern: "src/routes/demo/",
						severity: "warning" as const,
						description: "Demo route pages (may be adopted but require review)"
					}
				]
			}
		},

		/**
		 * Layout Configuration - Flexbox + Grid Hybrid Architecture
		 *
		 * Responsive layout system using CSS variables with rem units for scalability.
		 * Compatible with shadcn/ui Sidebar components and patterns.
		 */
		layout: {
			/**
			 * Sidebar Width Configuration (responsive rem units)
			 *
			 * Common proportions at 1280px viewport:
			 * - "16rem" (256px): 20/80 split ✅ RECOMMENDED (shadcn default)
			 * - "20rem" (320px): 25/75 split (extensive navigation)
			 * - "12rem" (192px): 15/85 split (content-focused)
			 *
			 * Acceptable range: "12rem" to "24rem" (192px to 384px)
			 */
			sidebarWidth: "16rem", // Desktop expanded: 256px (~20% at 1280px)
			sidebarWidthMobile: "18rem", // Mobile expanded: 288px
			sidebarWidthIcon: "4rem", // Collapsed state: 64px (increased for full emoji visibility)

			/**
			 * Header and Footer Heights
			 *
			 * Standard heights for sticky header and floating navigation.
			 * Acceptable range: "3rem" to "5rem" (48px to 80px)
			 */
			headerHeight: "4rem", // 64px - standard header height
			footerHeight: "4rem", // 64px - floating navigation height

			/**
			 * Responsive Breakpoints (Tailwind CSS defaults)
			 *
			 * These match Tailwind's responsive design system:
			 * - mobile (sm): 640px - small devices
			 * - tablet (md): 768px - medium devices
			 * - desktop (lg): 1024px - large screens
			 * - wide (xl): 1280px - extra large screens
			 */
			breakpoints: {
				mobile: "640px", // sm breakpoint
				tablet: "768px", // md breakpoint
				desktop: "1024px", // lg breakpoint
				wide: "1280px" // xl breakpoint
			}
		},
		/**
		 * Mermaid Diagram Configuration (Task 8G)
		 *
		 * Centralized settings for diagram rendering with GitHub-style zoom controls.
		 * Supports 10+ diagram types (flowchart, sequence, class, state, etc.)
		 * with integrated validation, modal expansion, and mobile-optimized interactions.
		 */
		mermaid: {
			/**
			 * Enable debug mode for detailed error logging and diagram source display
			 * @default true (development mode - enables troubleshooting)
			 */
			debug: true,

			/**
			 * Default modal viewport percentage for Dialog expansion
			 * @default 90 (90% of viewport width/height)
			 */
			modalPagePercent: 90,

			/**
			 * GitHub-style zoom controls configuration
			 */
			zoom: {
				/**
				 * Default zoom level percentage
				 * @default 100 (100% = original size)
				 */
				defaultLevel: 100,

				/**
				 * Minimum zoom level percentage
				 * @default 50 (50% = half size)
				 */
				minLevel: 50,

				/**
				 * Maximum zoom level percentage
				 * @default 200 (200% = double size)
				 */
				maxLevel: 200,

				/**
				 * Zoom step for in/out buttons
				 * @default 25 (25% increments)
				 */
				step: 25,

				/**
				 * Enable mouse wheel zoom on desktop
				 * @default true
				 */
				enableMouseWheel: true,

				/**
				 * Enable pinch-to-zoom gestures on mobile
				 * @default true
				 */
				enablePinchGestures: true
			},

			/**
			 * Pan Controls Configuration (GitHub-style navigation)
			 * Replaces scroll-based navigation with directional buttons
			 * Works in both inline mode and Dialog expansion
			 */
			pan: {
				/**
				 * Pan step for directional button clicks (in pixels)
				 * @default 50 (50px movement per click)
				 */
				step: 50,

				/**
				 * Maximum pan offset in pixels (prevents excessive panning)
				 * @default 500 (can pan up to 500px in any direction)
				 */
				maxOffset: 500
			},

			/**
			 * State Persistence Configuration (localStorage)
			 * Persists zoom/pan state across page navigation for improved UX
			 *
			 * STORAGE KEY STRATEGY (Hybrid Approach):
			 * 1. Prop `storageKey` (explicit user control) - highest priority
			 * 2. Prop `id` (component-level identity) - secondary
			 * 3. Auto-hash (location + content) - automatic fallback
			 *
			 * SCOPE OPTIONS:
			 * - 'location': State tied to current page/hash (recommended for multi-page diagrams)
			 * - 'global': State shared across all pages for same diagram content
			 *
			 * CLEANUP: Expired entries (older than maxAgeDays) removed automatically on app mount
			 */
			statePersistence: {
				/**
				 * Enable zoom/pan state persistence in localStorage
				 * @default true
				 */
				enabled: true,

				/**
				 * Maximum age in days before state expires and is purged
				 * Prevents localStorage bloat from stale diagram states
				 * @default 14 (2 weeks)
				 */
				maxAgeDays: 14,

				/**
				 * Default persistence scope
				 * - 'location': State per page/hash (independent state for same diagram on different pages)
				 * - 'global': State shared globally (same zoom for diagram across all pages)
				 * @default 'location'
				 */
				scope: "location" as const
			},

			/**
			 * Copy/Download Feedback Configuration
			 * Follows same pattern as codeBlock.copyFeedback for consistency
			 */
			copyFeedback: {
				/**
				 * Success state duration in milliseconds
				 * How long the Check icon displays after successful copy/download
				 * @default 2000 (2 seconds)
				 */
				duration: 2000
			},

			/**
			 * Responsive button visibility configuration
			 * Discriminates button visibility between mobile and desktop viewports
			 *
			 * ═══════════════════════════════════════════════════════════════════════
			 * ARCHITECTURE: Precedence Hierarchy (OS Analogy)
			 * ═══════════════════════════════════════════════════════════════════════
			 *
			 * These SETTINGS function as GLOBAL ENVIRONMENT VARIABLES that establish
			 * baseline behavior across the application. Think of them like OS env vars
			 * that programs consult when users don't provide explicit arguments.
			 *
			 * PRECEDENCE HIERARCHY (highest to lowest):
			 * 1. Component props (explicit)    = Program arguments (--flag=value)
			 * 2. SETTINGS (global config)      = Environment variables (ENV_VAR=value)
			 * 3. Component internals           = Hardcoded defaults
			 *
			 * ═══════════════════════════════════════════════════════════════════════
			 * USAGE & BEHAVIOR
			 * ═══════════════════════════════════════════════════════════════════════
			 *
			 * These are INTERNAL GLOBAL DEFAULTS that apply when component consumers
			 * DO NOT pass explicit props. Parent components should rarely need to pass
			 * button visibility props - trust these defaults.
			 *
			 * EXAMPLES:
			 * • Consumer passes showExpandButton={undefined} or omits prop
			 *   → SETTINGS default applies (viewport-specific: mobile/desktop)
			 *
			 * • Consumer passes showExpandButton={true}
			 *   → Prop takes precedence, BUT component still applies viewport discrimination
			 *   → Logic: true !== false && buttonDefaults.showExpandButton
			 *   → Result: Shows only if viewport allows it (respects mobile/desktop config)
			 *
			 * • Consumer passes showExpandButton={false}
			 *   → Feature explicitly disabled everywhere (all viewports)
			 *
			 * MOBILE vs DESKTOP DISCRIMINATION:
			 * Component ALWAYS consults these SETTINGS to determine viewport-appropriate
			 * behavior. This ensures consistent responsive UX across the application.
			 *
			 * ═══════════════════════════════════════════════════════════════════════
			 * STRATEGY
			 * ═══════════════════════════════════════════════════════════════════════
			 * Mobile  (< 768px): Copy actions + Expand (no downloads, no zoom/pan)
			 * Desktop (≥ 768px): All buttons enabled
			 */
			buttons: {
				/**
				 * Mobile configuration (< 768px)
				 * Simplified interface optimized for small screens and touch interactions
				 * Strategy: Keep only Copy actions + Expand, disable downloads/zoom
				 */
				mobile: {
					/** Copy SVG source to clipboard - ✅ ACTIVE (useful for code editors) */
					showCopySvgButton: true,
					/** Copy PNG image to clipboard - ✅ ACTIVE (paste in docs/presentations) */
					showCopyPngButton: true,
					/** Copy diagram code to clipboard - ✅ ACTIVE (share diagram definition) */
					showCopyCodeButton: true,
					/** Download SVG file - ❌ DISABLED (limited mobile storage/workflow) */
					showDownloadButton: false,
					/** Download PNG file - ❌ DISABLED (mobile browsers have download limitations) */
					showDownloadPngButton: false,
					/** Download JPG file - ❌ DISABLED (avoid cluttering mobile interface) */
					showDownloadJpgButton: false,
					/** Expand to Dialog - ❌ DISABLED (mobile already uses full width) */
					showExpandButton: true, // TESTING: compare vertical layout with 4 buttons
					/** Zoom/Pan controls - ❌ DISABLED (pinch-to-zoom preferred on mobile) */
					showZoomControls: false
				},
				/**
				 * Desktop configuration (≥ 768px)
				 * Full-featured interface with all export and navigation options
				 * Strategy: Enable everything for maximum flexibility
				 */
				desktop: {
					/** Copy SVG source to clipboard - ✅ ACTIVE */
					showCopySvgButton: true,
					/** Copy PNG image to clipboard - ✅ ACTIVE */
					showCopyPngButton: true,
					/** Copy diagram code to clipboard - ✅ ACTIVE */
					showCopyCodeButton: true,
					/** Download SVG file - ✅ ACTIVE */
					showDownloadButton: true,
					/** Download PNG file - ✅ ACTIVE */
					showDownloadPngButton: true,
					/** Download JPG file - ✅ ACTIVE */
					showDownloadJpgButton: true,
					/** Expand to Dialog - ✅ ACTIVE */
					showExpandButton: true,
					/** Zoom/Pan controls - ✅ ACTIVE */
					showZoomControls: true
				}
			},

			/**
			 * Action Buttons Configuration
			 * Controls action buttons appearance in both inline IconGrid and Dialog expansion
			 * Follows exact same pattern as codeBlock.actionButtons
			 */
			actionButtons: {
				/**
				 * Default orientation for action buttons
				 * Applies to both inline buttons and Dialog expanded view
				 * @default 'vertical' - auto-switches if horizontal + 4+ buttons
				 */
				defaultOrientation: "vertical" as const,

				/**
				 * Gap between buttons (applies to inline and Dialog)
				 * @default '0.5rem'
				 */
				gap: "0.5rem",

				/**
				 * Icon size (applies to inline and Dialog)
				 * @default '20px'
				 */
				iconSize: "20px",

				/**
				 * Inline buttons positioning (compact view)
				 * GitHub-style two-group layout:
				 * - position: Top-right (Download, Expand)
				 * - bottomPosition: Bottom-right (Zoom, Pan controls)
				 */
				inline: {
					position: {
						/** Distance from top */
						top: "0.5rem",
						/** Distance from right */
						right: "0.5rem"
					},
					bottomPosition: {
						/** Distance from bottom */
						bottom: "0.5rem",
						/** Distance from right */
						right: "0.5rem"
					}
				},

				/**
				 * Dialog expansion configuration
				 */
				dialog: {
					/**
					 * Alignment system for Dialog action buttons
					 * @default 'content-aligned' - sticky float over content
					 */
					alignment: "content-aligned" as const
				}
			}
		},
		flipCard: {
			modalPagePercent: 90 // Default modal viewport percentage for flip cards
		},
		breadcrumb: {
			showIcon: true // Show emoji icon in breadcrumbs by default
		},
		sidebar: {
			collapsible: true, // Enable sidebar collapse functionality
			defaultCollapsed: false, // Sidebar expanded by default
			/**
			 * Collapse Mode for shadcn/ui Sidebar integration
			 *
			 * - "icon": Collapses to icon-only view (uses sidebarWidthIcon)
			 * - "offcanvas": Slides off-screen completely (mobile-friendly)
			 * - "none": Non-collapsible sidebar (always visible)
			 */
			collapsibleMode: "icon" as "icon" | "offcanvas" | "none",
			/**
			 * Sidebar Header Configuration
			 *
			 * Displays navigation title and chapter count in sidebar header
			 */
			header: {
				icon: "BookOpen", // Lucide icon name (e.g., "BookOpen") or emoji (e.g., "📚")
				title: "Navigation", // Header title text
				description: "{units} units • {chapters} chapters" // Template with placeholders
			},
			/**
			 * Sidebar Footer Configuration
			 *
			 * Displays book title and version in sidebar footer
			 */
			footer: {
				version: "1.0.0" // Version number (displayed as "v{version}")
			}
		},
		stores: {
			spaNavigation: {
				cacheSize: 50, // Maximum number of loaded content items to cache
				loadingTimeout: 5000, // Timeout in ms for content loading operations
				enableAnalytics: true // Track navigation events for analytics
			}
		},
		/**
		 * IconGrid Configuration (Task 8D)
		 *
		 * Centralized settings for the IconGrid shared component.
		 * IconGrid provides standardized icon presentation with consistent styling
		 * (hover effects, borders, cursor, focus states) used across Dialog, CodeBlock,
		 * Diagram, and other components.
		 */
		iconGrid: {
			/**
			 * Default icon size (CSS unit or pixels)
			 * @default "20px"
			 */
			defaultIconSize: "20px",

			/**
			 * Default gap between icons
			 * @default "0.5rem"
			 */
			defaultGap: "0.5rem",

			/**
			 * Enable tooltips by default
			 * When true, uses shadcn-svelte Tooltip component
			 * When false, uses native title attribute
			 * @default true
			 */
			showTooltips: true,

			/**
			 * Minimum touch target size (accessibility requirement)
			 * Ensures icons are touch-friendly on mobile devices
			 * @default "44px" - WCAG 2.1 AA minimum
			 */
			minTouchTarget: "44px",

			/**
			 * Transition duration for hover/active animations
			 * @default "0.2s"
			 */
			transitionDuration: "0.2s",

			/**
			 * Success state display duration (milliseconds)
			 * How long success state (e.g., "Copied!") persists before reset
			 * @default 2000 (2 seconds)
			 */
			successStateDuration: 2000,

			/**
			 * Badge Configuration - Icon + Text Strategy (PLAN-COMPOSE-ICONS.md)
			 *
			 * Settings for text badges superimposed on icons to indicate format/action type.
			 * Uses Inter font optimized for 8-10px legibility with uppercase transformation.
			 *
			 * Use Case: Download/Copy buttons with format indicators (SVG, PNG, JPG, etc.)
			 * Implementation: src/lib/components/shared/IconButton.svelte
			 *
			 * Related:
			 * - Font: Inter (@fontsource/inter) - exceptional small-text legibility
			 * - Typography: src/styles/components.css (.badge-text-xs, .badge-text-sm)
			 * - Documentation: docs/PLAN-COMPOSE-ICONS.md (Strategy B: Icon + Text Badge)
			 */
			badge: {
				/**
				 * Default badge font size
				 * @default "0.625rem" (10px) - balanced legibility
				 * Alternative: "0.5rem" (8px) for extreme compactness
				 */
				fontSize: "0.625rem",

				/**
				 * Badge font weight
				 * @default 600 (semi-bold) - optimal for 10px text
				 * Use 700 (bold) for 8px text for maximum visibility
				 */
				fontWeight: 600,

				/**
				 * Maximum characters for badge text
				 * Text automatically truncated and uppercased (e.g., "Download" → "DOWN")
				 * @default 4 - fits within 20px icon bounds with 2px offset
				 */
				maxChars: 4,

				/**
				 * Badge background opacity for transparency
				 * Allows icon to be visible through badge background
				 * @default 0.2 (20% opacity) - mostly transparent, icon visible through text
				 * Range: 0.0 (fully transparent) to 1.0 (fully opaque)
				 */
				backgroundOpacity: 0.2,

				/**
				 * Badge layering strategy - controls z-index rendering order
				 * @default "overlay" - badge rendered on top of icon (current behavior)
				 * @option "behind" - badge rendered behind icon (z-index inverted, better for mobile without tooltips)
				 */
				layer: "overlay" as const,

				/**
				 * Badge background opacity when using layer="behind"
				 * Badge needs higher opacity when behind icon for visibility
				 * @default 0.6 (60% opacity) - more visible than overlay default (0.2)
				 */
				behindOpacity: 0.6,

				/**
				 * Badge vertical position relative to icon
				 * @default "bottom" - positioned at bottom edge
				 * Options: "top" | "center" | "bottom"
				 */
				verticalPosition: "bottom" as const,

				/**
				 * Badge horizontal position relative to icon
				 * @default "right" - positioned at right edge
				 * Options: "left" | "center" | "right"
				 */
				horizontalPosition: "right" as const,

				/**
				 * Badge offset from icon edge
				 * @default "10px" - 20% overlap (icon 20x20px = 400px², 20% = ~80px² = ~9x9px overlap)
				 * Previous: "2px" (64% overlap) - reduced for better icon visibility
				 */
				offset: "10px"
			}
		},

		/**
		 * CodeBlock Configuration (Task 8F)
		 *
		 * Centralized settings for syntax-highlighted code blocks with Shiki integration.
		 * Bundle optimization: ~2MB (14 languages) vs ~6.6MB (200+ languages) = 70% reduction
		 */
		codeBlock: {
			/**
			 * Syntax highlighting configuration
			 */
			syntax: {
				/**
				 * Languages to load in Shiki highlighter (bundle optimization)
				 *
				 * Only these languages will be included in the bundle.
				 * Add/remove languages based on your content needs.
				 *
				 * Current selection: 14 languages = ~2MB bundle size
				 */
				enabledLanguages: [
					"typescript",
					"javascript",
					"svelte",
					"python",
					"go",
					"rust",
					"java",
					"sql",
					"yaml",
					"bash",
					"hcl",
					"dockerfile",
					"graphql",
					"json"
				],

				/**
				 * Shiki theme configuration for light/dark modes
				 *
				 * Available themes: "github-light", "github-dark",
				 * "vitesse-light", "vitesse-dark", "dracula", "nord", "monokai"
				 */
				themes: {
					light: "vitesse-light" as const,
					dark: "vitesse-dark" as const
				},

				/**
				 * Fallback language when specified language not supported
				 */
				fallbackLanguage: "text",

				/**
				 * Enable syntax highlighting globally
				 * Set to false to render all code as plain text
				 */
				enableSyntaxHighlighting: true
			},

			/**
			 * Default UI settings for code blocks
			 */
			defaults: {
				/**
				 * Show line numbers by default
				 */
				showLineNumbers: true,

				/**
				 * Show copy-to-clipboard button by default
				 */
				showCopyButton: true,

				/**
				 * Show expand button for Dialog full-screen view
				 * @default true
				 */
				showExpandButton: true,

				/**
				 * Show download button to save code as file
				 * @default true
				 */
				showDownloadButton: true,

				/**
				 * Maximum code block height before scrolling
				 * CSS unit (px, rem, vh, etc.)
				 */
				maxHeight: "600px",

				/**
				 * Enable word wrap for long lines
				 * When false, uses horizontal scroll
				 * @default false
				 */
				enableWordWrap: false
			},

			/**
			 * Copy-to-clipboard feedback configuration
			 */
			copyFeedback: {
				/**
				 * Success state duration in milliseconds
				 * Inherits from iconGrid.successStateDuration for consistency
				 */
				duration: 2000,

				/**
				 * Icon shown after successful copy (Lucide icon name)
				 */
				successIcon: "Check",

				/**
				 * Default copy button icon (Lucide icon name)
				 */
				defaultIcon: "Copy"
			},

			/**
			 * Action Buttons Configuration
			 * Controls action buttons appearance in both inline IconGrid and Dialog expansion
			 */
			actionButtons: {
				/**
				 * Default orientation for action buttons
				 * Applies to both inline buttons and Dialog expanded view
				 * @default 'vertical'
				 */
				defaultOrientation: "vertical" as const,

				/**
				 * Gap between buttons (applies to inline and Dialog)
				 * @default '0.5rem'
				 */
				gap: "0.5rem",

				/**
				 * Icon size (applies to inline and Dialog)
				 * @default '20px'
				 */
				iconSize: "20px",

				/**
				 * Inline buttons positioning (compact view)
				 */
				inline: {
					position: {
						/** Distance from top */
						top: "0.5rem",
						/** Distance from right */
						right: "0.5rem"
					}
				},

				/**
				 * Dialog expansion configuration
				 */
				dialog: {
					/**
					 * Alignment system for Dialog action buttons
					 * @default 'content-aligned'
					 */
					alignment: "content-aligned" as const
				}
			}
		},

		/**
		 * Dialog Component Configuration
		 *
		 * Settings for Dialog component including close button, header styling,
		 * and action buttons
		 */
		dialog: {
			/**
			 * Close button configuration
			 */
			closeButton: {
				/**
				 * Close button size (minimum touch target)
				 * WCAG 2.1 Level AA requires 44x44px minimum for touch targets
				 * @default '44px'
				 */
				size: "44px",

				/**
				 * Close button offset from dialog edges
				 */
				offset: {
					/**
					 * Distance from top edge
					 * @default '1.25rem' (20px)
					 */
					top: "1.25rem",
					/**
					 * Distance from right edge
					 * @default '1.25rem' (20px)
					 */
					right: "1.25rem"
				},

				/**
				 * IconButton variant for close button
				 * @default 'subtle'
				 */
				variant: "subtle" as const,

				/**
				 * Show close button by default
				 * Can be overridden by hideDefaultClose prop
				 * @default true
				 */
				showByDefault: true
			},

			/**
			 * Action buttons configuration
			 */
			actionButtons: {
				/**
				 * Default orientation for action buttons
				 * @default 'horizontal'
				 */
				defaultOrientation: "horizontal" as const,

				/**
				 * Default alignment for intelligent positioning system
				 *
				 * SIMPLIFIED SYSTEM (2 Options):
				 * - 'content-aligned': Sticky float over content (76px from top, 20px from right) - DEFAULT
				 * - 'close-adjacent': Adjacent to close button in header (76px from right for horizontal)
				 *
				 * SMART FEATURES:
				 * - Auto-switches to vertical if horizontal + 4+ buttons
				 * - Sticky positioning for content-aligned (always visible during scroll)
				 * - Automatic collision avoidance with 76px safe zone
				 * - close-adjacent vertical: stacks BELOW close button
				 *
				 * REMOVED: 'header-boundary' (eliminated to prevent collisions)
				 *
				 * @default 'content-aligned'
				 */
				defaultAlignment: "content-aligned" as const,

				/**
				 * Minimum number of action buttons that must be visible
				 *
				 * Used for visibility validation in DEV mode.
				 * Logs warning if fewer buttons are provided than this minimum.
				 *
				 * @default 3
				 */
				minVisibleButtons: 3,

				/**
				 * Safe gap for collision avoidance
				 * Minimum spacing between action buttons and close button
				 * @default '12px'
				 */
				safeGap: "12px",

				/**
				 * Enable collision avoidance with close button
				 * When true, action buttons automatically adjust position to avoid overlap
				 * @default true
				 */
				respectCloseButton: true,

				/**
				 * Alignment-specific offset configurations
				 *
				 * Simplified to 2 alignments (removed 'header-boundary' to eliminate collisions).
				 * Used by intelligent positioning system for precise control.
				 *
				 * Design Decision (2025-11-01):
				 * Industry research shows separate zones (header vs content) prevent collisions.
				 * Our floating pattern matches VS Code, GitHub, CodeSandbox.
				 */
				alignmentOffsets: {
					/**
					 * Content-aligned offset from right edge
					 *
					 * Used for sticky positioning over content area.
					 * Matches content horizontal padding for visual consistency.
					 *
					 * @default '1.25rem' (20px)
					 */
					contentAligned: "1.25rem",

					/**
					 * Close-adjacent offset from right edge
					 *
					 * Calculated safe zone to avoid collision with close button:
					 * closeButton.size + closeButton.offset.right + safeGap
					 * = 44px (WCAG min touch) + 20px (offset) + 12px (gap) = 76px
					 *
					 * @default '76px'
					 */
					closeAdjacent: "76px"
				}
			}
		},

		/**
		 * Content Layout Configuration
		 *
		 * Controls how content articles are displayed for optimal readability.
		 * Based on typography research showing 60-80 character lines are ideal.
		 *
		 * LAYOUT MODES:
		 * ┌─────────────────────────────────────────────────────────────┐
		 * │ "centered" (RECOMMENDED - Industry Standard)                │
		 * │ Content centered with auto margins                          │
		 * │ Used by: GitHub Docs, MDN, Tailwind, Next.js, Medium       │
		 * │                                                              │
		 * │        ┌──────────────────────┐                            │
		 * │        │   Content Area       │                            │
		 * │        │   (max-width)        │                            │
		 * │        └──────────────────────┘                            │
		 * │                                                              │
		 * ├─────────────────────────────────────────────────────────────┤
		 * │ "left" (Left-Aligned Alternative)                           │
		 * │ Content left-aligned with max-width                         │
		 * │                                                              │
		 * │  ┌──────────────────────┐                                  │
		 * │  │   Content Area       │                                  │
		 * │  │   (max-width)        │                                  │
		 * │  └──────────────────────┘                                  │
		 * │                                                              │
		 * ├─────────────────────────────────────────────────────────────┤
		 * │ "full" (Full Width)                                         │
		 * │ Content spans entire viewport (minus sidebar)               │
		 * │ Use for: dashboards, wide tables, data visualizations       │
		 * │                                                              │
		 * │  ┌──────────────────────────────────────────────────────┐  │
		 * │  │   Content Area (100% width)                          │  │
		 * │  └──────────────────────────────────────────────────────┘  │
		 * └─────────────────────────────────────────────────────────────┘
		 *
		 * MAX WIDTH OPTIONS (Character Count Guide):
		 * - "prose": 65ch (~65 chars) ✅ OPTIMAL for academic/technical reading
		 * - "3xl": 48rem (~750px, ~60-70 chars) - Compact, mobile-friendly
		 * - "4xl": 56rem (~900px, ~70-80 chars) ✅ RECOMMENDED - Balanced
		 * - "5xl": 64rem (~1000px, ~80-90 chars) - Wider, more content
		 * - "6xl": 72rem (~1150px, ~90-100 chars) - Wide format
		 * - "full": 100% - No constraint (use with "full" layout mode)
		 *
		 * PADDING OPTIONS (Whitespace Control):
		 * - "4": 1rem (16px) - Minimal spacing
		 * - "6": 1.5rem (24px) - Compact
		 * - "8": 2rem (32px) ✅ RECOMMENDED - Balanced breathing room
		 * - "12": 3rem (48px) - Spacious, premium feel
		 * - "16": 4rem (64px) - Generous whitespace, luxury
		 */
		content: {
			/**
			 * Layout mode for content presentation
			 *
			 * Options: "centered" | "left" | "full"
			 * @default "centered" - Industry standard (GitHub, MDN, Tailwind)
			 */
			layoutMode: "centered" as const,

			/**
			 * Maximum content width for readability
			 *
			 * Options: "prose" | "3xl" | "4xl" | "5xl" | "6xl" | "full"
			 * @default "4xl" - 56rem (~900px) - Optimal 70-80 character lines
			 *
			 * Scientific Basis: Studies show 60-80 characters per line maximize
			 * reading comprehension and reduce eye fatigue.
			 */
			maxWidth: "4xl" as const,

			/**
			 * Content padding (horizontal and vertical spacing)
			 *
			 * Options: "4" | "6" | "8" | "12" | "16"
			 * @default "8" - 2rem (32px) - Balanced whitespace
			 */
			padding: "8" as const
		}
	},
	scripts: {
		validation: {
			generated: {
				runAfterGeneration: true, // Run validation after content generation (enabled by default)
				includeCheck: true, // Run TypeScript check validation
				includeLint: true // Run lint validation
			},
			mermaid: {
				maxParallelFiles: 4, // Process up to 4 files in parallel for optimal performance
				diagramPropertyNames: ["diagram", "definition", "diagramDefinition"], // Property names to search for mermaid diagrams
				verbose: false // Disable verbose output by default
			},
			paths: {
				tempConfigDir: "tmp/config", // Temporary configuration directory
				generatedConfigFile: "tsconfig.generated.json", // Generated TypeScript config filename
				wipConfigFile: "tsconfig.wip.json", // Work-in-progress config filename
				rootTsConfig: "tsconfig.json", // Root TypeScript config path
				svelteKitTsConfig: ".svelte-kit/tsconfig.json" // SvelteKit TypeScript config path
			},
			commands: {
				checkGenerated: ["npx", "svelte-check", "--tsconfig"], // Generated content check command
				lint: ["pnpm", "eslint", "--fix", "--no-warn-ignored"] // ESLint command
			},
			typescript: {
				extendsPath: ".svelte-kit/tsconfig.json" // Path to extend from (relative to project root)
			},
			logging: {
				showCommands: true, // Show command execution
				useEmojis: true, // Use emojis in output
				showTimestamps: false, // Disable timestamps by default
				verboseOutput: true // Show verbose output by default
			},
			cleanup: {
				autoCleanup: true, // Automatically clean temporary files
				retainOnError: true, // Retain config files on validation errors for debugging
				tempFilePrefix: "tsconfig", // Prefix for temporary config files
				fileListName: "files.txt" // Name for file list temporary file
			}
		},
		contentMenu: {
			paths: {
				inputFile: "CONTENT.md", // Input markdown file path
				outputFile: "src/data/generated/content-menu.ts" // Output TypeScript file path
			},
			validationPrefix: "content-menu" // Prefix for validation config IDs
		},
		searchIndex: {
			validationPrefix: "search-idx",
			paths: {
				inputFolder: "src/data/book",
				outputFile: "src/data/generated/search-index.ts"
			},
			processing: {
				mode: "development",
				enableNLP: false,
				verboseLogging: true,
				maxKeywords: 15,
				minKeywordLength: 3
			},
			fieldBoosts: {
				title: 10,
				summary: 8,
				content: 5,
				codeBlocks: 7,
				diagrams: 6,
				flipCards: 4,
				questions: 5,
				requirements: 6,
				keywords: 9,
				tags: 3
			},
			keywords: {
				cloudNative: [
					"kubernetes",
					"docker",
					"containerization",
					"microservices",
					"orchestration",
					"deployment",
					"scaling",
					"service mesh",
					"istio",
					"helm",
					"operators"
				],
				infrastructure: [
					"terraform",
					"ansible",
					"jenkins",
					"gitlab",
					"ci/cd",
					"infrastructure as code",
					"monitoring",
					"prometheus",
					"grafana",
					"logging",
					"observability"
				],
				languages: ["typescript", "javascript", "python", "go", "rust", "java", "nodejs"],
				databases: [
					"postgresql",
					"mongodb",
					"redis",
					"elasticsearch",
					"database",
					"storage",
					"persistence"
				],
				webTechnologies: [
					"api",
					"rest",
					"graphql",
					"http",
					"websocket",
					"json",
					"xml",
					"oauth",
					"jwt",
					"cors",
					"ssl",
					"tls"
				],
				cloudProviders: [
					"aws",
					"azure",
					"gcp",
					"cloud",
					"serverless",
					"lambda",
					"functions",
					"s3",
					"ec2",
					"rds"
				],
				security: [
					"authentication",
					"authorization",
					"security",
					"encryption",
					"certificate",
					"firewall",
					"vpn",
					"iam",
					"rbac"
				]
			}
		},
		flatNav: {
			paths: {
				inputFile: "src/data/generated/content-menu.ts", // Input from content menu generator
				outputFile: "src/data/generated/flatnav.ts" // Output navigation map
			},
			validationPrefix: "flatnav", // Prefix for validation config IDs
			bookOverview: {
				id: "00_BOOK", // Unique identifier for book overview entry
				title: "Welcome to Mastering Cloud-Native Technologies", // Display title
				chapterUrl: "overview.html", // Chapter URL for navigation
				filePath: "book/overview.ts", // TypeScript data file path
				unitTitle: "Book Overview", // Unit title for display context
				defaultSource: "direct" as const // Navigation source for analytics
			},
			navigation: {
				crossUnitNavigation: true, // Allow navigation across unit boundaries
				skipEmptyUnits: true, // Skip units with no available content
				generateDebugInfo: false // Include debug information in output
			}
		},
		contentCreator: {
			paths: {
				inputFile: "src/data/generated/content-menu.ts", // Input file for reading unit structure
				outputFolder: "src/data/book" // Output folder for content files
			},
			validationPrefix: "content-creator", // Prefix for validation config IDs
			repository: {
				backupDirectory: "tmp/backups" // Backup directory for content operations
			}
		},
		common: {
			configFiles: {
				packageJson: "package.json", // Package.json path
				tsConfig: "tsconfig.json" // TypeScript configuration file
			},
			extensions: {
				typescript: ".ts", // TypeScript files
				javascript: ".js", // JavaScript files
				json: ".json", // JSON files
				markdown: ".md" // Markdown files
			}
		},
		scaffolding: {
			paths: {
				inputFile: "src/data/generated/content-menu.ts", // Input file for reading unit structure
				outputFolder: "src/data/book" // Output folder for generated content files
			},
			validationPrefix: "scaffolding", // Prefix for validation config IDs
			lessons: {
				sections: 5, // Minimum 5 sections per lesson
				codeBlocks: 1, // Minimum 1 code block per lesson
				diagrams: 1 // Minimum 1 diagram per lesson
			},
			quizzes: {
				questions: 10, // Minimum 10 questions per quiz
				diverseTypes: true // Use diverse question types
			},
			exams: {
				questions: 35, // Minimum 35 questions (schema requirement) per exam
				diverseTypes: true // Use diverse question types
			},
			studyGuides: {
				flipCards: 10 // Minimum 10 flashcards (providing more than schema minimum of 6) per study guide
			},
			projects: {
				sections: 5, // Minimum 5 sections per project
				requirements: 5, // Minimum 5 requirements per project
				deliverables: 3 // Minimum 3 deliverables per project
			},
			contentLengths: {
				summary: 200,
				paragraph: 500,
				longParagraph: 800,
				question: 80,
				explanation: 300,
				flashcardQuestion: 60,
				flashcardAnswer: 400,
				objective: 50,
				requirement: 100,
				deliverable: 80,
				diagramTitle: 60,
				diagramCaption: 150
			}
		},
		schemas: {
			paths: {
				sourceFile: "src/lib/schemas/ContentSchemas.ts", // Schema definitions source
				outputFile: "src/data/generated/content-schemas.json" // Single consolidated JSON Schema
			},
			generation: {
				target: "draft-7", // Zod native target: "draft-2020-12" | "draft-7" | "draft-4" | "openapi-3.0"
				schemaId: "https://learn-cloud.example.com/schemas/content-schemas.json", // Schema $id URI
				title: "Cloud-Native Learning Platform Content Schemas", // Schema title
				io: "output", // Zod IO mode: "input" | "output"
				unrepresentable: "any", // How to handle unrepresentable types: "throw" | "any"
				cycles: "ref", // How to handle circular references: "ref" | "throw"
				validateOutput: true // Validate generated schemas
			},
			validationPrefix: "schema-gen" // Prefix for validation config IDs
		}
	}
};

// Note: AppSettings type is now centralized in src/lib/types/config.ts
// and can be imported via: import type { AppSettings } from "$types";
