import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

// @ts-ignore
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const base = env.VITE_APP_PUBLIC_PATH || env.VITE_PUBLIC_PATH || "/";
	const isProduction = mode === "production";

	return {
		base,
		plugins: [
			react(),
			vanillaExtractPlugin({
				identifiers: ({ debugId }) => `${debugId}`,
			}),
			tsconfigPaths(),
			VitePWA({
				registerType: "autoUpdate",
				includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
				manifest: {
					name: "MBA Laundry Express",
					short_name: "MBA Laundry",
					description: "Admin panel dan landing page MBA Laundry Express",
					theme_color: "#C62828",
					background_color: "#FAFAFA",
					display: "standalone",
					start_url: "/",
					icons: [
						{
							src: "/pwa-192x192.png",
							sizes: "192x192",
							type: "image/png",
						},
						{
							src: "/pwa-512x512.png",
							sizes: "512x512",
							type: "image/png",
						},
					],
				},
				workbox: {
					globPatterns: ["**/*.{js,css,html,svg,png,webp,woff2}"],
					runtimeCaching: [
						{
							urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
							handler: "CacheFirst",
							options: {
								cacheName: "google-fonts-stylesheets",
								expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
							},
						},
						{
							urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
							handler: "CacheFirst",
							options: {
								cacheName: "google-fonts-webfonts",
								expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
								cacheableResponse: { statuses: [0, 200] },
							},
						},
					],
				},
				devOptions: {
					enabled: false,
				},
			}),
			isProduction &&
				visualizer({
					open: false,
					gzipSize: true,
					brotliSize: true,
					template: "treemap",
				}),
		].filter(Boolean),

		server: {
			open: true,
			host: true,
			port: 3000,
			proxy: {
				"/pb-api": {
					target: env.POCKETBASE_URL || "http://43.156.144.127:8091",
					changeOrigin: true,
					secure: false,
					rewrite: (path) => path.replace(/^\/pb-api/, ""),
				},
				"/api": {
					target: env.VITE_API_PROXY_TARGET || "http://127.0.0.1:3002",
					changeOrigin: true,
					secure: false,
				},
			},
		},

		build: {
			target: "esnext",
			minify: "esbuild",
			sourcemap: false,
			cssCodeSplit: true,
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				external: [],
				output: {
					manualChunks: {
						"vendor-core": ["react", "react-dom", "react-router-dom"],
						"vendor-ui": ["antd", "@ant-design/cssinjs"],
						"vendor-utils": ["axios", "date-fns", "zustand", "@tanstack/react-query"],
						"vendor-charts": ["apexcharts", "react-apexcharts"],
					},
				},
			},
		},

		optimizeDeps: {
			include: ["react", "react-dom", "react-router-dom", "antd", "axios", "@ant-design/icons", "workbox-window"],
			exclude: ["@iconify/react"],
		},

		esbuild: {
			drop: isProduction ? ["console", "debugger"] : [],
			legalComments: "none",
			target: "esnext",
		},
	};
});
