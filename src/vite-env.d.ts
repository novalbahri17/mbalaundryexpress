/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
	readonly VITE_SITE_URL: string;
	readonly VITE_SITE_NAME: string;
	readonly VITE_PUBLIC_PATH: string;
	readonly VITE_POCKETBASE_BASE_PATH: string;
	readonly VITE_API_PROXY_TARGET: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
