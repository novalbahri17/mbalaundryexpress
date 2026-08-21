import {
	GiftOutlined,
	MailOutlined,
	PhoneOutlined,
	PlusOutlined,
	ShopOutlined,
	SunOutlined,
	MoonOutlined,
	TeamOutlined,
	WarningOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BarChart3, MessageSquare, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { getBranches } from "@/api/branches.api";
import { getJobs } from "@/api/jobs.api";
import { getPromos } from "@/api/promos.api";
import { getContactMessages, getPartnerships } from "@/api/settings.api";
import { formatCompact, formatDateTime } from "@/utils/format";
import { useThemeStore } from "@/store/themeStore";

type ActivityTone = "brand" | "blue" | "teal" | "amber";

interface ActivityItem {
	key: string;
	title: string;
	detail: string;
	timestamp: number;
	link: string;
	tone: ActivityTone;
}

const startOfToday = () => {
	const value = new Date();
	value.setHours(0, 0, 0, 0);
	return value.getTime();
};

const toTimestamp = (value?: string): number | null => {
	if (!value) return null;
	const ts = new Date(value).getTime();
	return Number.isNaN(ts) ? null : ts;
};

const getErrorMessage = (error: unknown): string | null => {
	if (!error) return null;
	if (error instanceof Error) return error.message;
	return "Terjadi kesalahan saat memuat data dashboard.";
};

// Stat Card Component - Compact style
function StatCard({
	label,
	value,
	icon,
	trend,
	link,
	actionLabel,
}: {
	label: string;
	value: number;
	icon: React.ReactNode;
	trend?: number;
	link?: string;
	actionLabel: string;
}) {
	const content = (
		<div className="stat-card">
			<div className="stat-card-top">
				<div className="stat-icon">{icon}</div>
				<div className="stat-info">
					<span className="stat-value">{formatCompact(value)}</span>
					<span className="stat-label">{label}</span>
				</div>
			</div>
			<div className="stat-card-bottom">
				{trend !== undefined && (
					<span className={`trend-pill ${trend >= 0 ? "pill-up" : "pill-down"}`}>
						{trend >= 0 ? "↑" : "↓"}
						{Math.abs(trend)}%
					</span>
				)}
				{link && (
					<Link to={link} className="stat-action">
						{actionLabel}
						<ArrowRight size={13} />
					</Link>
				)}
			</div>
		</div>
	);

	return content;
}

// Activity Item Component
function ActivityListItem({ item }: { item: ActivityItem }) {
	const toneMap: Record<ActivityTone, string> = {
		brand: "indicator-red",
		blue: "indicator-blue",
		teal: "indicator-teal",
		amber: "indicator-amber",
	};

	return (
		<Link to={item.link}>
			<motion.div whileHover={{ x: 2 }} className="activity-item">
				<div className={`indicator ${toneMap[item.tone]}`} />
				<div className="content">
					<p className="title">{item.title}</p>
					<p className="detail">{item.detail}</p>
				</div>
			</motion.div>
		</Link>
	);
}

// Notification Card Component
function NotificationCard({
	icon,
	count,
	label,
	description,
	color,
	link,
}: {
	icon: React.ReactNode;
	count: number;
	label: string;
	description: string;
	color: string;
	link?: string;
}) {
	const card = (
		<div className={`notification-card ${color}`}>
			<div className="notification-icon">{icon}</div>
			<div className="notification-content">
				<span className="count">{count}</span>
				<span className="label">{label}</span>
				<span className="description">{description}</span>
			</div>
		</div>
	);

	if (link) {
		return <Link to={link}>{card}</Link>;
	}
	return card;
}

// KPI Card Component
function KPICard({
	label,
	value,
	icon,
	accent,
	sparkline,
}: {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	accent?: "brand" | "info" | "teal" | "warning";
	sparkline?: number[];
}) {
	return (
		<div className="kpi-card">
			<div className="kpi-header">
				<span className="kpi-label">{label}</span>
				<div className={`kpi-icon kpi-icon-${accent || "default"}`}>{icon}</div>
			</div>
			<div className="kpi-body">
				<span className="kpi-value">{value}</span>
			</div>
			{sparkline && (
				<div className="sparkline">
					{sparkline.map((v, i) => (
						<div key={i} className="sparkline-bar" style={{ height: `${(v / Math.max(...sparkline)) * 100}%` }} />
					))}
				</div>
			)}
		</div>
	);
}

// Main Dashboard
export default function DashboardPage() {
	const { mode, toggle } = useThemeStore();
	const now = new Date();
	const dayString = now.toLocaleDateString("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	const {
		data: branchRes,
		isLoading: branchLoading,
		error: branchError,
	} = useQuery({
		queryKey: ["dash-branches"],
		queryFn: () => getBranches({ activeOnly: true, perPage: 200 }),
	});

	const {
		data: promoRes,
		isLoading: promoLoading,
		error: promoError,
	} = useQuery({
		queryKey: ["dash-promos"],
		queryFn: () => getPromos({ activeOnly: true, status: "published", perPage: 200 }),
	});

	const { data: jobs = [], isLoading: jobsLoading } = useQuery({
		queryKey: ["dash-jobs"],
		queryFn: () => getJobs({ openOnly: true }),
	});

	const { data: messages = [] } = useQuery({
		queryKey: ["dash-messages"],
		queryFn: getContactMessages,
	});

	const { data: partnerships = [] } = useQuery({
		queryKey: ["dash-partnerships"],
		queryFn: getPartnerships,
	});

	const branchItems = branchRes?.items ?? [];
	const promoItems = promoRes?.items ?? [];

	const unreadMessagesCount = messages.filter((item) => item.status === "new").length;
	const newPartnershipCount = partnerships.filter((item) => item.status === "new").length;

	const expiringPromo = useMemo(
		() =>
			promoItems.filter((promo) => {
				const diff = new Date(promo.end_date).getTime() - now.getTime();
				return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
			}),
		[now, promoItems],
	);

	const engagementEventTimestamps = useMemo(() => {
		const messageEvents = messages.map((item) => toTimestamp(item.created)).filter((v): v is number => v !== null);
		const partnershipEvents = partnerships
			.map((item) => toTimestamp(item.created))
			.filter((v): v is number => v !== null);
		return [...messageEvents, ...partnershipEvents];
	}, [messages, partnerships]);

	const weeklySeries = useMemo(() => {
		const dayMs = 24 * 60 * 60 * 1000;
		const todayStart = startOfToday();
		const points: Array<{ label: string; value: number }> = [];
		for (let offset = 6; offset >= 0; offset -= 1) {
			const rangeStart = todayStart - offset * dayMs;
			const rangeEnd = rangeStart + dayMs;
			const count = engagementEventTimestamps.filter((ts) => ts >= rangeStart && ts < rangeEnd).length;
			const label = new Date(rangeStart).toLocaleDateString("id-ID", { weekday: "short" }).slice(0, 3);
			points.push({ label, value: count });
		}
		return points;
	}, [engagementEventTimestamps]);

	const recentActivities = useMemo(() => {
		const items: ActivityItem[] = [];
		for (const message of messages.slice(0, 4)) {
			items.push({
				key: `message-${message.id}`,
				title: message.subject ? `Pesan baru: ${message.subject}` : `Pesan kontak dari ${message.name}`,
				detail: `${message.name} • ${formatDateTime(message.created ?? new Date())}`,
				timestamp: toTimestamp(message.created) ?? 0,
				link: "/admin/pesan",
				tone: "blue",
			});
		}
		for (const lead of partnerships.slice(0, 4)) {
			items.push({
				key: `lead-${lead.id}`,
				title: `Lead kemitraan: ${lead.name}`,
				detail: `${lead.company ?? "Individu"} • status ${lead.status}`,
				timestamp: toTimestamp(lead.created) ?? 0,
				link: "/admin/kemitraan",
				tone: "teal",
			});
		}
		for (const promo of expiringPromo.slice(0, 3)) {
			items.push({
				key: `promo-${promo.id}`,
				title: `Promo hampir berakhir: ${promo.title}`,
				detail: `Berakhir ${formatDateTime(promo.end_date)}`,
				timestamp: toTimestamp(promo.end_date) ?? 0,
				link: "/admin/promo",
				tone: "amber",
			});
		}
		return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
	}, [expiringPromo, messages, partnerships]);

	const errorMessages = [getErrorMessage(branchError), getErrorMessage(promoError)].filter((value): value is string =>
		Boolean(value),
	);

	const chartOptions = {
		chart: {
			type: "bar" as const,
			toolbar: { show: false },
			fontFamily: "Inter, sans-serif",
			foreColor: mode === "dark" ? "#8B8FA8" : "#9CA3AF",
		},
		plotOptions: {
			bar: {
				borderRadius: 8,
				horizontal: false,
				columnWidth: "40%",
				distributed: true,
			},
		},
		colors: ["#C62828", "#EF4444", "#F87171", "#FCA5A5", "#FEE2E2"],
		dataLabels: { enabled: false },
		xaxis: {
			categories: weeklySeries.map((d) => d.label),
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				style: { colors: mode === "dark" ? "#8B8FA8" : "#9CA3AF", fontSize: "12px" },
			},
		},
		yaxis: { show: false },
		grid: { show: false },
		tooltip: {
			theme: mode,
			style: { fontSize: "12px" },
		},
		legend: { show: false },
	};

	const chartSeries = [
		{
			name: "Aktivitas",
			data: weeklySeries.map((d) => d.value),
		},
	];

	return (
		<div className="dashboard-container">
			<style>{dashboardStyles}</style>

			{/* Page Header */}
			<div className="page-header">
				<div className="header-content">
					<h1 className="page-title">Dashboard Overview</h1>
					<p className="page-subtitle">{dayString}</p>
				</div>
				<div className="header-actions">
					<button className="btn-theme-toggle" onClick={toggle} title={mode === "dark" ? "Mode Terang" : "Mode Gelap"}>
						{mode === "dark" ? <SunOutlined /> : <MoonOutlined />}
					</button>
					<Link to="/admin/promo" className="btn-action-add">
						<PlusOutlined />
						<span>Tambah Promo</span>
					</Link>
				</div>
			</div>

			{/* Error Alerts */}
			<AnimatePresence>
				{errorMessages.length > 0 && (
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
						<div className="alert alert-error">
							<WarningOutlined />
							<span>Gagal memuat beberapa data: {errorMessages[0]}</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Notification Cards */}
			{expiringPromo.length > 0 && (
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
					<div className="notification-row">
						<NotificationCard
							icon={<WarningOutlined />}
							count={expiringPromo.length}
							label="Promo berakhir"
							description="Segera perpanjang atau hapus"
							color="warning"
							link="/admin/promo"
						/>
					</div>
				</motion.div>
			)}

			{(unreadMessagesCount > 0 || newPartnershipCount > 0) && (
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
					<div className="notification-row">
						{unreadMessagesCount > 0 && (
							<NotificationCard
								icon={<MailOutlined />}
								count={unreadMessagesCount}
								label="Pesan baru"
								description="Belum dibaca"
								color="info"
								link="/admin/pesan"
							/>
						)}
						{newPartnershipCount > 0 && (
							<NotificationCard
								icon={<PhoneOutlined />}
								count={newPartnershipCount}
								label="Lead baru"
								description="Pendaftaran kemitraan"
								color="success"
								link="/admin/kemitraan"
							/>
						)}
					</div>
				</motion.div>
			)}

			{/* Stats Grid */}
			<div className="stats-grid">
				<StatCard
					label="Cabang Aktif"
					value={branchItems.length}
					icon={<ShopOutlined />}
					trend={12}
					link="/admin/cabang"
					actionLabel="Kelola cabang"
				/>
				<StatCard
					label="Promo Aktif"
					value={promoItems.length}
					icon={<GiftOutlined />}
					trend={8}
					link="/admin/promo"
					actionLabel="Lihat promo"
				/>
				<StatCard
					label="Lowongan Terbuka"
					value={jobs.length}
					icon={<TeamOutlined />}
					link="/admin/loker"
					actionLabel="Lihat loker"
				/>
				<StatCard
					label="Pesan Masuk"
					value={messages.length}
					icon={<MailOutlined />}
					link="/admin/pesan"
					actionLabel="Buka pesan"
				/>
			</div>

			{/* Main Content Grid */}
			<div className="content-grid">
				{/* Chart Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="card chart-card"
				>
					<div className="card-header">
						<div className="card-title-group">
							<div className="card-icon card-icon-brand">
								<BarChart3 size={20} />
							</div>
							<div>
								<h3 className="card-title">Interaksi Mingguan</h3>
								<p className="card-subtitle">Aktivitas pesan dan lead kemitraan</p>
							</div>
						</div>
						<TrendingUp size={20} />
					</div>
					<div className="card-body">
						<ReactApexChart type="bar" options={chartOptions} series={chartSeries} height={160} />
					</div>
				</motion.div>

				{/* KPI Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.25 }}
					className="card kpi-card-wrapper"
				>
					<div className="card-header">
						<div className="card-title-group">
							<div className="card-icon card-icon-muted">
								<MessageSquare size={20} />
							</div>
							<div>
								<h3 className="card-title">Ringkasan</h3>
								<p className="card-subtitle">Statistik penting</p>
							</div>
						</div>
					</div>
					<div className="card-body kpi-grid">
						<KPICard
							label="Pesan Masuk"
							value={messages.length}
							icon={<MailOutlined />}
							accent="info"
							sparkline={[1, 2, 3, 2, 4, 3, 5]}
						/>
						<KPICard label="Lead Kemitraan" value={partnerships.length} icon={<PhoneOutlined />} accent="teal" />
						<KPICard label="Cabang" value={branchItems.length} icon={<ShopOutlined />} accent="brand" />
						<KPICard label="Promo" value={promoItems.length} icon={<GiftOutlined />} accent="warning" />
					</div>
				</motion.div>
			</div>

			{/* Recent Activity */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="card activity-card"
			>
				<div className="card-header">
					<div className="card-title-group">
						<div className="card-icon card-icon-muted">
							<MessageSquare size={20} />
						</div>
						<div>
							<h3 className="card-title">Aktivitas Terbaru</h3>
							<p className="card-subtitle">Interaksi dan notifikasi terbaru</p>
						</div>
					</div>
				</div>
				<div className="card-body">
					{recentActivities.length > 0 ? (
						<div className="activity-list">
							{recentActivities.slice(0, 8).map((item) => (
								<ActivityListItem key={item.key} item={item} />
							))}
						</div>
					) : (
						<div className="empty-state">
							<MessageSquare size={32} />
							<p>Belum ada aktivitas hari ini.</p>
							<p className="empty-sub">Aktivitas baru akan muncul setelah ada pesan, promo, atau lead masuk.</p>
						</div>
					)}
				</div>
			</motion.div>
		</div>
	);
}

const dashboardStyles = `
	/* ===== BASE ===== */
	.dashboard-container {
		max-width: 1400px;
		margin: 0 auto;
	}

	/* ===== PAGE HEADER ===== */
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
	}

	.page-title {
		font-size: 20px;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.2;
		letter-spacing: -0.02em;
	}

	.page-subtitle {
		font-size: 13px;
		color: var(--text-muted);
		margin: 3px 0 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* Theme Toggle — icon only */
	.btn-theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-sm);
		border: none;
		cursor: pointer;
		background: var(--bg-surface);
		color: var(--text-muted);
		transition: all 0.15s;
	}

	.btn-theme-toggle:hover {
		background: var(--border);
		color: var(--text-primary);
	}

	/* Action Button — Tambah Promo (solid brand blue) */
	.btn-action-add {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		font-size: 13px;
		font-weight: 600;
		border-radius: var(--radius-sm);
		border: none;
		cursor: pointer;
		transition: all 0.15s;
		text-decoration: none;
		background: var(--brand);
		color: var(--brand-text);
	}

	.btn-action-add:hover {
		background: var(--brand-hover);
		transform: translateY(-1px);
	}

	/* ===== ALERT ===== */
	.alert {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-weight: 500;
		margin-bottom: 16px;
	}

	.alert-error {
		background: var(--danger-bg);
		color: var(--danger);
	}

	/* ===== NOTIFICATION CARDS ===== */
	.notification-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 12px;
		margin-bottom: 20px;
	}

	.notification-card {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
		border-radius: var(--radius-card);
		cursor: pointer;
		transition: all 0.15s;
		text-decoration: none;
	}

	.notification-card:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-card-hover);
	}

	.notification-card.warning {
		background: var(--warning-bg);
	}

	.notification-card.warning .notification-icon {
		color: var(--warning);
		font-size: 20px;
	}

	.notification-card.info {
		background: var(--info-bg);
	}

	.notification-card.info .notification-icon {
		color: var(--brand);
		font-size: 20px;
	}

	.notification-card.success {
		background: var(--success-bg);
	}

	.notification-card.success .notification-icon {
		color: var(--success);
		font-size: 20px;
	}

	.notification-content {
		display: flex;
		flex-direction: column;
	}

	.notification-content .count {
		font-size: 22px;
		font-weight: 800;
		color: var(--text-primary);
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.notification-content .label {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-muted);
		margin-top: 3px;
	}

	.notification-content .description {
		font-size: 11px;
		color: var(--text-muted);
		opacity: 0.7;
		margin-top: 1px;
	}

	/* ===== STATS GRID — 4 columns, compact ===== */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 14px;
		margin-bottom: 20px;
	}

	@media (max-width: 1200px) {
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
	}

	@media (max-width: 640px) {
		.stats-grid { grid-template-columns: 1fr; }
	}

	/* Stat Card — compact, number dominant */
	.stat-card {
		background: var(--bg-card);
		border-radius: var(--radius-card);
		padding: 16px;
		box-shadow: var(--shadow-card);
		display: flex;
		flex-direction: column;
		gap: 12px;
		transition: all 0.15s;
	}

	.stat-card:hover {
		box-shadow: var(--shadow-card-hover);
		transform: translateY(-1px);
	}

	.stat-card-top {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.stat-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--brand);
		flex-shrink: 0;
	}

	.stat-icon svg {
		color: var(--brand-text);
	}

	.stat-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.stat-value {
		font-size: 22px;
		font-weight: 800;
		color: var(--text-primary);
		line-height: 1;
		letter-spacing: -0.03em;
	}

	.stat-label {
		font-size: 12px;
		color: var(--text-muted);
		font-weight: 500;
	}

	.stat-card-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 10px;
		border-top: 1px solid var(--border);
	}

	/* Trend Pill */
	.trend-pill {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 3px 8px;
		border-radius: 999px;
		font-size: 11px;
		font-weight: 700;
	}

	.trend-pill.pill-up {
		background: var(--success-bg);
		color: var(--success);
	}

	.trend-pill.pill-down {
		background: var(--brand-bg);
		color: var(--danger);
	}

	/* Stat Action Link */
	.stat-action {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 12px;
		font-weight: 600;
		color: var(--brand);
		text-decoration: none;
		transition: color 0.15s;
	}

	.stat-action:hover {
		color: var(--brand-hover);
	}

	/* ===== CONTENT GRID — chart 8col + summary 4col ===== */
	.content-grid {
		display: grid;
		grid-template-columns: 8fr 4fr;
		gap: 16px;
		margin-bottom: 20px;
	}

	@media (max-width: 1024px) {
		.content-grid { grid-template-columns: 1fr; }
	}

	/* ===== CARD BASE ===== */
	.card {
		background: var(--bg-card);
		border-radius: var(--radius-card);
		border: none;
		box-shadow: var(--shadow-card);
		overflow: hidden;
	}

	.card .card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 18px;
		border-bottom: 1px solid var(--border);
	}

	.card-title-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.card-icon {
		width: 36px;
		height: 36px;
		border-radius: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-icon svg {
		color: var(--brand-text);
	}

	/* Brand blue icon */
	.card-icon-brand {
		background: var(--brand);
	}

	/* Muted icon for summary/activity headers */
	.card-icon-muted {
		background: var(--bg-surface);
	}

	.card-icon-muted svg {
		color: var(--text-muted) !important;
	}

	.card .card-title {
		font-size: 14px;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.card .card-subtitle {
		font-size: 11px;
		color: var(--text-muted);
		margin: 2px 0 0;
	}

	.card .card-header svg {
		color: var(--text-muted);
		opacity: 0.5;
	}

	.card .card-body {
		padding: 16px 18px;
	}

	/* ===== KPI GRID — 2x2 compact ===== */
	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}

	.kpi-card {
		padding: 12px;
		border-radius: var(--radius-sm);
		background: var(--bg-surface);
	}

	.kpi-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 6px;
	}

	.kpi-label {
		font-size: 11px;
		color: var(--text-muted);
		font-weight: 600;
		letter-spacing: 0.03em;
	}

	.kpi-icon {
		font-size: 13px;
	}

	.kpi-icon svg {
		color: var(--text-muted);
	}

	.kpi-icon-default svg { color: var(--text-muted); }
	.kpi-icon-brand svg { color: var(--brand); }
	.kpi-icon-info svg { color: var(--info); }
	.kpi-icon-teal svg { color: var(--accent-teal); }
	.kpi-icon-warning svg { color: var(--warning); }

	.kpi-body {
		display: flex;
		align-items: baseline;
	}

	.kpi-value {
		font-size: 20px;
		font-weight: 800;
		color: var(--text-primary);
		letter-spacing: -0.03em;
	}

	.sparkline {
		display: flex;
		align-items: flex-end;
		gap: 2px;
		height: 16px;
		margin-top: 6px;
	}

	.sparkline-bar {
		flex: 1;
		background: var(--brand);
		border-radius: 2px;
		min-height: 2px;
		opacity: 0.7;
	}

	/* ===== ACTIVITY CARD ===== */
	.activity-card .card-body {
		padding: 0;
	}

	.activity-list {
		display: flex;
		flex-direction: column;
	}

	.activity-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 18px;
		border-bottom: 1px solid var(--border);
		transition: background 0.15s;
		cursor: pointer;
	}

	.activity-item:last-child {
		border-bottom: none;
	}

	.activity-item:hover {
		background: var(--bg-surface);
	}

	.activity-item .indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.activity-item .indicator.indicator-red { background: var(--danger); }
	.activity-item .indicator.indicator-blue { background: var(--brand); }
	.activity-item .indicator.indicator-teal { background: var(--accent-teal); }
	.activity-item .indicator.indicator-amber { background: var(--warning); }

	.activity-item .content {
		flex: 1;
		min-width: 0;
	}

	.activity-item .title {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.activity-item .detail {
		font-size: 11px;
		color: var(--text-muted);
		margin: 2px 0 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ===== EMPTY STATE ===== */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 28px 20px;
		text-align: center;
	}

	.empty-state svg {
		color: var(--border);
		margin-bottom: 6px;
	}

	.empty-state p {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-muted);
	}

	.empty-state .empty-sub {
		font-size: 12px;
		font-weight: 400;
		color: var(--text-muted);
		opacity: 0.75;
		margin-top: 4px;
	}

	/* ===== DARK MODE ===== */
	/* CSS variables are set globally via :root.dark in tokens.css */
	/* Dashboard uses var() references — dark mode applies automatically */

	.notification-card.warning { background: var(--warning-bg); }
	.notification-card.info { background: var(--info-bg); }
	.notification-card.success { background: var(--success-bg); }

	.kpi-icon-brand svg { color: var(--brand) !important; }
	.kpi-icon-info svg { color: var(--info) !important; }
	.kpi-icon-teal svg { color: var(--accent-teal) !important; }
	.kpi-icon-warning svg { color: var(--warning) !important; }

	.trend-pill.pill-up { background: var(--success-bg); color: var(--success); }
	.trend-pill.pill-down { background: var(--danger-bg); color: var(--danger); }

	.alert-error { background: var(--danger-bg); color: var(--danger); }
`;
