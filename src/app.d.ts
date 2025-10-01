// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Vite environment variables for import.meta.env
	interface ImportMetaEnv {
		readonly DEV: boolean;
		readonly PROD: boolean;
		readonly SSR: boolean;
		readonly MODE: string;
		readonly BASE_URL: string;
	}

	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}

export {};
