import {
	Alert,
	Button,
	Checkbox,
	DatePicker,
	Empty,
	Input,
	Modal,
	Radio,
	Segmented,
	Select,
	Spin,
	Table,
	Tabs,
	Tag,
	Tooltip,
	message,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import {
	AlertTriangle,
	ArrowLeftRight,
	CalendarDays,
	CalendarRange,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Copy,
	Edit3,
	ExternalLink,
	History,
	Info,
	LayoutGrid,
	Link2,
	MapPin,
	MessageCircle,
	RefreshCw,
	RotateCcw,
	Rows3,
	Save,
	Share2,
	Sparkles,
	Store,
	Users,
	Users2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
	createShiftAssignment,
	deleteShiftAssignment,
	listShiftAssignments,
	listShiftEmployees,
	listShiftEvents,
} from "@/api/shift.api";
import { logAdminActivity } from "@/api/logs.api";
import { useBranches } from "@/hooks/useBranches";
import { MetronicCard, MetronicPage } from "@/components/admin/MetronicPage";
import {
	DAY_MODE_LABEL,
	SHIFT_META,
	addDays,
	allowedRegularShifts,
	buildUsage,
	buildWhatsAppText,
	eachDate,
	formatDateId,
	formatDateShort,
	generateSchedule,
	isSunday,
	startOfWeek,
	toDateKey,
} from "@/lib/shiftScheduler";
import type { DaySchedule, DaySlot, EmployeeSummary, ScheduleWarning, ShiftKind } from "@/lib/shiftScheduler";
import type { ShiftEmployee } from "@/types/database.types";
import { EmployeePanel } from "./EmployeePanel";
import { EventPanel } from "./EventPanel";
import { ModeBadge, RosterPerson, ShiftLegendRow, WeekDateHeader } from "./ShiftChip";

type RangeMode = "week" | "2week" | "month" | "2month" | "3month" | "4month" | "5month" | "6month" | "year" | "custom";
type ViewMode = "matrix" | "cards";

/** Gabungkan peringatan yang berulang jadi satu baris + daftar tanggal. */
interface GroupedWarning {
	level: ScheduleWarning["level"];
	message: string;
	dates: string[];
}

const groupWarnings = (warnings: ScheduleWarning[]): GroupedWarning[] => {
	const map = new Map<string, GroupedWarning>();
	for (const w of warnings) {
		const key = `${w.level}|${w.message}`;
		const existing = map.get(key);
		if (existing) existing.dates.push(w.date);
		else map.set(key, { level: w.level, message: w.message, dates: [w.date] });
	}
	const order = { danger: 0, warning: 1, info: 2 };
	return Array.from(map.values()).sort((a, b) => order[a.level] - order[b.level] || b.dates.length - a.dates.length);
};

export default function JadwalShiftPage() {
	const queryClient = useQueryClient();
	const { data: branches = [], isLoading: branchesLoading } = useBranches();

	const [branchId, setBranchId] = useState<string>();
	const [rangeMode, setRangeMode] = useState<RangeMode>("week");
	const [viewMode, setViewMode] = useState<ViewMode>("matrix");
	const [anchor, setAnchor] = useState(() => startOfWeek(toDateKey(new Date())));

	// Setting per-cabang: apakah Mbak Koperasi / Magang aktif atau fallback 12 jam (tersimpan di localStorage)
	const [backupByBranch, setBackupByBranch] = useState<Record<string, boolean>>(() => {
		try {
			const raw = localStorage.getItem("mba-shift-branch-backup");
			return raw ? JSON.parse(raw) : {};
		} catch {
			return {};
		}
	});

	const [showRules, setShowRules] = useState(false);
	const [showAllWarnings, setShowAllWarnings] = useState(false);

	const activeBranch = branches.find((b) => b.id === branchId) ?? branches[0];
	const effectiveBranchId = branchId ?? branches[0]?.id;

	// Nilai backupAvailable khusus cabang aktif
	const backupAvailable = useMemo(() => {
		if (!effectiveBranchId) return true;
		if (effectiveBranchId in backupByBranch) {
			return backupByBranch[effectiveBranchId];
		}
		return true;
	}, [effectiveBranchId, backupByBranch]);

	const setBackupAvailable = (val: boolean) => {
		if (!effectiveBranchId) return;
		setBackupByBranch((prev) => {
			const next = { ...prev, [effectiveBranchId]: val };
			try {
				localStorage.setItem("mba-shift-branch-backup", JSON.stringify(next));
			} catch {}
			return next;
		});
	};

	// --- Rentang tanggal ----------------------------------------------------
	const [customRange, setCustomRange] = useState<[string, string] | null>(null);

	const isMonthBased =
		rangeMode === "month" ||
		rangeMode === "2month" ||
		rangeMode === "3month" ||
		rangeMode === "4month" ||
		rangeMode === "5month" ||
		rangeMode === "6month" ||
		rangeMode === "year";

	const { from, to } = useMemo(() => {
		if (rangeMode === "custom" && customRange) {
			return { from: customRange[0], to: customRange[1] };
		}
		if (rangeMode === "week") return { from: anchor, to: addDays(anchor, 6) };
		if (rangeMode === "2week") return { from: anchor, to: addDays(anchor, 13) };

		const d = dayjs(anchor);
		const first = d.startOf("month");

		if (rangeMode === "month") {
			return { from: first.format("YYYY-MM-DD"), to: first.endOf("month").format("YYYY-MM-DD") };
		}
		if (rangeMode === "2month") {
			return { from: first.format("YYYY-MM-DD"), to: first.add(1, "month").endOf("month").format("YYYY-MM-DD") };
		}
		if (rangeMode === "3month") {
			return { from: first.format("YYYY-MM-DD"), to: first.add(2, "month").endOf("month").format("YYYY-MM-DD") };
		}
		if (rangeMode === "4month") {
			return { from: first.format("YYYY-MM-DD"), to: first.add(3, "month").endOf("month").format("YYYY-MM-DD") };
		}
		if (rangeMode === "5month") {
			return { from: first.format("YYYY-MM-DD"), to: first.add(4, "month").endOf("month").format("YYYY-MM-DD") };
		}
		if (rangeMode === "6month") {
			return { from: first.format("YYYY-MM-DD"), to: first.add(5, "month").endOf("month").format("YYYY-MM-DD") };
		}
		if (rangeMode === "year") {
			return { from: first.format("YYYY-MM-DD"), to: first.add(11, "month").endOf("month").format("YYYY-MM-DD") };
		}

		return { from: anchor, to: addDays(anchor, 6) };
	}, [anchor, rangeMode, customRange]);

	const shiftLabel = (v: RangeMode) => {
		switch (v) {
			case "week":
				return "1 Minggu (7 hari)";
			case "2week":
				return "2 Minggu (14 hari)";
			case "month":
				return "1 Bulan";
			case "2month":
				return "2 Bulan";
			case "3month":
				return "3 Bulan (Kuartal)";
			case "4month":
				return "4 Bulan";
			case "5month":
				return "5 Bulan";
			case "6month":
				return "6 Bulan (Semester)";
			case "year":
				return "1 Tahun Penuh (12 Bulan)";
			case "custom":
				return "Rentang Bebas (Custom)";
			default:
				return "1 Minggu";
		}
	};

	const stepAnchor = (direction: -1 | 1) => {
		setAnchor((prev) => {
			if (rangeMode === "week") return addDays(startOfWeek(prev), direction * 7);
			if (rangeMode === "2week") return addDays(startOfWeek(prev), direction * 14);

			const d = dayjs(prev);
			let months = 1;
			if (rangeMode === "2month") months = 2;
			else if (rangeMode === "3month") months = 3;
			else if (rangeMode === "4month") months = 4;
			else if (rangeMode === "5month") months = 5;
			else if (rangeMode === "6month") months = 6;
			else if (rangeMode === "year") months = 12;

			return d
				.add(direction * months, "month")
				.startOf("month")
				.format("YYYY-MM-DD");
		});
	};

	const prevFrom = addDays(from, -28);
	const prevTo = addDays(from, -1);

	// --- Data ---------------------------------------------------------------
	// Ambil semua karyawan semua cabang (untuk lookup BKO & pinjam staf)
	const { data: allEmployees = [], isLoading: employeesLoading } = useQuery({
		queryKey: ["shift-employees", "all"],
		queryFn: () => listShiftEmployees(),
	});

	// Karyawan cabang saat ini
	const employees = useMemo(() => {
		return allEmployees.filter((e) => e.branch_id === effectiveBranchId);
	}, [allEmployees, effectiveBranchId]);

	// Statistik ringkas per cabang untuk Card Pilihan Cabang
	const branchStats = useMemo(() => {
		const map = new Map<
			string,
			{ crewCount: number; hasBackup: boolean; backupName: string; backupMode: "auto" | "no-backup" }
		>();
		for (const b of branches) {
			const branchEmps = allEmployees.filter((e) => e.branch_id === b.id && e.status !== "resigned");
			const crew = branchEmps.filter((e) => e.role !== "backup" && e.role !== "koperasi" && e.role !== "magang");
			const backup = branchEmps.filter((e) => e.role === "backup" || e.role === "koperasi" || e.role === "magang");
			const isBackupEnabled = b.id in backupByBranch ? backupByBranch[b.id] : true;
			map.set(b.id, {
				crewCount: crew.length,
				hasBackup: isBackupEnabled && (backup.length > 0 || true),
				backupName: backup[0]?.name ?? "Mbak Koperasi",
				backupMode: isBackupEnabled ? "auto" : "no-backup",
			});
		}
		return map;
	}, [branches, allEmployees, backupByBranch]);

	// Ambil event semua cabang dalam rentang waktu (termasuk BKO antar cabang)
	const { data: events = [] } = useQuery({
		queryKey: ["shift-events", prevFrom, to],
		queryFn: () => listShiftEvents({ from: prevFrom, to }),
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

	// --- Manual Overrides (Tersimpan & Terisolasi Per-Cabang) -----------------
	// Map<branchId, Record<tanggal YYYY-MM-DD, DaySlot[]>>
	const [manualOverridesByBranch, setManualOverridesByBranch] = useState<Record<string, Record<string, DaySlot[]>>>({});

	const manualOverrides = useMemo(() => {
		return effectiveBranchId ? (manualOverridesByBranch[effectiveBranchId] ?? {}) : {};
	}, [effectiveBranchId, manualOverridesByBranch]);

	const setManualOverrides = (
		updater: Record<string, DaySlot[]> | ((prev: Record<string, DaySlot[]>) => Record<string, DaySlot[]>),
	) => {
		if (!effectiveBranchId) return;
		setManualOverridesByBranch((prev) => {
			const current = prev[effectiveBranchId] ?? {};
			const next = typeof updater === "function" ? updater(current) : updater;
			return { ...prev, [effectiveBranchId]: next };
		});
	};

	// --- Engine Penjadwalan (Otomatis + Menyesuaikan dengan Input Manual) -----
	const schedule = useMemo(() => {
		if (!effectiveBranchId) return null;
		return generateSchedule({
			branchId: effectiveBranchId,
			from,
			to,
			employees: allEmployees,
			events,
			previousAssignments: [...previousAssignments, ...savedAssignments],
			priorUsage: buildUsage(previousAssignments),
			backupAvailable,
			manualOverrides,
		});
	}, [
		effectiveBranchId,
		from,
		to,
		allEmployees,
		events,
		previousAssignments,
		savedAssignments,
		backupAvailable,
		manualOverrides,
	]);

	// Muat jadwal tersimpan dari database ke mode edit manual
	const loadFromSavedAssignments = () => {
		if (savedAssignments.length === 0) {
			message.info("Belum ada jadwal tersimpan untuk periode ini.");
			return;
		}
		const map: Record<string, DaySlot[]> = {};
		for (const asg of savedAssignments) {
			const list = map[asg.date] ?? [];
			const meta = SHIFT_META[asg.shift as ShiftKind] ?? SHIFT_META.pagi;
			list.push({
				shift: asg.shift as ShiftKind,
				employeeId: asg.employee_id ?? null,
				employeeName: asg.employee_name,
				startTime: asg.start_time || meta.start,
				endTime: asg.end_time || meta.end,
				hours: asg.hours || meta.hours,
				isBackup: asg.is_backup,
				isEmergency: asg.is_emergency,
				note: asg.note ?? undefined,
			});
			map[asg.date] = list;
		}
		setManualOverrides(map);
		message.success(`Berhasil memuat ${savedAssignments.length} slot tersimpan dari database ke mode edit manual.`);
	};

	// --- State Modal Input Manual (Rentang / Harian) ---
	const [manualModalOpen, setManualModalOpen] = useState(false);
	const [manualTab, setManualTab] = useState<"range" | "daily">("range");
	const [manualRange, setManualRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
	const [manualPagiEmpId, setManualPagiEmpId] = useState<string>();
	const [manualSiangEmpId, setManualSiangEmpId] = useState<string>();
	const [manualMalamEmpId, setManualMalamEmpId] = useState<string>();

	const [singleDate, setSingleDate] = useState<Dayjs | null>(null);
	const [singlePagiEmpId, setSinglePagiEmpId] = useState<string>();
	const [singleSiangEmpId, setSingleSiangEmpId] = useState<string>();
	const [singleMalamEmpId, setSingleMalamEmpId] = useState<string>();

	// --- State Modal Edit Sel / Slot ---
	const [cellModalOpen, setCellModalOpen] = useState(false);
	const [cellDate, setCellDate] = useState<string>("");
	const [cellEmpId, setCellEmpId] = useState<string | null>(null);
	const [cellEmpName, setCellEmpName] = useState<string>("");
	const [cellTargetShift, setCellTargetShift] = useState<ShiftKind | "off">("pagi");
	const [applyToWeek, setApplyToWeek] = useState(false);
	const [swapEmpId, setSwapEmpId] = useState<string>();

	const openSlotEdit = (date: string, empId: string | null, currentShift: ShiftKind | null) => {
		setCellDate(date);
		setCellEmpId(empId);
		const found = allEmployees.find((e) => e.id === empId);
		setCellEmpName(found?.name ?? "Karyawan");
		setCellTargetShift(currentShift ?? "pagi");
		setApplyToWeek(false);
		setSwapEmpId(undefined);
		setCellModalOpen(true);
	};

	const handleSaveCellEdit = () => {
		if (!cellEmpId) return;
		const targetDates = applyToWeek
			? eachDate(startOfWeek(cellDate), addDays(startOfWeek(cellDate), 6)).filter((d) => d >= from && d <= to)
			: [cellDate];

		const nextOverrides = { ...manualOverrides };

		for (const d of targetDates) {
			const daySlots = [...(nextOverrides[d] ?? schedule?.days.find((x) => x.date === d)?.slots ?? [])];

			// Jika pilih Tukar dengan karyawan lain:
			if (swapEmpId && swapEmpId !== cellEmpId) {
				const mySlot = daySlots.find((s) => s.employeeId === cellEmpId);
				const theirSlot = daySlots.find((s) => s.employeeId === swapEmpId);
				if (mySlot && theirSlot) {
					const tempShift = mySlot.shift;
					const tempStart = mySlot.startTime;
					const tempEnd = mySlot.endTime;
					const tempHours = mySlot.hours;

					mySlot.shift = theirSlot.shift;
					mySlot.startTime = theirSlot.startTime;
					mySlot.endTime = theirSlot.endTime;
					mySlot.hours = theirSlot.hours;

					theirSlot.shift = tempShift;
					theirSlot.startTime = tempStart;
					theirSlot.endTime = tempEnd;
					theirSlot.hours = tempHours;
				}
				nextOverrides[d] = daySlots;
				continue;
			}

			// Jika ubah shift langsung atau libur:
			const filtered = daySlots.filter((s) => s.employeeId !== cellEmpId);
			if (cellTargetShift !== "off") {
				const meta = SHIFT_META[cellTargetShift];
				const cleanSlots = filtered.filter((s) => s.shift !== cellTargetShift);
				cleanSlots.push({
					shift: cellTargetShift,
					employeeId: cellEmpId,
					employeeName: cellEmpName,
					startTime: meta.start,
					endTime: meta.end,
					hours: meta.hours,
					isBackup: false,
					isEmergency: false,
					note: "Diedit manual",
				});
				cleanSlots.sort((a, b) => {
					const order = { pagi: 0, siang: 1, malam: 2, pagi12: 3, sore12: 4 };
					return (order[a.shift] ?? 0) - (order[b.shift] ?? 0);
				});
				nextOverrides[d] = cleanSlots;
			} else {
				nextOverrides[d] = filtered;
			}
		}

		setManualOverrides(nextOverrides);
		message.success(`Jadwal diperbarui untuk ${targetDates.length} hari.`);
		setCellModalOpen(false);
	};

	const handleApplyManualRange = () => {
		if (!manualRange?.[0] || !manualRange?.[1]) {
			message.warning("Pilih rentang tanggal terlebih dahulu.");
			return;
		}
		const startDate = manualRange[0].format("YYYY-MM-DD");
		const endDate = manualRange[1].format("YYYY-MM-DD");
		if (startDate > endDate) {
			message.warning("Tanggal mulai tidak boleh lebih besar dari tanggal selesai.");
			return;
		}

		const nextOverrides = { ...manualOverrides };
		const rangeDates = eachDate(startDate, endDate);

		for (const d of rangeDates) {
			const slots: DaySlot[] = [];
			if (manualPagiEmpId) {
				const emp = allEmployees.find((e) => e.id === manualPagiEmpId);
				if (emp) {
					slots.push({
						shift: "pagi",
						employeeId: emp.id,
						employeeName: emp.name,
						startTime: "08:00",
						endTime: "16:00",
						hours: 8,
						isBackup: emp.role === "backup" || emp.role === "koperasi",
						isEmergency: false,
						note: "Input manual",
					});
				}
			}
			if (manualSiangEmpId) {
				const emp = allEmployees.find((e) => e.id === manualSiangEmpId);
				if (emp) {
					slots.push({
						shift: "siang",
						employeeId: emp.id,
						employeeName: emp.name,
						startTime: "16:00",
						endTime: "00:00",
						hours: 8,
						isBackup: emp.role === "backup" || emp.role === "koperasi",
						isEmergency: false,
						note: "Input manual",
					});
				}
			}
			if (manualMalamEmpId) {
				const emp = allEmployees.find((e) => e.id === manualMalamEmpId);
				if (emp) {
					slots.push({
						shift: "malam",
						employeeId: emp.id,
						employeeName: emp.name,
						startTime: "00:00",
						endTime: "08:00",
						hours: 8,
						isBackup: emp.role === "backup" || emp.role === "koperasi",
						isEmergency: false,
						note: "Input manual",
					});
				}
			}
			nextOverrides[d] = slots;
		}

		setManualOverrides(nextOverrides);
		message.success(
			`Jadwal manual berhasil diterapkan untuk ${rangeDates.length} hari (${formatDateShort(startDate)} – ${formatDateShort(endDate)}). Silakan periksa dan klik "Simpan Jadwal".`,
		);
		setManualModalOpen(false);
	};

	const handleApplySingleDay = () => {
		if (!singleDate) {
			message.warning("Pilih tanggal terlebih dahulu.");
			return;
		}
		const d = singleDate.format("YYYY-MM-DD");
		const slots: DaySlot[] = [];
		if (singlePagiEmpId) {
			const emp = allEmployees.find((e) => e.id === singlePagiEmpId);
			if (emp) {
				slots.push({
					shift: "pagi",
					employeeId: emp.id,
					employeeName: emp.name,
					startTime: "08:00",
					endTime: "16:00",
					hours: 8,
					isBackup: emp.role === "backup" || emp.role === "koperasi",
					isEmergency: false,
					note: "Input manual",
				});
			}
		}
		if (singleSiangEmpId) {
			const emp = allEmployees.find((e) => e.id === singleSiangEmpId);
			if (emp) {
				slots.push({
					shift: "siang",
					employeeId: emp.id,
					employeeName: emp.name,
					startTime: "16:00",
					endTime: "00:00",
					hours: 8,
					isBackup: emp.role === "backup" || emp.role === "koperasi",
					isEmergency: false,
					note: "Input manual",
				});
			}
		}
		if (singleMalamEmpId) {
			const emp = allEmployees.find((e) => e.id === singleMalamEmpId);
			if (emp) {
				slots.push({
					shift: "malam",
					employeeId: emp.id,
					employeeName: emp.name,
					startTime: "00:00",
					endTime: "08:00",
					hours: 8,
					isBackup: emp.role === "backup" || emp.role === "koperasi",
					isEmergency: false,
					note: "Input manual",
				});
			}
		}
		setManualOverrides((prev) => ({ ...prev, [d]: slots }));
		message.success(`Jadwal untuk ${formatDateId(d)} berhasil diperbarui.`);
		setManualModalOpen(false);
	};

	const weeks = useMemo(() => {
		if (!schedule) return [];
		const map = new Map<string, DaySchedule[]>();
		for (const day of schedule.days) {
			const wk = startOfWeek(day.date);
			const list = map.get(wk) ?? [];
			list.push(day);
			map.set(wk, list);
		}
		return Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
	}, [schedule]);

	const todayKey = toDateKey(new Date());
	const crewOnBranch = employees.filter((e) => e.role !== "backup" && e.status !== "resigned");
	const backupOnBranch = employees.filter((e) => e.role === "backup" && e.status !== "resigned");
	const hasCrew = crewOnBranch.length > 0;

	// Cek apakah jadwal yang tampil di layar sudah identik tersimpan di database
	const isAlreadySaved = useMemo(() => {
		if (!schedule || savedAssignments.length === 0) return false;
		if (schedule.assignments.length !== savedAssignments.length) return false;
		const savedMap = new Set(
			savedAssignments.map((a) => `${a.date}|${a.shift}|${a.employee_id ?? ""}|${a.start_time}|${a.end_time}`),
		);
		return schedule.assignments.every((a) =>
			savedMap.has(`${a.date}|${a.shift}|${a.employee_id ?? ""}|${a.start_time}|${a.end_time}`),
		);
	}, [schedule, savedAssignments]);

	// --- Aksi ---------------------------------------------------------------
	const [saving, setSaving] = useState(false);
	const [waOpen, setWaOpen] = useState(false);
	const [waText, setWaText] = useState("");
	const [shareModalOpen, setShareModalOpen] = useState(false);

	const publicEmployeeLink = useMemo(() => {
		if (!activeBranch) return "";
		const origin = typeof window !== "undefined" ? window.location.origin : "https://mbalaundryexpress.com";
		const token = activeBranch.schedule_token || "auth";
		return `${origin}/jadwal-karyawan/${activeBranch.slug}/${token}`;
	}, [activeBranch]);

	const handleSave = async () => {
		if (!schedule || !effectiveBranchId) return;
		setSaving(true);
		try {
			await Promise.all(savedAssignments.map((asg) => deleteShiftAssignment(asg.id)));
			for (const asg of schedule.assignments) {
				await createShiftAssignment(asg);
			}
			await logAdminActivity({
				action: "schedule_save",
				collection: "shift_assignments",
				targetId: effectiveBranchId,
				summary: `Menyimpan jadwal shift ${activeBranch?.name ?? "Cabang"} (${formatDateShort(from)} – ${formatDateShort(to)})`,
				details: {
					branchName: activeBranch?.name,
					from,
					to,
					slotsCount: schedule.assignments.length,
				},
			}).catch(() => {});
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

	const groupedWarnings = useMemo(() => groupWarnings(schedule?.warnings ?? []), [schedule]);
	const dangerGroups = groupedWarnings.filter((g) => g.level === "danger");
	const otherGroups = groupedWarnings.filter((g) => g.level !== "danger");
	const visibleOthers = showAllWarnings ? otherGroups : otherGroups.slice(0, 4);

	// --- Roster matrix ------------------------------------------------------
	const matrixColumns = useMemo(() => {
		if (!schedule) return [];
		return [
			{
				title: "Karyawan",
				dataIndex: "name",
				key: "name",
				fixed: "left" as const,
				width: 190,
				render: (_: unknown, row: { name: string; kind: string; allowed: ShiftKind[] }) => {
					const isBackup = row.kind === "backup";
					const isBko = row.kind === "bko";
					return (
						<div className="flex items-center gap-2">
							<span
								className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
								style={{
									background: isBackup ? "#EDE9FE" : isBko ? "#DBEAFE" : "var(--brand-bg)",
									color: isBackup ? "#6D28D9" : isBko ? "#1D4ED8" : "var(--brand)",
								}}
							>
								{row.name.slice(0, 1).toUpperCase()}
							</span>
							<div className="min-w-0">
								<div className="truncate text-[12px] font-semibold text-[var(--text-primary)]">{row.name}</div>
								<div className="flex gap-0.5">
									{isBackup ? (
										<span className="text-[10px] text-[#6D28D9]">backup • fleksibel</span>
									) : isBko ? (
										<span className="text-[10px] font-semibold text-[#1D4ED8]">BKO • bantuan</span>
									) : (
										row.allowed.map((s) => (
											<Tooltip key={s} title={`Boleh ${SHIFT_META[s].label}`}>
												<span className="text-[10px]">{SHIFT_META[s].emoji}</span>
											</Tooltip>
										))
									)}
								</div>
							</div>
						</div>
					);
				},
			},
			...schedule.days.map((day) => ({
				title: (
					<div className="space-y-1">
						<WeekDateHeader date={day.date} isToday={day.date === todayKey} />
						{day.mode !== "3shift" && (
							<div className="flex justify-center">
								<ModeBadge
									text={
										day.mode === "sunday-2x12"
											? "2×12j"
											: day.mode === "2shift12"
												? "2×12j"
												: day.mode === "backup"
													? "backup"
													: "darurat"
									}
									tone={day.mode === "backup" ? "info" : "warn"}
								/>
							</div>
						)}
					</div>
				),
				key: day.date,
				width: 78,
				align: "center" as const,
				render: (_: unknown, row: { employeeId: string | null; kind: string }) => {
					const src = schedule.days.find((d) => d.date === day.date);
					if (!src) return <span className="text-[11px] text-[var(--text-muted)]">—</span>;
					const slot =
						row.kind === "backup"
							? src.slots.find((s) => s.isBackup)
							: row.employeeId
								? src.slots.find((s) => s.employeeId === row.employeeId && !s.isBackup)
								: undefined;
					if (!slot) {
						return (
							<Tooltip title={row.kind === "backup" ? "Tidak dibutuhkan hari ini" : "Libur • Klik untuk beri shift"}>
								<button
									type="button"
									disabled={row.kind === "backup"}
									className="cursor-pointer rounded px-2 py-0.5 text-[11px] font-medium text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--brand)]"
									onClick={() => row.employeeId && openSlotEdit(day.date, row.employeeId, null)}
								>
									–
								</button>
							</Tooltip>
						);
					}
					return (
						<div
							className="flex cursor-pointer justify-center transition-transform hover:scale-105"
							onClick={() => row.employeeId && openSlotEdit(day.date, row.employeeId, slot.shift)}
							title="Klik untuk ubah shift atau tukar petugas"
						>
							<RosterPerson shift={slot.shift} name={slot.employeeName} backup={slot.isBackup} />
						</div>
					);
				},
			})),
		];
	}, [schedule, todayKey]);

	const matrixRows = useMemo(() => {
		const rows: { key: string; name: string; kind: string; employeeId: string | null; allowed: ShiftKind[] }[] = [];
		const crew: ShiftEmployee[] = employees
			.filter((e) => e.role !== "backup" && e.role !== "koperasi" && e.status !== "resigned")
			.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
		for (const emp of crew) {
			rows.push({
				key: emp.id,
				name: emp.name,
				kind: "crew",
				employeeId: emp.id,
				allowed: allowedRegularShifts(emp),
			});
		}
		// Tambahkan baris untuk kru bantuan BKO jika ada di jadwal cabang ini
		if (schedule) {
			for (const day of schedule.days) {
				for (const slot of day.slots) {
					if (slot.employeeId && !slot.isBackup && !rows.some((r) => r.employeeId === slot.employeeId)) {
						const helperEmp = allEmployees.find((e) => e.id === slot.employeeId);
						rows.push({
							key: `bko-${slot.employeeId}`,
							name: slot.employeeName,
							kind: "bko",
							employeeId: slot.employeeId,
							allowed: helperEmp ? allowedRegularShifts(helperEmp) : ["pagi", "siang", "malam"],
						});
					}
				}
			}
		}
		for (const emp of backupOnBranch) {
			rows.push({ key: `b-${emp.id}`, name: emp.name, kind: "backup", employeeId: null, allowed: [] });
		}
		const hasAutoBackupSlot = schedule?.days.some((d) => d.slots.some((s) => s.isBackup));
		if (hasAutoBackupSlot && backupOnBranch.length === 0) {
			const bName = schedule?.meta.backupName ?? "Mbak Koperasi";
			rows.push({ key: "backup-auto", name: bName, kind: "backup", employeeId: null, allowed: [] });
		}
		return rows;
	}, [employees, allEmployees, backupOnBranch, schedule]);

	// --- Render -------------------------------------------------------------
	if (branchesLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spin />
			</div>
		);
	}

	return (
		<MetronicPage title="Jadwal Shift" subtitle="Susun jadwal 3 shift per cabang secara otomatis.">
			<div className="space-y-4">
				{/* ============ PILIHAN CABANG (MODERN CARDS) ============ */}
				<div>
					<div className="mb-2.5 flex items-center justify-between">
						<div>
							<p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
								Pilih Cabang untuk Dikelola Jadwalnya
							</p>
							<p className="text-[12px] text-[var(--text-secondary)]">
								Klik salah satu cabang di bawah untuk langsung membuka & menyusun jadwal shift cabang tersebut.
							</p>
						</div>
						<Tag color="default" className="!font-semibold">
							{branches.length} Cabang Terdaftar
						</Tag>
					</div>

					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{branches.map((b) => {
							const isSelected = b.id === effectiveBranchId;
							const stats = branchStats.get(b.id) ?? {
								crewCount: 0,
								hasBackup: false,
								backupName: "Mbak Koperasi",
							};

							return (
								<button
									type="button"
									key={b.id}
									onClick={() => setBranchId(b.id)}
									className="group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer"
									style={{
										background: isSelected ? "color-mix(in srgb, var(--brand) 10%, var(--bg-card))" : "var(--bg-card)",
										borderColor: isSelected ? "var(--brand)" : "var(--border)",
										boxShadow: isSelected ? "0 4px 18px -2px rgba(198, 40, 40, 0.3)" : "none",
										transform: isSelected ? "scale(1.01)" : "none",
									}}
								>
									<div>
										<div className="flex items-start justify-between gap-2">
											<div className="flex items-center gap-2.5 min-w-0">
												<span
													className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
													style={{
														background: isSelected ? "var(--brand)" : "var(--bg-surface)",
														color: isSelected ? "#ffffff" : "var(--text-muted)",
													}}
												>
													<Store size={18} />
												</span>
												<div className="min-w-0">
													<h4
														className="truncate text-[14px] font-bold leading-snug transition-colors"
														style={{
															color: isSelected ? "var(--brand)" : "var(--text-primary)",
														}}
													>
														{b.name}
													</h4>
													<div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
														<MapPin size={11} className="shrink-0" />
														<span className="truncate max-w-[190px]">{b.address || "Belum ada alamat"}</span>
													</div>
												</div>
											</div>

											{isSelected ? (
												<Tag color="error" className="!m-0 !text-[10px] font-bold shrink-0">
													✓ AKTIF
												</Tag>
											) : (
												<span className="text-[11px] font-medium text-[var(--text-muted)] group-hover:text-[var(--text-primary)] shrink-0">
													Pilih →
												</span>
											)}
										</div>

										<div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-2.5">
											<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-secondary)]">
												<Users size={12} className="text-[var(--text-muted)]" />
												<span>{stats.crewCount} Kru Aktif</span>
											</span>
											<span className="text-[10px] text-[var(--text-muted)]">•</span>
											<span
												className="text-[11px] font-medium"
												style={{ color: stats.backupMode === "auto" ? "#16A34A" : "#D97706" }}
											>
												{stats.backupMode === "auto" ? `✓ Ada ${stats.backupName}` : "✕ Mode 12 Jam"}
											</span>
										</div>
									</div>

									<div className="mt-3">
										<div
											className="w-full rounded-md py-1.5 text-center text-[11px] font-bold transition-all"
											style={{
												background: isSelected ? "var(--brand)" : "var(--bg-surface)",
												color: isSelected ? "#ffffff" : "var(--text-secondary)",
												border: `1px solid ${isSelected ? "var(--brand)" : "var(--border)"}`,
											}}
										>
											{isSelected ? "✓ Sedang Dikelola" : "Kelola Jadwal Cabang Ini"}
										</div>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* ============ LANGKAH 1 : pengaturan periode & aksi ============ */}
				<MetronicCard>
					<div className="flex flex-wrap items-end gap-4">
						{/* Info Cabang Aktif yang Sedang Dikelola */}
						<div className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5">
							<span
								className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
								style={{ background: "var(--brand)" }}
							>
								<Store size={16} />
							</span>
							<div>
								<span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
									Mengelola Jadwal
								</span>
								<span className="block text-[13px] font-bold text-[var(--text-primary)]">{activeBranch?.name}</span>
							</div>
						</div>

						<div>
							<p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
								Periode Jadwal
							</p>
							<div className="flex flex-wrap items-center gap-1.5">
								{/* Segmented Preset Utama */}
								<Segmented
									value={
										rangeMode === "week" ||
										rangeMode === "month" ||
										rangeMode === "3month" ||
										rangeMode === "6month" ||
										rangeMode === "year"
											? rangeMode
											: "more"
									}
									onChange={(v) => {
										if (v !== "more") {
											setRangeMode(v as RangeMode);
											if (v === "week" || v === "2week") {
												setAnchor(startOfWeek(toDateKey(new Date())));
											} else {
												setAnchor(dayjs().startOf("month").format("YYYY-MM-DD"));
											}
										}
									}}
									options={[
										{ value: "week", label: "1 Minggu" },
										{ value: "month", label: "1 Bulan" },
										{ value: "3month", label: "3 Bulan" },
										{ value: "6month", label: "6 Bulan" },
										{ value: "year", label: "1 Tahun" },
									]}
								/>

								{/* Dropdown Lengkap Semua Pilihan */}
								<Select
									className="!w-[170px]"
									value={rangeMode}
									onChange={(v) => {
										setRangeMode(v as RangeMode);
										if (v === "week" || v === "2week") {
											setAnchor(startOfWeek(toDateKey(new Date())));
										} else if (v !== "custom") {
											setAnchor(dayjs().startOf("month").format("YYYY-MM-DD"));
										}
									}}
									options={[
										{
											label: "Mingguan",
											options: [
												{ value: "week", label: "⚡ 1 Minggu (7 hari)" },
												{ value: "2week", label: "⚡ 2 Minggu (14 hari)" },
											],
										},
										{
											label: "Bulanan",
											options: [
												{ value: "month", label: "📅 1 Bulan" },
												{ value: "2month", label: "📅 2 Bulan" },
												{ value: "3month", label: "📅 3 Bulan (Kuartal)" },
												{ value: "4month", label: "📅 4 Bulan" },
												{ value: "5month", label: "📅 5 Bulan" },
												{ value: "6month", label: "📅 6 Bulan (Semester)" },
											],
										},
										{
											label: "Tahunan",
											options: [{ value: "year", label: "🏆 1 Tahun (12 Bulan)" }],
										},
										{
											label: "Kustom",
											options: [{ value: "custom", label: "🎯 Rentang Bebas (Pilih Tanggal)" }],
										},
									]}
								/>

								{/* Jika pilih Rentang Bebas (Custom) */}
								{rangeMode === "custom" && (
									<DatePicker.RangePicker
										value={customRange ? [dayjs(customRange[0]), dayjs(customRange[1])] : [dayjs(from), dayjs(to)]}
										onChange={(dates) => {
											if (dates?.[0] && dates?.[1]) {
												setCustomRange([dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")]);
											}
										}}
										format="DD/MM/YYYY"
										placeholder={["Mulai", "Selesai"]}
										className="!w-[240px]"
									/>
								)}
							</div>
						</div>

						<div>
							<p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
								Pilih Tanggal / Geser
							</p>
							<div className="flex flex-wrap items-center gap-1.5">
								<div className="flex items-center gap-1">
									<Button onClick={() => stepAnchor(-1)}>‹</Button>
									<Button
										icon={<RefreshCw size={13} />}
										onClick={() => {
											if (isMonthBased) setAnchor(dayjs().startOf("month").format("YYYY-MM-DD"));
											else setAnchor(startOfWeek(toDateKey(new Date())));
										}}
									>
										{isMonthBased ? "Bulan Ini" : "Pekan Ini"}
									</Button>
									<Button onClick={() => stepAnchor(1)}>›</Button>
								</div>

								{/* Shortcut Riwayat 1-4 Minggu Sebelumnya */}
								{!isMonthBased && rangeMode !== "custom" && (
									<Select
										className="!w-[155px]"
										placeholder="Pilih Riwayat..."
										value={
											anchor === startOfWeek(toDateKey(new Date()))
												? "0"
												: anchor === addDays(startOfWeek(toDateKey(new Date())), -7)
													? "-1"
													: anchor === addDays(startOfWeek(toDateKey(new Date())), -14)
														? "-2"
														: anchor === addDays(startOfWeek(toDateKey(new Date())), -21)
															? "-3"
															: anchor === addDays(startOfWeek(toDateKey(new Date())), -28)
																? "-4"
																: undefined
										}
										onChange={(val) => {
											const weeksBack = Number(val);
											setAnchor(addDays(startOfWeek(toDateKey(new Date())), weeksBack * 7));
										}}
										options={[
											{ value: "0", label: "📍 Pekan Ini" },
											{ value: "-1", label: "⏪ 1 Minggu Lalu" },
											{ value: "-2", label: "⏪ 2 Minggu Lalu" },
											{ value: "-3", label: "⏪ 3 Minggu Lalu" },
											{ value: "-4", label: "⏪ 4 Minggu Lalu" },
										]}
									/>
								)}

								{/* Kalender Bebas */}
								{rangeMode !== "custom" && (
									<DatePicker
										value={dayjs(anchor)}
										onChange={(d) => {
											if (d) {
												setAnchor(
													isMonthBased ? d.startOf("month").format("YYYY-MM-DD") : startOfWeek(d.format("YYYY-MM-DD")),
												);
											}
										}}
										format={rangeMode === "year" ? "YYYY" : isMonthBased ? "MMMM YYYY" : "DD MMM YYYY"}
										picker={rangeMode === "year" ? "year" : isMonthBased ? "month" : "date"}
										className="!w-[140px]"
									/>
								)}
							</div>
						</div>

						<div className="min-w-[210px] flex-1">
							<p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
								Rentang jadwal
							</p>
							<div className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-[5px] text-[12px] font-semibold text-[var(--text-primary)]">
								<span>
									{formatDateId(from)} – {formatDateId(to)}
								</span>
								<span className="font-normal text-[var(--text-muted)]">({shiftLabel(rangeMode)})</span>
								{to < todayKey && (
									<Tag color="cyan" className="!m-0 !text-[10px] font-bold">
										RIWAYAT MASA LALU
									</Tag>
								)}
								{isAlreadySaved ? (
									<Tag color="success" className="!m-0 !text-[10px] font-bold">
										✓ TERSIMPAN SINKRON ({savedAssignments.length} SLOT)
									</Tag>
								) : savedAssignments.length > 0 ? (
									<Tag color="volcano" className="!m-0 !text-[10px] font-bold">
										⚡ ADA PERUBAHAN BARU
									</Tag>
								) : (
									<Tag color="warning" className="!m-0 !text-[10px] font-bold">
										DRAF BELUM DISIMPAN
									</Tag>
								)}
							</div>
						</div>

						<div>
							<p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
								Mbak Koperasi / Magang
							</p>
							<Segmented
								value={backupAvailable ? "ada" : "tidak"}
								onChange={(v) => setBackupAvailable(v === "ada")}
								options={[
									{ value: "ada", label: "✓ Ada (Otomatis)" },
									{ value: "tidak", label: "✕ Tidak Ada (12 Jam)" },
								]}
							/>
						</div>

						<div className="ml-auto flex flex-wrap gap-2">
							<Button
								icon={<Edit3 size={14} />}
								onClick={() => {
									setManualRange([dayjs(from), dayjs(to)]);
									setSingleDate(dayjs(from));
									setManualModalOpen(true);
								}}
							>
								Input Manual
							</Button>
							{Object.keys(manualOverrides).length > 0 && (
								<Button
									icon={<RotateCcw size={14} />}
									danger
									onClick={() => {
										setManualOverrides({});
										message.info("Editan manual telah di-reset ke jadwal otomatis.");
									}}
								>
									Reset Manual ({Object.keys(manualOverrides).length})
								</Button>
							)}
							{savedAssignments.length > 0 && Object.keys(manualOverrides).length === 0 && (
								<Button icon={<History size={14} />} onClick={loadFromSavedAssignments}>
									Edit Tersimpan
								</Button>
							)}
							<Button icon={<MessageCircle size={14} />} onClick={openWhatsApp} disabled={!schedule}>
								Export WA
							</Button>
							<Button
								icon={<Share2 size={14} className="text-emerald-600" />}
								onClick={() => setShareModalOpen(true)}
								className="!font-semibold"
								title="Buka link rahasia jadwal khusus karyawan cabang ini"
							>
								Link Karyawan
							</Button>
							<Tooltip
								title={
									isAlreadySaved
										? "Jadwal pada periode ini sudah tersimpan dan sinkron dengan database. Klik lagi jika ingin memaksa simpan ulang."
										: savedAssignments.length > 0
											? "Ada perubahan baru pada jadwal. Klik untuk menyimpan perubahan ke database."
											: "Draf jadwal baru belum tersimpan. Klik untuk menyimpan ke database."
								}
							>
								<Button
									type={isAlreadySaved ? "default" : "primary"}
									icon={isAlreadySaved ? <CheckCircle2 size={14} className="text-[#16A34A]" /> : <Save size={14} />}
									loading={saving}
									onClick={handleSave}
									disabled={!schedule || !hasCrew}
									style={
										isAlreadySaved
											? {
													borderColor: "color-mix(in srgb, #16A34A 50%, var(--border))",
													color: "var(--text-primary)",
													background: "var(--bg-surface)",
												}
											: undefined
									}
								>
									{isAlreadySaved
										? "Sudah Tersimpan"
										: savedAssignments.length > 0
											? "Simpan Perubahan"
											: "Simpan Jadwal"}
								</Button>
							</Tooltip>
						</div>
					</div>
				</MetronicCard>

				{/* ============ Ringkasan cepat ============ */}
				{schedule && (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						<SummaryTile
							label="Karyawan aktif"
							value={`${schedule.meta.crewCount} orang`}
							hint={schedule.meta.crewCount < 3 ? "Ideal 3 orang / cabang" : "Cukup untuk 3 shift"}
							tone={schedule.meta.crewCount < 3 ? "warn" : "ok"}
						/>
						<SummaryTile label="Orang per shift" value={`${schedule.meta.perShift} orang`} hint="Pagi, Sore, Malam" />
						<SummaryTile
							label="Mbak Koperasi / Magang"
							value={schedule.meta.backupAvailable ? "Ada (Otomatis)" : "Tidak Ada"}
							hint={
								schedule.meta.backupAvailable ? "Jaga shift pagi saat ada izin/sakit" : "Mode cadangan 2 orang × 12 jam"
							}
							tone={schedule.meta.backupAvailable ? "ok" : "warn"}
						/>
						<SummaryTile
							label="Total hari"
							value={`${schedule.days.length} hari`}
							hint={`${weeks.length} pekan • ${dangerGroups.length + otherGroups.length} catatan`}
						/>
					</div>
				)}

				{/* ============ LANGKAH 2 : isi karyawan dulu ============ */}
				{!hasCrew && (
					<Alert
						type="info"
						showIcon
						icon={<Users2 size={16} />}
						message="Belum ada karyawan di cabang ini"
						description="Tambahkan nama karyawan di panel bawah, lalu pilih shift mana saja yang boleh dia ambil. Setelah itu jadwal otomatis langsung terbentuk."
					/>
				)}

				{/* ============ LANGKAH 3 : roster ============ */}
				<MetronicCard
					title="Jadwal"
					icon={<CalendarRange size={16} />}
					noPadding
					action={
						<Segmented
							size="small"
							value={viewMode}
							onChange={(v) => setViewMode(v as ViewMode)}
							options={[
								{
									value: "matrix",
									label: (
										<span className="flex items-center gap-1">
											<LayoutGrid size={12} /> Tabel
										</span>
									),
								},
								{
									value: "cards",
									label: (
										<span className="flex items-center gap-1">
											<Rows3 size={12} /> Per Hari
										</span>
									),
								},
							]}
						/>
					}
				>
					{!schedule ? (
						<div className="p-8">
							<Empty description="Pilih cabang untuk melihat jadwal" />
						</div>
					) : !hasCrew ? (
						<div className="p-8">
							<Empty description="Isi karyawan dulu di panel bawah" image={Empty.PRESENTED_IMAGE_SIMPLE} />
						</div>
					) : viewMode === "matrix" ? (
						<div className="pt-1">
							<Table
								size="small"
								pagination={false}
								rowKey="key"
								sticky
								scroll={{ x: "max-content" }}
								dataSource={matrixRows}
								columns={matrixColumns}
							/>
							<div className="flex flex-wrap items-center gap-4 border-t border-[var(--border)] px-3 py-2">
								<ShiftLegendRow shift="pagi" />
								<ShiftLegendRow shift="siang" />
								<ShiftLegendRow shift="malam" />
								<ShiftLegendRow shift="pagi12" extra="darurat" />
								<ShiftLegendRow shift="sore12" extra="darurat" />
							</div>
						</div>
					) : (
						<div className="space-y-4 p-3">
							{weeks.map(([weekStart, days]) => (
								<div key={weekStart}>
									<div className="mb-2 flex items-center gap-2">
										<CalendarDays size={14} className="text-[var(--text-muted)]" />
										<span className="text-[12px] font-bold text-[var(--text-primary)]">
											Pekan {formatDateShort(weekStart)} – {formatDateShort(addDays(weekStart, 6))}
										</span>
									</div>
									<div
										className="grid gap-2"
										style={{ gridTemplateColumns: `repeat(${days.length}, minmax(150px, 1fr))` }}
									>
										{days.map((day) => (
											<div key={`h-${day.date}`}>
												<WeekDateHeader date={day.date} isToday={day.date === todayKey} />
											</div>
										))}
										{days.map((day) => (
											<div
												key={day.date}
												className="space-y-1 rounded-lg border p-1.5"
												style={{
													borderColor: day.date === todayKey ? "var(--brand)" : "var(--border)",
													borderWidth: day.date === todayKey ? 2 : 1,
												}}
											>
												{day.slots.length === 0 ? (
													<div className="py-3 text-center text-[11px] text-[var(--text-muted)]">Belum ada petugas</div>
												) : (
													day.slots.map((slot, i) => (
														<div key={`${day.date}-${slot.shift}-${i}`} className="flex items-start gap-1">
															<span className="mt-0.5 text-[11px]">{SHIFT_META[slot.shift].emoji}</span>
															<div className="min-w-0 flex-1">
																<div className="truncate text-[12px] font-semibold text-[var(--text-primary)]">
																	{slot.employeeName}
																</div>
																<div className="text-[10px] text-[var(--text-muted)]">
																	{SHIFT_META[slot.shift].label} {slot.startTime}–{slot.endTime}
																	{slot.isBackup ? " • backup" : ""}
																</div>
															</div>
														</div>
													))
												)}
												{day.off.length > 0 && (
													<div className="border-t border-dashed border-[var(--border)] pt-1 text-[10px] text-[var(--text-muted)]">
														🛌 {day.off.join(", ")}
													</div>
												)}
												{(day.mode !== "3shift" || isSunday(day.date)) && (
													<div className="pt-0.5">
														<ModeBadge text={DAY_MODE_LABEL[day.mode]} tone={day.mode === "backup" ? "info" : "warn"} />
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</MetronicCard>

				{/* ============ Peringatan ============ */}
				{schedule && groupedWarnings.length > 0 && (
					<MetronicCard
						title="Catatan Sistem"
						icon={<AlertTriangle size={16} />}
						action={
							otherGroups.length > 4 ? (
								<Button
									size="small"
									type="text"
									icon={showAllWarnings ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
									onClick={() => setShowAllWarnings((v) => !v)}
								>
									{showAllWarnings ? "Ringkas" : `Lihat ${otherGroups.length - 4} lagi`}
								</Button>
							) : undefined
						}
					>
						<div className="space-y-2">
							{dangerGroups.length === 0 && otherGroups.length === 0 && (
								<div className="flex items-center gap-2 text-[12px] text-[#15803D]">
									<CheckCircle2 size={14} /> Semua aturan terpenuhi.
								</div>
							)}
							{[...dangerGroups, ...visibleOthers].map((g, i) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: daftar hasil group stabil
									key={`${g.level}-${i}`}
									className="flex items-start gap-2 rounded-lg px-3 py-2"
									style={{
										background:
											g.level === "danger"
												? "color-mix(in srgb, #DC2626 14%, var(--bg-surface))"
												: g.level === "warning"
													? "color-mix(in srgb, #F59E0B 16%, var(--bg-surface))"
													: "var(--bg-surface)",
										color:
											g.level === "danger" ? "#EF4444" : g.level === "warning" ? "#D97706" : "var(--text-secondary)",
									}}
								>
									{g.level === "danger" ? (
										<AlertTriangle size={14} className="mt-0.5 shrink-0" />
									) : (
										<Info size={14} className="mt-0.5 shrink-0" />
									)}
									<span className="text-[12px] leading-snug">
										{g.message}
										{g.dates.length > 1 && (
											<span className="ml-1 opacity-80">
												({g.dates.length}×: {g.dates.map((d) => formatDateShort(d)).join(", ")})
											</span>
										)}
									</span>
								</div>
							))}
						</div>
					</MetronicCard>
				)}

				{/* ============ Rekap pemerataan ============ */}
				{schedule && schedule.summary.length > 0 && (
					<MetronicCard title="Pemerataan Shift" icon={<CheckCircle2 size={16} />} noPadding>
						<Table
							size="small"
							pagination={false}
							rowKey="employeeId"
							dataSource={schedule.summary}
							scroll={{ x: 620 }}
							columns={[
								{ title: "Karyawan", dataIndex: "name", key: "name", fixed: "left" as const, width: 140 },
								{
									title: "🌅 Pagi",
									dataIndex: "pagi",
									key: "pagi",
									align: "center" as const,
									width: 78,
									render: (v: number) => <span className="text-[12px] font-semibold">{v}</span>,
								},
								{
									title: "☀️ Sore",
									dataIndex: "siang",
									key: "siang",
									align: "center" as const,
									width: 78,
									render: (v: number) => <span className="text-[12px] font-semibold">{v}</span>,
								},
								{
									title: "🌙 Malam",
									dataIndex: "malam",
									key: "malam",
									align: "center" as const,
									width: 82,
									render: (v: number) => <span className="text-[12px] font-semibold">{v}</span>,
								},
								{
									title: "12 Jam",
									dataIndex: "emergency",
									key: "emergency",
									align: "center" as const,
									width: 72,
									render: (v: number) =>
										v > 0 ? <Tag color="volcano">{v}</Tag> : <span className="text-[var(--text-muted)]">—</span>,
								},
								{
									title: "Total Jam",
									dataIndex: "totalHours",
									key: "totalHours",
									align: "center" as const,
									width: 88,
								},
								{
									title: "Libur",
									dataIndex: "offDays",
									key: "offDays",
									align: "center" as const,
									width: 68,
									render: (v: number) => (
										<span
											className="text-[12px]"
											style={{ color: v > 0 ? "var(--text-secondary)" : "var(--text-muted)" }}
										>
											{v}
										</span>
									),
								},
							]}
						/>
					</MetronicCard>
				)}

				{/* ============ LANGKAH 2 : karyawan & absensi ============ */}
				<div className="grid gap-4 xl:grid-cols-2">
					<MetronicCard title="2. Karyawan & Shift yang Boleh Diambil" icon={<Users2 size={16} />}>
						<EmployeePanel
							branchId={effectiveBranchId}
							employees={employees}
							loading={employeesLoading}
							onChanged={invalidateAll}
						/>
					</MetronicCard>

					<MetronicCard title="3. Absensi / Izin / Resign / BKO" icon={<CalendarDays size={16} />}>
						<EventPanel
							branchId={effectiveBranchId}
							branchName={activeBranch?.name}
							branches={branches}
							employees={employees}
							allEmployees={allEmployees}
							events={events}
							onChanged={invalidateAll}
						/>
					</MetronicCard>
				</div>

				{/* ============ Cara kerja ============ */}
				<MetronicCard
					title="Cara Sistem Menyusun Jadwal"
					icon={<Info size={16} />}
					action={
						<Button
							size="small"
							type="text"
							icon={showRules ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
							onClick={() => setShowRules((v) => !v)}
						>
							{showRules ? "Tutup" : "Buka"}
						</Button>
					}
				>
					{showRules ? (
						<div className="space-y-3 text-[12px] leading-relaxed text-[var(--text-secondary)]">
							<div className="grid gap-3 md:grid-cols-3">
								<ShiftLegendRow shift="pagi" extra="shift 1" />
								<ShiftLegendRow shift="siang" extra="shift 2" />
								<ShiftLegendRow shift="malam" extra="shift 3" />
							</div>
							<div className="grid gap-2 md:grid-cols-2">
								<RuleItem title="1. Pembagian Shift Adil">
									Shift pagi, sore, dan malam terbagi merata dalam satu periode rotasi mingguan.
								</RuleItem>
								<RuleItem title="2. Anti-Fatigue (Malam → Pagi)">
									Tidak boleh shift malam lalu langsung shift pagi keesokan harinya atau di pekan berikutnya tanpa jeda.
								</RuleItem>
								<RuleItem title="3. Larangan Shift Karyawan">
									Jika karyawan punya larangan shift (mis. tidak bisa malam), aturan itu WAJIB dipatuhi oleh sistem.
								</RuleItem>
								<RuleItem title="4. Izin / Sakit / Libur Dadakan">
									Shift pagi otomatis dijaga oleh Mbak Koperasi / anak magang, dan shift lain menyesuaikan.
								</RuleItem>
								<RuleItem title="5. Libur Hari Sabtu (Ada Backup)">
									Jika salah satu dari 3 karyawan inti libur pada hari Sabtu, Mbak Koperasi / magang masuk pukul
									08.00–13.00, 2 crew membagi sisa waktu.
								</RuleItem>
								<RuleItem title="6. Libur Hari Minggu (2 Orang × 12 Jam)">
									Jika ada libur dadakan pada hari Minggu, jadwal otomatis memakai 2 orang jaga @12 jam (08.00–20.00 &
									20.00–08.00).
								</RuleItem>
								<RuleItem title="7. Libur Hari Sabtu (Tanpa Mbak Koperasi)">
									Jika ada karyawan libur hari Sabtu dan tidak ada Mbak Koperasi, maka 2 orang menjaga selama 12 jam.
								</RuleItem>
								<RuleItem title="8. Resign Dadakan">
									Mbak Koperasi / magang menggantikan sementara, jadwal crew lain disesuaikan agar tetap adil.
								</RuleItem>
								<RuleItem title="9. Aturan Khusus Mbak Koperasi">
									Mbak Koperasi <strong>HANYA BISA shift pagi</strong> (08.00–16.00 atau 08.00–13.00). Sistem tidak
									pernah menempatkan Mbak Koperasi pada shift sore atau malam.
								</RuleItem>
								<RuleItem title="10. Pengganti Sore / Malam">
									Jika butuh pengganti sore/malam, sistem memakai anak magang atau crew lain. Jika tidak ada yang
									memenuhi, ditandai <code>[PERLU KONFIRMASI]</code>.
								</RuleItem>
								<RuleItem title="11. Tanpa Backup (Mode 12 Jam)">
									Jika tombol Mbak Koperasi diset "Tidak Ada" atau backup tidak tersedia, berlaku aturan cadangan 2
									orang menjaga 12 jam.
								</RuleItem>
								<RuleItem title="12. Transparansi [PERLU KONFIRMASI]">
									Sistem tidak mengarang data. Jika ada kekurangan orang atau aturan bertentangan, sistem memberi label{" "}
									<code>[PERLU KONFIRMASI]</code>.
								</RuleItem>
							</div>
						</div>
					) : (
						<p className="text-[12px] text-[var(--text-muted)]">
							Sistem 12 aturan operasional: rotasi mingguan adil, anti-fatigue, larangan shift, toggle Mbak Koperasi
							(hanya pagi) / fallback 12 jam, dan penanda [PERLU KONFIRMASI]. Klik “Buka” untuk detail.
						</p>
					)}
				</MetronicCard>
			</div>

			<Modal
				open={waOpen}
				onCancel={() => setWaOpen(false)}
				title="Teks Jadwal untuk WhatsApp"
				width={580}
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

			{/* ============ Modal Link Jadwal Karyawan ============ */}
			<Modal
				open={shareModalOpen}
				onCancel={() => setShareModalOpen(false)}
				title={
					<div className="flex items-center gap-2">
						<Link2 size={16} className="text-emerald-600" />
						<span>Link Rahasia Jadwal Karyawan</span>
					</div>
				}
				width={560}
				footer={[
					<Button key="close" onClick={() => setShareModalOpen(false)}>
						Tutup
					</Button>,
					<Button
						key="copy"
						type="primary"
						icon={<Copy size={14} />}
						onClick={() => {
							navigator.clipboard.writeText(publicEmployeeLink);
							message.success("Link berhasil disalin!");
						}}
					>
						Salin Link
					</Button>,
				]}
			>
				<div className="space-y-4 py-2">
					<Alert
						type="success"
						showIcon
						message="Aman & Tidak Terindeks Google (NoIndex)"
						description={`Link ini dibuat khusus untuk karyawan ${activeBranch?.name}. Dilengkapi kode unik rahasia agar aman dan tidak akan pernah muncul di pencarian Google. Karyawan hanya bisa melihat jika Anda membagikan link ini.`}
					/>

					<div>
						<label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
							Link Jadwal untuk Dibagikan ke Tim {activeBranch?.name}:
						</label>
						<Input.Search
							value={publicEmployeeLink}
							readOnly
							enterButton={
								<Button type="primary" icon={<Copy size={13} />}>
									Salin
								</Button>
							}
							onSearch={() => {
								navigator.clipboard.writeText(publicEmployeeLink);
								message.success("Link jadwal karyawan disalin!");
							}}
							className="!font-mono !text-[12px]"
						/>
					</div>

					<div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3 text-[12px] space-y-2">
						<p className="font-bold text-[var(--text-primary)]">Fitur Otomatis di Halaman Karyawan:</p>
						<ul className="list-disc pl-4 space-y-1 text-[var(--text-secondary)]">
							<li>
								<strong>Senin – Jumat:</strong> Karyawan melihat jadwal 1 minggu yang sedang berjalan.
							</li>
							<li>
								<strong>Hari Sabtu & Minggu:</strong> Otomatis muncul bagian <em>"Jadwal Minggu Depan"</em> di sebelah
								bawah untuk persiapan.
							</li>
							<li>
								<strong>Masuk Hari Senin:</strong> Jadwal minggu lalu otomatis hilang dan digantikan minggu yang baru.
							</li>
							<li>
								<strong>Tombol "Pilih Nama Saya":</strong> Karyawan cukup klik namanya, jadwal kerjanya langsung menyala
								terang dan jadwal liburnya langsung terlihat jelas.
							</li>
						</ul>
					</div>

					<div className="flex flex-wrap gap-2 pt-1">
						<Button icon={<ExternalLink size={13} />} onClick={() => window.open(publicEmployeeLink, "_blank")}>
							Buka Halaman Karyawan
						</Button>
						<Button
							type="default"
							icon={<MessageCircle size={13} className="text-emerald-600" />}
							onClick={() => {
								const text = `Halo tim ${activeBranch?.name}! Berikut link jadwal kerja shift resmi minggu ini:\n\n🔗 ${publicEmployeeLink}\n\nSilakan klik namamu di halaman tersebut untuk melihat jam masuk kerja ya. Terima kasih!`;
								window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
							}}
						>
							Kirim ke WhatsApp
						</Button>
					</div>
				</div>
			</Modal>

			{/* ============ Modal Input Manual Jadwal ============ */}
			<Modal
				open={manualModalOpen}
				onCancel={() => setManualModalOpen(false)}
				title={
					<div className="flex items-center gap-2">
						<Edit3 size={16} className="text-[var(--brand)]" />
						<span>Input Manual Jadwal Shift</span>
					</div>
				}
				width={540}
				footer={null}
			>
				<div className="space-y-4 py-2">
					<Alert
						type="info"
						showIcon
						message="Input Bebas / Fleksibel"
						description="Anda bisa menentukan sendiri siapa yang masuk Pagi, Sore, atau Malam untuk rentang tanggal tertentu (misal 1 minggu lalu, atau mulai dari hari saat karyawan baru bergabung/resign)."
					/>

					<Tabs
						activeKey={manualTab}
						onChange={(k) => setManualTab(k as "range" | "daily")}
						items={[
							{
								key: "range",
								label: "Per Rentang Tanggal / Mingguan",
								children: (
									<div className="space-y-3 pt-1">
										<div>
											<label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
												1. Pilih Rentang Tanggal
											</label>
											<DatePicker.RangePicker
												className="!w-full"
												value={manualRange}
												onChange={(v) => setManualRange(v as [Dayjs | null, Dayjs | null] | null)}
												format="DD/MM/YYYY"
											/>
											<span className="mt-1 block text-[11px] text-[var(--text-muted)]">
												Bisa pilih 1 minggu penuh, atau mulai dari hari tertentu (misal Rabu s/d Minggu).
											</span>
										</div>

										<div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
											<p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
												2. Susunan Shift untuk Rentang Ini
											</p>

											<div>
												<span className="mb-1 block text-[12px] font-semibold text-[var(--text-primary)]">
													🌅 Shift Pagi (08:00 – 16:00)
												</span>
												<Select
													className="!w-full"
													placeholder="Pilih karyawan Pagi..."
													allowClear
													value={manualPagiEmpId}
													onChange={setManualPagiEmpId}
													options={employees
														.filter((e) => e.status !== "resigned")
														.map((e) => ({ value: e.id, label: e.name }))}
												/>
											</div>

											<div>
												<span className="mb-1 block text-[12px] font-semibold text-[var(--text-primary)]">
													☀️ Shift Sore/Siang (16:00 – 00:00)
												</span>
												<Select
													className="!w-full"
													placeholder="Pilih karyawan Sore/Siang..."
													allowClear
													value={manualSiangEmpId}
													onChange={setManualSiangEmpId}
													options={employees
														.filter((e) => e.status !== "resigned")
														.map((e) => ({ value: e.id, label: e.name }))}
												/>
											</div>

											<div>
												<span className="mb-1 block text-[12px] font-semibold text-[var(--text-primary)]">
													🌙 Shift Malam (00:00 – 08:00)
												</span>
												<Select
													className="!w-full"
													placeholder="Pilih karyawan Malam..."
													allowClear
													value={manualMalamEmpId}
													onChange={setManualMalamEmpId}
													options={employees
														.filter((e) => e.status !== "resigned")
														.map((e) => ({ value: e.id, label: e.name }))}
												/>
											</div>
										</div>

										<div className="flex justify-end gap-2 pt-2">
											<Button onClick={() => setManualModalOpen(false)}>Batal</Button>
											<Button type="primary" icon={<Sparkles size={14} />} onClick={handleApplyManualRange}>
												Terapkan ke Rentang Ini
											</Button>
										</div>
									</div>
								),
							},
							{
								key: "daily",
								label: "Edit Cepat Per Tanggal",
								children: (
									<div className="space-y-3 pt-1">
										<div>
											<label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
												1. Pilih Tanggal Spesifik
											</label>
											<DatePicker
												className="!w-full"
												value={singleDate}
												onChange={setSingleDate}
												format="DD MMMM YYYY"
											/>
										</div>

										<div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
											<p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
												2. Petugas Shift di Tanggal Ini
											</p>

											<div>
												<span className="mb-1 block text-[12px] font-semibold text-[var(--text-primary)]">
													🌅 Shift Pagi (08:00 – 16:00)
												</span>
												<Select
													className="!w-full"
													placeholder="Pilih karyawan Pagi..."
													allowClear
													value={singlePagiEmpId}
													onChange={setSinglePagiEmpId}
													options={employees
														.filter((e) => e.status !== "resigned")
														.map((e) => ({ value: e.id, label: e.name }))}
												/>
											</div>

											<div>
												<span className="mb-1 block text-[12px] font-semibold text-[var(--text-primary)]">
													☀️ Shift Sore/Siang (16:00 – 00:00)
												</span>
												<Select
													className="!w-full"
													placeholder="Pilih karyawan Sore/Siang..."
													allowClear
													value={singleSiangEmpId}
													onChange={setSingleSiangEmpId}
													options={employees
														.filter((e) => e.status !== "resigned")
														.map((e) => ({ value: e.id, label: e.name }))}
												/>
											</div>

											<div>
												<span className="mb-1 block text-[12px] font-semibold text-[var(--text-primary)]">
													🌙 Shift Malam (00:00 – 08:00)
												</span>
												<Select
													className="!w-full"
													placeholder="Pilih karyawan Malam..."
													allowClear
													value={singleMalamEmpId}
													onChange={setSingleMalamEmpId}
													options={employees
														.filter((e) => e.status !== "resigned")
														.map((e) => ({ value: e.id, label: e.name }))}
												/>
											</div>
										</div>

										<div className="flex justify-end gap-2 pt-2">
											<Button onClick={() => setManualModalOpen(false)}>Batal</Button>
											<Button type="primary" icon={<Sparkles size={14} />} onClick={handleApplySingleDay}>
												Terapkan Hari Ini
											</Button>
										</div>
									</div>
								),
							},
						]}
					/>
				</div>
			</Modal>

			{/* ============ Modal Edit Sel / Slot Individual ============ */}
			<Modal
				open={cellModalOpen}
				onCancel={() => setCellModalOpen(false)}
				title={
					<div className="flex items-center gap-2">
						<Edit3 size={15} className="text-[var(--brand)]" />
						<span>Ubah Shift: {cellEmpName}</span>
					</div>
				}
				width={420}
				footer={[
					<Button key="cancel" onClick={() => setCellModalOpen(false)}>
						Batal
					</Button>,
					<Button key="ok" type="primary" onClick={handleSaveCellEdit}>
						Simpan Perubahan
					</Button>,
				]}
			>
				<div className="space-y-4 py-2">
					<div className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] p-2.5 text-[12px]">
						<div className="font-semibold text-[var(--text-primary)]">{cellDate ? formatDateId(cellDate) : ""}</div>
						<div className="text-[11px] text-[var(--text-muted)]">Karyawan: {cellEmpName}</div>
					</div>

					<div>
						<label className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
							Pilih Shift Baru
						</label>
						<Radio.Group
							className="!flex !flex-col !gap-2"
							value={cellTargetShift}
							onChange={(e) => {
								setCellTargetShift(e.target.value);
								setSwapEmpId(undefined);
							}}
						>
							<Radio value="pagi">
								<span className="font-medium">🌅 Pagi (08:00 – 16:00)</span>
							</Radio>
							<Radio value="siang">
								<span className="font-medium">☀️ Sore / Siang (16:00 – 00:00)</span>
							</Radio>
							<Radio value="malam">
								<span className="font-medium">🌙 Malam (00:00 – 08:00)</span>
							</Radio>
							<Radio value="off">
								<span className="font-medium text-[var(--text-muted)]">🛌 Libur (Off)</span>
							</Radio>
						</Radio.Group>
					</div>

					<div className="border-t border-[var(--border)] pt-3">
						<label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
							Atau Tukar Shift dengan Kru Lain di Hari Ini
						</label>
						<Select
							className="!w-full"
							placeholder="Pilih rekan untuk tukar shift..."
							allowClear
							value={swapEmpId}
							onChange={(v) => setSwapEmpId(v)}
							options={employees
								.filter((e) => e.id !== cellEmpId && e.status !== "resigned")
								.map((e) => ({ value: e.id, label: `Tukar dengan ${e.name}` }))}
						/>
					</div>

					<div className="border-t border-[var(--border)] pt-2">
						<Checkbox checked={applyToWeek} onChange={(e) => setApplyToWeek(e.target.checked)}>
							<span className="text-[12px] font-medium text-[var(--text-secondary)]">
								Terapkan shift ini ke seluruh hari di pekan ini (Senin–Minggu)
							</span>
						</Checkbox>
					</div>
				</div>
			</Modal>
		</MetronicPage>
	);
}

function SummaryTile({
	label,
	value,
	hint,
	tone = "neutral",
}: {
	label: string;
	value: string;
	hint?: string;
	tone?: "neutral" | "ok" | "warn";
}) {
	const palette = {
		neutral: { bg: "var(--bg-surface)", border: "var(--border)", accent: "var(--text-muted)" },
		ok: {
			bg: "color-mix(in srgb, #16A34A 10%, var(--bg-surface))",
			border: "color-mix(in srgb, #16A34A 40%, var(--border))",
			accent: "#16A34A",
		},
		warn: {
			bg: "color-mix(in srgb, #F59E0B 12%, var(--bg-surface))",
			border: "color-mix(in srgb, #F59E0B 45%, var(--border))",
			accent: "#D97706",
		},
	}[tone];
	return (
		<div className="rounded-xl border px-3 py-2.5" style={{ background: palette.bg, borderColor: palette.border }}>
			<p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: palette.accent }}>
				{label}
			</p>
			<p className="text-[15px] font-bold leading-tight text-[var(--text-primary)]">{value}</p>
			{hint && <p className="truncate text-[10px] text-[var(--text-muted)]">{hint}</p>}
		</div>
	);
}

function RuleItem({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2">
			<p className="mb-0.5 text-[12px] font-bold text-[var(--text-primary)]">{title}</p>
			<p className="text-[11px] leading-snug">{children}</p>
		</div>
	);
}
