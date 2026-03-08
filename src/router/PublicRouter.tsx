import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { PublicLayout } from "@/components/public/layout/PublicLayout";

const HomePage = lazy(() => import("@/pages/public/HomePage"));
const CabangListPage = lazy(() => import("@/pages/public/CabangListPage"));
const CabangDetailPage = lazy(() => import("@/pages/public/CabangDetailPage"));
const PromoPage = lazy(() => import("@/pages/public/PromoPage"));
const HargaPage = lazy(() => import("@/pages/public/HargaPage"));
const KalkulatorPage = lazy(() => import("@/pages/public/KalkulatorPage"));
const CaraPakaiPage = lazy(() => import("@/pages/public/CaraPakaiPage"));
const FaqPage = lazy(() => import("@/pages/public/FaqPage"));
const BlogListPage = lazy(() => import("@/pages/public/BlogListPage"));
const BlogDetailPage = lazy(() => import("@/pages/public/BlogDetailPage"));
const TestimoniPage = lazy(() => import("@/pages/public/TestimoniPage"));
const GaleriPage = lazy(() => import("@/pages/public/GaleriPage"));
const KarirListPage = lazy(() => import("@/pages/public/KarirListPage"));
const KarirDetailPage = lazy(() => import("@/pages/public/KarirDetailPage"));
const KemitraanPage = lazy(() => import("@/pages/public/KemitraanPage"));
const KorporatPage = lazy(() => import("@/pages/public/KorporatPage"));
const TentangPage = lazy(() => import("@/pages/public/TentangPage"));
const KontakPage = lazy(() => import("@/pages/public/KontakPage"));

const StatistikPage = lazy(() => import("@/pages/public/StatistikPage"));

export const publicRoutes: RouteObject = {
	path: "/",
	element: <PublicLayout />,
	children: [
		{ index: true, element: <HomePage /> },
		{ path: "cabang", element: <CabangListPage /> },
		{ path: "cabang/:slug", element: <CabangDetailPage /> },
		{ path: "promo", element: <PromoPage /> },
		{ path: "harga", element: <HargaPage /> },
		{ path: "kalkulator", element: <KalkulatorPage /> },
		{ path: "cara-pakai", element: <CaraPakaiPage /> },
		{ path: "faq", element: <FaqPage /> },
		{ path: "blog", element: <BlogListPage /> },
		{ path: "blog/:slug", element: <BlogDetailPage /> },
		{ path: "testimoni", element: <TestimoniPage /> },
		{ path: "galeri", element: <GaleriPage /> },
		{ path: "karir", element: <KarirListPage /> },
		{ path: "karir/:id", element: <KarirDetailPage /> },
		{ path: "kemitraan", element: <KemitraanPage /> },
		{ path: "korporat", element: <KorporatPage /> },
		{ path: "tentang", element: <TentangPage /> },
		{ path: "kontak", element: <KontakPage /> },

		{ path: "statistik", element: <StatistikPage /> },
	],
};
