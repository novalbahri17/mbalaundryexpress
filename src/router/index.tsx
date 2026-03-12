import { Navigate, createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "@/router/AdminRouter";
import { publicRoutes } from "@/router/PublicRouter";

export const appRouter = createBrowserRouter([
	publicRoutes,
	adminRoutes,
	{ path: "*", element: <Navigate to="/" replace /> },
]);
