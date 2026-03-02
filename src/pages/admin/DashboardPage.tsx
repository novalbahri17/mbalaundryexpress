import {
	AppstoreAddOutlined,
	ArrowUpOutlined,
	CalendarOutlined,
	ClockCircleOutlined,
	GiftOutlined,
	MailOutlined,
	NotificationOutlined,
	PlusOutlined,
	ReadOutlined,
	RightOutlined,
	ShopOutlined,
	TeamOutlined,
	WarningOutlined,
} from "@ant-design/icons";
import { Alert, Empty, Segmented, Skeleton, Tooltip } from "antd";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getArticles } from "@/api/articles.api";
import { getBranches } from "@/api/branches.api";
import { getJobs } from "@/api/jobs.api";
import { getPromos } from "@/api/promos.api";
import { getContactMessages, getPartnerships } from "@/api/settings.api";
import { getSubscribers } from "@/api/subscribers.api";
import { formatDateTime } from "@/utils/format";

type SeriesMode = "Mingguan" | "Bulanan";
type ActivityTone = "brand" | "blue" | "teal" | "amber";

interface SeriesPoint {
	label: string;
	value: number;
}

interface ActivityItem {
	key: string;
	title: string;
	detail: string;
	timestamp: number;
	link: string;
	tone: ActivityTone;
}

interface PriorityItem {
	label: string;
	description: string;
	progress: number;
	colorClass: string;
}

function startOfToday(): number {
	const value = new Date();
	value.setHours(0, 0, 0, 0);
	return value.getTime();
}

function toTimestamp(value?: string): number | null {
	if (!value) return null;
	const ts = new Date(value).getTime();
	return Number.isNaN(ts) ? null : ts;
}

function formatNumber(value: number): string {
	return new Intl.NumberFormat("id-ID").format(value);
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function initials(value: string): string {
	const words = value.split(" ").filter(Boolean);
	const chars = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "");
	return chars.join("") || "MB";
}

function getErrorMessage(error: unknown): string | null {
	if (!error) return null;
	if (error instanceof Error) {
		return error.message;
	}
	return "Terjadi kesalahan saat memuat data dashboard.";
}

function getPercent(done: number, total: number, fallback = 0): number {
	if (total <= 0) return fallback;
	return clamp(Math.round((done / total) * 100), 0, 100);
}

