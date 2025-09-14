/**
 * Clean icon mapping utility for content menu icons
 * Static imports for better tree-shaking and simpler code
 * Perfect for SPA builds where bundle size is optimized anyway
 * 
 * IMPORTANT: This file must be manually updated when new icons are added
 * to CONTENT.md or when running generate_content_menu.py introduces new icons.
 * The Python script will warn about missing icons in the console output.
 */

// Import all icons we need statically
import BookOpenIcon from "@lucide/svelte/icons/book-open";
import HelpCircleIcon from "@lucide/svelte/icons/help-circle";
import TargetIcon from "@lucide/svelte/icons/target";
import RocketIcon from "@lucide/svelte/icons/rocket";
import BoxIcon from "@lucide/svelte/icons/box";
import CpuIcon from "@lucide/svelte/icons/cpu";
import CodeIcon from "@lucide/svelte/icons/code";
import SettingsIcon from "@lucide/svelte/icons/settings";
import LockIcon from "@lucide/svelte/icons/lock";
import ShieldIcon from "@lucide/svelte/icons/shield";
import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
import BotIcon from "@lucide/svelte/icons/bot";
import ZapIcon from "@lucide/svelte/icons/zap";
import GraduationCapIcon from "@lucide/svelte/icons/graduation-cap";
import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
import DatabaseIcon from "@lucide/svelte/icons/database";
import GlobeIcon from "@lucide/svelte/icons/globe";
import TestTubeIcon from "@lucide/svelte/icons/test-tube";
import BarChart3Icon from "@lucide/svelte/icons/bar-chart-3";
import CloudIcon from "@lucide/svelte/icons/cloud";
import ContainerIcon from "@lucide/svelte/icons/container";
import GitBranchIcon from "@lucide/svelte/icons/git-branch";
import WorkflowIcon from "@lucide/svelte/icons/workflow";
import ServerIcon from "@lucide/svelte/icons/server";
import SearchIcon from "@lucide/svelte/icons/search";
import ScanLineIcon from "@lucide/svelte/icons/scan-line";
import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
import CloudLightningIcon from "@lucide/svelte/icons/cloud-lightning";
import AwardIcon from "@lucide/svelte/icons/award";
import LinkIcon from "@lucide/svelte/icons/link";
import KeyIcon from "@lucide/svelte/icons/key";

// Clean, simple mapping object
export const ICON_MAP: Record<string, any> = {
	// Content types
	BookOpen: BookOpenIcon,
	HelpCircle: HelpCircleIcon,
	Target: TargetIcon,
	Rocket: RocketIcon,

	// Programming languages & tech
	Box: BoxIcon,
	Cpu: CpuIcon,
	Code: CodeIcon,

	// Infrastructure & DevOps
	Settings: SettingsIcon,
	Lock: LockIcon,
	Shield: ShieldIcon,
	ShieldCheck: ShieldCheckIcon,
	Bot: BotIcon,
	Zap: ZapIcon,
	GraduationCap: GraduationCapIcon,

	// Development concepts
	CheckCircle: CheckCircleIcon,
	Database: DatabaseIcon,
	Globe: GlobeIcon,
	TestTube: TestTubeIcon,
	BarChart3: BarChart3Icon,

	// Cloud & Infrastructure
	Cloud: CloudIcon,
	Container: ContainerIcon,
	GitBranch: GitBranchIcon,
	Workflow: WorkflowIcon,
	Server: ServerIcon,

	// Security & Tools
	Search: SearchIcon,
	ScanLine: ScanLineIcon,
	AlertTriangle: AlertTriangleIcon,
	RefreshCw: RefreshCwIcon,
	CloudLightning: CloudLightningIcon,
	Award: AwardIcon,
	Link: LinkIcon,
	Key: KeyIcon
};

/**
 * Get icon component by name - simple and synchronous
 * Returns the corresponding Lucide icon component or fallback
 */
export function getIconComponent(iconName: string): any | null {
	return ICON_MAP[iconName] || ICON_MAP.HelpCircle || null;
}
