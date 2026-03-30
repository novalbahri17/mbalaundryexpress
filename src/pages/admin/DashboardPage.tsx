import {
	AppstoreOutlined,
	AreaChartOutlined,
	BarChartOutlined,
	CloseOutlined,
	DragOutlined,
	ExperimentOutlined,
	FireOutlined,
	FunnelPlotOutlined,
	GiftOutlined,
	LineChartOutlined,
	MailOutlined,
	PhoneOutlined,
	PieChartOutlined,
	PlusOutlined,
	ReadOutlined,
	SettingOutlined,
	ShopOutlined,
	TeamOutlined,
	TrophyOutlined,
	WarningOutlined,
} from "@ant-design/icons";
import {
	Alert,
	Button,
	Card,
	Empty,
	Progress,
	Segmented,
	Skeleton,
	Switch,
	Tag,
	Tooltip,
} from "antd";
import {
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import CountUp from "react-countup";
import { Link } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";
import { getArticles } from "@/api/articles.api";
import { getBranches } from "@/api/branches.api";
import { getJobs } from "@/api/jobs.api";
import { getPromos } from "@/api/promos.api";
import { getContactMessages, getPartnerships } from "@/api/settings.api";
import { getSubscribers } from "@/api/subscribers.api";
import { formatDateTime } from "@/utils/format";

type SeriesMode = "Mingguan" | "Bulanan";
type ActivityTone = "brand" | "blue" | "teal" | "amber";
type WidgetCategory = "analytics" | "monitoring" | "quickActions" | "content" | "marketing";

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

interface WidgetConfig {
	id: string;
	title: string;
	icon: React.ReactNode;
	colSpan: 1 | 2 | 3 | 4;
	enabled: boolean;
	order: number;
	category: WidgetCategory;
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

const formatNumber = (value: number): string => {
	return new Intl.NumberFormat("id-ID").format(value);
};

const clamp = (value: number, min: number, max: number): number => {
	return Math.min(max, Math.max(min, value));
};

const getErrorMessage = (error: unknown): string | null => {
	if (!error) return null;
	if (error instanceof Error) return error.message;
	return "Terjadi kesalahan saat memuat data dashboard.";
};

const getPercent = (done: number, total: number, fallback = 0): number => {
	if (total <= 0) return fallback;
	return clamp(Math.round((done / total) * 100), 0, 100);
};

// Sortable Widget Component
interface SortableWidgetCardProps {
	widget: WidgetConfig;
	children: React.ReactNode;
	isCustomizing: boolean;
	onToggle: (id: string) => void;
	onRemove: (id: string) => void;
}

function SortableWidgetCard({ widget, children, isCustomizing, onToggle, onRemove }: SortableWidgetCardProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: widget.id,
		disabled: !isCustomizing,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const colSpanClasses = {
		1: "xl:col-span-3",
		2: "xl:col-span-6",
		3: "xl:col-span-9",
		4: "xl:col-span-12",
	};

	return (
		<div ref={setNodeRef} style={style} className={`${colSpanClasses[widget.colSpan]} relative`}>
			{isCustomizing && (
				<div className="absolute -top-3 -right-3 z-20 flex gap-1">
					<Tooltip title={widget.enabled ? "Nonaktifkan" : "Aktifkan"}>
						<Switch size="small" checked={widget.enabled} onChange={() => onToggle(widget.id)} />
					</Tooltip>
					<Tooltip title="Hapus widget">
						<Button type="primary" danger size="small" icon={<CloseOutlined />} onClick={() => onRemove(widget.id)} />
					</Tooltip>
				</div>
			)}
			{isCustomizing && (
				<div
					className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-blue-500 text-white px-2 py-1 rounded text-xs cursor-move flex items-center gap-1"
					{...attributes}
					{...listeners}
				>
					<DragOutlined /> Drag
				</div>
			)}
			<div className={`h-full transition-all duration-300 ${isCustomizing ? "ring-2 ring-blue-400 ring-offset-2 rounded-2xl" : ""}`}>
				{children}
			</div>
		</div>
	);
}

// Animated Counter
function AnimatedCounter({ end }: { end: number }) {
	return <CountUp end={end} duration={2} separator="." className="tabular-nums" />;
}

// Marketing Widget
function MarketingMiniWidget() {
	const { data: promoRes } = useQuery({
		queryKey: ["dash-promos-marketing"],
		queryFn: () => getPromos({ activeOnly: true, status: "published", perPage: 200 }),
	});

	const promoItems = promoRes?.items ?? [];
	const totalImpressions = promoItems.reduce((acc, p) => acc + (p.impressions || 0), 0);
	const totalConversions = promoItems.reduce((acc, p) => acc + (p.conversions || 0), 0);
	const avgConversionRate = totalImpressions > 0 ? (totalConversions / totalImpressions) * 100 : 0;

	return (
		<div className="space-y-3">
			<div className="flex justify-between items-center">
				<span className="text-sm text-neutral-600 dark:text-neutral-400">Conversion Rate</span>
				<span className="text-lg font-bold text-emerald-600">{avgConversionRate.toFixed(1)}%</span>
			</div>
			<Progress percent={Math.min(avgConversionRate * 10, 100)} showInfo={false} strokeColor="#10b981" />
			<div className="grid grid-cols-2 gap-2 text-center">
				<div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
					<div className="text-lg font-bold text-emerald-600">{formatNumber(totalConversions)}</div>
					<div className="text-xs text-neutral-500">Konversi</div>
				</div>
				<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
					<div className="text-lg font-bold text-blue-600">{formatNumber(totalImpressions)}</div>
					<div className="text-xs text-neutral-500">Impressions</div>
				</div>
			</div>
		</div>
	);
}

// Lead Funnel Widget
function LeadFunnelWidget() {
	const funnelData = [
		{ stage: "Website Visit", count: 1250, color: "#3b82f6" },
		{ stage: "CTA Click", count: 680, color: "#8b5cf6" },
		{ stage: "WhatsApp", count: 420, color: "#10b981" },
		{ stage: "Branch Visit", count: 180, color: "#f59e0b" },
		{ stage: "Transaction", count: 95, color: "#ef4444" },
	];
	const maxCount = Math.max(...funnelData.map((d) => d.count));

	return (
		<div className="space-y-2">
			{funnelData.map((item, index) => (
				<div key={item.stage} className="flex items-center gap-2">
					<div className="w-24 text-xs text-neutral-600 dark:text-neutral-400">{item.stage}</div>
					<div className="flex-1">
						<div
							className="h-6 rounded-md flex items-center justify-end px-2 text-xs font-bold text-white transition-all duration-500"
							style={{
								width: `${(item.count / maxCount) * 100}%`,
								backgroundColor: item.color,
								marginLeft: index * 8,
							}}
						>
							{item.count}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

// A/B Testing Widget
function ABTestingWidget() {
	const tests = [
		{ name: "Hero CTA Color", variantA: "Blue", variantB: "Red", winner: "B", improvement: "+12%" },
		{ name: "Promo Banner", variantA: "Static", variantB: "Animated", winner: "B", improvement: "+8%" },
	];

	return (
		<div className="space-y-3">
			{tests.map((test) => (
				<div key={test.name} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm font-semibold">{test.name}</span>
						<Tag color="success">Winner: {test.winner}</Tag>
					</div>
					<div className="flex gap-2 text-xs">
						<div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded p-2 text-center">
							<div className="text-neutral-500">A: {test.variantA}</div>
						</div>
						<div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded p-2 text-center border border-emerald-200">
							<div className="text-emerald-600 font-bold">B: {test.variantB}</div>
							<div className="text-emerald-500 text-xs">{test.improvement}</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

// Campaign Tracker Widget
function CampaignTrackerWidget() {
	const campaigns = [
		{ platform: "Instagram", budget: 2500000, spent: 1800000, clicks: 450, color: "#e1306c" },
		{ platform: "TikTok", budget: 1500000, spent: 1200000, clicks: 380, color: "#000000" },
		{ platform: "Facebook", budget: 1000000, spent: 800000, clicks: 220, color: "#1877f2" },
	];

	return (
		<div className="space-y-3">
			{campaigns.map((camp) => (
				<div key={camp.platform} className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: camp.color }}>
						{camp.platform[0]}
					</div>
					<div className="flex-1">
						<div className="flex justify-between text-sm">
							<span className="font-semibold">{camp.platform}</span>
							<span className="text-neutral-500">{formatNumber(camp.clicks)} clicks</span>
						</div>
						<Progress percent={Math.round((camp.spent / camp.budget) * 100)} size="small" strokeColor={camp.color} />
					</div>
				</div>
			))}
		</div>
	);
}

// Gamification Widget
function GamificationWidget() {
	const achievements = [
		{ icon: <FireOutlined />, name: "7-Day Streak", unlocked: true },
		{ icon: <TrophyOutlined />, name: "Promo Master", unlocked: true },
		{ icon: <GiftOutlined />, name: "Content Creator", unlocked: false },
		{ icon: <MailOutlined />, name: "Fast Responder", unlocked: false },
	];

	return (
		<div className="space-y-2">
			<div className="flex justify-between items-center mb-3">
				<span className="text-sm font-semibold">Achievements</span>
				<Tag color="success">2/4</Tag>
			</div>
			<div className="grid grid-cols-2 gap-2">
				{achievements.map((ach) => (
					<div
						key={ach.name}
						className={`p-2 rounded-lg border text-center transition-all ${
							ach.unlocked
								? "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700"
								: "bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 opacity-60"
						}`}
					>
						<div className={`text-lg ${ach.unlocked ? "text-amber-500" : "text-neutral-400"}`}>{ach.icon}</div>
						<div className="text-xs font-semibold mt-1">{ach.name}</div>
					</div>
				))}
			</div>
		</div>
	);
}

// Main Dashboard
export default function DashboardPage() {
	const [seriesMode, setSeriesMode] = useState<SeriesMode>("Mingguan");
	const [customizableMode, setCustomizableMode] = useState(false);
	const now = new Date();
	const dayString = now.toLocaleDateString("id-ID", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	const defaultWidgets: WidgetConfig[] = [
		{ id: "stats-overview", title: "Statistik Overview", icon: <BarChartOutlined />, colSpan: 4, enabled: true, order: 1, category: "analytics" },
		{ id: "marketing-performance", title: "Marketing Performance", icon: <LineChartOutlined />, colSpan: 2, enabled: true, order: 2, category: "marketing" },
		{ id: "lead-funnel", title: "Lead Funnel", icon: <FunnelPlotOutlined />, colSpan: 2, enabled: true, order: 3, category: "marketing" },
		{ id: "performance-chart", title: "Performance Chart", icon: <AreaChartOutlined />, colSpan: 2, enabled: true, order: 4, category: "analytics" },
		{ id: "recent-activity", title: "Recent Activity", icon: <AppstoreOutlined />, colSpan: 2, enabled: true, order: 5, category: "monitoring" },
		{ id: "ab-testing", title: "A/B Testing", icon: <ExperimentOutlined />, colSpan: 2, enabled: true, order: 6, category: "marketing" },
		{ id: "campaign-tracker", title: "Campaign Tracker", icon: <PieChartOutlined />, colSpan: 2, enabled: true, order: 7, category: "marketing" },
		{ id: "gamification", title: "Achievements", icon: <TrophyOutlined />, colSpan: 2, enabled: true, order: 8, category: "content" },
	];

	const [widgets, setWidgets] = useLocalStorage<WidgetConfig[]>("dashboard-widgets-v2", defaultWidgets);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

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
	const isLoadingDashboard = branchLoading || promoLoading || jobsLoading || articlesLoading || messagesLoading || partnershipsLoading || subscribersLoading;

	const todayTs = startOfToday();
	const unreadMessagesCount = messages.filter((item) => item.status === "new").length;
	const newPartnershipCount = partnerships.filter((item) => item.status === "new").length;
	const openBranches = branchItems.filter((branch) => branch.status === "buka").length;
	const busyBranches = branchItems.filter((branch) => branch.status === "ramai").length;

	const expiringPromo = useMemo(
		() =>
			promoItems.filter((promo) => {
				const diff = new Date(promo.end_date).getTime() - now.getTime();
				return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
			}),
		[now, promoItems]
	);

	const engagementEventTimestamps = useMemo(() => {
		const messageEvents = messages.map((item) => toTimestamp(item.created)).filter((v): v is number => v !== null);
		const partnershipEvents = partnerships.map((item) => toTimestamp(item.created)).filter((v): v is number => v !== null);
		const subscriberEvents = subscribers.map((item) => toTimestamp(item.created)).filter((v): v is number => v !== null);
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
			const count = engagementEventTimestamps.filter((ts) => ts >= monthStart.getTime() && ts < monthEnd.getTime()).length;
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

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setWidgets((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const handleToggleWidget = (id: string) => {
		setWidgets((items) => items.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
	};

	const handleRemoveWidget = (id: string) => {
		setWidgets((items) => items.filter((item) => item.id !== id));
	};

	const handleResetWidgets = () => {
		if (confirm("Reset layout widget ke default?")) {
			setWidgets(defaultWidgets);
		}
	};

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

	const renderWidgetContent = (widgetId: string) => {
		switch (widgetId) {
			case "stats-overview":
				return (
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{[
							{ label: "Promo Aktif", value: promoItems.length, helper: `${expiringPromo.length} akan berakhir`, icon: <GiftOutlined />, color: "rose" },
							{ label: "Cabang Aktif", value: branchItems.length, helper: `${openBranches} buka • ${busyBranches} ramai`, icon: <ShopOutlined />, color: "blue" },
							{ label: "Loker Terbuka", value: jobs.length, helper: "Posisi tersedia", icon: <TeamOutlined />, color: "amber" },
							{ label: "Artikel Publish", value: articles.length, helper: `${formatNumber(subscribers.length)} subscribers`, icon: <ReadOutlined />, color: "teal" },
						].map((item) => (
							<motion.div
								key={item.label}
								whileHover={{ scale: 1.02 }}
								className={`rounded-xl bg-gradient-to-br from-${item.color}-50 to-white dark:from-${item.color}-900/10 dark:to-transparent border border-${item.color}-200 dark:border-${item.color}-800 p-4`}
							>
								<div className="flex items-start justify-between">
									<div>
										<p className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{item.label}</p>
										<div className="mt-1 text-3xl font-black text-neutral-900 dark:text-white">
											{isLoadingDashboard ? <Skeleton.Input active size="small" style={{ width: 60 }} /> : <AnimatedCounter end={item.value} />}
										</div>
										<p className="text-xs text-neutral-500 mt-1">{item.helper}</p>
									</div>
									<div className={`p-2 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400`}>
										{item.icon}
									</div>
								</div>
							</motion.div>
						))}
					</div>
				);
			case "marketing-performance":
				return <MarketingMiniWidget />;
			case "lead-funnel":
				return <LeadFunnelWidget />;
			case "performance-chart":
				return (
					<div>
						<div className="flex items-center justify-between mb-4">
							<div>
								<span className="text-sm text-neutral-600 dark:text-neutral-400">Total Interaksi</span>
								<div className="text-2xl font-black text-neutral-900 dark:text-white">
									<AnimatedCounter end={seriesTotal} />
								</div>
							</div>
							<Segmented
								size="small"
								options={["Mingguan", "Bulanan"]}
								value={seriesMode}
								onChange={(v) => setSeriesMode(v as SeriesMode)}
							/>
						</div>
						<div className="flex items-end gap-2 h-40">
							{activeSeries.map((point) => {
								const ratio = point.value / maxSeriesValue;
								const heightPercent = Math.round(Math.max(10, ratio * 100));
								return (
									<div key={point.label} className="flex-1 min-w-[40px]">
										<motion.div
											initial={{ height: 0 }}
											animate={{ height: `${heightPercent}%` }}
											className="bg-gradient-to-t from-ruby-600 to-teal-400 rounded-t-lg relative group"
										>
											<div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
												{point.value}
											</div>
										</motion.div>
										<div className="text-center text-xs mt-1 text-neutral-500">{point.label}</div>
									</div>
								);
								})}
						</div>
					</div>
				);
			case "recent-activity":
				return (
					<div className="space-y-3 max-h-64 overflow-y-auto">
						{recentActivities.length > 0 ? (
							recentActivities.slice(0, 6).map((item) => (
								<Link
									key={item.key}
									to={item.link}
									className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-ruby-300 hover:bg-ruby-50/30 dark:hover:bg-ruby-500/10 transition-all"
								>
									<span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${activityToneClass[item.tone]}`} />
									<div className="min-w-0 flex-1">
										<p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{item.title}</p>
										<p className="text-xs text-neutral-500 truncate">{item.detail}</p>
									</div>
								</Link>
							))
						) : (
							<Empty description="Belum ada aktivitas" image={Empty.PRESENTED_IMAGE_SIMPLE} />
						)}
					</div>
				);
			case "ab-testing":
				return <ABTestingWidget />;
			case "campaign-tracker":
				return <CampaignTrackerWidget />;
			case "gamification":
				return <GamificationWidget />;
			default:
				return <div className="p-4 text-neutral-500">Widget content</div>;
		}
	};

	const enabledWidgets = widgets.filter((w) => w.enabled);

	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<motion.p
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-600 dark:text-neutral-400"
					>
						Dashboard
					</motion.p>
					<motion.h1
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.1 }}
						className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white mt-1"
					>
						Analytics Operasional
					</motion.h1>
					<p className="text-sm text-neutral-500 mt-1">{dayString}</p>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<Button icon={<SettingOutlined />} onClick={() => setCustomizableMode(!customizableMode)} type={customizableMode ? "primary" : "default"}>
						{customizableMode ? "Selesai" : "Kustomisasi"}
					</Button>
					{customizableMode && <Button onClick={handleResetWidgets}>Reset Layout</Button>}
					<Link
						to="/admin/promo"
						className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-ruby-600 to-blue-500 px-4 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
					>
						<PlusOutlined /> Tambah Promo
					</Link>
				</div>
			</div>

			{/* Error Alerts */}
			<AnimatePresence>
				{errorMessages.length > 0 && (
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
						{errorMessages.map((msg, index) => (
							<Alert key={`${msg}-${index}`} type="error" showIcon message="Gagal memuat data" description={msg} className="rounded-xl" />
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Notifications */}
			<div className="grid gap-3 md:grid-cols-3">
				{expiringPromo.length > 0 && (
					<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
						<Alert type="warning" showIcon icon={<WarningOutlined />} message={`${expiringPromo.length} promo akan berakhir`} className="rounded-xl" />
					</motion.div>
				)}
				{unreadMessagesCount > 0 && (
					<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
						<Alert type="info" showIcon icon={<MailOutlined />} message={`${unreadMessagesCount} pesan belum dibaca`} className="rounded-xl" />
					</motion.div>
				)}
				{newPartnershipCount > 0 && (
					<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
						<Alert type="success" showIcon icon={<PhoneOutlined />} message={`${newPartnershipCount} lead kemitraan baru`} className="rounded-xl" />
					</motion.div>
				)}
			</div>

			{/* Customizable Widget Grid */}
			<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
				<SortableContext items={enabledWidgets.map((w) => w.id)}>
					<div className="grid gap-5 md:grid-cols-6 xl:grid-cols-12">
						{enabledWidgets.map((widget) => (
							<SortableWidgetCard
								key={widget.id}
								widget={widget}
								isCustomizing={customizableMode}
								onToggle={handleToggleWidget}
								onRemove={handleRemoveWidget}
							>
								<Card
									title={
										<div className="flex items-center gap-2">
											{widget.icon}
											<span className="font-semibold">{widget.title}</span>
										</div>
									}
									className="h-full shadow-sm hover:shadow-md transition-shadow"
								>
									{renderWidgetContent(widget.id)}
								</Card>
							</SortableWidgetCard>
						))}
					</div>
				</SortableContext>
			</DndContext>

			{/* Empty State */}
			{enabledWidgets.length === 0 && (
				<div className="text-center py-12">
					<Empty description="Tidak ada widget aktif. Aktifkan widget dari mode kustomisasi." image={Empty.PRESENTED_IMAGE_SIMPLE} />
					<Button type="primary" onClick={() => setCustomizableMode(true)} className="mt-4">
						Kustomisasi Dashboard
					</Button>
				</div>
			)}
		</div>
	);
}
