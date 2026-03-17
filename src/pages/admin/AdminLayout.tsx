import {
	ApartmentOutlined,
	AppstoreOutlined,
	ArrowLeftOutlined,
	BellOutlined,
	CrownOutlined,
	DashboardOutlined,
	DownOutlined,
	GiftOutlined,
	HomeOutlined,
	LeftOutlined,
	LogoutOutlined,
	MailOutlined,
	MenuOutlined,
	MessageOutlined,
	PictureOutlined,
	QuestionCircleOutlined,
	ReadOutlined,
	RightOutlined,
	SettingOutlined,
	StarOutlined,
	TeamOutlined,
	UpOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Button, Drawer, Layout, Menu, Typography } from "antd";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUserActions, useUserInfo } from "@/store/userStore";
import { useBranding } from "@/hooks/useBranding";
import { DynamicFavicon } from "@/components/public/layout/DynamicFavicon";
import { AdminFavicon } from "@/components/admin/AdminFavicon";

const { Header, Content, Sider } = Layout;
const SIDEBAR_WIDTH = 272;
const SIDEBAR_COLLAPSED_WIDTH = 84;

type MenuGroupKey = "group-operasional" | "group-konten" | "group-program" | "group-komunikasi";

interface AdminMenuEntry {
	key: string;
	icon: ReactNode;
	label: string;
	group: MenuGroupKey;
}

interface MenuGroupConfig {
	key: MenuGroupKey;
	label: string;
	icon: ReactNode;
}

const menuGroups: MenuGroupConfig[] = [
	{ key: "group-operasional", label: "Operasional", icon: <ApartmentOutlined /> },
	{ key: "group-konten", label: "Konten & Promo", icon: <AppstoreOutlined /> },
	{ key: "group-program", label: "Program Pelanggan", icon: <CrownOutlined /> },
	{ key: "group-komunikasi", label: "Komunikasi & Sistem", icon: <MessageOutlined /> },
];

const dashboardMenuEntry: Pick<AdminMenuEntry, "key" | "icon" | "label"> = {
	key: "/admin/dashboard",
	icon: <DashboardOutlined />,
	label: "Dashboard",
};

const menuEntries: AdminMenuEntry[] = [
	{ key: "/admin/cabang", icon: <ApartmentOutlined />, label: "Cabang", group: "group-operasional" },
	{ key: "/admin/loker", icon: <TeamOutlined />, label: "Loker", group: "group-operasional" },
	{ key: "/admin/promo", icon: <GiftOutlined />, label: "Promo", group: "group-konten" },
	{ key: "/admin/blog", icon: <ReadOutlined />, label: "Blog", group: "group-konten" },
	{ key: "/admin/testimoni", icon: <StarOutlined />, label: "Testimoni", group: "group-konten" },
	{ key: "/admin/faq", icon: <QuestionCircleOutlined />, label: "FAQ", group: "group-konten" },
	{ key: "/admin/galeri", icon: <PictureOutlined />, label: "Galeri", group: "group-konten" },
	{ key: "/admin/subscribers", icon: <BellOutlined />, label: "Subscribers", group: "group-program" },
	{ key: "/admin/kemitraan", icon: <HomeOutlined />, label: "Kemitraan", group: "group-komunikasi" },
	{ key: "/admin/pesan", icon: <MailOutlined />, label: "Pesan", group: "group-komunikasi" },
	{ key: "/admin/pengaturan", icon: <SettingOutlined />, label: "Pengaturan", group: "group-komunikasi" },
	{ key: "/admin/pengaturan/branding", icon: <SettingOutlined />, label: "Branding", group: "group-komunikasi" },
];

const menuByKey = new Map<string, { label: string; group?: MenuGroupKey }>([
	[dashboardMenuEntry.key, { label: dashboardMenuEntry.label }],
	...menuEntries.map((item) => [item.key, { label: item.label, group: item.group }] as const),
]);
const sortedMenuEntries = [dashboardMenuEntry, ...menuEntries].sort((a, b) => b.key.length - a.key.length);

