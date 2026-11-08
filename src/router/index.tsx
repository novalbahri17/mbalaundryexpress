import { lazy } from "react";
import type { RouterProviderProps } from "react-router-dom";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { adminRoutes } from "@/router/AdminRouter";
import { publicRoutes } from "@/router/PublicRouter";

const JadwalKaryawanPage = lazy(() => import("@/pages/public/JadwalKaryawanPage"));

export const appRouter: RouterProviderProps["router"] = createBrowserRouter([
	{
		path: "/jadwal-karyawan/:branchSlug/:secretToken",
		element: <JadwalKaryawanPage />,
	},
	publicRoutes,
	adminRoutes,
	{ path: "*", element: <Navigate to="/" replace /> },
]);
