import { Suspense, useEffect } from "react";
import { ConfigProvider, App as AntdApp, theme as antdTheme } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import { appRouter } from "@/router";
import { useThemeStore } from "@/store/themeStore";

const queryClient = new QueryClient();

function ThemeSync() {
	const mode = useThemeStore((state) => state.mode);
	const setMode = useThemeStore((state) => state.setMode);

	useEffect(() => {
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		if (!window.localStorage.getItem("mba-theme")) {
			setMode(prefersDark ? "dark" : "light");
		}
	}, [setMode]);

	return (
		<ConfigProvider
			theme={{
				token: {
					colorPrimary: "#C62828",
					colorInfo: "#1565C0",
					colorSuccess: "#0F766E",
					colorWarning: "#D97706",
					colorError: "#DC2626",
					borderRadius: 14,
					borderRadiusLG: 20,
					borderRadiusSM: 10,
					controlHeight: 42,
					controlHeightLG: 48,
					fontSize: 14,
					colorBorder: mode === "dark" ? "#262637" : "#E7EAF1",
				},
				components: {
					Button: {
						borderRadius: 12,
						controlHeight: 42,
						controlHeightLG: 48,
						fontWeight: 700,
						boxShadow: "0 10px 24px rgba(198,40,40,0.22)",
					},
					Input: {
						controlHeight: 42,
						borderRadius: 12,
					},
					InputNumber: {
						controlHeight: 42,
						borderRadius: 12,
					},
					Select: {
						controlHeight: 42,
						borderRadius: 12,
					},
					Table: {
						borderColor: mode === "dark" ? "#262637" : "#E7EAF1",
						headerBg: mode === "dark" ? "#1b1b28" : "#F8FAFC",
						headerColor: mode === "dark" ? "#E7EAF4" : "#0F172A",
						rowHoverBg: mode === "dark" ? "rgba(255,255,255,0.04)" : "#F8FAFC",
					},
					Modal: {
						borderRadiusLG: 20,
						contentBg: mode === "dark" ? "#161621" : "#ffffff",
					},
					Drawer: {
						colorBgElevated: mode === "dark" ? "#161621" : "#ffffff",
					},
					Card: {
						borderRadiusLG: 18,
					},
					Segmented: {
						borderRadius: 12,
					},
					Alert: {
						borderRadiusLG: 12,
					},
				},
				algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
			}}
		>
			<AntdApp>
				<Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-slate-500">Memuat halaman...</div>}>
					<RouterProvider router={appRouter} future={{ v7_startTransition: true }} />
				</Suspense>
			</AntdApp>
		</ConfigProvider>
	);
}

export default function App() {
	return (
		<HelmetProvider>
			<QueryClientProvider client={queryClient}>
				<Helmet>
					<title>{import.meta.env.VITE_SITE_NAME || "MBA Laundry Express"}</title>
				</Helmet>
				<ThemeSync />
				<Toaster
					position="bottom-right"
					gutter={10}
					toastOptions={{
						duration: 3200,
						style: {
							borderRadius: "14px",
							background: "#111827",
							color: "#F9FAFB",
							border: "1px solid rgba(255,255,255,0.12)",
							boxShadow: "0 14px 34px rgba(2, 6, 23, 0.4)",
						},
						success: {
							style: {
								background: "#052e16",
								color: "#ecfdf5",
								border: "1px solid #14532d",
							},
						},
						error: {
							style: {
								background: "#450a0a",
								color: "#fef2f2",
								border: "1px solid #7f1d1d",
							},
						},
					}}
				/>
				<SonnerToaster position="bottom-right" richColors closeButton />
			</QueryClientProvider>
		</HelmetProvider>
	);
}