export default function DashboardPage() {
	const [seriesMode, setSeriesMode] = useState<SeriesMode>("Mingguan");
	const now = new Date();
	const dayString = now.toLocaleDateString("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	const { data: branchRes, isLoading: branchLoading, error: branchError } = useQuery({
		queryKey: ["dash-branches"],
		queryFn: () => getBranches({ activeOnly: true, perPage: 200 }),
	});
	const { data: promoRes, isLoading: promoLoading, error: promoError } = useQuery({
		queryKey: ["dash-promos"],
		queryFn: () => getPromos({ activeOnly: true, status: "published", perPage: 200 }),
	});
	const { data: jobs = [], isLoading: jobsLoading, error: jobsError } = useQuery({
		queryKey: ["dash-jobs"],
		queryFn: () => getJobs({ openOnly: true }),
	});
	const { data: articles = [], isLoading: articlesLoading, error: articlesError } = useQuery({
		queryKey: ["dash-articles"],
		queryFn: () => getArticles({ publishedOnly: true }),
	});
	const { data: messages = [], isLoading: messagesLoading, error: messagesError } = useQuery({
		queryKey: ["dash-messages"],
		queryFn: getContactMessages,
	});
	const { data: partnerships = [], isLoading: partnershipsLoading, error: partnershipsError } = useQuery({
		queryKey: ["dash-partnerships"],
		queryFn: getPartnerships,
	});
	const { data: subscribers = [], isLoading: subscribersLoading, error: subscribersError } = useQuery({
		queryKey: ["dash-subscribers"],
		queryFn: getSubscribers,
	});

	const branchItems = branchRes?.items ?? [];
	const promoItems = promoRes?.items ?? [];
	const isLoadingDashboard =
		branchLoading ||
		promoLoading ||
		jobsLoading ||
		articlesLoading ||
		messagesLoading ||
		partnershipsLoading ||
		subscribersLoading;

	const todayTs = startOfToday();
	const newMessagesToday = messages.filter((item) => (item.created ? new Date(item.created).getTime() >= todayTs : false));
	const newPartnershipsToday = partnerships.filter((item) =>
		item.created ? new Date(item.created).getTime() >= todayTs : false,
	);
	const unreadMessagesCount = messages.filter((item) => item.status === "new").length;
	const newPartnershipCount = partnerships.filter((item) => item.status === "new").length;

	const openBranches = branchItems.filter((branch) => branch.status === "buka").length;
	const busyBranches = branchItems.filter((branch) => branch.status === "ramai").length;
	const closedBranches = branchItems.filter((branch) => branch.status === "tutup").length;

	const expiringPromo = useMemo(
		() =>
			promoItems.filter((promo) => {
				const diff = new Date(promo.end_date).getTime() - now.getTime();
				return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
			}),
		[now, promoItems],
	);

	const engagementEventTimestamps = useMemo(() => {
		const messageEvents = messages.map((item) => toTimestamp(item.created)).filter((value): value is number => value !== null);
		const partnershipEvents = partnerships
			.map((item) => toTimestamp(item.created))
			.filter((value): value is number => value !== null);
		const subscriberEvents = subscribers
			.map((item) => toTimestamp(item.created))
			.filter((value): value is number => value !== null);
		return [...messageEvents, ...partnershipEvents, ...subscriberEvents];
	}, [messages, partnerships, subscribers]);

	const weeklySeries = useMemo(() => {
		const dayMs = 24 * 60 * 60 * 1000;
		const todayStart = startOfToday();
		const points: SeriesPoint[] = [];
		for (let offset = 6; offset >= 0; offset -= 1) {
			const rangeStart = todayStart - offset * dayMs;
			const rangeEnd = rangeStart + dayMs;
			const count = engagementEventTimestamps.filter((ts) => ts >= rangeStart && ts < rangeEnd).length;
			const label = new Date(rangeStart).toLocaleDateString("id-ID", { weekday: "short" }).slice(0, 3);
			points.push({ label, value: count });
		}
		return points;
	}, [engagementEventTimestamps]);

	const monthlySeries = useMemo(() => {
		const points: SeriesPoint[] = [];
		const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		for (let offset = 5; offset >= 0; offset -= 1) {
			const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - offset, 1);
			const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - offset + 1, 1);
			const rangeStart = monthStart.getTime();
			const rangeEnd = monthEnd.getTime();
			const count = engagementEventTimestamps.filter((ts) => ts >= rangeStart && ts < rangeEnd).length;
			const label = monthStart.toLocaleDateString("id-ID", { month: "short" });
			points.push({ label, value: count });
		}
		return points;
	}, [engagementEventTimestamps, now]);

	const activeSeries = seriesMode === "Mingguan" ? weeklySeries : monthlySeries;
	const maxSeriesValue = Math.max(1, ...activeSeries.map((point) => point.value));
	const seriesTotal = activeSeries.reduce((acc, point) => acc + point.value, 0);

	const recentActivities = useMemo(() => {
		const items: ActivityItem[] = [];
		for (const message of messages.slice(0, 4)) {
			items.push({
				key: `message-${message.id}`,
				title: message.subject
					? `Pesan baru: ${message.subject}`
					: `Pesan kontak dari ${message.name}`,
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
		for (const article of articles.slice(0, 3)) {
			items.push({
				key: `article-${article.id}`,
				title: `Artikel diperbarui: ${article.title}`,
				detail: `Status ${article.status} • ${formatDateTime(article.updated ?? article.created ?? new Date())}`,
				timestamp: toTimestamp(article.updated ?? article.created) ?? 0,
				link: "/admin/blog",
				tone: "brand",
			});
		}

		return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
	}, [articles, expiringPromo, messages, partnerships]);

	const messageHandledProgress = messages.length
		? getPercent(messages.length - unreadMessagesCount, messages.length)
		: 100;
	const partnershipFollowProgress = partnerships.length
		? getPercent(partnerships.length - newPartnershipCount, partnerships.length)
		: 100;
	const promoCoverageProgress = branchItems.length
		? clamp(Math.round((promoItems.length / branchItems.length) * 100), 0, 100)
		: 0;
	const articleHealthProgress = clamp(articles.length * 10, 0, 100);
	const jobFulfillmentProgress = clamp(jobs.length * 15, 0, 100);

	const priorityItems: PriorityItem[] = [
		{
			label: "Respons Pesan",
			description: `${unreadMessagesCount} pesan butuh follow-up`,
			progress: messageHandledProgress,
			colorClass: "from-sky-500 to-indigo-500",
		},
		{
			label: "Leads Kemitraan",
			description: `${newPartnershipCount} lead baru`,
			progress: partnershipFollowProgress,
			colorClass: "from-teal-500 to-emerald-500",
		},
		{
			label: "Distribusi Promo",
			description: `${promoItems.length} promo aktif di ${branchItems.length} cabang`,
			progress: promoCoverageProgress,
			colorClass: "from-rose-500 to-pink-500",
		},
		{
			label: "Kesehatan Konten",
			description: `${articles.length} artikel publish`,
			progress: articleHealthProgress,
			colorClass: "from-violet-500 to-fuchsia-500",
		},
		{
			label: "Ketersediaan Loker",
			description: `${jobs.length} posisi terbuka`,
			progress: jobFulfillmentProgress,
			colorClass: "from-amber-500 to-orange-500",
		},
	];

	const errorMessages = [
		getErrorMessage(branchError),
		getErrorMessage(promoError),
		getErrorMessage(jobsError),
		getErrorMessage(articlesError),
		getErrorMessage(messagesError),
		getErrorMessage(partnershipsError),
		getErrorMessage(subscribersError),
	].filter((value): value is string => Boolean(value));

	const activityToneClass: Record<ActivityTone, string> = {
		brand: "bg-rose-500",
		blue: "bg-blue-500",
		teal: "bg-teal-500",
		amber: "bg-amber-500",
	};

	const panelClass =
		"rounded-2xl border border-[#E4E6EF] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#1F212A]";

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<p className="m-0 text-xs font-semibold uppercase tracking-[0.22em] text-mba-subtext dark:text-mba-darkSubtext">
						Dashboard
					</p>
					<h1 className="m-0 mt-1 text-[1.7rem] font-extrabold tracking-tight text-mba-text dark:text-mba-darkText">
						Analytics Operasional
					</h1>
					<p className="m-0 mt-1 text-sm font-medium text-mba-subtext dark:text-mba-darkSubtext">{dayString}</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<Link
						to="/admin/konten-home"
						className="inline-flex h-10 items-center gap-2 rounded-xl border border-mba-border px-4 text-sm font-bold text-mba-text transition hover:border-brand-300 hover:text-brand-600 dark:border-mba-darkBorder dark:text-mba-darkText dark:hover:border-brand-500/30 dark:hover:text-brand-400"
					>
						<CalendarOutlined />
						Konten Home
					</Link>
					<Link
						to="/admin/promo"
						className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-blue-500 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(198,40,40,0.35)] transition hover:-translate-y-0.5"
					>
						<PlusOutlined />
						Tambah Promo
					</Link>
				</div>
			</div>

			{errorMessages.length > 0 ? (
				<div className="space-y-2">
					{errorMessages.map((message, index) => (
						<Alert
							key={`${message}-${index + 1}`}
							type="error"
							showIcon
							message="Gagal memuat sebagian data dashboard"
							description={message}
							className="rounded-xl"
						/>
					))}
				</div>
			) : null}

			<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
				{[
					{
						label: "Promo Aktif",
						value: promoItems.length,
						helper: `${expiringPromo.length} akan berakhir <= 3 hari`,
						icon: <GiftOutlined />,
						iconClass: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
					},
					{
						label: "Cabang Aktif",
						value: branchItems.length,
						helper: `${openBranches} buka • ${busyBranches} ramai • ${closedBranches} tutup`,
						icon: <ShopOutlined />,
						iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
					},
					{
						label: "Loker Terbuka",
						value: jobs.length,
						helper: "Posisi yang masih menerima pelamar",
						icon: <TeamOutlined />,
						iconClass: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
					},
					{
						label: "Artikel Publish",
						value: articles.length,
						helper: `${formatNumber(subscribers.length)} subscribers promo`,
						icon: <ReadOutlined />,
						iconClass: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
					},
				].map((item) => (
					<div key={item.label} className={panelClass}>
						<div className="flex items-start justify-between p-5">
							<div className="min-w-0">
								<p className="m-0 text-[11px] font-bold uppercase tracking-[0.18em] text-mba-subtext dark:text-mba-darkSubtext">
									{item.label}
								</p>
								<div className="mt-2 text-[2rem] font-black leading-none text-mba-text tabular-nums dark:text-mba-darkText">
									{isLoadingDashboard ? (
										<Skeleton.Input active size="small" style={{ width: 78, height: 34 }} />
									) : (
										formatNumber(item.value)
									)}
								</div>
								<p className="m-0 mt-2 truncate text-xs font-medium text-mba-subtext dark:text-mba-darkSubtext">
									{item.helper}
								</p>
							</div>
							<div className={`grid h-11 w-11 place-items-center rounded-xl text-lg ${item.iconClass}`}>{item.icon}</div>
						</div>
					</div>
				))}
			</div>

			<div className="grid gap-5 xl:grid-cols-12">
				<div className="space-y-5 xl:col-span-3">
					<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F1416C] to-[#7239EA] p-5 text-white shadow-[0_14px_34px_rgba(114,57,234,0.28)]">
						<div className="absolute -left-6 -top-10 h-28 w-28 rounded-full bg-white/15 blur-xl" />
						<div className="absolute -right-8 -bottom-12 h-36 w-36 rounded-full bg-black/15 blur-2xl" />
						<div className="relative">
							<p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Campaign Pulse</p>
							<div className="mt-2 text-[2.4rem] font-black leading-none tabular-nums">{formatNumber(promoItems.length)}</div>
							<p className="m-0 mt-1 text-sm font-medium text-white/85">Promo berjalan saat ini</p>
							<div className="mt-5">
								<div className="mb-2 flex items-center justify-between text-xs font-bold text-white/85">
									<span>Promo hampir berakhir</span>
									<span>{getPercent(expiringPromo.length, Math.max(promoItems.length, 1))}%</span>
								</div>
								<div className="h-2 w-full rounded-full bg-white/30">
									<div
										className="h-2 rounded-full bg-white"
										style={{
											width: `${getPercent(expiringPromo.length, Math.max(promoItems.length, 1))}%`,
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className={panelClass}>
						<div className="border-b border-mba-border px-5 py-4 dark:border-mba-darkBorder">
							<h3 className="m-0 text-[15px] font-bold text-mba-text dark:text-mba-darkText">Today's Heroes</h3>
							<p className="m-0 mt-1 text-xs text-mba-subtext dark:text-mba-darkSubtext">
								Cabang dengan aktivitas operasional hari ini
							</p>
						</div>
						<div className="p-5">
							<div className="flex flex-wrap gap-2">
								{branchItems.length > 0 ? (
									branchItems.slice(0, 8).map((branch) => (
										<Tooltip key={branch.id} title={branch.name}>
											<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-blue-500 text-xs font-bold text-white">
												{initials(branch.name)}
											</span>
										</Tooltip>
									))
								) : (
									<p className="m-0 text-xs font-medium text-mba-subtext dark:text-mba-darkSubtext">Belum ada cabang aktif.</p>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-5 xl:col-span-3">
					<div className={panelClass}>
						<div className="border-b border-mba-border px-5 py-4 dark:border-mba-darkBorder">
							<h3 className="m-0 text-[15px] font-bold text-mba-text dark:text-mba-darkText">Operasional Hari Ini</h3>
						</div>
						<div className="space-y-4 p-5">
							<div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
								<p className="m-0 text-xs font-semibold text-mba-subtext dark:text-mba-darkSubtext">Pesan masuk hari ini</p>
								<p className="m-0 mt-1 text-xl font-bold text-mba-text tabular-nums dark:text-mba-darkText">
									{formatNumber(newMessagesToday.length)}
								</p>
							</div>
							<div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
								<p className="m-0 text-xs font-semibold text-mba-subtext dark:text-mba-darkSubtext">Lead kemitraan hari ini</p>
								<p className="m-0 mt-1 text-xl font-bold text-mba-text tabular-nums dark:text-mba-darkText">
									{formatNumber(newPartnershipsToday.length)}
								</p>
							</div>
							<div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
								<p className="m-0 text-xs font-semibold text-mba-subtext dark:text-mba-darkSubtext">Subscriber promo</p>
								<p className="m-0 mt-1 text-xl font-bold text-mba-text tabular-nums dark:text-mba-darkText">
									{formatNumber(subscribers.length)}
								</p>
							</div>
						</div>
					</div>

					<div className={panelClass}>
						<div className="border-b border-mba-border px-5 py-4 dark:border-mba-darkBorder">
							<h3 className="m-0 text-[15px] font-bold text-mba-text dark:text-mba-darkText">Quick Links</h3>
						</div>
						<div className="space-y-3 p-5">
							{[
								{ to: "/admin/promo", label: "Kelola Promo", icon: <GiftOutlined /> },
								{ to: "/admin/blog", label: "Kelola Artikel", icon: <ReadOutlined /> },
								{ to: "/admin/cabang", label: "Kelola Cabang", icon: <ShopOutlined /> },
								{ to: "/admin/pesan", label: "Inbox Kontak", icon: <MailOutlined /> },
							].map((item) => (
								<Link
									key={item.to}
									to={item.to}
									className="flex items-center justify-between rounded-xl border border-mba-border px-4 py-3 text-sm font-semibold text-mba-text transition hover:border-brand-300 hover:text-brand-600 dark:border-mba-darkBorder dark:text-mba-darkText dark:hover:border-brand-500/30 dark:hover:text-brand-400"
								>
									<span className="flex items-center gap-2">
										{item.icon} {item.label}
									</span>
									<RightOutlined className="text-xs" />
								</Link>
							))}
						</div>
					</div>
				</div>

				<div className="xl:col-span-6">
					<div className="relative h-full overflow-hidden rounded-2xl border border-[#e7daf8] bg-gradient-to-br from-[#fdf4ff] via-[#eff6ff] to-[#ecfeff] p-7 shadow-[0_18px_45px_rgba(80,34,145,0.13)] dark:border-[#392f4e] dark:from-[#2b2138] dark:via-[#1e2438] dark:to-[#142d34]">
						<div className="pointer-events-none absolute inset-0 bg-[url('/assets/noise.png')] opacity-15 mix-blend-overlay" />
						<div className="pointer-events-none absolute -left-16 top-8 h-44 w-44 rounded-full bg-[#f1416c]/20 blur-3xl" />
						<div className="pointer-events-none absolute -right-12 bottom-0 h-52 w-52 rounded-full bg-[#009ef7]/20 blur-3xl" />
						<div className="pointer-events-none absolute right-24 top-6 h-24 w-24 rounded-full border border-white/50" />
						<div className="relative z-10 flex h-full flex-col justify-between gap-6">
							<div>
								<p className="m-0 text-xs font-semibold uppercase tracking-[0.22em] text-[#7239ea] dark:text-[#d0b5ff]">
									Engage Widget
								</p>
								<h2 className="m-0 mt-2 max-w-[28rem] text-[2.05rem] leading-tight font-extrabold text-slate-900 dark:text-white">
									Selamat datang, Admin MBA Laundry
								</h2>
								<p className="m-0 mt-2 max-w-[30rem] text-sm font-medium text-slate-600 dark:text-slate-200/85">
									Fokuskan hari ini pada promo, respon pesan pelanggan, dan peningkatan kualitas konten untuk semua cabang.
								</p>
							</div>
							<div className="grid gap-3 sm:grid-cols-3">
								<div className="rounded-xl border border-white/65 bg-white/75 p-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
									<p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
										Avg Response
									</p>
									<div className="mt-1 flex items-center gap-2">
										<ClockCircleOutlined className="text-brand-600 dark:text-brand-400" />
										<span className="text-lg font-black text-slate-900 dark:text-white">12m</span>
									</div>
								</div>
								<div className="rounded-xl border border-white/65 bg-white/75 p-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
									<p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
										Open Branch
									</p>
									<div className="mt-1 flex items-center gap-2">
										<ShopOutlined className="text-blue-600 dark:text-blue-400" />
										<span className="text-lg font-black text-slate-900 dark:text-white">{formatNumber(openBranches)}</span>
									</div>
								</div>
								<div className="rounded-xl border border-white/65 bg-white/75 p-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
									<p className="m-0 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
										Growth
									</p>
									<div className="mt-1 flex items-center gap-2">
										<ArrowUpOutlined className="text-emerald-600 dark:text-emerald-400" />
										<span className="text-lg font-black text-slate-900 dark:text-white">+18%</span>
									</div>
								</div>
							</div>
							<div className="flex flex-wrap gap-3">
								<Link
									to="/admin/promo"
									className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
								>
									Kelola Promo
								</Link>
								<Link
									to="/admin/konten-home"
									className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-900 transition hover:border-brand-500 hover:text-brand-600 dark:border-white/25 dark:text-white dark:hover:border-brand-500"
								>
									Edit Konten Home
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-5 xl:grid-cols-12">
				<div className={`${panelClass} xl:col-span-7`}>
					<div className="flex flex-wrap items-start justify-between gap-4 border-b border-mba-border px-6 py-5 dark:border-mba-darkBorder">
						<div>
							<h3 className="m-0 text-[16px] font-bold text-mba-text dark:text-mba-darkText">Performance Overview</h3>
							<p className="m-0 mt-1 text-xs text-mba-subtext dark:text-mba-darkSubtext">
								Interaksi dari channel pesan, kemitraan, dan subscribe
							</p>
						</div>
						<Segmented
							options={["Mingguan", "Bulanan"]}
							value={seriesMode}
							onChange={(value) => {
								if (value === "Mingguan" || value === "Bulanan") {
									setSeriesMode(value);
								}
							}}
						/>
					</div>
					<div className="p-6">
						<div className="mb-6 flex items-center gap-3">
							<span className="text-sm font-semibold text-mba-subtext dark:text-mba-darkSubtext">Total Interaksi</span>
							<span className="text-[2rem] leading-none font-black text-mba-text tabular-nums dark:text-mba-darkText">
								{formatNumber(seriesTotal)}
							</span>
						</div>
						<div className="flex items-end gap-2 overflow-x-auto pb-1">
							{activeSeries.map((point) => {
								const ratio = point.value / maxSeriesValue;
								const heightPercent = Math.round(Math.max(10, ratio * 100));
								return (
									<div key={`${seriesMode}-${point.label}`} className="min-w-[60px] flex-1">
										<div className="group relative h-44 rounded-xl bg-slate-100/80 p-1 dark:bg-white/5">
											<div className="absolute inset-x-1 bottom-1">
												<div
													className="relative w-full rounded-lg bg-gradient-to-t from-brand-600 via-blue-500 to-teal-400 transition-all duration-300"
													style={{ height: `${heightPercent}%` }}
												>
													<span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-mba-text opacity-0 transition group-hover:opacity-100 dark:text-white">
														{point.value}
													</span>
												</div>
											</div>
										</div>
										<p className="m-0 mt-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-mba-subtext dark:text-mba-darkSubtext">
											{point.label}
										</p>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				<div className={`${panelClass} xl:col-span-5`}>
					<div className="flex items-center justify-between border-b border-mba-border px-6 py-5 dark:border-mba-darkBorder">
						<h3 className="m-0 text-[16px] font-bold text-mba-text dark:text-mba-darkText">Recent Activity</h3>
						<Link
							to="/admin/pesan"
							className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
						>
							View all
						</Link>
					</div>
					<div className="p-6">
						{recentActivities.length > 0 ? (
							<div className="space-y-4">
								{recentActivities.map((item) => (
									<Link
										key={item.key}
										to={item.link}
										className="flex items-start gap-3 rounded-xl border border-mba-border/70 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50/30 dark:border-white/10 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/10"
									>
										<span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${activityToneClass[item.tone]}`} />
										<span className="min-w-0">
											<span className="block truncate text-sm font-bold text-mba-text dark:text-mba-darkText">{item.title}</span>
											<span className="block truncate text-xs font-medium text-mba-subtext dark:text-mba-darkSubtext">
												{item.detail}
											</span>
										</span>
									</Link>
								))}
							</div>
						) : (
							<Empty
								description="Belum ada aktivitas terbaru."
								image={Empty.PRESENTED_IMAGE_SIMPLE}
							/>
						)}
					</div>
				</div>
			</div>

			<div className="grid gap-5 xl:grid-cols-12">
				<div className={`${panelClass} xl:col-span-8`}>
					<div className="flex items-center justify-between border-b border-mba-border px-6 py-5 dark:border-mba-darkBorder">
						<h3 className="m-0 text-[16px] font-bold text-mba-text dark:text-mba-darkText">Prioritas Operasional</h3>
						<span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700 dark:bg-white/10 dark:text-slate-200">
							<AppstoreAddOutlined />
							Live
						</span>
					</div>
					<div className="space-y-4 p-6">
						{priorityItems.map((item) => (
							<div key={item.label} className="rounded-xl border border-mba-border/70 p-4 dark:border-white/10">
								<div className="mb-2 flex items-center justify-between gap-3">
									<div className="min-w-0">
										<p className="m-0 truncate text-sm font-bold text-mba-text dark:text-mba-darkText">{item.label}</p>
										<p className="m-0 truncate text-xs text-mba-subtext dark:text-mba-darkSubtext">{item.description}</p>
									</div>
									<p className="m-0 text-sm font-black text-mba-text tabular-nums dark:text-mba-darkText">{item.progress}%</p>
								</div>
								<div className="h-2 rounded-full bg-slate-100 dark:bg-white/10">
									<div
										className={`h-2 rounded-full bg-gradient-to-r ${item.colorClass}`}
										style={{ width: `${item.progress}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="space-y-4 xl:col-span-4">
					{expiringPromo.length > 0 ? (
						<Alert
							type="warning"
							showIcon
							icon={<WarningOutlined />}
							message={`${expiringPromo.length} promo akan berakhir dalam 3 hari`}
							className="rounded-xl border border-amber-200"
						/>
					) : null}
					{unreadMessagesCount > 0 ? (
						<Alert
							type="info"
							showIcon
							icon={<NotificationOutlined />}
							message={`${unreadMessagesCount} pesan kontak belum dibaca`}
							className="rounded-xl border border-blue-200"
						/>
					) : null}
					{newPartnershipCount > 0 ? (
						<Alert
							type="success"
							showIcon
							message={`${newPartnershipCount} lead kemitraan baru`}
							className="rounded-xl border border-emerald-200"
						/>
					) : null}

					<div className={panelClass}>
						<div className="border-b border-mba-border px-5 py-4 dark:border-mba-darkBorder">
							<h3 className="m-0 text-[15px] font-bold text-mba-text dark:text-mba-darkText">Quick Actions</h3>
						</div>
						<div className="grid gap-3 p-5">
							<Link
								to="/admin/promo"
								className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-600 hover:text-white dark:bg-brand-500/10 dark:text-brand-400 dark:hover:bg-brand-500"
							>
								<GiftOutlined /> Tambah Promo
							</Link>
							<Link
								to="/admin/blog"
								className="flex items-center gap-3 rounded-xl border border-mba-border px-4 py-3 text-sm font-bold text-mba-text transition hover:border-brand-300 hover:text-brand-600 dark:border-mba-darkBorder dark:text-mba-darkText dark:hover:border-brand-500/30 dark:hover:text-brand-400"
							>
								<ReadOutlined /> Tambah Artikel
							</Link>
							<Link
								to="/admin/cabang"
								className="flex items-center gap-3 rounded-xl border border-mba-border px-4 py-3 text-sm font-bold text-mba-text transition hover:border-brand-300 hover:text-brand-600 dark:border-mba-darkBorder dark:text-mba-darkText dark:hover:border-brand-500/30 dark:hover:text-brand-400"
							>
								<ShopOutlined /> Atur Cabang
							</Link>
							<Link
								to="/admin/pengaturan"
								className="flex items-center gap-3 rounded-xl border border-mba-border px-4 py-3 text-sm font-bold text-mba-text transition hover:border-brand-300 hover:text-brand-600 dark:border-mba-darkBorder dark:text-mba-darkText dark:hover:border-brand-500/30 dark:hover:text-brand-400"
							>
								<CalendarOutlined /> Pengaturan
							</Link>
						</div>
					</div>
				</div>
			</div>

			{isLoadingDashboard ? (
				<div className={`${panelClass} p-6`}>
					<Skeleton active paragraph={{ rows: 3 }} />
				</div>
			) : null}
		</div>
	);
}
