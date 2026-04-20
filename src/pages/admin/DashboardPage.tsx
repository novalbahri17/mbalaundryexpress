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

// Stat Card Component - Metronic Style
function StatCard({
	label,
	value,
	icon,
	color,
	trend,
	link,
}: {
	label: string;
	value: number;
	icon: React.ReactNode;
	color: "primary" | "success" | "warning" | "info";
	trend?: number;
	link?: string;
}) {
	const colorMap = {
		primary: {
			bg: "icon-gradient-red",
		},
		success: {
			bg: "icon-gradient-emerald",
		},
		warning: {
			bg: "icon-gradient-amber",
		},
		info: {
			bg: "icon-gradient-blue",
		},
	};

	const c = colorMap[color];

	const content = (
		<div className="card stat-card">
			<div className="card-header">
				<div className={`icon-container ${c.bg}`}>{icon}</div>
				<div className="content">
					<span className="value">{formatCompact(value)}</span>
					<span className="label">{label}</span>
				</div>
			</div>
			<div className="card-footer">
				{trend !== undefined && (
					<span className={`trend-pill ${trend >= 0 ? "pill-up" : "pill-down"}`}>
						{trend >= 0 ? "↑" : "↓"}
						{Math.abs(trend)}% dari kemarin
					</span>
				)}
				{link && (
					<span className="view-link">
						<span>Lihat detail</span>
						<ArrowRight size={14} />
					</span>
				)}
			</div>
		</div>
	);

	return link ? (
		<Link to={link} className="stat-card-link">
			{content}
		</Link>
	) : (
		content
	);
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
	sparkline,
}: {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	sparkline?: number[];
}) {
	return (
		<div className="kpi-card">
			<div className="kpi-header">
				<span className="kpi-label">{label}</span>
				<div className="kpi-icon">{icon}</div>
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
		<div className={`dashboard-container ${mode === "dark" ? "dashboard-dark" : ""}`}>
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
					color="info"
					trend={12}
					link="/admin/cabang"
				/>
				<StatCard
					label="Promo Aktif"
					value={promoItems.length}
					icon={<GiftOutlined />}
					color="primary"
					trend={8}
					link="/admin/promo"
				/>
				<StatCard
					label="Lowongan Terbuka"
					value={jobs.length}
					icon={<TeamOutlined />}
					color="success"
					link="/admin/loker"
				/>
				<StatCard
					label="Pesan Masuk"
					value={messages.length}
					icon={<MailOutlined />}
					color="warning"
					link="/admin/pesan"
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
							<div className="card-icon card-icon-red">
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
						<ReactApexChart type="bar" options={chartOptions} series={chartSeries} height={200} />
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
							<div className="card-icon card-icon-blue">
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
							sparkline={[1, 2, 3, 2, 4, 3, 5]}
						/>
						<KPICard label="Lead Kemitraan" value={partnerships.length} icon={<PhoneOutlined />} />
						<KPICard label="Cabang" value={branchItems.length} icon={<ShopOutlined />} />
						<KPICard label="Promo" value={promoItems.length} icon={<GiftOutlined />} />
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
						<div className="card-icon card-icon-violet">
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
							<MessageSquare size={36} />
							<p>Belum ada aktivitas hari ini.</p>
							<p className="empty-sub">Chill dulu, semua berjalan lancar!</p>
						</div>
					)}
				</div>
			</motion.div>
		</div>
	);
}

