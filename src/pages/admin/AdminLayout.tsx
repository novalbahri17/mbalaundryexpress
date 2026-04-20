import {
	ApartmentOutlined,
	AppstoreOutlined,
	ArrowLeftOutlined,
	BellOutlined,
	DashboardOutlined,
	GiftOutlined,
	HomeOutlined,
	LineChartOutlined,
	LogouteOutlined,
	MessageOutlined,
	PictureOutlined,
	QuestionCircleOutlined,
	ReadOutlined,
	SettingOutlined,
	StarOutlined,
	TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
	BarChart3,
	GitBranch,
	Home,
	LucideBookOpen,
	LucideCalendarClock,
	LuceneImage,
	Image,
	LuceneMegaphone,
	Megaphone,
	MessageSquareMore,
	Settings2,
	ShieldCheck,
	ShoppingBag,
	Star,
	Users,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUserActions, useUserInfo } from "@/store/userStore";
import { useBranding } from "@/hooks/useBranding";
import { AdminFavicon } from "@/components/admin/AdminFavicon";
import NotificationCenter from "@/components/admin/NotificationCenter";

type MenuGroupKey = "group-operasional" | "group-konten" | "group-komunikasi";

interface AdminMenuEntry {
	key: string;
	label: string;
	group?: MenuGroupKey;
}

interface MenuGroupConfig {
	key: MenuGroupKey;
	label: string;
}

const SIDEBAR_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 72;

const menuGroups: MenuGroupConfig[] = [
	{ key: "group-operasional", label: "Operasional" },
	{ key: "group-konten", label: "Konten & Promo" },
	{ key: "group-komunikasi", label: "Komunikasi & Sistem" },
];

const dashboardMenuEntry: AdminMenuEntry = {
	key: "/admin/dashboard",
	label: "Dashboard",
};

const menuEntries: AdminMenuEntry[] = [
	{ key: "/admin/cabang", label: "Cabang", group: "group-operasional" },
	{ key: "/admin/loker", label: "Lowongan Kerja", group: "group-operasional" },
	{ key: "/admin/promo", label: "Promo", group: "group-konten" },
	{ key: "/admin/blog", label: "Blog", group: "group-konten" },
	{ key: "/admin/testimoni", label: "Testimoni", group: "group-konten" },
	{ key: "/admin/faq", label: "FAQ", group: "group-konten" },
	{ key: "/admin/galeri", label: "Galeri", group: "group-konten" },
	{ key: "/admin/marketing", label: "Marketing", group: "group-konten" },
	{ key: "/admin/kemitraan", label: "Kemitraan", group: "group-komunikasi" },
	{ key: "/admin/pesan", label: "Pesan", group: "group-komunikasi" },
	{ key: "/admin/pengaturan", label: "Pengaturan", group: "group-komunikasi" },
];

const menuByKey = new Map<string, { label: string; group?: MenuGroupKey }>([
	[dashboardMenuEntry.key, { label: dashboardMenuEntry.label }],
	...menuEntries.map((item) => [item.key, { label: item.label, group: item.group }] as const),
]);

