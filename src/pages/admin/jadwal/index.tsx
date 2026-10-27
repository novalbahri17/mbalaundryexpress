import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Alert,
	Button,
	Empty,
	Input,
	Modal,
	Select,
	Segmented,
	Spin,
	Table,
	Tag,
	Tooltip,
	message,
} from "antd";
import dayjs from "dayjs";
import {
	AlertTriangle,
	CalendarDays,
	CalendarRange,
	CheckCircle2,
	Copy,
	MessageCircle,
	RefreshCw,
	Users2,
	Wand2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	createShiftAssignment,
	deleteShiftAssignment,
	listShiftAssignments,
	listShiftEmployees,
	listShiftEvents,
} from "@/api/shift.api";
import { useBranches } from "@/hooks/useBranches";
import { MetronicCard, MetronicPage } from "@/components/admin/MetronicPage";
import {
	DAY_MODE_LABEL,
	REGULAR_SHIFTS,
	SHIFT_META,
	addDays,
	buildUsage,
	buildWhatsAppText,
	formatDateId,
	formatDateShort,
	generateSchedule,
	isSunday,
	startOfWeek,
	toDateKey,
} from "@/lib/shiftScheduler";
import { EmployeePanel } from "./EmployeePanel";
import { EventPanel } from "./EventPanel";
import { ShiftChip, WeekDateHeader } from "./ShiftChip";

type RangeMode = "week" | "month" | "custom";

