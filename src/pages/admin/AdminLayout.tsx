import { DashboardOutlined, LockOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Dropdown } from "antd";
import {
	Activity,
	BarChart3,
	CalendarClock,
	GitBranch,
	Image,
	LucideBookOpen,
	Megaphone,
	MessageSquareMore,
	Settings2,
	ShieldCheck,
	Star,
	Type,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AdminFavicon } from "@/components/admin/AdminFavicon";
import NotificationCenter from "@/components/admin/NotificationCenter";
import { useBranding } from "@/hooks/useBranding";
import { useUserActions, useUserInfo } from "@/store/userStore";

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
	{ key: "/admin/jadwal", label: "Jadwal Shift", group: "group-operasional" },
	{ key: "/admin/loker", label: "Lowongan Kerja", group: "group-operasional" },
	{ key: "/admin/promo", label: "Promo", group: "group-konten" },
	{ key: "/admin/blog", label: "Blog", group: "group-konten" },
	{ key: "/admin/testimoni", label: "Testimoni", group: "group-konten" },
	{ key: "/admin/faq", label: "FAQ", group: "group-konten" },
	{ key: "/admin/galeri", label: "Galeri", group: "group-konten" },
	{ key: "/admin/marketing", label: "Marketing", group: "group-konten" },
	{ key: "/admin/kemitraan", label: "Kemitraan", group: "group-komunikasi" },
	{ key: "/admin/pesan", label: "Pesan", group: "group-komunikasi" },
	// Harus di atas "/admin/pengaturan" supaya pencocokan path terpanjang
	// memilih menu Branding saat halaman /admin/pengaturan/branding dibuka.
	{ key: "/admin/pengaturan/branding", label: "Logo & Branding", group: "group-komunikasi" },
	{ key: "/admin/pengaturan/teks-landing", label: "Teks Landing", group: "group-komunikasi" },
	{ key: "/admin/pengaturan", label: "Pengaturan", group: "group-komunikasi" },
	{ key: "/admin/logs", label: "Log & Aktivitas", group: "group-komunikasi" },
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
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C62828]">
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
				<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C62828]">
					<span className="text-sm font-bold text-white">M</span>
				</div>
			)}
			<div className="flex flex-col overflow-hidden">
				<span className="text-sm font-bold text-white truncate">{branding?.site_title || "MBA Admin"}</span>
				<span className="truncate text-[10px] text-white/70">Panel Admin</span>
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
	const items = useMemo<MenuProps["items"]>(() => {
		const dashboardItem = {
			key: dashboardMenuEntry.key,
			label: dashboardMenuEntry.label,
			icon: <DashboardOutlined />,
			className: selectedKey === dashboardMenuEntry.key ? "menu-item-active" : "",
		};

		// Bandingkan dengan `selectedKey` (hasil pencocokan path terpanjang),
		// bukan `startsWith`. Dengan `startsWith`, halaman
		// /admin/pengaturan/branding juga cocok dengan "/admin/pengaturan"
		// sehingga dua menu tersorot sekaligus.
		if (collapsed) {
			return [
				dashboardItem,
				...menuEntries.map((entry) => ({
					key: entry.key,
					label: entry.label,
					icon: getMenuIcon(entry.key),
					className: selectedKey === entry.key ? "menu-item-active" : "",
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
					className: selectedKey === entry.key ? "menu-item-active" : "",
				})),
		}));

		return [dashboardItem, ...groups];
	}, [collapsed, selectedKey]);

	const onClick: MenuProps["onClick"] = ({ key }) => {
		onSelect(key);
	};

	return (
		<div className="sidebar-menu-container">
			<div className="menu-items">
				{items?.map((item: any) => {
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
		case "/admin/jadwal":
			return <CalendarClock size={18} />;
		case "/admin/loker":
			return <Users size={18} />;
		case "/admin/promo":
			return <Megaphone size={18} />;
		case "/admin/blog":
			return <LucideBookOpen size={18} />;
		case "/admin/testimoni":
			return <Star size={18} />;
		case "/admin/faq":
			return <SettingOutlined style={{ fontSize: 18 }} />;
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
		case "/admin/pengaturan/branding":
			return <Image size={18} />;
		case "/admin/pengaturan/teks-landing":
			return <Type size={18} />;
		case "/admin/logs":
			return <Activity size={18} />;
		default:
			return <SettingOutlined />;
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
		() =>
			// Cocokkan path terpanjang: /admin/pengaturan/branding harus memilih
			// menu Branding, bukan menu Pengaturan.
			[...menuEntries]
				.filter((item) => location.pathname === item.key || location.pathname.startsWith(`${item.key}/`))
				.sort((a, b) => b.key.length - a.key.length)[0]?.key ?? dashboardMenuEntry.key,
		[location.pathname],
	);

	const pageTitle = menuByKey.get(selected)?.label ?? "Dashboard";

	const goTo = (key: string) => {
		navigate(key);
		setMobileOpen(false);
	};

	const handleLogout = () => {
		clearUserInfoAndToken();
		toast.success("Logout berhasil. Sampai jumpa lagi.");
		navigate("/admin/login", { replace: true });
	};

	// User dropdown menu
	const userMenuItems: MenuProps["items"] = [
		{
			key: "security",
			label: "Keamanan",
			icon: <LockOutlined />,
			onClick: () => navigate("/admin/pengaturan?tab=keamanan"),
		},
		{
			type: "divider",
		},
		{
			key: "logout",
			label: "Logout",
			icon: <LogoutOutlined />,
			danger: true,
			onClick: handleLogout,
		},
	];

	// Get display name from user
	const displayName = user.username ?? user.email?.split("@")[0] ?? "Admin";
	const displayEmail = user.email ?? "";
	const avatarInitial = (user.username ?? user.email ?? "A").slice(0, 1).toUpperCase();

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
				{/* CLEAN NAVBAR */}
				<header className="app-header">
					<div className="header-left">
						<button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
								<path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</button>

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

						<Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
							<button className="user-dropdown-trigger">
								<Avatar size={32} className="user-avatar">
									{avatarInitial}
								</Avatar>
								<div className="user-dropdown-info">
									<span className="user-dropdown-name">{displayName}</span>
									{displayEmail && <span className="user-dropdown-email">{displayEmail}</span>}
								</div>
							</button>
						</Dropdown>
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
		background: var(--bg-app);
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	/* ===== SIDEBAR TOKENS ===== */
	:root {
		--sidebar-bg: #1b1b26;
		--sidebar-border: rgba(255, 255, 255, 0.05);
		--sidebar-scrollbar: rgba(255, 255, 255, 0.1);
		--sidebar-text: #9CA3AF;
		--sidebar-text-active: #ffffff;
		--mobile-overlay: rgba(0, 0, 0, 0.5);
	}

	:root.dark {
		--sidebar-border: rgba(255, 255, 255, 0.08);
		--sidebar-text: #d1d5db;
		--sidebar-text-active: #ffffff;
		--mobile-overlay: rgba(0, 0, 0, 0.7);
	}

	/* ===== Sidebar */
	.app-sidebar {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		width: ${SIDEBAR_WIDTH}px;
		background: var(--sidebar-bg);
		display: flex;
		flex-direction: column;
		z-index: 100;
		transition: width 0.3s ease;
		border-right: 1px solid var(--sidebar-border);
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
		background: var(--bg-surface);
		border: 1px solid var(--border);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 10;
		transition: all 0.2s;
		color: var(--text-muted);
	}

	.sidebar-toggle-btn:hover {
		background: var(--border);
		color: var(--text-primary);
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
		background: var(--sidebar-scrollbar);
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
		color: var(--sidebar-text);
		font-size: 13px;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: left;
	}

	.menu-item-link:hover {
		background: rgba(255, 255, 255, 0.05);
		color: var(--sidebar-text-active);
	}

	.menu-item-link.menu-item-active {
		background: var(--brand);
		color: var(--sidebar-text-active);
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
		color: var(--sidebar-text);
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
		min-width: 0;
		display: flex;
		flex-direction: column;
		transition: margin-left 0.3s ease;
	}

	.main-wrapper.sidebar-collapsed {
		margin-left: ${SIDEBAR_COLLAPSED_WIDTH}px;
	}

	/* ===== CLEAN HEADER ===== */
	.app-header {
		position: sticky;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
		padding: 0 24px;
		background: var(--bg-card);
		border-bottom: 1px solid var(--border);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
		min-width: 0;
		flex: 1 1 auto;
		overflow: hidden;
	}

	.mobile-menu-btn {
		display: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		border-radius: 8px;
	}

	.mobile-menu-btn:hover {
		background: var(--bg-surface);
	}

	.page-title-container {
		display: flex;
		flex-direction: column;
	}

	.page-title {
		font-size: 16px;
		font-weight: 700;
		color: var(--text-primary);
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
		color: var(--text-muted);
		cursor: pointer;
		transition: color 0.2s;
	}

	.breadcrumb-item:hover {
		color: var(--brand);
	}

	.breadcrumb-separator {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--border-strong);
	}

	.breadcrumb-current {
		color: var(--text-primary);
		font-weight: 500;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 16px;
		min-width: 0;
		flex: 0 0 auto;
	}

	/* Tombol ikon di header (notifikasi) */
	.header-icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 38px;
		height: 38px;
		border: none;
		border-radius: 10px;
		background: transparent;
		color: var(--text-secondary);
		cursor: pointer;
		transition: background 0.2s, color 0.2s;
	}

	.header-icon-btn:hover {
		background: var(--bg-surface);
		color: var(--text-primary);
	}

	.header-icon-btn .ant-badge {
		display: inline-flex;
		line-height: 1;
	}

	/* User Dropdown */
	.user-dropdown-trigger {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 6px 10px;
		border: none;
		background: transparent;
		border-radius: 10px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.user-dropdown-trigger:hover {
		background: var(--bg-surface);
	}

	.user-avatar {
		background: var(--brand);
		color: var(--brand-text);
		font-weight: 700;
		font-size: 13px;
		flex-shrink: 0;
	}

	.user-dropdown-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.user-dropdown-name {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-primary);
		line-height: 1.2;
	}

	.user-dropdown-email {
		font-size: 11px;
		color: var(--text-muted);
		line-height: 1.2;
		max-width: 160px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Page Content */
	.page-content {
		flex: 1;
		min-width: 0;
		padding: 24px;
	}

	/* Mobile Overlay */
	.mobile-overlay {
		display: none;
		position: fixed;
		inset: 0;
		background: var(--mobile-overlay);
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
		background: var(--sidebar-bg);
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

		.user-dropdown-info {
			display: none;
		}

		.header-right {
			gap: 12px;
		}

		.page-header {
			flex-wrap: wrap;
			gap: 12px;
		}

		.header-actions {
			flex-wrap: wrap;
		}
	}

	/* Dark Mode */
	.dark .sidebar-toggle-btn {
		background: var(--bg-surface);
		color: var(--text-muted);
	}

	.dark .sidebar-toggle-btn:hover {
		background: var(--border);
		color: var(--text-primary);
	}

	.dark .menu-item-link:hover {
		color: var(--brand-text);
	}

	.dark .menu-item-link.menu-item-active {
		color: var(--brand-text);
	}

	.dark .user-avatar {
		background: var(--brand);
		color: var(--brand-text);
	}

	.dark .user-dropdown-trigger:hover {
		background: var(--bg-surface);
	}
`;
