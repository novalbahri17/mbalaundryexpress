import { lazy, useEffect } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "@/api/client";
import { useUserActions, useUserToken } from "@/store/userStore";

const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const LoginPage = lazy(() => import("@/pages/admin/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const CabangPage = lazy(() => import("@/pages/admin/cabang"));
const JadwalShiftPage = lazy(() => import("@/pages/admin/jadwal"));
const CabangKelolaPage = lazy(() => import("@/pages/admin/cabang/KelolaPage"));
const CabangJamPage = lazy(() => import("@/pages/admin/cabang/JamPage"));
const CabangFasilitasPage = lazy(() => import("@/pages/admin/cabang/FasilitasPage"));
const CabangMesinPage = lazy(() => import("@/pages/admin/cabang/MesinPage"));
const CabangGaleriPage = lazy(() => import("@/pages/admin/cabang/GaleriPage"));
const CabangPromoPage = lazy(() => import("@/pages/admin/cabang/PromoPage"));
const PromoPage = lazy(() => import("@/pages/admin/promo"));
const LokerPage = lazy(() => import("@/pages/admin/loker"));
const BlogPage = lazy(() => import("@/pages/admin/blog"));
const TestimoniPage = lazy(() => import("@/pages/admin/testimoni"));
const FaqPage = lazy(() => import("@/pages/admin/faq"));
const GaleriPage = lazy(() => import("@/pages/admin/galeri"));

const KemitraanPage = lazy(() => import("@/pages/admin/kemitraan"));
const PesanPage = lazy(() => import("@/pages/admin/pesan"));
const PengaturanPage = lazy(() => import("@/pages/admin/pengaturan"));
const BrandingSettingsPage = lazy(() => import("@/pages/admin/pengaturan/branding"));
const TeksLandingPage = lazy(() => import("@/pages/admin/pengaturan/teks-landing"));
const MarketingDashboardPage = lazy(() => import("@/pages/admin/marketing"));

function RequireAdminAuth() {
	const token = useUserToken();
	const { hydrateFromAuthStore, clearUserInfoAndToken } = useUserActions();
	const hasValidSession = isAuthenticated();

	useEffect(() => {
		if (!hasValidSession) {
			if (token.accessToken) clearUserInfoAndToken();
			return;
		}

		if (!token.accessToken) {
			hydrateFromAuthStore();
		}
	}, [clearUserInfoAndToken, hasValidSession, hydrateFromAuthStore, token.accessToken]);

	if (!hasValidSession) {
		return <Navigate to="/admin/login" replace />;
	}

	return <Outlet />;
}

export const adminRoutes: RouteObject = {
	path: "/admin",
	children: [
		{ path: "login", element: <LoginPage /> },
		{
			element: <RequireAdminAuth />,
			children: [
				{
					element: <AdminLayout />,
					children: [
						{ path: "dashboard", element: <DashboardPage /> },
						{ path: "cabang", element: <CabangPage /> },
						{ path: "jadwal", element: <JadwalShiftPage /> },
						{ path: "cabang/:id", element: <CabangKelolaPage /> },
						{ path: "cabang/:id/jam", element: <CabangJamPage /> },
						{ path: "cabang/:id/fasilitas", element: <CabangFasilitasPage /> },
						{ path: "cabang/:id/mesin", element: <CabangMesinPage /> },
						{ path: "cabang/:id/promo", element: <CabangPromoPage /> },
						{ path: "cabang/:id/promo", element: <CabangPromoPage /> },
						{ path: "cabang/:id/galeri", element: <CabangGaleriPage /> },
						{ path: "promo", element: <PromoPage /> },
						{ path: "loker", element: <LokerPage /> },
						{ path: "blog", element: <BlogPage /> },
						{ path: "testimoni", element: <TestimoniPage /> },
						{ path: "faq", element: <FaqPage /> },
						{ path: "galeri", element: <GaleriPage /> },
						{ path: "kemitraan", element: <KemitraanPage /> },
						{ path: "pesan", element: <PesanPage /> },
						{ path: "pengaturan", element: <PengaturanPage /> },
						{ path: "pengaturan/branding", element: <BrandingSettingsPage /> },
						{ path: "pengaturan/teks-landing", element: <TeksLandingPage /> },
						{ path: "marketing", element: <MarketingDashboardPage /> },
						{ index: true, element: <Navigate to="dashboard" replace /> },
					],
				},
			],
		},
	],
};