export default function JadwalShiftPage() {
	const queryClient = useQueryClient();
	const { data: branches = [], isLoading: branchesLoading } = useBranches();

	const [branchId, setBranchId] = useState<string>();
	const [rangeMode, setRangeMode] = useState<RangeMode>("week");
	const [anchor, setAnchor] = useState(() => startOfWeek(toDateKey(new Date())));

	const activeBranch = branches.find((b) => b.id === branchId) ?? branches[0];
	const effectiveBranchId = branchId ?? branches[0]?.id;

	// --- Rentang tanggal ----------------------------------------------------
	const { from, to } = useMemo(() => {
		if (rangeMode === "week") return { from: anchor, to: addDays(anchor, 6) };
		if (rangeMode === "month") {
			const d = dayjs(anchor);
			const first = d.startOf("month");
			return { from: first.format("YYYY-MM-DD"), to: first.endOf("month").format("YYYY-MM-DD") };
		}
		return { from: anchor, to: addDays(anchor, 13) };
	}, [anchor, rangeMode]);

	// Periode sebelumnya untuk aturan anti-fatigue & fairness.
	const prevFrom = addDays(from, -28);
	const prevTo = addDays(from, -1);

	// --- Data --------------------------------------------------------------
	const { data: employees = [], isLoading: employeesLoading } = useQuery({
		queryKey: ["shift-employees", effectiveBranchId],
		queryFn: () => listShiftEmployees(effectiveBranchId),
		enabled: Boolean(effectiveBranchId),
	});

	const { data: events = [] } = useQuery({
		queryKey: ["shift-events", effectiveBranchId, prevFrom, to],
		queryFn: () => listShiftEvents({ branchId: effectiveBranchId, from: prevFrom, to }),
		enabled: Boolean(effectiveBranchId),
	});

	const { data: previousAssignments = [] } = useQuery({
		queryKey: ["shift-assignments", effectiveBranchId, prevFrom, prevTo],
		queryFn: () => listShiftAssignments({ branchId: effectiveBranchId as string, from: prevFrom, to: prevTo }),
		enabled: Boolean(effectiveBranchId),
	});

	const { data: savedAssignments = [] } = useQuery({
		queryKey: ["shift-assignments", effectiveBranchId, from, to],
		queryFn: () => listShiftAssignments({ branchId: effectiveBranchId as string, from, to }),
		enabled: Boolean(effectiveBranchId),
	});

	const invalidateAll = () => {
		queryClient.invalidateQueries({ queryKey: ["shift-employees"] });
		queryClient.invalidateQueries({ queryKey: ["shift-events"] });
		queryClient.invalidateQueries({ queryKey: ["shift-assignments"] });
	};

	// --- Engine ------------------------------------------------------------
	const schedule = useMemo(() => {
		if (!effectiveBranchId) return null;
		return generateSchedule({
			branchId: effectiveBranchId,
			from,
			to,
			employees,
			events,
			previousAssignments: [...previousAssignments, ...savedAssignments],
			priorUsage: buildUsage(previousAssignments),
		});
	}, [effectiveBranchId, from, to, employees, events, previousAssignments, savedAssignments]);

	// Kelompokkan hari per minggu untuk tampilan grid.
	const weeks = useMemo(() => {
		if (!schedule) return [];
		const map = new Map<string, typeof schedule.days>();
		for (const day of schedule.days) {
			const wk = startOfWeek(day.date);
			const list = map.get(wk) ?? [];
			list.push(day);
			map.set(wk, list);
		}
		return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
	}, [schedule]);

	// --- Aksi --------------------------------------------------------------
	const [saving, setSaving] = useState(false);
	const [waOpen, setWaOpen] = useState(false);
	const [waText, setWaText] = useState("");

	const handleSave = async () => {
		if (!schedule || !effectiveBranchId) return;
		setSaving(true);
		try {
			// Hapus jadwal lama pada rentang ini, lalu simpan hasil engine.
			await Promise.all(savedAssignments.map((asg) => deleteShiftAssignment(asg.id)));
			for (const asg of schedule.assignments) {
				await createShiftAssignment(asg);
			}
			message.success(`Jadwal ${formatDateShort(from)} – ${formatDateShort(to)} tersimpan.`);
			queryClient.invalidateQueries({ queryKey: ["shift-assignments"] });
		} catch (err) {
			message.error((err as Error)?.message || "Gagal menyimpan jadwal.");
		} finally {
			setSaving(false);
		}
	};

	const openWhatsApp = () => {
		if (!schedule) return;
		setWaText(buildWhatsAppText(activeBranch?.name ?? "MBA Laundry", schedule.days, { from, to }));
		setWaOpen(true);
	};

	const copyWa = async () => {
		try {
			await navigator.clipboard.writeText(waText);
			message.success("Teks jadwal sudah dicopy. Tinggal paste ke grup WhatsApp.");
		} catch {
			message.error("Browser menolak akses clipboard — salin manual dari kotak teks.");
		}
	};

	const dangerCount = schedule?.warnings.filter((w) => w.level === "danger").length ?? 0;
	const warnCount = schedule?.warnings.filter((w) => w.level === "warning").length ?? 0;

	// --- Render ------------------------------------------------------------
	if (branchesLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spin />
			</div>
		);
	}

	return (
		<MetronicPage
			title="Jadwal Shift Otomatis"
			subtitle="Generator roster per cabang: 3 shift 8 jam, rotasi mingguan, anti-fatigue Malam → Pagi, dan fallback otomatis saat ada izin/resign."
		>
			<div className="space-y-4">
				{/* Toolbar */}
				<MetronicCard>
					<div className="flex flex-wrap items-center gap-3">
						<Select
							className="!min-w-[220px]"
							placeholder="Pilih cabang"
							value={effectiveBranchId}
							onChange={setBranchId}
							options={branches.map((b) => ({ value: b.id, label: b.name }))}
						/>

						<Segmented
							value={rangeMode}
							onChange={(v) => {
								setRangeMode(v as RangeMode);
								setAnchor(startOfWeek(toDateKey(new Date())));
							}}
							options={[
								{ value: "week", label: "1 Minggu" },
								{ value: "month", label: "1 Bulan" },
								{ value: "custom", label: "2 Minggu" },
							]}
						/>

						<div className="flex items-center gap-1">
							<Button
								size="small"
								onClick={() =>
									setAnchor((prev) => {
										if (rangeMode === "month") return dayjs(prev).subtract(1, "month").startOf("month").format("YYYY-MM-DD");
										return addDays(startOfWeek(prev), -7);
									})
								}
							>
								‹ Sebelumnya
							</Button>
							<Button
								size="small"
								onClick={() => setAnchor(startOfWeek(toDateKey(new Date())))}
								icon={<RefreshCw size={13} />}
							>
								Hari ini
							</Button>
							<Button
								size="small"
								onClick={() =>
									setAnchor((prev) => {
										if (rangeMode === "month") return dayjs(prev).add(1, "month").startOf("month").format("YYYY-MM-DD");
										return addDays(startOfWeek(prev), 7);
									})
								}
							>
								Berikutnya ›
							</Button>
						</div>

						<Tag color="blue" className="!m-0">
							{formatDateId(from)} – {formatDateId(to)}
						</Tag>

						<div className="ml-auto flex flex-wrap gap-2">
							<Button icon={<MessageCircle size={14} />} onClick={openWhatsApp} disabled={!schedule}>
								Export WhatsApp
							</Button>
							<Button
								type="primary"
								icon={<Wand2 size={14} />}
								loading={saving}
								onClick={handleSave}
								disabled={!schedule}
							>
								Simpan Jadwal
							</Button>
						</div>
					</div>

					{schedule?.meta.stressTest && (
						<Alert
							className="!mt-3"
							type="warning"
							showIcon
							message={`Stress test aktif: cabang ini hanya punya ${schedule.meta.crewCount} karyawan aktif (ideal 3). Sistem tetap jalan dengan mode mitigasi.`}
						/>
					)}
				</MetronicCard>

				{/* Roster */}
				<MetronicCard
					title="Roster Mingguan"
					icon={<CalendarRange size={16} />}
					noPadding
				>
					{!schedule ? (
						<div className="p-8">
							<Empty description="Pilih cabang untuk melihat jadwal" />
						</div>
					) : (
						<div className="overflow-x-auto p-4">
							<div className="space-y-4">
								{weeks.map(([weekStart, days]) => (
									<div key={weekStart} className="rounded-xl border border-[var(--border)] p-3">
										<div className="mb-2 flex items-center gap-2">
											<CalendarDays size={14} className="text-[var(--text-muted)]" />
											<span className="text-[12px] font-bold text-[var(--text-primary)]">
												Pekan {formatDateShort(weekStart)} – {formatDateShort(addDays(weekStart, 6))}
											</span>
										</div>
										<div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(130px, 1fr))` }}>
											{days.map((day) => (
												<div key={`h-${day.date}`}>
													<WeekDateHeader date={day.date} />
												</div>
											))}
											{days.map((day) => (
												<div key={day.date} className="space-y-1">
													{day.slots.length === 0 ? (
														<div className="flex min-h-[64px] items-center justify-center rounded-md border border-dashed border-[var(--border-strong)] px-2 text-[11px] text-[var(--text-muted)]">
															Belum ada petugas
														</div>
													) : (
														day.slots.map((slot, i) => (
															<ShiftChip
																// biome-ignore lint/suspicious/noArrayIndexKey: urutan slot tetap
																key={`${day.date}-${slot.shift}-${i}`}
																shift={slot.shift}
																name={slot.employeeName}
																backup={slot.isBackup}
																title={`${SHIFT_META[slot.shift].label} ${slot.startTime}–${slot.endTime} • ${slot.employeeName}${slot.isBackup ? " (backup)" : ""}`}
															/>
														))
													)}
													{isSunday(day.date) && day.off.length > 0 && (
														<div className="text-[10px] text-[var(--text-muted)]">Libur: {day.off.join(", ")}</div>
													)}
													{day.notes.length > 0 && (
														<Tooltip title={day.notes.join(" • ")}>
															<div className="cursor-help text-[10px] font-semibold text-[#B45309]">
																{DAY_MODE_LABEL[day.mode]}
															</div>
														</Tooltip>
													)}
												</div>
											))}
										</div>
									</div>
								))}
							</div>

							{/* Legend */}
							<div className="mt-4 flex flex-wrap gap-3 border-t border-[var(--border)] pt-3">
								{Object.entries(SHIFT_META).map(([key, meta]) => (
									<div key={key} className="flex items-center gap-1.5">
										<span
											className="inline-block h-3 w-3 rounded"
											style={{ background: meta.bg, border: `1px solid ${meta.color}` }}
										/>
										<span className="text-[11px] text-[var(--text-secondary)]">
											{meta.emoji} {meta.label} ({meta.start}–{meta.end})
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</MetronicCard>

				{/* Peringatan */}
				{schedule && schedule.warnings.length > 0 && (
					<MetronicCard
						title={`Peringatan & Catatan (${dangerCount} kritis, ${warnCount} peringatan)`}
						icon={<AlertTriangle size={16} />}
					>
						<div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
							{schedule.warnings.map((w, i) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: daftar statis per render
									key={`${w.date}-${i}`}
									className="flex items-start gap-2 rounded-lg px-3 py-2"
									style={{
										background: w.level === "danger" ? "#FEE2E2" : w.level === "warning" ? "#FEF3C7" : "var(--bg-surface)",
										color: w.level === "danger" ? "#991B1B" : w.level === "warning" ? "#92400E" : "var(--text-secondary)",
									}}
								>
									<AlertTriangle size={14} className="mt-0.5 shrink-0" />
									<span className="text-[12px] leading-snug">
										<strong>{formatDateShort(w.date)}</strong> — {w.message}
									</span>
								</div>
							))}
						</div>
					</MetronicCard>
				)}

				{/* Rekap fairness */}
				{schedule && schedule.summary.length > 0 && (
					<MetronicCard title="Rekap Pemerataan Shift" icon={<CheckCircle2 size={16} />} noPadding>
						<Table
							size="small"
							pagination={false}
							rowKey="employeeId"
							dataSource={schedule.summary}
							columns={[
								{ title: "Karyawan", dataIndex: "name", key: "name" },
								{
									title: SHIFT_META.pagi.label,
									dataIndex: "pagi",
									key: "pagi",
									align: "center",
									render: (v: number) => <Tag color="gold">{v}</Tag>,
								},
								{
									title: SHIFT_META.siang.label,
									dataIndex: "siang",
									key: "siang",
									align: "center",
									render: (v: number) => <Tag color="orange">{v}</Tag>,
								},
								{
									title: SHIFT_META.malam.label,
									dataIndex: "malam",
									key: "malam",
									align: "center",
									render: (v: number) => <Tag color="geekblue">{v}</Tag>,
								},
								{
									title: "12 Jam",
									dataIndex: "emergency",
									key: "emergency",
									align: "center",
									render: (v: number) => (v > 0 ? <Tag color="volcano">{v}</Tag> : "—"),
								},
								{ title: "Total Jam", dataIndex: "totalHours", key: "totalHours", align: "center" },
								{ title: "Hari Libur", dataIndex: "offDays", key: "offDays", align: "center" },
							]}
						/>
					</MetronicCard>
				)}

				{/* Manajemen karyawan & absensi */}
				<div className="grid gap-4 lg:grid-cols-2">
					<MetronicCard title="Karyawan Cabang" icon={<Users2 size={16} />}>
						<EmployeePanel
							branchId={effectiveBranchId}
							employees={employees}
							loading={employeesLoading}
							onChanged={invalidateAll}
						/>
					</MetronicCard>

					<MetronicCard title="Absensi & Perubahan Status" icon={<CalendarDays size={16} />}>
						<EventPanel branchId={effectiveBranchId} employees={employees} events={events} onChanged={invalidateAll} />
					</MetronicCard>
				</div>

				{/* Ringkasan aturan */}
				<MetronicCard title="Aturan yang Dijalankan Sistem" icon={<CheckCircle2 size={16} />}>
					<ul className="ml-4 list-disc space-y-1 text-[12px] leading-relaxed text-[var(--text-secondary)]">
						<li>
							Tiap cabang <strong>3 orang per shift</strong>: 🌅 Pagi 08:00–16:00, ☀️ Siang 16:00–00:00, 🌙 Malam
							00:00–08:00.
						</li>
						<li>
							<strong>Restriksi:</strong> karyawan yang tidak dicentang “Bisa Malam” hanya mendapat Pagi & Siang.
						</li>
						<li>
							<strong>Anti-fatigue:</strong> crew yang Malam pekan ini tidak akan langsung dapat Pagi pekan depan —
							transisi wajib lewat Siang dulu.
						</li>
						<li>
							<strong>Rotasi & pemerataan:</strong> shift bergeser tiap pekan, porsi Pagi/Siang/Malam diseimbangkan
							per siklus 4 pekan.
						</li>
						<li>
							<strong>Resign (A):</strong> karyawan keluar dari rotasi, slot Pagi diisi{" "}
							{schedule?.meta.backupName ?? "Mbak Koperasi/anak magang"}, sisanya dirotasi ulang.
						</li>
						<li>
							<strong>Izin/Sakit/Libur (B):</strong> Pagi dibackup staf backup; Siang & Malam diisi crew aktif tanpa
							melewati 12 jam/hari.
						</li>
						<li>
							<strong>Sabtu (C):</strong> bila backup siap — backup masuk 08:00–13:00 lalu shift reguler lanjut; bila
							backup tidak ada — hari itu jadi 2 shift @12 jam.
						</li>
						<li>
							<strong>Minggu (D):</strong> format 3 shift diabaikan, 2 orang jaga masing-masing 12 jam (08:00–20:00 &
							20:00–08:00).
						</li>
						<li>
							Shift reguler yang dipakai: {REGULAR_SHIFTS.map((s) => SHIFT_META[s].label).join(" • ")}.
						</li>
					</ul>
				</MetronicCard>
			</div>

			<Modal
				open={waOpen}
				onCancel={() => setWaOpen(false)}
				title="Teks Jadwal untuk WhatsApp"
				width={560}
				footer={[
					<Button key="copy" type="primary" icon={<Copy size={14} />} onClick={copyWa}>
						Copy Teks
					</Button>,
					<Button key="close" onClick={() => setWaOpen(false)}>
						Tutup
					</Button>,
				]}
			>
				<Input.TextArea value={waText} rows={16} className="!font-mono !text-[12px]" />
			</Modal>

		</MetronicPage>
	);
}
