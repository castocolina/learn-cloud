/**
 * Breadcrumb Navigation Store
 *
 * Manages breadcrumb trail state for the SPA navigation system.
 * Updated by unified navigation system, consumed by breadcrumb component.
 *
 * ARCHITECTURE:
 * - Simple writable store with BreadcrumbItem array
 * - Updated by navigateToContent() in navigation.ts
 * - Consumed by Breadcrumb component (TASK 8C)
 * - Integrates with BreadcrumbItem type from $types
 *
 * BREADCRUMB STRUCTURE:
 * - Always starts with Home
 * - Shows: Home → Unit → Chapter (current)
 * - Last item is not clickable (isClickable: false)
 * - Uses icons from BreadcrumbIcon type
 *
 * INTEGRATION:
 * - TASK 8B (Sticky Header): Display breadcrumb in header
 * - TASK 8C (Breadcrumb): Main consumer of this store
 * - Navigation system: Updates trail on every navigation
 *
 * @module breadcrumb
 */

import { writable } from "svelte/store";
import type { BreadcrumbItem } from "$types";

/**
 * Breadcrumb store
 *
 * Holds the current breadcrumb trail as an array of BreadcrumbItems.
 * Updated by navigation.ts when user navigates to different content.
 *
 * @example
 * import { breadcrumbStore } from "$lib/stores/breadcrumb";
 *
 * // In component
 * const breadcrumbs = $breadcrumbStore;
 * // [{ id: "home", label: "Home", ... }, { id: "unit_1", label: "Unit 1", ... }]
 *
 * // Update breadcrumb trail
 * breadcrumbStore.set([
 *   { id: "home", label: "Home", url: "#/", icon: "Home", isClickable: true },
 *   { id: "unit_1", label: "Python", url: "#/unit01", icon: "BookOpen", isClickable: true },
 *   { id: "01_01L", label: "Dev Environment", url: "#/01_01_lesson_dev.html", isClickable: false, isActive: true }
 * ]);
 */
export const breadcrumbStore = writable<BreadcrumbItem[]>([]);
