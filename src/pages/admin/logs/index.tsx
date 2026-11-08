import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Alert,
	Badge,
	Button,
	Card,
	Empty,
	Input,
	Modal,
	Popconfirm,
	Segmented,
	Select,
	Space,
	Table,
	Tabs,
	Tag,
	Tooltip,
	message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
	Activity,
	AlertCircle,
	CheckCircle2,
	Clock,
	Copy,
	Eye,
	Globe,
	Laptop,
	LogIn,
	Monitor,
	RefreshCw,
	Search,
	ShieldAlert,
	ShieldCheck,
	Smartphone,
	Tablet,
	Trash2,
	User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { clearAdminLogs, getActivityLogs, getLoginLogs } from "@/api/logs.api";
import { MetronicCard, MetronicPage } from "@/components/admin/MetronicPage";
import type { AdminActivityLog, AdminLoginLog } from "@/types/database.types";

export default function LogsPage() {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<"login" | "activity">("login");
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [actionFilter, setActionFilter] = useState<string>("all");
	const [pageSize, setPageSize] = useState<number>(20);
	const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
	const [selectedLog, setSelectedLog] = useState<AdminActivityLog | null>(null);
	const [detailModalOpen, setDetailModalOpen] = useState(false);
	const [clearing, setClearing] = useState(false);

	// Query Login Logs
	const {
		data: loginLogs = [],
		isLoading: loginLoading,
		refetch: refetchLogin,
	} = useQuery({
		queryKey: ["admin-login-logs"],
		queryFn: () => getLoginLogs(300),
		staleTime: 10_000,
	});

	// Query Activity Logs
	const {
		data: activityLogs = [],
		isLoading: activityLoading,
		refetch: refetchActivity,
	} = useQuery({
		queryKey: ["admin-activity-logs"],
		queryFn: () => getActivityLogs(300),
		staleTime: 10_000,
	});

	const handleRefresh = () => {
		if (activeTab === "login") refetchLogin();
		else refetchActivity();
		message.success("Data log diperbarui.");
	};

	const handleClearLogs = async (type: "login" | "activity") => {
		setClearing(true);
		try {
			await clearAdminLogs(type);
			message.success(`Log ${type === "login" ? "login" : "aktivitas"} berhasil dibersihkan.`);
			queryClient.invalidateQueries({ queryKey: ["admin-login-logs"] });
			queryClient.invalidateQueries({ queryKey: ["admin-activity-logs"] });
		} catch (err) {
			message.error((err as Error)?.message || "Gagal membersihkan log.");
		} finally {
			setClearing(false);
		}
	};

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		message.success(`${label} disalin ke clipboard.`);
	};

	// Device Icon Helper
	const getDeviceIcon = (deviceStr: string) => {
		const lower = (deviceStr || "").toLowerCase();
		if (lower.includes("hp") || lower.includes("iphone") || lower.includes("smartphone")) {
			return <Smartphone size={14} className="text-blue-500 shrink-0" />;
		}
		if (lower.includes("tablet") || lower.includes("ipad")) {
			return <Tablet size={14} className="text-purple-500 shrink-0" />;
		}
		if (lower.includes("laptop") || lower.includes("macbook")) {
			return <Laptop size={14} className="text-emerald-500 shrink-0" />;
		}
		return <Monitor size={14} className="text-slate-500 shrink-0" />;
	};

	// Filtered Login Logs
	const filteredLoginLogs = useMemo(() => {
		const result = loginLogs.filter((log) => {
			if (statusFilter !== "all" && log.status !== statusFilter) return false;
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchEmail = (log.admin_email || "").toLowerCase().includes(q);
				const matchIp = (log.ip_address || "").toLowerCase().includes(q);
				const matchDev = (log.device || "").toLowerCase().includes(q);
				const matchReason = (log.fail_reason || "").toLowerCase().includes(q);
				if (!matchEmail && !matchIp && !matchDev && !matchReason) return false;
			}
			return true;
		});

		return result.sort((a, b) => {
			const da = new Date(a.created).getTime() || 0;
			const db = new Date(b.created).getTime() || 0;
			return sortOrder === "desc" ? db - da : da - db;
		});
	}, [loginLogs, statusFilter, searchQuery, sortOrder]);

	// Filtered Activity Logs
	const filteredActivityLogs = useMemo(() => {
		const result = activityLogs.filter((log) => {
			if (actionFilter !== "all" && log.action !== actionFilter) return false;
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchEmail = (log.admin_email || "").toLowerCase().includes(q);
				const matchSummary = (log.summary || "").toLowerCase().includes(q);
				const matchCol = (log.collection || "").toLowerCase().includes(q);
				const matchIp = (log.ip_address || "").toLowerCase().includes(q);
				const matchDev = (log.device || "").toLowerCase().includes(q);
				if (!matchEmail && !matchSummary && !matchCol && !matchIp && !matchDev) return false;
			}
			return true;
		});

		return result.sort((a, b) => {
			const da = new Date(a.created).getTime() || 0;
			const db = new Date(b.created).getTime() || 0;
			return sortOrder === "desc" ? db - da : da - db;
		});
	}, [activityLogs, actionFilter, searchQuery, sortOrder]);

	// Table Columns - Login Logs
	const loginColumns: ColumnsType<AdminLoginLog> = [
		{
			title: "Waktu (Real Time WIB)",
			dataIndex: "created_wib",
			key: "created_wib",
			width: 190,
			render: (wib: string) => (
				<div className="flex items-center gap-1.5 font-medium">
					<Clock size={13} className="text-[var(--text-muted)] shrink-0" />
					<span className="text-[12px] text-[var(--text-primary)]">{wib || "-"}</span>
				</div>
			),
		},
		{
			title: "Email Pengguna",
			dataIndex: "admin_email",
			key: "admin_email",
			width: 210,
			render: (email: string) => (
				<div className="flex items-center gap-1.5">
					<User size={13} className="text-[var(--brand)] shrink-0" />
					<span className="truncate text-[12px] font-semibold text-[var(--text-primary)]">{email}</span>
				</div>
			),
		},
		{
			title: "Status Login",
			dataIndex: "status",
			key: "status",
			width: 160,
			render: (status: string, row) => {
				if (status === "success") {
					return (
						<Tag color="success" className="!m-0 inline-flex items-center gap-1 font-semibold">
							<ShieldCheck size={12} />
							<span>Berhasil</span>
						</Tag>
					);
				}
				if (status === "locked") {
					return (
						<Tooltip title={row.fail_reason || "Terkunci rate limit"}>
							<Tag color="volcano" className="!m-0 inline-flex items-center gap-1 font-semibold">
								<ShieldAlert size={12} />
								<span>Terkunci (Limit)</span>
							</Tag>
						</Tooltip>
					);
				}
				return (
					<Tooltip title={row.fail_reason || "Login gagal"}>
						<Tag color="error" className="!m-0 inline-flex items-center gap-1 font-semibold">
							<AlertCircle size={12} />
							<span>Gagal: {row.fail_reason || "Password Salah"}</span>
						</Tag>
					</Tooltip>
				);
			},
		},
		{
			title: "IP Asli Terdeteksi",
			dataIndex: "ip_address",
			key: "ip_address",
			width: 200,
			render: (ip: string) => {
				const isLocal = ip.includes("127.0.0.1") || ip.includes("Localhost");
				return (
					<div className="flex items-center gap-1.5">
						<Tag
							color={isLocal ? "cyan" : "blue"}
							className="!m-0 cursor-pointer !font-mono !text-[11px] font-bold"
							onClick={() => copyToClipboard(ip, "IP Address")}
							title="Klik untuk menyalin IP"
						>
							<Globe size={11} className="inline mr-1" />
							{ip}
						</Tag>
					</div>
				);
			},
		},
		{
			title: "Perangkat & Browser",
			dataIndex: "device",
			key: "device",
			render: (device: string, row) => (
				<Tooltip title={`User-Agent: ${row.user_agent || device}`}>
					<div className="flex items-center gap-1.5">
						{getDeviceIcon(device)}
						<span className="truncate text-[12px] text-[var(--text-secondary)]">{device}</span>
					</div>
				</Tooltip>
			),
		},
	];

	// Table Columns - Activity Logs
	const activityColumns: ColumnsType<AdminActivityLog> = [
		{
			title: "Waktu (WIB)",
			dataIndex: "created_wib",
			key: "created_wib",
			width: 185,
			render: (wib: string) => (
				<div className="flex items-center gap-1.5">
					<Clock size={13} className="text-[var(--text-muted)] shrink-0" />
					<span className="text-[12px] font-medium text-[var(--text-primary)]">{wib || "-"}</span>
				</div>
			),
		},
		{
			title: "Admin",
			dataIndex: "admin_email",
			key: "admin_email",
			width: 170,
			render: (email: string) => (
				<span className="truncate text-[12px] font-semibold text-[var(--text-primary)]">{email}</span>
			),
		},
		{
			title: "Aksi",
			dataIndex: "action",
			key: "action",
			width: 120,
			render: (action: string) => {
				const config: Record<string, { color: string; label: string }> = {
					create: { color: "green", label: "TAMBAH" },
					update: { color: "blue", label: "UBAH" },
					delete: { color: "red", label: "HAPUS" },
					login: { color: "purple", label: "LOGIN" },
					schedule_save: { color: "volcano", label: "JADWAL" },
				};
				const c = config[action] ?? { color: "default", label: action.toUpperCase() };
				return (
					<Tag color={c.color} className="!m-0 !text-[10px] font-bold">
						{c.label}
					</Tag>
				);
			},
		},
		{
			title: "Target / Modul",
			dataIndex: "collection",
			key: "collection",
			width: 140,
			render: (col: string) => <Tag className="!m-0 !font-mono !text-[11px] text-[var(--text-secondary)]">{col}</Tag>,
		},
		{
			title: "Aktivitas / Perubahan yang Dilakukan",
			dataIndex: "summary",
			key: "summary",
			render: (summary: string, row) => (
				<div className="min-w-[200px]">
					<span className="font-medium text-[12px] text-[var(--text-primary)]">{summary}</span>
					{row.details && (
						<button
							type="button"
							onClick={() => {
								setSelectedLog(row);
								setDetailModalOpen(true);
							}}
							className="ml-2 inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--brand)] hover:underline cursor-pointer"
						>
							<Eye size={11} /> Detail
						</button>
					)}
				</div>
			),
		},
		{
			title: "IP Terdeteksi",
			dataIndex: "ip_address",
			key: "ip_address",
			width: 160,
			render: (ip: string) => <span className="font-mono text-[11px] text-[var(--text-secondary)]">{ip}</span>,
		},
		{
			title: "Perangkat",
			dataIndex: "device",
			key: "device",
			width: 180,
			render: (device: string) => (
				<div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] truncate">
					{getDeviceIcon(device)}
					<span className="truncate">{device}</span>
				</div>
			),
		},
	];

	// Summary Statistics
	const stats = useMemo(() => {
		const totalLogins = loginLogs.length;
		const successLogins = loginLogs.filter((l) => l.status === "success").length;
		const failedLogins = loginLogs.filter((l) => l.status === "failed" || l.status === "locked").length;
		const totalActivities = activityLogs.length;
		return { totalLogins, successLogins, failedLogins, totalActivities };
	}, [loginLogs, activityLogs]);

	return (
		<MetronicPage
			title="Log Keamanan & Aktivitas"
			subtitle="Pemantauan riwayat login admin, deteksi IP asli, perangkat & jam real-time Indonesia (WIB), serta riwayat perubahan data."
		>
			<div className="space-y-4">
				{/* ============ STATISTIK RINGKAS ============ */}
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<Card size="small" className="!rounded-xl border border-[var(--border)]">
						<div className="flex items-center gap-3">
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
								<ShieldCheck size={20} />
							</span>
							<div>
								<span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
									Login Berhasil
								</span>
								<span className="text-[18px] font-bold text-emerald-600">{stats.successLogins}</span>
							</div>
						</div>
					</Card>

					<Card size="small" className="!rounded-xl border border-[var(--border)]">
						<div className="flex items-center gap-3">
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40">
								<ShieldAlert size={20} />
							</span>
							<div>
								<span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
									Percobaan Gagal
								</span>
								<span className="text-[18px] font-bold text-red-600">{stats.failedLogins}</span>
							</div>
						</div>
					</Card>

					<Card size="small" className="!rounded-xl border border-[var(--border)]">
						<div className="flex items-center gap-3">
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
								<LogIn size={20} />
							</span>
							<div>
								<span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
									Total Log Login
								</span>
								<span className="text-[18px] font-bold text-[var(--text-primary)]">{stats.totalLogins}</span>
							</div>
						</div>
					</Card>

					<Card size="small" className="!rounded-xl border border-[var(--border)]">
						<div className="flex items-center gap-3">
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40">
								<Activity size={20} />
							</span>
							<div>
								<span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
									Perubahan Aktivitas
								</span>
								<span className="text-[18px] font-bold text-purple-600">{stats.totalActivities}</span>
							</div>
						</div>
					</Card>
				</div>

				{/* ============ TABS & KONTROL LOG ============ */}
				<MetronicCard noPadding>
					{/* Header Kontrol */}
					<div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
						<div className="flex flex-wrap items-center gap-2">
							<Segmented
								value={activeTab}
								onChange={(val) => {
									setActiveTab(val as "login" | "activity");
									setSearchQuery("");
								}}
								options={[
									{
										value: "login",
										label: (
											<span className="flex items-center gap-1.5 font-semibold py-0.5">
												<LogIn size={14} /> Log Login ({loginLogs.length})
											</span>
										),
									},
									{
										value: "activity",
										label: (
											<span className="flex items-center gap-1.5 font-semibold py-0.5">
												<Activity size={14} /> Log Aktivitas Perubahan ({activityLogs.length})
											</span>
										),
									},
								]}
							/>
						</div>

						<div className="flex flex-wrap items-center gap-2">
							<Input
								prefix={<Search size={13} className="text-[var(--text-muted)]" />}
								placeholder="Cari email, IP, perangkat..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								allowClear
								className="!w-[220px]"
							/>

							{activeTab === "login" ? (
								<Select
									value={statusFilter}
									onChange={setStatusFilter}
									className="!w-[130px]"
									options={[
										{ value: "all", label: "Semua Status" },
										{ value: "success", label: "Berhasil" },
										{ value: "failed", label: "Gagal" },
										{ value: "locked", label: "Terkunci" },
									]}
								/>
							) : (
								<Select
									value={actionFilter}
									onChange={setActionFilter}
									className="!w-[140px]"
									options={[
										{ value: "all", label: "Semua Aksi" },
										{ value: "create", label: "Tambah Data" },
										{ value: "update", label: "Ubah Data" },
										{ value: "delete", label: "Hapus Data" },
										{ value: "login", label: "Login" },
										{ value: "schedule_save", label: "Jadwal Shift" },
									]}
								/>
							)}

							{/* Dropdown Jumlah Tampil: 10, 20, 50 */}
							<Select
								value={pageSize}
								onChange={setPageSize}
								className="!w-[130px]"
								options={[
									{ value: 10, label: "Tampil: 10" },
									{ value: 20, label: "Tampil: 20" },
									{ value: 50, label: "Tampil: 50" },
								]}
							/>

							{/* Dropdown Sortir Waktu */}
							<Select
								value={sortOrder}
								onChange={setSortOrder}
								className="!w-[145px]"
								options={[
									{ value: "desc", label: "⏳ Terbaru Dulu" },
									{ value: "asc", label: "⌛ Terlama Dulu" },
								]}
							/>

							<Button icon={<RefreshCw size={13} />} onClick={handleRefresh}>
								Refresh
							</Button>

							<Popconfirm
								title={`Bersihkan semua log ${activeTab === "login" ? "login" : "aktivitas"}?`}
								description="Tindakan ini akan mengosongkan riwayat log pada tab ini."
								onConfirm={() => handleClearLogs(activeTab)}
								okText="Bersihkan"
								cancelText="Batal"
								okButtonProps={{ danger: true }}
							>
								<Button danger icon={<Trash2 size={13} />} loading={clearing}>
									Bersihkan Log
								</Button>
							</Popconfirm>
						</div>
					</div>

					{/* Tabel Data */}
					{activeTab === "login" ? (
						<Table
							size="middle"
							rowKey="id"
							columns={loginColumns}
							dataSource={filteredLoginLogs}
							loading={loginLoading}
							pagination={{
								pageSize,
								onShowSizeChange: (_curr, size) => setPageSize(size),
								pageSizeOptions: ["10", "20", "50"],
								showSizeChanger: true,
								showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`,
							}}
							scroll={{ x: "max-content" }}
						/>
					) : (
						<Table
							size="middle"
							rowKey="id"
							columns={activityColumns}
							dataSource={filteredActivityLogs}
							loading={activityLoading}
							pagination={{
								pageSize,
								onShowSizeChange: (_curr, size) => setPageSize(size),
								pageSizeOptions: ["10", "20", "50"],
								showSizeChanger: true,
								showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} data`,
							}}
							scroll={{ x: "max-content" }}
						/>
					)}
				</MetronicCard>
			</div>

			{/* Modal Detail Perubahan JSON / Data */}
			<Modal
				open={detailModalOpen}
				onCancel={() => setDetailModalOpen(false)}
				title={
					<div className="flex items-center gap-2">
						<Activity size={16} className="text-[var(--brand)]" />
						<span>Detail Aktivitas Perubahan Data</span>
					</div>
				}
				footer={[
					<Button key="close" onClick={() => setDetailModalOpen(false)}>
						Tutup
					</Button>,
				]}
				width={600}
			>
				{selectedLog && (
					<div className="space-y-3 py-2">
						<div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-[12px] space-y-1.5">
							<div>
								<span className="font-bold text-[var(--text-muted)] uppercase text-[10px] block">
									Ringkasan Perubahan:
								</span>
								<span className="font-semibold text-[13px] text-[var(--text-primary)]">{selectedLog.summary}</span>
							</div>
							<div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--border)]">
								<div>
									<span className="text-[10px] text-[var(--text-muted)] block">Admin:</span>
									<span className="font-medium">{selectedLog.admin_email}</span>
								</div>
								<div>
									<span className="text-[10px] text-[var(--text-muted)] block">Waktu Real-Time:</span>
									<span className="font-medium">{selectedLog.created_wib}</span>
								</div>
								<div>
									<span className="text-[10px] text-[var(--text-muted)] block">IP Address:</span>
									<span className="font-mono">{selectedLog.ip_address}</span>
								</div>
								<div>
									<span className="text-[10px] text-[var(--text-muted)] block">Perangkat:</span>
									<span>{selectedLog.device}</span>
								</div>
							</div>
						</div>

						{selectedLog.details && (
							<div>
								<span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
									Payload / Data yang Berubah:
								</span>
								<pre className="max-h-[300px] overflow-auto rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3 font-mono text-[11px] leading-relaxed text-[var(--text-secondary)]">
									{(() => {
										try {
											return JSON.stringify(JSON.parse(selectedLog.details), null, 2);
										} catch {
											return selectedLog.details;
										}
									})()}
								</pre>
							</div>
						)}
					</div>
				)}
			</Modal>
		</MetronicPage>
	);
}
