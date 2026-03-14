import { Navigate, createBrowserRouter } from "react-router-dom";
import type { RouterProviderProps } from "react-router-dom";
import { adminRoutes } from "@/router/AdminRouter";
import { publicRoutes } from "@/router/PublicRouter";

export const appRouter: RouterProviderProps["router"] = createBrowserRouter([
	publicRoutes,
	adminRoutes,
	{ path: "*", element: <Navigate to="/" replace /> },
]);