const dashboardStyles = `
	/* ===== BASE (Light Mode) ===== */
	.dashboard-container {
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Page Header */
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
	}

	.page-title {
		font-size: 22px;
		font-weight: 700;
		color: #1E293B;
		margin: 0;
		line-height: 1.2;
	}

	.page-subtitle {
		font-size: 13px;
		color: #94A3B8;
		margin: 4px 0 0;
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
		border-radius: 10px;
		border: none;
		cursor: pointer;
		background: #F1F5F9;
		color: #64748B;
		transition: all 0.2s;
	}

	.btn-theme-toggle:hover {
		background: #E2E8F0;
		color: #1E293B;
	}

	/* Action Button — Tambah Promo (indigo/violet) */
	.btn-action-add {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 9px 18px;
		font-size: 13px;
		font-weight: 700;
		border-radius: 10px;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
		color: #fff;
		box-shadow: 0 2px 8px rgba(79, 70, 229, 0.35);
		letter-spacing: 0.01em;
	}

	.btn-action-add:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45);
	}

	/* Alert */
	.alert {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		border-radius: 12px;
		font-size: 13px;
		font-weight: 500;
		margin-bottom: 16px;
	}

	.alert-error {
		background: #FEF2F2;
		color: #DC2626;
	}

	/* Notification Cards */
	.notification-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 12px;
		margin-bottom: 20px;
	}

	.notification-card {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px;
		border-radius: 14px;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
	}

	.notification-card.warning {
		background: #FFFBEB;
	}

	.notification-card.warning .notification-icon {
		color: #D97706;
		font-size: 20px;
	}

	.notification-card.info {
		background: #EFF6FF;
	}

	.notification-card.info .notification-icon {
		color: #3B82F6;
		font-size: 20px;
	}

	.notification-card.success {
		background: #F0FDF4;
	}

	.notification-card.success .notification-icon {
		color: #16A34A;
		font-size: 20px;
	}

	.notification-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
	}

	.notification-content {
		display: flex;
		flex-direction: column;
	}

	.notification-content .count {
		font-size: 22px;
		font-weight: 800;
		color: #1E293B;
		line-height: 1;
	}

	.notification-content .label {
		font-size: 12px;
		font-weight: 600;
		color: #475569;
		margin-top: 3px;
	}

	.notification-content .description {
		font-size: 11px;
		color: #94A3B8;
		margin-top: 2px;
	}

	/* Stats Grid */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		margin-bottom: 20px;
	}

	@media (max-width: 1200px) {
		.stats-grid { grid-template-columns: repeat(2, 1fr); }
	}

	@media (max-width: 640px) {
		.stats-grid { grid-template-columns: 1fr; }
	}

	.stat-card-link {
		text-decoration: none;
		display: block;
	}

	.stat-card {
		background: #FFFFFF;
		border-radius: 14px;
		padding: 20px;
		border: none;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
		transition: all 0.2s;
	}

	.stat-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.stat-card .card-header {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		margin-bottom: 14px;
	}

	.stat-card .icon-container {
		width: 44px;
		height: 44px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		flex-shrink: 0;
	}

	.stat-card .icon-container svg {
		color: #fff;
	}

	.stat-card .content {
		display: flex;
		flex-direction: column;
	}

	.stat-card .value {
		font-size: 26px;
		font-weight: 800;
		color: #1E293B;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.stat-card .label {
		font-size: 12px;
		color: #94A3B8;
		margin-top: 4px;
		font-weight: 500;
	}

	.stat-card .card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 12px;
		border-top: 1px solid #F1F5F9;
	}

	/* Trend Pill Badges */
	.trend-pill {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 3px 9px;
		border-radius: 999px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.01em;
	}

	.trend-pill.pill-up {
		background: #DCFCE7;
		color: #16A34A;
	}

	.trend-pill.pill-down {
		background: #FEE2E2;
		color: #DC2626;
	}

	.stat-card .view-link {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		font-weight: 600;
		color: #94A3B8;
		text-decoration: none;
		transition: color 0.2s;
	}

	.stat-card .view-link:hover {
		color: #4F46E5;
	}

	/* Content Grid */
	.content-grid {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 20px;
		margin-bottom: 20px;
	}

	@media (max-width: 1024px) {
		.content-grid { grid-template-columns: 1fr; }
	}

	/* Card Base — no border, subtle shadow, rounded-xl */
	.card {
		background: #FFFFFF;
		border-radius: 14px;
		border: none;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
		overflow: hidden;
	}

	.card .card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 20px;
		border-bottom: 1px solid #F1F5F9;
	}

	.card-title-group {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.card-icon {
		width: 38px;
		height: 38px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-icon svg {
		color: #fff;
	}

	.card .card-title {
		font-size: 14px;
		font-weight: 700;
		color: #1E293B;
		margin: 0;
		letter-spacing: -0.01em;
	}

	.card .card-subtitle {
		font-size: 11px;
		color: #94A3B8;
		margin: 2px 0 0;
	}

	.card .card-header svg {
		color: #CBD5E1;
	}

	.card .card-body {
		padding: 20px;
	}

	/* KPI Card */
	.kpi-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}

	.kpi-card {
		padding: 14px;
		border-radius: 12px;
		background: #F8FAFC;
	}

	.kpi-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.kpi-label {
		font-size: 11px;
		color: #94A3B8;
		font-weight: 600;
		letter-spacing: 0.03em;
	}

	.kpi-icon {
		font-size: 14px;
	}

	.kpi-icon svg {
		color: #94A3B8;
	}

	.kpi-card:nth-child(1) .kpi-icon svg { color: #3B82F6; }
	.kpi-card:nth-child(2) .kpi-icon svg { color: #14B8A6; }
	.kpi-card:nth-child(3) .kpi-icon svg { color: #16A34A; }
	.kpi-card:nth-child(4) .kpi-icon svg { color: #EF4444; }

	.kpi-body {
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.kpi-value {
		font-size: 20px;
		font-weight: 800;
		color: #1E293B;
		letter-spacing: -0.02em;
	}

	.sparkline {
		display: flex;
		align-items: flex-end;
		gap: 2px;
		height: 20px;
		margin-top: 8px;
	}

	.sparkline-bar {
		flex: 1;
		background: linear-gradient(to top, #C62828, #EF4444);
		border-radius: 2px;
		min-height: 3px;
	}

	/* Activity Card */
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
		padding: 14px 20px;
		border-bottom: 1px solid #F8FAFC;
		transition: background 0.15s;
		cursor: pointer;
	}

	.activity-item:last-child {
		border-bottom: none;
	}

	.activity-item:hover {
		background: #F8FAFC;
	}

	.activity-item .indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.activity-item .content {
		flex: 1;
		min-width: 0;
	}

	.activity-item .title {
		font-size: 13px;
		font-weight: 600;
		color: #1E293B;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.activity-item .detail {
		font-size: 11px;
		color: #94A3B8;
		margin: 2px 0 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40px 20px;
		text-align: center;
	}

	.empty-state svg {
		color: #CBD5E1;
		margin-bottom: 4px;
	}

	.empty-state p {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		color: #64748B;
	}

	.empty-state .empty-sub {
		font-size: 12px;
		font-weight: 400;
		color: #94A3B8;
		margin-top: 4px;
	}

	/* Icon Gradients */
	.icon-gradient-red { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); }
	.icon-gradient-emerald { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }
	.icon-gradient-amber { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
	.icon-gradient-blue { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }

	.card-icon-red { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); }
	.card-icon-blue { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }
	.card-icon-violet { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }

	.indicator-red { background: #EF4444; }
	.indicator-blue { background: #3B82F6; }
	.indicator-teal { background: #14B8A6; }
	.indicator-amber { background: #F59E0B; }

	/* ===== DARK MODE ===== */
	.dashboard-container.dashboard-dark {
		background: #111827;
	}

	.dashboard-dark .page-title {
		color: #F1F5F9;
	}

	.dashboard-dark .page-subtitle {
		color: #64748B;
	}

	.dashboard-dark .btn-theme-toggle {
		background: #1F2937;
		color: #9CA3AF;
	}

	.dashboard-dark .btn-theme-toggle:hover {
		background: #374151;
		color: #F9FAFB;
	}

	.dashboard-dark .card {
		background: #1F2937;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.dashboard-dark .card .card-header {
		border-color: #374151;
	}

	.dashboard-dark .card .card-title {
		color: #F1F5F9;
	}

	.dashboard-dark .card .card-subtitle {
		color: #64748B;
	}

	.dashboard-dark .card .card-header svg {
		color: #4B5563 !important;
	}

	.dashboard-dark .card-icon {
		background: #374151 !important;
	}

	.dashboard-dark .card-icon svg {
		color: #9CA3AF !important;
	}

	.dashboard-dark .stat-card {
		background: #1F2937;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.dashboard-dark .stat-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}

	.dashboard-dark .stat-card .value {
		color: #F1F5F9;
	}

	.dashboard-dark .stat-card .label {
		color: #64748B;
	}

	.dashboard-dark .stat-card .card-footer {
		border-color: #374151;
	}

	.dashboard-dark .stat-card .view-link {
		color: #64748B;
	}

	.dashboard-dark .stat-card .view-link:hover {
		color: #818CF8;
	}

	/* Dark trend pills */
	.dashboard-dark .trend-pill.pill-up {
		background: rgba(22, 163, 74, 0.15);
		color: #4ADE80;
	}

	.dashboard-dark .trend-pill.pill-down {
		background: rgba(220, 38, 38, 0.15);
		color: #F87171;
	}

	/* Dark notification cards */
	.dashboard-dark .notification-card {
		border: none;
	}

	.dashboard-dark .notification-card.warning {
		background: #1C1917;
	}

	.dashboard-dark .notification-card.warning .notification-icon {
		color: #D97706;
	}

	.dashboard-dark .notification-card.info {
		background: #1E1B2E;
	}

	.dashboard-dark .notification-card.info .notification-icon {
		color: #818CF8;
	}

	.dashboard-dark .notification-card.success {
		background: #172554;
	}

	.dashboard-dark .notification-card.success .notification-icon {
		color: #4ADE80;
	}

	.dashboard-dark .notification-content .count {
		color: #F1F5F9;
	}

	.dashboard-dark .notification-content .label {
		color: #9CA3AF;
	}

	.dashboard-dark .notification-content .description {
		color: #64748B;
	}

	/* Dark KPI */
	.dashboard-dark .kpi-card {
		background: #1A1D27;
	}

	.dashboard-dark .kpi-label {
		color: #64748B;
	}

	.dashboard-dark .kpi-value {
		color: #F1F5F9;
	}

	.dashboard-dark .kpi-card:nth-child(1) .kpi-icon svg { color: #818CF8 !important; }
	.dashboard-dark .kpi-card:nth-child(2) .kpi-icon svg { color: #2DD4BF !important; }
	.dashboard-dark .kpi-card:nth-child(3) .kpi-icon svg { color: #4ADE80 !important; }
	.dashboard-dark .kpi-card:nth-child(4) .kpi-icon svg { color: #F87171 !important; }

	/* Dark activity */
	.dashboard-dark .activity-item {
		border-color: #374151;
	}

	.dashboard-dark .activity-item:hover {
		background: #1A1D27;
	}

	.dashboard-dark .activity-item .title {
		color: #F1F5F9;
	}

	.dashboard-dark .activity-item .detail {
		color: #64748B;
	}

	/* Dark empty state */
	.dashboard-dark .empty-state svg {
		color: #374151 !important;
	}

	.dashboard-dark .empty-state p {
		color: #9CA3AF;
	}

	.dashboard-dark .empty-state .empty-sub {
		color: #64748B;
	}

	/* Dark alert */
	.dashboard-dark .alert-error {
		background: rgba(220, 38, 38, 0.12);
		color: #F87171;
	}

	/* Dark sparkline */
	.dashboard-dark .sparkline-bar {
		background: linear-gradient(to top, #991B1B, #DC2626);
	}

	/* Dark icon gradients */
	.dashboard-dark .icon-gradient-red { background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); }
	.dashboard-dark .icon-gradient-emerald { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
	.dashboard-dark .icon-gradient-amber { background: linear-gradient(135deg, #D97706 0%, #B45309 100%); }
	.dashboard-dark .icon-gradient-blue { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); }

	.dashboard-dark .card-icon-red { background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); }
	.dashboard-dark .card-icon-blue { background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); }
	.dashboard-dark .card-icon-violet { background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); }

	.dashboard-dark .indicator-red { background: #DC2626; }
	.dashboard-dark .indicator-blue { background: #2563EB; }
	.dashboard-dark .indicator-teal { background: #0F766E; }
	.dashboard-dark .indicator-amber { background: #D97706; }
`;