function SidebarMenu({
	selectedKey,
	openKeys,
	collapsed,
	onSelect,
	onOpenChange,
}: {
	selectedKey: string;
	openKeys: string[];
	collapsed: boolean;
	onSelect: (key: string) => void;
	onOpenChange: (keys: string[]) => void;
}) {
	const items = useMemo<MenuProps["items"]>(() => {
		if (collapsed) {
			return [
				{
					key: dashboardMenuEntry.key,
					icon: dashboardMenuEntry.icon,
					label: dashboardMenuEntry.label,
				},
				...menuEntries.map((entry) => ({
					key: entry.key,
					icon: entry.icon,
					label: entry.label,
				})),
			];
		}

		return [
			{
				key: dashboardMenuEntry.key,
				icon: dashboardMenuEntry.icon,
				label: dashboardMenuEntry.label,
			},
			...menuGroups.map((group) => ({
				key: group.key,
				icon: group.icon,
				label: group.label,
				children: menuEntries
					.filter((entry) => entry.group === group.key)
					.map((entry) => ({
						key: entry.key,
						icon: entry.icon,
						label: entry.label,
					})),
			})),
		];
	}, [collapsed]);

	return (
		<Menu
			mode="inline"
			theme="dark"
			inlineCollapsed={collapsed}
			selectedKeys={[selectedKey]}
			openKeys={openKeys}
			onOpenChange={(keys) => onOpenChange(keys as string[])}
			onClick={({ key }) => onSelect(String(key))}
			items={items}
			expandIcon={({ isOpen }) => (
				<span className="text-[10px] text-slate-400">{isOpen ? <UpOutlined /> : <DownOutlined />}</span>
			)}
			className="mba-admin-menu border-none bg-transparent"
		/>
	);
}