function SidebarLogo({ collapsed }: { collapsed: boolean }) {
	const { data: branding } = useBranding();

	if (collapsed) {
		return (
			<div className="flex h-16 items-center justify-center border-b border-white/10">
				{branding?.logo_url ? (
					<img src={branding.logo_url} alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
				) : (
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#C62828] to-[#1565C0]">
						<span className="text-sm font-bold text-white">M</span>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
			{branding?.logo_url ? (
				<img src={branding.logo_url} alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
			) : (
				<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#C62828] to-[#1565C0]">
					<span className="text-sm font-bold text-white">M</span>
				</div>
			)}
			<div className="flex flex-col overflow-hidden">
				<span className="text-sm font-bold text-white truncate">{branding?.site_title || "MBA Admin"}</span>
				<span className="text-[10px] text-white/50">Control Panel</span>
			</div>
		</div>
	);
}

function SidebarMenu({
	selectedKey,
	collapsed,
	onSelect,
}: {
	selectedKey: string;
	collapsed: boolean;
	onSelect: (key: string) => void;
}) {
	const location = useLocation();

	const items = useMemo<MenuProps["items"]>(() => {
		const dashboardItem = {
			key: dashboardMenuEntry.key,
			label: dashboardMenuEntry.label,
			icon: <DashboardOutlined />,
			className: selectedKey === dashboardMenuEntry.key ? "menu-item-active" : "",
		};

		if (collapsed) {
			return [
				dashboardItem,
				...menuEntries.map((entry) => ({
					key: entry.key,
					label: entry.label,
					icon: getMenuIcon(entry.key),
					className: location.pathname.startsWith(entry.key) ? "menu-item-active" : "",
				})),
			];
		}

		const groups = menuGroups.map((group) => ({
			key: group.key,
			label: <span className="menu-group-label">{group.label}</span>,
			type: "group" as const,
			children: menuEntries
				.filter((entry) => entry.group === group.key)
				.map((entry) => ({
					key: entry.key,
					label: entry.label,
					icon: getMenuIcon(entry.key),
					className: location.pathname.startsWith(entry.key) ? "menu-item-active" : "",
				})),
		}));

		return [dashboardItem, ...groups];
	}, [collapsed, location.pathname, selectedKey]);

	const onClick: MenuProps["onClick"] = ({ key }) => {
		onSelect(key);
	};

	return (
		<div className="sidebar-menu-container">
			<div className="menu-items">
				{items?.map((item: any, index: number) => {
					if (item.type === "group") {
						return (
							<div key={item.key} className="menu-group">
								<div className="menu-group-title">{item.label}</div>
								<div className="menu-group-children">
									{item.children?.map((child: any) => (
										<button
											key={child.key}
											onClick={() => onClick({ key: child.key } as any)}
											className={`menu-item-link ${child.className || ""}`}
											title={collapsed ? child.label : undefined}
										>
											<span className="menu-item-icon">{child.icon}</span>
											{!collapsed && <span className="menu-item-label">{child.label}</span>}
										</button>
									))}
								</div>
							</div>
						);
					}

					return (
						<button
							key={item.key}
							onClick={() => onClick({ key: item.key } as any)}
							className={`menu-item-link ${item.className || ""}`}
							title={collapsed ? item.label : undefined}
						>
							<span className="menu-item-icon">{item.icon}</span>
							{!collapsed && <span className="menu-item-label">{item.label}</span>}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function getMenuIcon(key: string): React.ReactNode {
	switch (key) {
		case "/admin/cabang":
			return <GitBranch size={18} />;
		case "/admin/loker":
			return <Users size={18} />;
		case "/admin/promo":
			return <Megaphone size={18} />;
		case "/admin/blog":
			return <LucideBookOpen size={18} />;
		case "/admin/testimoni":
			return <Star size={18} />;
		case "/admin/faq":
			return <QuestionCircleOutlined style={{ fontSize: 18 }} />;
		case "/admin/galeri":
			return <Image size={18} />;
		case "/admin/marketing":
			return <BarChart3 size={18} />;
		case "/admin/kemitraan":
			return <ShieldCheck size={18} />;
		case "/admin/pesan":
			return <MessageSquareMore size={18} />;
		case "/admin/pengaturan":
			return <Settings2 size={18} />;
		default:
			return <SettingsOutlined />;
	}
}

export default function AdminLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const user = useUserInfo();
	const { clearUserInfoAndToken } = useUserActions();

	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const selected = useMemo(
		() => menuEntries.find((item) => location.pathname.startsWith(item.key))?.key ?? dashboardMenuEntry.key,
		[location.pathname],
	);

	const selectedGroup = menuByKey.get(selected)?.group;
	const pageTitle = menuByKey.get(selected)?.label ?? "Dashboard";
	const isDashboard = selected === dashboardMenuEntry.key;

	const goTo = (key: string) => {
		navigate(key);
		setMobileOpen(false);
	};

	const handleBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
			return;
		}
		navigate("/admin/dashboard");
	};

	const handleLogout = () => {
		clearUserInfoAndToken();
		toast.success("Logout berhasil. Sampai jumpa lagi.");
		navigate("/admin/login", { replace: true });
	};

	return (
		<div className="metronic-admin-layout">
			<style>{metronicAdminStyles}</style>
			<AdminFavicon />

			{/* Desktop Sidebar */}
			<aside className={`app-sidebar ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
				<SidebarLogo collapsed={sidebarCollapsed} />

				<button
					className="sidebar-toggle-btn"
					onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
					title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
				>
					<div className={`toggle-icon ${sidebarCollapsed ? "collapsed" : ""}`}>
						<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
							<path
								d="M8.5 3L3.5 6L8.5 9"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</button>

				<SidebarMenu selectedKey={selected} collapsed={sidebarCollapsed} onSelect={goTo} />
			</aside>

			{/* Mobile Overlay */}
			{mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

			{/* Mobile Sidebar */}
			<aside className={`mobile-sidebar ${mobileOpen ? "open" : ""}`}>
				<SidebarLogo collapsed={false} />
				<SidebarMenu selectedKey={selected} collapsed={false} onSelect={goTo} />
			</aside>

			{/* Main Content Area */}
			<div className={`main-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
				{/* Header */}
				<header className="app-header">
					<div className="header-left">
						<button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
								<path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</button>

						{!isDashboard && (
							<button className="back-btn" onClick={handleBack}>
								<ArrowLeftOutlined />
								<span>Kembali</span>
							</button>
						)}

						<div className="page-title-container">
							<h1 className="page-title">{pageTitle}</h1>
							<div className="breadcrumb">
								<span className="breadcrumb-item" onClick={() => navigate("/admin/dashboard")}>
									Dashboard
								</span>
								<span className="breadcrumb-separator" />
								<span className="breadcrumb-current">{pageTitle}</span>
							</div>
						</div>
					</div>

					<div className="header-right">
						<NotificationCenter />

						<div className="user-menu">
							<div className="user-info">
								<span className="user-name">{user.username ?? user.email ?? "Admin"}</span>
								<span className="user-role">Administrator</span>
							</div>
							<Avatar size={36} className="user-avatar">
								{(user.username ?? user.email ?? "A").slice(0, 1).toUpperCase()}
							</Avatar>
						</div>

						<Tooltip title="Logout">
							<button className="logout-btn" onClick={handleLogout}>
								<svg width="18" height="18" viewBox="0 0 18 18" fill="none">
									<path
										d="M6 15H3C2.46957 15 1.96086 14.7893 1.58579 14.4142C1.21071 14.0391 1 13.5304 1 13V5C1 4.46957 1.21071 3.96086 1.58579 3.58579C1.96086 3.21071 2.46957 3 3 3H6M12 12L17 9M17 9L12 6M17 9H7"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</button>
						</Tooltip>
					</div>
				</header>

				{/* Page Content */}
				<main className="page-content">
					<Outlet />
				</main>
			</div>
		</div>
	);
}

const metronicAdminStyles = `
	.metronic-admin-layout {
		display: flex;
		min-height: 100vh;
		background: #F9FAFB;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	/* Sidebar */
	.app-sidebar {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		width: ${SIDEBAR_WIDTH}px;
		background: linear-gradient(180deg, #1e1e2d 0%, #191924 100%);
		display: flex;
		flex-direction: column;
		z-index: 100;
		transition: width 0.3s ease;
		border-right: 1px solid rgba(255, 255, 255, 0.05);
	}

	.app-sidebar.sidebar-collapsed {
		width: ${SIDEBAR_COLLAPSED_WIDTH}px;
	}

	/* Sidebar Logo */
	.app-sidebar .flex.h-16 {
		position: relative;
	}

	/* Sidebar Toggle Button */
	.sidebar-toggle-btn {
		position: absolute;
		right: -12px;
		top: 50%;
		transform: translateY(-50%);
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: #2D2E3F;
		border: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 10;
		transition: all 0.2s;
		color: #9CA3AF;
	}

	.sidebar-toggle-btn:hover {
		background: #3D3E4F;
		color: #fff;
	}

	.toggle-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.3s;
	}

	.toggle-icon.collapsed {
		transform: rotate(180deg);
	}

	/* Sidebar Menu */
	.sidebar-menu-container {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 12px 0;
	}

	.sidebar-menu-container::-webkit-scrollbar {
		width: 4px;
	}

	.sidebar-menu-container::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}

	.menu-items {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 0 8px;
	}

	.menu-item-link {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 10px 12px;
		border: none;
		background: transparent;
		color: #9CA3AF;
		font-size: 13px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.menu-item-link:hover {
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
	}

	.menu-item-link.menu-item-active {
		background: linear-gradient(90deg, rgba(198, 40, 40, 0.9) 0%, rgba(239, 68, 68, 0.8) 100%);
		color: #fff;
		box-shadow: 0 4px 12px rgba(198, 40, 40, 0.3);
	}

	.menu-item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 20px;
		height: 20px;
	}

	.menu-item-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Menu Group */
	.menu-group {
		margin-bottom: 8px;
	}

	.menu-group-title {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #6B7280;
		padding: 8px 12px 4px;
	}

	.menu-group-children {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	/* Main Wrapper */
	.main-wrapper {
		flex: 1;
		margin-left: ${SIDEBAR_WIDTH}px;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		transition: margin-left 0.3s ease;
	}

	.main-wrapper.sidebar-collapsed {
		margin-left: ${SIDEBAR_COLLAPSED_WIDTH}px;
	}

	/* Header */
	.app-header {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
		padding: 0 24px;
		background: #fff;
		border-bottom: 1px solid #E5E7EB;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.mobile-menu-btn {
		display: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: none;
		background: transparent;
		color: #374151;
		cursor: pointer;
		border-radius: 8px;
	}

	.mobile-menu-btn:hover {
		background: #F3F4F6;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		border: 1px solid #E5E7EB;
		background: #fff;
		color: #374151;
		font-size: 13px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.back-btn:hover {
		border-color: #C62828;
		color: #C62828;
	}

	.page-title-container {
		display: flex;
		flex-direction: column;
	}

	.page-title {
		font-size: 16px;
		font-weight: 700;
		color: #111827;
		margin: 0;
		line-height: 1.2;
	}

	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		margin-top: 2px;
	}

	.breadcrumb-item {
		color: #6B7280;
		cursor: pointer;
		transition: color 0.2s;
	}

	.breadcrumb-item:hover {
		color: #C62828;
	}

	.breadcrumb-separator {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: #D1D5DB;
	}

	.breadcrumb-current {
		color: #111827;
		font-weight: 500;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.user-menu {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 6px 12px;
		border-radius: 10px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.user-menu:hover {
		background: #F3F4F6;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.user-name {
		font-size: 13px;
		font-weight: 600;
		color: #111827;
		line-height: 1.2;
	}

	.user-role {
		font-size: 11px;
		color: #6B7280;
	}

	.user-avatar {
		background: linear-gradient(135deg, #C62828 0%, #1565C0 100%);
		color: #fff;
		font-weight: 700;
		font-size: 14px;
	}

	.logout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		background: transparent;
		color: #6B7280;
		cursor: pointer;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.logout-btn:hover {
		background: #FEE2E2;
		color: #DC2626;
	}

	/* Page Content */
	.page-content {
		flex: 1;
		padding: 24px;
	}

	/* Mobile Overlay */
	.mobile-overlay {
		display: none;
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 90;
	}

	/* Mobile Sidebar */
	.mobile-sidebar {
		display: none;
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		width: 280px;
		background: linear-gradient(180deg, #1e1e2d 0%, #191924 100%);
		z-index: 95;
		transform: translateX(-100%);
		transition: transform 0.3s ease;
	}

	.mobile-sidebar.open {
		transform: translateX(0);
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.app-sidebar {
			transform: translateX(-100%);
		}

		.app-sidebar.mobile-open {
			transform: translateX(0);
		}

		.main-wrapper {
			margin-left: 0;
		}

		.main-wrapper.sidebar-collapsed {
			margin-left: 0;
		}

		.mobile-menu-btn {
			display: flex;
		}

		.mobile-overlay {
			display: block;
		}

		.mobile-sidebar {
			display: flex;
			flex-direction: column;
		}

		.sidebar-toggle-btn {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.app-header {
			padding: 0 16px;
		}

		.page-content {
			padding: 16px;
		}

		.user-info {
			display: none;
		}

		.back-btn span {
			display: none;
		}

		.back-btn {
			padding: 8px;
		}
	}

	/* Dark Mode Support */
	@media (prefers-color-scheme: dark) {
		.metronic-admin-layout {
			background: #0F0F12;
		}

		.app-header {
			background: #1A1A24;
			border-color: #2D2E3F;
		}

		.page-title {
			color: #F9FAFB;
		}

		.breadcrumb-item {
			color: #9CA3AF;
		}

		.breadcrumb-current {
			color: #F9FAFB;
		}

		.breadcrumb-separator {
			background: #4B5563;
		}

		.user-name {
			color: #F9FAFB;
		}

		.user-role {
			color: #9CA3AF;
		}

		.user-menu:hover {
			background: #2D2E3F;
		}

		.back-btn {
			background: transparent;
			border-color: #2D2E3F;
			color: #9CA3AF;
		}

		.back-btn:hover {
			border-color: #C62828;
			color: #EF4444;
		}

		.logout-btn:hover {
			background: rgba(220, 38, 38, 0.15);
			color: #EF4444;
		}
	}
`;