export default function AdminLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const user = useUserInfo();
	const { clearUserInfoAndToken } = useUserActions();

	const [mobileOpen, setMobileOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const selected = useMemo(
		() => sortedMenuEntries.find((item) => location.pathname.startsWith(item.key))?.key ?? "/admin/dashboard",
		[location.pathname],
	);

	const selectedGroup = menuByKey.get(selected)?.group;
	const [openKeys, setOpenKeys] = useState<string[]>(selectedGroup ? [selectedGroup] : []);

	useEffect(() => {
		if (sidebarCollapsed) {
			setOpenKeys([]);
			return;
		}
		setOpenKeys(selectedGroup ? [selectedGroup] : []);
	}, [selectedGroup, sidebarCollapsed]);

	const pageTitle = menuByKey.get(selected)?.label ?? "Dashboard";
	const isDashboard = selected === "/admin/dashboard";

	const goTo = (key: string) => {
		navigate(key);
		setMobileOpen(false);
	};

	const handleOpenChange = (nextKeys: string[]) => {
		if (sidebarCollapsed) return;
		const latestOpened = nextKeys.find((key) => !openKeys.includes(key));
		setOpenKeys(latestOpened ? [latestOpened] : []);
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

	// Admin drawer title component with branding
	function AdminDrawerTitle() {
		const { data: branding } = useBranding();
		return (
			<span className="flex items-center gap-2 font-bold text-white">
				{branding?.logo_url ? (
					<img 
						src={branding.logo_url} 
						alt="Logo" 
						className="h-6 w-6 object-contain rounded"
					/>
				) : (
					<span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-ruby-600 to-sapphire-500">
						<span className="h-2 w-2 rounded-full border-2 border-white" />
					</span>
				)}
				{branding?.site_title || "MBA Admin"}
			</span>
		);
	}

	// Admin sidebar logo component
	function AdminSidebarLogo({ collapsed }: { collapsed: boolean }) {
		const { data: branding } = useBranding();
		return (
			<Typography.Text className="flex items-center gap-3 text-[1.06rem] font-bold tracking-tight text-white">
				{branding?.logo_url ? (
					<img 
						src={branding.logo_url} 
						alt="Logo" 
						className="h-8 w-8 object-contain rounded"
					/>
				) : (
					<span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-ruby-600 to-sapphire-500 text-white shadow">
						<span className="h-2.5 w-2.5 rounded-full border-2 border-white" />
					</span>
				)}
				<span className={`${collapsed ? "hidden" : "inline"}`}>
					{branding?.site_title ? `${branding.site_title} Admin` : "MBA Admin"}
				</span>
			</Typography.Text>
		);
	}

	return (
		<>
			<DynamicFavicon />
			<AdminFavicon />
			<Layout className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
			<Sider
				width={SIDEBAR_WIDTH}
				collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
				collapsed={sidebarCollapsed}
				trigger={null}
				breakpoint="lg"
				className="hidden border-r border-[#272738] !bg-[#1e1e2d] lg:!block"
			>
				<div
					className={`flex h-[70px] items-center border-b border-white/10 ${
						sidebarCollapsed ? "justify-center px-0" : "px-5"
					}`}
				>
					<AdminSidebarLogo collapsed={sidebarCollapsed} />
				</div>

				<div className="h-[calc(100vh-70px)] overflow-y-auto p-3">
					<p
						className={`mb-2 px-3 pt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 ${
							sidebarCollapsed ? "hidden" : "block"
						}`}
					>
						Navigasi Admin
					</p>
					<SidebarMenu
						selectedKey={selected}
						openKeys={openKeys}
						collapsed={sidebarCollapsed}
						onSelect={goTo}
						onOpenChange={handleOpenChange}
					/>
				</div>
			</Sider>

			<div
				className="fixed top-[80px] z-40 hidden h-[54px] w-[18px] rounded-r-md border border-l-0 border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900/70 lg:block"
				style={{ left: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
			/>

			<button
				type="button"
				aria-label={sidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
				title={sidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar (Maximize Workspace)"}
				onClick={() => setSidebarCollapsed((value) => !value)}
				className="fixed top-[87px] z-50 hidden h-10 w-7 -translate-x-1/2 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 shadow-[0_8px_20px_rgba(15,23,42,0.14)] transition-all duration-300 hover:text-ruby-600 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-300 dark:hover:text-ruby-400 lg:flex"
				style={{ left: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
			>
				{sidebarCollapsed ? <RightOutlined /> : <LeftOutlined />}
			</button>

			<Layout className="bg-transparent">
				<Header className="sticky top-0 z-40 flex h-[70px] items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-8 dark:border-neutral-700 dark:bg-neutral-900/70">
					<div className="flex items-center gap-3 md:gap-4">
						<Button
							type="text"
							icon={<MenuOutlined />}
							onClick={() => setMobileOpen(true)}
							className="lg:!hidden border-none bg-neutral-200 text-neutral-600 shadow-none dark:bg-neutral-700 dark:text-neutral-300"
						/>

						{!isDashboard ? (
							<Button
								type="text"
								icon={<ArrowLeftOutlined />}
								onClick={handleBack}
								className="border border-neutral-200 text-neutral-600 hover:border-ruby-300 hover:text-ruby-600 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-ruby-500/30 dark:hover:text-ruby-400"
							>
								Kembali
							</Button>
						) : null}

						<div className="hidden md:block">
							<h1 className="m-0 text-[1.15rem] font-bold leading-tight text-neutral-900 dark:text-white">
								{pageTitle}
							</h1>
							<div className="mt-0.5 flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
								<button
									type="button"
									className="cursor-pointer hover:text-ruby-600 dark:hover:text-ruby-400"
									onClick={() => navigate("/admin/dashboard")}
								>
									Dashboard
								</button>
								<span className="h-1 w-1 rounded-full bg-neutral-400/40" />
								<span className="text-neutral-900 dark:text-white">{pageTitle}</span>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2 md:gap-4">
						<Button
							type="text"
							icon={<BellOutlined className="text-base" />}
							onClick={() => toast("Tidak ada notifikasi baru", { icon: "i" })}
							className="hidden h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-50 hover:text-ruby-600 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-ruby-400 md:!inline-flex"
						/>

						<div className="flex cursor-pointer items-center gap-3 rounded-lg px-1.5 py-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700">
							<div className="hidden text-right md:block">
								<p className="mb-1 text-[13px] leading-none font-bold text-neutral-900 dark:text-white">
									{user.username ?? user.email ?? "Admin"}
								</p>
								<p className="text-[11px] leading-none font-semibold text-neutral-600 dark:text-neutral-300">
									Administrator
								</p>
							</div>
							<Avatar size={36} className="bg-ruby-50 font-bold text-ruby-600 dark:bg-ruby-500/10 dark:text-ruby-400">
								{(user.username ?? user.email ?? "A").slice(0, 1).toUpperCase()}
							</Avatar>
						</div>

						<div className="mx-1 hidden h-6 w-px bg-neutral-200 dark:bg-neutral-700 md:block" />

						<Button
							type="text"
							icon={<LogoutOutlined />}
							onClick={handleLogout}
							className="text-neutral-600 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-neutral-300 dark:hover:bg-rose-500/10"
						/>
					</div>
				</Header>

				<Content className="relative p-4 md:p-8">
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(198,40,40,0.06),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(21,101,192,0.06),transparent_38%)] dark:bg-[radial-gradient(circle_at_10%_0%,rgba(239,83,80,0.12),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(66,165,245,0.1),transparent_32%)]" />
					<Outlet />
				</Content>
			</Layout>

			<Drawer
				title={<AdminDrawerTitle />}
				placement="left"
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				width={280}
				className="lg:!hidden"
				rootClassName="lg:!hidden"
				styles={{
					header: {
						borderBottom: "1px solid rgba(255,255,255,0.08)",
						background: "#1e1e2d",
					},
					body: { padding: "12px 8px", background: "#1e1e2d" },
				}}
			>
				<SidebarMenu
					selectedKey={selected}
					openKeys={openKeys}
					collapsed={false}
					onSelect={goTo}
					onOpenChange={handleOpenChange}
				/>
			</Drawer>
		</Layout>
		</>
	);
}
