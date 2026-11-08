import type { ShiftAssignment, ShiftEmployee, ShiftEvent, ShiftKind } from "@/types/database.types";
export type { ShiftKind };

/**
 * =============================================================================
 * Smart Laundry Shift Scheduler — rule-based engine (pure TypeScript)
 * =============================================================================
 * Asumsi operasional: tiap cabang punya 3 karyawan dan 3 shift 8 jam, jadi satu
 * orang menempati satu shift (Pagi / Siang / Malam). Kalau satu cabang punya
 * lebih banyak karyawan, jumlah orang per shift otomatis naik
 * (floor(jumlah crew / 3)).
 *
 * Aturan yang dipatuhi:
 *  1. Restriksi: `can_night = false` tidak pernah mendapat shift Malam.
 *  2. Anti-fatigue: crew yang Malam pekan ini tidak boleh langsung Pagi pekan
 *     depan — wajib transisi lewat Siang dulu.
 *  3. Fairness: porsi Pagi/Siang/Malam diseimbangkan per siklus 4 pekan.
 *  4. Rotasi mingguan: shift tiap crew bergeser setiap pekan.
 *  5. Fallback dinamis (A–D): resign / izin / sakit / libur, Sabtu dengan atau
 *     tanpa backup, dan Minggu 2 orang × 12 jam.
 */

// ---------------------------------------------------------------------------
// Konstanta
// ---------------------------------------------------------------------------

/** Shift reguler 8 jam, urut rotasi: Pagi → Siang → Malam → Pagi. */
export const REGULAR_SHIFTS: ShiftKind[] = ["pagi", "siang", "malam"];

export interface ShiftMeta {
	label: string;
	emoji: string;
	start: string;
	end: string;
	hours: number;
	color: string;
	bg: string;
}

export const SHIFT_META: Record<ShiftKind, ShiftMeta> = {
	pagi: { label: "Pagi", emoji: "🌅", start: "08:00", end: "16:00", hours: 8, color: "#CA8A04", bg: "#FEF9C3" },
	siang: { label: "Sore", emoji: "☀️", start: "16:00", end: "00:00", hours: 8, color: "#EA580C", bg: "#FFEDD5" },
	malam: { label: "Malam", emoji: "🌙", start: "00:00", end: "08:00", hours: 8, color: "#1E3A8A", bg: "#DBEAFE" },
	pagi12: {
		label: "Pagi 12 Jam",
		emoji: "🔥",
		start: "08:00",
		end: "20:00",
		hours: 12,
		color: "#DC2626",
		bg: "#FEE2E2",
	},
	sore12: {
		label: "Malam 12 Jam",
		emoji: "🌗",
		start: "20:00",
		end: "08:00",
		hours: 12,
		color: "#7C3AED",
		bg: "#EDE9FE",
	},
};

/** Jumlah karyawan ideal per cabang (1 orang per shift). */
export const IDEAL_CREW_SIZE = 3;

/** Batas jam kerja wajar per orang per hari. */
export const MAX_HOURS_PER_DAY = 12;

export const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const MONTH_NAMES = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// ---------------------------------------------------------------------------
// Helper tanggal (string YYYY-MM-DD, bebas zona waktu)
// ---------------------------------------------------------------------------

const pad2 = (n: number): string => String(n).padStart(2, "0");

export const toDateKey = (date: Date): string =>
	`${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const parseDateKey = (key: string): Date => {
	const [y, m, d] = key.split("-").map(Number);
	return new Date(y, (m || 1) - 1, d || 1);
};

export const addDays = (key: string, days: number): string => {
	const d = parseDateKey(key);
	d.setDate(d.getDate() + days);
	return toDateKey(d);
};

/** 0 = Minggu … 6 = Sabtu. */
export const dayOfWeek = (key: string): number => parseDateKey(key).getDay();
export const isSaturday = (key: string): boolean => dayOfWeek(key) === 6;
export const isSunday = (key: string): boolean => dayOfWeek(key) === 0;

/** Senin sebagai awal pekan kerja. */
export const startOfWeek = (key: string): string => {
	const dow = dayOfWeek(key);
	return addDays(key, dow === 0 ? -6 : 1 - dow);
};

export const eachDate = (from: string, to: string): string[] => {
	const out: string[] = [];
	let cur = from;
	for (let i = 0; i < 1500 && cur <= to; i += 1) {
		out.push(cur);
		cur = addDays(cur, 1);
	}
	return out;
};

export const formatDateId = (key: string): string => {
	const d = parseDateKey(key);
	return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateShort = (key: string): string => {
	const d = parseDateKey(key);
	return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
};

export const dayLabel = (key: string): string => DAY_NAMES[dayOfWeek(key)];

// ---------------------------------------------------------------------------
// Tipe hasil engine
// ---------------------------------------------------------------------------

export interface ScheduleInput {
	branchId: string;
	from: string;
	to: string;
	employees: ShiftEmployee[];
	events: ShiftEvent[];
	/** Jadwal periode sebelumnya — untuk aturan anti-fatigue lintas periode. */
	previousAssignments?: ShiftAssignment[];
	/** Rekap pemakaian shift sebelum periode ini, kunci `employeeId|shift`. */
	priorUsage?: ShiftUsage;
	/** Toggle Mbak Koperasi / Anak Magang: true = Ada (default), false = Tidak Ada (maka 12 jam). */
	backupAvailable?: boolean;
	/** Penugasan manual per tanggal (YYYY-MM-DD -> DaySlot[]). Jadwal setelah tanggal manual otomatis berotasi menyesuaikan baseline tersebut. */
	manualOverrides?: Record<string, DaySlot[]>;
}

export interface ScheduleWarning {
	date: string;
	level: "info" | "warning" | "danger";
	message: string;
}

export interface DaySlot {
	shift: ShiftKind;
	employeeId: string | null;
	employeeName: string;
	startTime: string;
	endTime: string;
	hours: number;
	isBackup: boolean;
	isEmergency: boolean;
	note?: string;
}

export type DayMode = "3shift" | "2shift12" | "backup" | "sunday-2x12" | "emergency";

export const DAY_MODE_LABEL: Record<DayMode, string> = {
	"3shift": "3 shift (8 jam)",
	"2shift12": "2 shift @12 jam",
	backup: "Dibackup koperasi/magang",
	"sunday-2x12": "Minggu 2×12 jam",
	emergency: "Mode darurat",
};

export interface DaySchedule {
	date: string;
	mode: DayMode;
	slots: DaySlot[];
	notes: string[];
	/** Nama crew yang libur di hari itu. */
	off: string[];
}

export interface EmployeeSummary {
	employeeId: string;
	name: string;
	pagi: number;
	siang: number;
	malam: number;
	emergency: number;
	totalHours: number;
	offDays: number;
}

export interface ScheduleResult {
	days: DaySchedule[];
	assignments: Omit<ShiftAssignment, "id" | "created" | "updated">[];
	warnings: ScheduleWarning[];
	summary: EmployeeSummary[];
	meta: {
		branchId: string;
		from: string;
		to: string;
		crewCount: number;
		perShift: number;
		/** true kalau crew aktif < 3 (mode mitigasi). */
		stressTest: boolean;
		backupName: string;
		hasBackup: boolean;
		backupAvailable: boolean;
	};
}

export type ShiftUsage = Record<string, number>;

export const usageKey = (employeeId: string, shift: ShiftKind): string => `${employeeId}|${shift}`;

/** Rekap pemakaian shift dari daftar assignment (untuk fairness lintas periode). */
export const buildUsage = (assignments: ShiftAssignment[]): ShiftUsage => {
	const usage: ShiftUsage = {};
	for (const asg of assignments) {
		if (!asg.employee_id) continue;
		const key = usageKey(asg.employee_id, asg.shift);
		usage[key] = (usage[key] ?? 0) + 1;
	}
	return usage;
};

/** Petakan shift 12 jam ke kategori rotasi 8 jam. */
const normalizeShift = (shift: ShiftKind, canNight: boolean): ShiftKind => {
	if (shift === "pagi12") return "pagi";
	if (shift === "sore12") return canNight ? "malam" : "siang";
	return shift;
};

/**
 * Daftar shift 8 jam yang boleh diambil seorang karyawan.
 *
 * `allowed_shifts` adalah sumber kebenaran: kalau diisi, hanya shift di dalam
 * daftar itu yang dipakai. Kalau kosong/null (data lama), fallback ke
 * `can_night`: true = semua shift, false = Pagi & Siang saja.
 */
export const allowedRegularShifts = (emp: ShiftEmployee): ShiftKind[] => {
	const raw = emp.allowed_shifts;
	if (Array.isArray(raw)) {
		const picked = REGULAR_SHIFTS.filter((s) => raw.includes(s));
		if (picked.length > 0) return picked;
	}
	return emp.can_night === false ? ["pagi", "siang"] : [...REGULAR_SHIFTS];
};

/** true kalau karyawan boleh memegang shift 8 jam tertentu. */
export const canTakeShift = (emp: ShiftEmployee, shift: ShiftKind): boolean => {
	const base: ShiftKind = shift === "pagi12" ? "pagi" : shift === "sore12" ? "malam" : shift;
	return allowedRegularShifts(emp).includes(base);
};

/** true kalau karyawan bisa shift malam (dipakai untuk shift 12 jam malam). */
export const canWorkNight = (emp: ShiftEmployee): boolean => allowedRegularShifts(emp).includes("malam");

/**
 * Cek apakah karyawan baru sedang dalam masa orientasi wajib masuk pagi.
 * Aturan: wajib minimal 1 minggu pertama (atau sisa minggu masuk + 1 minggu penuh berikutnya).
 */
export const isNewHireMorningPeriod = (emp: ShiftEmployee, date: string): boolean => {
	if (emp.is_new) {
		if (!emp.joined_date) return true;
		const startW = startOfWeek(emp.joined_date);
		const endW = addDays(startW, 13);
		return date <= endW;
	}
	if (emp.joined_date) {
		const startW = startOfWeek(emp.joined_date);
		const endW = addDays(startW, 13);
		return date >= emp.joined_date && date <= endW;
	}
	return false;
};

/**
 * Parsing catatan BKO (bantuan antar cabang) dari ShiftEvent note.
 * Format: BKO:targetBranchId:targetBranchName
 */
export const parseBkoTarget = (note?: string | null): { branchId: string; branchName?: string } | null => {
	if (!note) return null;
	if (note.startsWith("BKO:")) {
		const parts = note.split(":");
		return { branchId: parts[1], branchName: parts[2] };
	}
	return null;
};

interface RotState {
	/** Shift utama pekan ini. */
	shift: ShiftKind;
	/** Berapa pekan berturut-turut crew ini ada di shift tersebut. */
	weeks: number;
}

/**
 * Urutan rotasi yang dipakai untuk menentukan shift awal tiap crew.
 * Dipakai supaya pekan pertama TIDAK menumpuk semua orang di Pagi —
 * crew dibagi rata ke Pagi / Siang / Malam.
 */
const START_ROTATION: ShiftKind[] = ["pagi", "siang", "malam"];

/**
 * Siklus rotasi mingguan: Pagi → Malam → Siang → Pagi.
 *
 * Siklus ini dipilih karena TIDAK pernah memindahkan orang dari Malam
 * langsung ke Pagi (anti-fatigue), sekaligus membuat porsi Pagi / Siang /
 * Malam benar-benar merata: dalam 3 pekan tiap orang mendapat ketiga shift
 * masing-masing satu pekan.
 */
const ROTATE_NEXT: Record<"pagi" | "siang" | "malam", "pagi" | "siang" | "malam"> = {
	pagi: "malam",
	siang: "pagi",
	malam: "siang",
};

/** Menghasilkan semua permutasi k item dari array. */
function getPermutations<T>(items: T[], k: number): T[][] {
	if (k === 0) return [[]];
	const result: T[][] = [];
	for (let i = 0; i < items.length; i++) {
		const current = items[i];
		const rest = [...items.slice(0, i), ...items.slice(i + 1)];
		const sub = getPermutations(rest, k - 1);
		for (const s of sub) {
			result.push([current, ...s]);
		}
	}
	return result;
}

// ---------------------------------------------------------------------------
// Engine utama
// ---------------------------------------------------------------------------

export function generateSchedule(input: ScheduleInput): ScheduleResult {
	const {
		branchId,
		from,
		to,
		employees,
		events,
		previousAssignments = [],
		priorUsage = {},
		backupAvailable = true,
		manualOverrides = {},
	} = input;

	const warnings: ScheduleWarning[] = [];
	const dates = eachDate(from, to);

	const scoped = employees.filter((e) => e.branch_id === branchId);
	const backupStaff = scoped.filter(
		(e) => (e.role === "backup" || e.role === "koperasi" || e.role === "magang") && e.status !== "resigned",
	);
	const backupName = backupStaff[0]?.name ?? "Mbak Koperasi";
	const hasMagang = backupStaff.some((e) => e.role === "magang" || e.name.toLowerCase().includes("magang"));

	// --- Index event -------------------------------------------------------
	// `unavailable` = tanggal tertentu di mana crew tidak bisa masuk (izin/sakit/libur/bantuan ke cabang lain).
	const unavailable = new Map<string, ShiftEvent>();
	// `resignedFrom` = tanggal mulai resign. Setelah tanggal ini crew permanen hilang.
	const resignedFrom = new Map<string, string>();
	// `backupBlocked` = tanggal di mana user menyatakan backup TIDAK bisa datang.
	const backupBlocked = new Set<string>();

	// Karyawan dari cabang lain yang ditugaskan membantu cabang ini (BKO)
	const incomingHelpers = new Map<string, ShiftEmployee[]>();

	for (const ev of events) {
		// Jika ini event BKO ke cabang lain:
		if (ev.type === "bantuan") {
			const bko = parseBkoTarget(ev.note);
			// Jika targetnya adalah cabang ini, daftarkan sebagai kru bantuan masuk!
			if (bko && bko.branchId === branchId) {
				const helperEmp = employees.find((e) => e.id === ev.employee_id);
				if (helperEmp) {
					for (const date of eachDate(ev.date, ev.end_date || ev.date)) {
						const list = incomingHelpers.get(date) ?? [];
						if (!list.some((e) => e.id === helperEmp.id)) list.push(helperEmp);
						incomingHelpers.set(date, list);
					}
				}
				continue;
			}
		}

		if (ev.branch_id && ev.branch_id !== branchId) continue;
		if (ev.type === "resign") {
			const prev = resignedFrom.get(ev.employee_id);
			if (!prev || ev.date < prev) resignedFrom.set(ev.employee_id, ev.date);
			continue;
		}
		for (const date of eachDate(ev.date, ev.end_date || ev.date)) {
			unavailable.set(`${ev.employee_id}|${date}`, ev);
			if (ev.backup_available === false) backupBlocked.add(date);
		}
	}

	const todayKey = toDateKey(new Date());

	// Crew = karyawan reguler.
	// Jika jadwal untuk masa lalu (sebelum hari ini), karyawan yang sudah resign tetap disertakan
	// jika tanggal resign-nya sesudah awal jadwal (atau belum ada data tanggal resign pasti).
	const crew = scoped
		.filter((e) => e.role !== "backup" && e.role !== "koperasi")
		.filter((e) => {
			if (e.status !== "resigned") return true;
			const resignDate = resignedFrom.get(e.id);
			if (resignDate) return resignDate >= from;
			return to < todayKey;
		})
		.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

	const stressTest = crew.length < IDEAL_CREW_SIZE;

	// --- Status kehadiran per tanggal --------------------------------------
	const resignedOn = (emp: ShiftEmployee, date: string): boolean => {
		const start = resignedFrom.get(emp.id);
		return start !== undefined && date >= start;
	};
	const notYetJoined = (emp: ShiftEmployee, date: string): boolean => {
		return Boolean(emp.joined_date && date < emp.joined_date);
	};
	const isAway = (emp: ShiftEmployee, date: string): boolean =>
		unavailable.has(`${emp.id}|${date}`) || resignedOn(emp, date) || notYetJoined(emp, date);

	const backupBusy = new Set<string>();
	for (const b of backupStaff) {
		for (const ev of events) {
			if (ev.employee_id !== b.id) continue;
			if (ev.type === "resign") continue;
			for (const date of eachDate(ev.date, ev.end_date || ev.date)) backupBusy.add(date);
		}
	}

	/**
	 * Backup (Mbak Koperasi / Anak Magang) siap masuk SECARA OTOMATIS jika:
	 *  1. Tombol toggle backup aktif (backupAvailable !== false).
	 *     Jika tidak aktif, otomatis jatuh ke aturan 12 jam (Aturan 11).
	 *  2. Tidak ada event yang memblokir backup di tanggal tersebut.
	 *  3. Staf backup terdaftar (jika ada) tidak sedang libur/sakit.
	 * User TIDAK perlu menambah karyawan backup secara manual.
	 */
	const backupReadyOn = (date: string): boolean => {
		if (backupAvailable === false) return false;
		if (backupBlocked.has(date)) return false;
		if (backupBusy.has(date)) return false;
		return true;
	};

	const crewCountOf = (date: string): number => {
		const localCount = crew.filter((e) => !isAway(e, date)).length;
		const helperCount = (incomingHelpers.get(date) ?? []).length;
		return localCount + helperCount;
	};
	/** Jumlah orang per shift = floor(crew hadir / 3), minimal 1. */
	const perShiftOn = (date: string): number => Math.max(1, Math.floor(crewCountOf(date) / IDEAL_CREW_SIZE));

	// Peringatan dini kalau ada resign di tengah periode.
	for (const [empId, resignDate] of resignedFrom) {
		if (resignDate < from || resignDate > to) continue;
		const emp = scoped.find((e) => e.id === empId);
		if (!emp) continue;
		warnings.push({
			date: resignDate,
			level: "warning",
			message: `${emp.name} resign mulai ${formatDateShort(resignDate)} — jadwal setelah tanggal itu otomatis dibagi ulang ke crew tersisa${
				backupStaff.length > 0 ? ` + ${backupName}` : " (tanpa backup)"
			}.`,
		});
	}

	// --- Statistik fairness ------------------------------------------------
	const usage: ShiftUsage = { ...priorUsage };
	/** Shift 12 jam dihitung ke kategori 8 jam-nya supaya rotasi tetap adil. */
	const baseShiftOf = (shift: ShiftKind): ShiftKind =>
		shift === "pagi12" ? "pagi" : shift === "sore12" ? "malam" : shift;
	const bump = (employeeId: string, shift: ShiftKind): void => {
		const key = usageKey(employeeId, baseShiftOf(shift));
		usage[key] = (usage[key] ?? 0) + 1;
	};
	const used = (employeeId: string, shift: ShiftKind): number => usage[usageKey(employeeId, baseShiftOf(shift))] ?? 0;
	const totalUsed = (employeeId: string): number =>
		REGULAR_SHIFTS.reduce((sum, shift) => sum + used(employeeId, shift), 0);

	// --- Riwayat shift terakhir dari periode sebelumnya ---------------------
	const lastWorkedShift = new Map<string, { date: string; shift: ShiftKind }>();
	for (const asg of previousAssignments) {
		if (!asg.employee_id) continue;
		const prev = lastWorkedShift.get(asg.employee_id);
		if (!prev || asg.date >= prev.date) lastWorkedShift.set(asg.employee_id, { date: asg.date, shift: asg.shift });
	}

	const weekState = new Map<string, RotState>();

	/**
	 * Untuk pekan pertama: bagi crew ke Pagi / Siang / Malam secara merata
	 * sesuai daftar shift yang boleh mereka ambil.
	 *
	 * Anak baru yang masih masa orientasi diutamakan masuk Pagi.
	 */
	const seedInitialShifts = (): void => {
		// Jika tepat 3 crew dan ada 1 staf khusus: terapkan aturan rotasi shift khusus (2 minggu)
		if (crew.length === 3) {
			const specialEmployees = crew.filter((e) => allowedRegularShifts(e).length < 3);
			if (specialEmployees.length === 1) {
				const special = specialEmployees[0];
				const allowed = allowedRegularShifts(special);
				const [free1, free2] = crew.filter((e) => e.id !== special.id);

				// Kasus 1: Staf Khusus tidak bisa MALAM (bisa Pagi & Siang)
				if (!allowed.includes("malam") && allowed.includes("pagi") && allowed.includes("siang")) {
					weekState.set(special.id, { shift: "pagi", weeks: 1 });
					weekState.set(free1.id, { shift: "malam", weeks: 1 });
					weekState.set(free2.id, { shift: "siang", weeks: 1 });
					return;
				}

				// Kasus 2: Staf Khusus tidak bisa PAGI (bisa Siang & Malam)
				if (!allowed.includes("pagi") && allowed.includes("siang") && allowed.includes("malam")) {
					weekState.set(special.id, { shift: "siang", weeks: 1 });
					weekState.set(free1.id, { shift: "pagi", weeks: 1 });
					weekState.set(free2.id, { shift: "malam", weeks: 1 });
					return;
				}

				// Kasus 3: Staf Khusus tidak bisa SIANG (hanya bisa Pagi & Malam)
				if (!allowed.includes("siang") && allowed.includes("pagi") && allowed.includes("malam")) {
					weekState.set(special.id, { shift: "pagi", weeks: 1 });
					weekState.set(free1.id, { shift: "siang", weeks: 1 });
					weekState.set(free2.id, { shift: "malam", weeks: 1 });
					return;
				}

				// Kasus Staf hanya bisa 1 shift
				if (allowed.length === 1) {
					const only = allowed[0];
					weekState.set(special.id, { shift: only, weeks: 1 });
					if (only === "pagi") {
						weekState.set(free1.id, { shift: "siang", weeks: 1 });
						weekState.set(free2.id, { shift: "malam", weeks: 1 });
					} else if (only === "malam") {
						weekState.set(free1.id, { shift: "pagi", weeks: 1 });
						weekState.set(free2.id, { shift: "siang", weeks: 1 });
					} else {
						weekState.set(free1.id, { shift: "pagi", weeks: 1 });
						weekState.set(free2.id, { shift: "malam", weeks: 1 });
					}
					return;
				}
			}
		}

		const sorted = [...crew].sort((a, b) => {
			const aNew = isNewHireMorningPeriod(a, dates[0]) ? 0 : 1;
			const bNew = isNewHireMorningPeriod(b, dates[0]) ? 0 : 1;
			if (aNew !== bNew) return aNew - bNew;
			return (
				allowedRegularShifts(a).length - allowedRegularShifts(b).length ||
				a.sort_order - b.sort_order ||
				a.name.localeCompare(b.name)
			);
		});
		const count: Record<string, number> = { pagi: 0, siang: 0, malam: 0 };

		for (const emp of sorted) {
			const allowed = allowedRegularShifts(emp);
			// Anak baru dalam masa orientasi wajib masuk Pagi
			if (isNewHireMorningPeriod(emp, dates[0]) && allowed.includes("pagi")) {
				count.pagi += 1;
				weekState.set(emp.id, { shift: "pagi", weeks: 1 });
				continue;
			}

			// Riwayat jadwal sebelumnya menang atas pembagian awal.
			const history = lastWorkedShift.get(emp.id);
			const prior = history ? normalizeShift(history.shift, allowed.includes("malam")) : null;
			if (prior && allowed.includes(prior)) {
				count[prior] += 1;
				weekState.set(emp.id, { shift: prior, weeks: 1 });
				continue;
			}

			// Shift yang paling sedikit terisi dulu supaya pembagian merata.
			const pick = [...allowed].sort(
				(a, b) => (count[a] ?? 0) - (count[b] ?? 0) || START_ROTATION.indexOf(a) - START_ROTATION.indexOf(b),
			)[0];
			count[pick] += 1;
			weekState.set(emp.id, { shift: pick, weeks: 1 });
		}
	};

	/**
	 * Rapikan pembagian shift pekan ini supaya Pagi / Siang / Malam
	 * masing-masing punya minimal satu orang.
	 */
	const repairWeekCoverage = (weekDate: string): void => {
		const entries = crew.map((e) => ({ emp: e, state: weekState.get(e.id) }));
		const inShift = (shift: ShiftKind) => entries.filter((x) => x.state && x.state.shift === shift);
		const assignedCount = (shift: ShiftKind): number => inShift(shift).length;

		for (const target of REGULAR_SHIFTS) {
			if (assignedCount(target) > 0) continue;

			// Pilih donor dengan urutan prioritas:
			//  1. shift yang terisi >= 2 orang (supaya shift asalnya tetap terisi),
			//  2. yang paling sedikit pilihan shift-nya (paling tidak fleksibel),
			//  3. yang sudah paling lama ada di shift itu (supaya rotasi tetap jalan).
			// Malam → Pagi tetap DILARANG.
			// Karyawan baru dalam orientasi TIDAK BOLEH dipindah keluar dari Pagi.
			const candidates = entries
				.filter((x) => x.state && x.state.shift !== target)
				.filter((x) => allowedRegularShifts(x.emp).includes(target))
				.filter((x) => !(x.state!.shift === "malam" && target === "pagi"))
				.filter((x) => !(isNewHireMorningPeriod(x.emp, weekDate) && x.state!.shift === "pagi"))
				.filter((x) => assignedCount(x.state!.shift) >= 2)
				.sort((a, b) => {
					const fa = allowedRegularShifts(a.emp).length;
					const fb = allowedRegularShifts(b.emp).length;
					if (fa !== fb) return fa - fb;
					return (b.state!.weeks ?? 1) - (a.state!.weeks ?? 1);
				});

			const donor = candidates[0];
			if (!donor?.state) continue;
			donor.state.shift = target;
			donor.state.weeks = 1;
		}
	};

	const allCrewForSummary = [...crew];
	for (const list of incomingHelpers.values()) {
		for (const h of list) {
			if (!allCrewForSummary.some((c) => c.id === h.id)) allCrewForSummary.push(h);
		}
	}
	const summaryMap = new Map<string, EmployeeSummary>(
		allCrewForSummary.map((e) => [
			e.id,
			{ employeeId: e.id, name: e.name, pagi: 0, siang: 0, malam: 0, emergency: 0, totalHours: 0, offDays: 0 },
		]),
	);

	const assignments: ScheduleResult["assignments"] = [];
	const days: DaySchedule[] = [];
	let currentWeek = "";

	/**
	 * Hitung shift utama tiap crew untuk pekan yang dimulai `weekStart`.
	 *
	 * Aturan rotasi:
	 *  - Shift berganti tiap 1 minggu.
	 *  - Karyawan baru wajib masuk Pagi minimal 1 minggu pertama.
	 *  - Dilarang Malam → Pagi (anti-fatigue).
	 *  - Shift Malam dibagi seadil-adilnya secara kumulatif.
	 */
	const planWeek = (weekStart: string, isFirstWeek: boolean): void => {
		// Pekan pertama: bagi crew merata ke Pagi / Siang / Malam.
		if (isFirstWeek) {
			seedInitialShifts();
			repairWeekCoverage(weekStart);
			return;
		}

		const activeWeekCrew = crew.filter((e) => !resignedOn(e, weekStart));

		// Aturan Restriksi Shift Khusus: jika tepat 3 orang dan 1 orang memiliki restriksi shift
		if (activeWeekCrew.length === 3) {
			const specialEmployees = activeWeekCrew.filter((e) => allowedRegularShifts(e).length < 3);
			if (specialEmployees.length === 1) {
				const special = specialEmployees[0];
				const allowed = allowedRegularShifts(special);
				const [free1, free2] = activeWeekCrew.filter((e) => e.id !== special.id);

				// =========================================================================
				// KASUS 1: Staf Khusus Tidak Bisa MALAM (hanya Pagi & Siang)
				// - Shift Malam ditahan 2 minggu bergantian oleh 2 staf bebas.
				// - Staf Khusus selang-seling antara Pagi <-> Siang tiap 1 minggu.
				//   Alur staf bebas: Malam -> Malam -> Siang -> Pagi
				// =========================================================================
				if (!allowed.includes("malam") && allowed.includes("pagi") && allowed.includes("siang")) {
					const prevSpecial = weekState.get(special.id)?.shift ?? "pagi";
					const nextSpecial: ShiftKind = prevSpecial === "pagi" ? "siang" : "pagi";

					const s1 = weekState.get(free1.id);
					const s2 = weekState.get(free2.id);
					const prevNightHolder = s1?.shift === "malam" ? free1 : s2?.shift === "malam" ? free2 : free1;
					const otherFree = prevNightHolder.id === free1.id ? free2 : free1;
					const nightWeeks = (prevNightHolder.id === free1.id ? s1?.weeks : s2?.weeks) ?? 1;

					const remainingShift: ShiftKind = nextSpecial === "pagi" ? "siang" : "pagi";

					if (nightWeeks < 2) {
						// Tahan shift Malam selama 2 minggu berturut-turut
						weekState.set(prevNightHolder.id, { shift: "malam", weeks: 2 });
						weekState.set(otherFree.id, { shift: remainingShift, weeks: 1 });
					} else {
						// Sudah 2 minggu di pos Malam: gantian ke staf bebas satunya!
						weekState.set(otherFree.id, { shift: "malam", weeks: 1 });
						weekState.set(prevNightHolder.id, { shift: remainingShift, weeks: 1 });
					}
					weekState.set(special.id, { shift: nextSpecial, weeks: 1 });
					repairWeekCoverage(weekStart);
					return;
				}

				// =========================================================================
				// KASUS 2: Staf Khusus Tidak Bisa PAGI (hanya Siang & Malam)
				// - Shift Pagi ditahan 2 minggu bergantian oleh 2 staf bebas.
				// - Staf Khusus selang-seling antara Siang <-> Malam tiap 1 minggu.
				//   Alur staf bebas: Pagi -> Pagi -> Malam -> Siang
				// =========================================================================
				if (!allowed.includes("pagi") && allowed.includes("siang") && allowed.includes("malam")) {
					const prevSpecial = weekState.get(special.id)?.shift ?? "siang";
					const nextSpecial: ShiftKind = prevSpecial === "siang" ? "malam" : "siang";

					const s1 = weekState.get(free1.id);
					const s2 = weekState.get(free2.id);
					const prevPagiHolder = s1?.shift === "pagi" ? free1 : s2?.shift === "pagi" ? free2 : free1;
					const otherFree = prevPagiHolder.id === free1.id ? free2 : free1;
					const pagiWeeks = (prevPagiHolder.id === free1.id ? s1?.weeks : s2?.weeks) ?? 1;

					const remainingShift: ShiftKind = nextSpecial === "siang" ? "malam" : "siang";

					if (pagiWeeks < 2) {
						// Tahan shift Pagi selama 2 minggu berturut-turut
						weekState.set(prevPagiHolder.id, { shift: "pagi", weeks: 2 });
						weekState.set(otherFree.id, { shift: remainingShift, weeks: 1 });
					} else {
						// Sudah 2 minggu di pos Pagi: gantian ke staf bebas satunya!
						weekState.set(otherFree.id, { shift: "pagi", weeks: 1 });
						weekState.set(prevPagiHolder.id, { shift: remainingShift, weeks: 1 });
					}
					weekState.set(special.id, { shift: nextSpecial, weeks: 1 });
					repairWeekCoverage(weekStart);
					return;
				}

				// =========================================================================
				// KASUS 3: Staf Khusus Tidak Bisa SIANG (Kondisi Buntu / Zona Bahaya)
				// Solusi Mutlak:
				// - Staf Khusus TIDAK BOLEH shift Malam, dikunci 100% di Pagi.
				// - 2 staf bebas muter bergantian Siang <-> Malam tiap minggu.
				// =========================================================================
				if (!allowed.includes("siang") && allowed.includes("pagi") && allowed.includes("malam")) {
					weekState.set(special.id, { shift: "pagi", weeks: (weekState.get(special.id)?.weeks ?? 1) + 1 });
					const s1 = weekState.get(free1.id)?.shift;
					const next1: ShiftKind = s1 === "siang" ? "malam" : "siang";
					const next2: ShiftKind = next1 === "siang" ? "malam" : "siang";
					weekState.set(free1.id, { shift: next1, weeks: 1 });
					weekState.set(free2.id, { shift: next2, weeks: 1 });
					repairWeekCoverage(weekStart);
					return;
				}

				// Kasus Staf hanya bisa 1 shift
				if (allowed.length === 1) {
					const only = allowed[0];
					weekState.set(special.id, { shift: only, weeks: (weekState.get(special.id)?.weeks ?? 1) + 1 });
					const otherShifts = REGULAR_SHIFTS.filter((s) => s !== only);
					const s1 = weekState.get(free1.id)?.shift;
					const next1: ShiftKind = s1 === otherShifts[0] ? otherShifts[1] : otherShifts[0];
					const next2: ShiftKind = next1 === otherShifts[0] ? otherShifts[1] : otherShifts[0];
					weekState.set(free1.id, { shift: next1, weeks: 1 });
					weekState.set(free2.id, { shift: next2, weeks: 1 });
					repairWeekCoverage(weekStart);
					return;
				}
			}
		}

		// Jika kru aktif 3 orang bebas, cari penugasan 3 shift terbaik yang paling adil
		if (activeWeekCrew.length === 3) {
			const perms: ShiftKind[][] = [
				["pagi", "siang", "malam"],
				["pagi", "malam", "siang"],
				["siang", "pagi", "malam"],
				["siang", "malam", "pagi"],
				["malam", "pagi", "siang"],
				["malam", "siang", "pagi"],
			];

			let bestPerm: ShiftKind[] | null = null;
			let bestScore = Infinity;
			const yesterday = addDays(weekStart, -1);

			for (const perm of perms) {
				let valid = true;
				let score = 0;

				for (let i = 0; i < 3; i++) {
					const emp = activeWeekCrew[i];
					const s = perm[i];

					// 1. Karyawan boleh mengambil shift ini
					if (!allowedRegularShifts(emp).includes(s)) {
						valid = false;
						break;
					}

					// 2. Anak baru dalam masa orientasi WAJIB masuk pagi
					if (isNewHireMorningPeriod(emp, weekStart) && s !== "pagi") {
						valid = false;
						break;
					}

					// 3. Anti-fatigue Malam -> Pagi lintas pekan (Minggu malam -> Senin pagi)
					const lastWorked = lastWorkedShift.get(emp.id);
					if (
						lastWorked?.date === yesterday &&
						(lastWorked.shift === "malam" || lastWorked.shift === "sore12") &&
						s === "pagi"
					) {
						valid = false;
						break;
					}

					const prevShift = weekState.get(emp.id)?.shift;
					// 4. Penalti jika tidak berganti shift dari pekan lalu (wajib ganti tiap 1 minggu!)
					if (prevShift && s === prevShift && !isNewHireMorningPeriod(emp, weekStart)) {
						score += 500;
					}

					// 5. Bonus jika mengikuti siklus rotasi alami Pagi -> Malam -> Siang -> Pagi
					if (prevShift && ROTATE_NEXT[prevShift as "pagi" | "siang" | "malam"] === s) {
						score -= 50;
					}

					// 6. Keadilan beban shift malam (Equity Penalty)
					if (s === "malam") {
						score += used(emp.id, "malam") * 10;
					}

					// 7. Keadilan total jam kerja kumulatif
					score += totalUsed(emp.id) * 1;
				}

				if (valid && score < bestScore) {
					bestScore = score;
					bestPerm = perm;
				}
			}

			if (bestPerm) {
				for (let i = 0; i < 3; i++) {
					const emp = activeWeekCrew[i];
					const next = bestPerm[i];
					const prevShift = weekState.get(emp.id)?.shift;
					const weeks = prevShift === next ? (weekState.get(emp.id)?.weeks ?? 1) + 1 : 1;
					weekState.set(emp.id, { shift: next, weeks });
				}
				repairWeekCoverage(weekStart);
				return;
			}
		}

		// Fallback heuristik untuk jumlah crew selain 3
		const shiftLoad = new Map<ShiftKind, number>();
		const loadOf = (s: ShiftKind): number => shiftLoad.get(s) ?? 0;
		const leastLoaded = (allowed: ShiftKind[]): ShiftKind => {
			let best = allowed[0];
			for (const s of allowed) if (loadOf(s) < loadOf(best)) best = s;
			return best;
		};

		for (const emp of crew) {
			const prevState = weekState.get(emp.id);
			const allowed = allowedRegularShifts(emp);
			const baseShift: ShiftKind | null = prevState?.shift ?? null;
			const baseWeeks = prevState?.weeks ?? 1;
			const cycle: ShiftKind[] = allowed;

			let next: ShiftKind;
			let weeks = 1;

			if (isNewHireMorningPeriod(emp, weekStart) && allowed.includes("pagi")) {
				next = "pagi";
			} else if (!baseShift) {
				next = leastLoaded(cycle);
			} else if (!allowed.includes(baseShift)) {
				next = leastLoaded(cycle);
			} else {
				const rotateTo = ROTATE_NEXT[baseShift as "pagi" | "siang" | "malam"];
				let target: ShiftKind | null = allowed.includes(rotateTo) ? rotateTo : null;

				if (!target) {
					const options = cycle.filter((s) => s !== baseShift && !(baseShift === "malam" && s === "pagi"));
					if (options.length > 0) {
						target = [...options].sort((a, b) => used(emp.id, a) - used(emp.id, b))[0];
					}
				}

				if (!target) {
					next = baseShift;
					weeks = baseWeeks + 1;
				} else {
					next = target;
				}
			}

			if (!allowed.includes(next)) next = cycle[0];

			weekState.set(emp.id, { shift: next, weeks });
			shiftLoad.set(next, loadOf(next) + 1);
		}

		repairWeekCoverage(weekStart);
	};

	for (const date of dates) {
		const weekStart = startOfWeek(date);
		if (weekStart !== currentWeek) {
			const isFirstWeek = currentWeek === "";
			currentWeek = weekStart;
			planWeek(weekStart, isFirstWeek);
		}

		const shiftOf = (emp: ShiftEmployee): ShiftKind => weekState.get(emp.id)?.shift ?? "pagi";

		const helpersToday = incomingHelpers.get(date) ?? [];
		const availableCrew = [...crew.filter((e) => !isAway(e, date)), ...helpersToday];
		const absentCrew = crew.filter((e) => isAway(e, date));
		const absentNames = absentCrew.map((e) => e.name).join(", ");

		// --- Pemilih shift ---------------------------------------------------
		const chosen = new Set<string>();
		const pickFor = (shift: ShiftKind, count: number): ShiftEmployee[] => {
			if (count <= 0) return [];
			const yesterday = addDays(date, -1);

			const eligible = (emp: ShiftEmployee): boolean => {
				if (chosen.has(emp.id)) return false;
				// Restriksi per karyawan: shift harus ada di daftar yang diizinkan.
				if (!canTakeShift(emp, shift)) return false;
				// Anti-fatigue: tidak boleh masuk Pagi kalau kemarin selesai shift malam.
				const wantsMorning = shift === "pagi" || shift === "pagi12";
				if (!wantsMorning) return true;
				const prev = lastWorkedShift.get(emp.id);
				return !(prev && prev.date === yesterday && (prev.shift === "malam" || prev.shift === "sore12"));
			};

			const comparator = (a: ShiftEmployee, b: ShiftEmployee): number => {
				// Shift utama pekan ini SELALU didahulukan, supaya satu orang
				// memegang shift yang sama sepanjang pekan (tidak ganti tiap hari).
				const aPref = shiftOf(a) === shift ? 0 : 1;
				const bPref = shiftOf(b) === shift ? 0 : 1;
				if (aPref !== bPref) return aPref - bPref;
				// Baru setelah itu pemerataan dipakai sebagai penentu.
				const aUse = used(a.id, shift);
				const bUse = used(b.id, shift);
				if (aUse !== bUse) return aUse - bUse;
				return totalUsed(a.id) - totalUsed(b.id);
			};

			const result = availableCrew.filter(eligible).sort(comparator).slice(0, count);
			for (const e of result) chosen.add(e.id);
			return result;
		};

		const makeSlot = (shift: ShiftKind, emp: ShiftEmployee, note?: string): DaySlot => {
			const meta = SHIFT_META[shift];
			const isHelper = helpersToday.some((h) => h.id === emp.id);
			return {
				shift,
				employeeId: emp.id,
				employeeName: isHelper ? `${emp.name} (BKO)` : emp.name,
				startTime: meta.start,
				endTime: meta.end,
				hours: meta.hours,
				isBackup: false,
				isEmergency: shift === "pagi12" || shift === "sore12",
				note: note || (isHelper ? "BKO dari cabang lain" : undefined),
			};
		};

		// Aturan 9: Mbak Koperasi HANYA BISA shift pagi. Jangan pernah menempatkan di sore/malam.
		const backupSlot = (shift: ShiftKind, start: string, end: string, hours: number, note?: string): DaySlot => {
			const isMorning = shift === "pagi" || (shift === "pagi12" && start === "08:00");
			const name = isMorning ? backupName : hasMagang ? "Anak Magang" : backupName;
			return {
				shift,
				employeeId: null,
				employeeName: name,
				startTime: start,
				endTime: end,
				hours,
				isBackup: true,
				isEmergency: true,
				note,
			};
		};

		const slots: DaySlot[] = [];
		const notes: string[] = [];
		let mode: DayMode = "3shift";

		const fillThreeShifts = (backupCoversPagi = false): void => {
			const openShifts = REGULAR_SHIFTS.filter((s) => !(backupCoversPagi && s === "pagi"));
			// Jumlah orang per shift menyesuaikan crew yang hadir hari itu.
			const perShift = perShiftOn(date);
			const yesterday = addDays(date, -1);
			const unassignedCrew = availableCrew.filter((e) => !chosen.has(e.id));

			// Solver permutasi untuk 1 orang per shift (skenario standar 2-3 orang)
			if (perShift === 1 && unassignedCrew.length >= openShifts.length) {
				const candidatePerms = getPermutations(unassignedCrew, openShifts.length);
				let bestPerm: ShiftEmployee[] | null = null;
				let bestScore = Infinity;

				for (const perm of candidatePerms) {
					let valid = true;
					let score = 0;

					for (let i = 0; i < openShifts.length; i++) {
						const emp = perm[i];
						const shift = openShifts[i];

						// 1. Larangan shift
						if (!canTakeShift(emp, shift)) {
							valid = false;
							break;
						}

						// 2. Anti-fatigue: Malam -> Pagi dilarang keras!
						const prev = lastWorkedShift.get(emp.id);
						if (
							prev &&
							prev.date === yesterday &&
							(prev.shift === "malam" || prev.shift === "sore12") &&
							(shift === "pagi" || shift === "pagi12")
						) {
							valid = false;
							break;
						}

						// 3. Anak baru dalam masa orientasi wajib masuk Pagi
						if (isNewHireMorningPeriod(emp, date)) {
							if (openShifts.includes("pagi") && shift !== "pagi") {
								valid = false;
								break;
							}
							if (shift === "malam") {
								valid = false;
								break;
							}
						}

						// Scoring:
						// A. Deviasi dari shift target pekan ini (harus dipertahankan selama 1 minggu Senin-Minggu)
						if (shift !== shiftOf(emp)) {
							score += 5000;
						}

						// B. Anti-trap darurat: jangan biarkan orang yang cover darurat malam kemarin
						// terjebak di malam lagi jika target pemilik malam hari ini sudah hadir
						if (prev && prev.date === yesterday && prev.shift === "malam" && shiftOf(emp) !== "malam") {
							if (shift === "malam") {
								const legitimateNightOwner = unassignedCrew.find(
									(c) => shiftOf(c) === "malam" && canTakeShift(c, "malam"),
								);
								if (legitimateNightOwner && legitimateNightOwner.id !== emp.id) {
									score += 20000;
								}
							}
						}

						// C. Keadilan beban shift malam (hanya berpengaruh saat ada swap darurat)
						if (shift === "malam") {
							score += used(emp.id, "malam") * 20;
						}

						// D. Keadilan total jam kerja (hanya berpengaruh saat ada swap darurat)
						score += totalUsed(emp.id) * 1;
					}

					if (valid && score < bestScore) {
						bestScore = score;
						bestPerm = perm;
					}
				}

				if (bestPerm) {
					const planSlots: DaySlot[] = [];
					for (let i = 0; i < openShifts.length; i++) {
						const emp = bestPerm[i];
						const shift = openShifts[i];
						chosen.add(emp.id);
						planSlots.push(makeSlot(shift, emp));
					}
					planSlots.sort((a, b) => REGULAR_SHIFTS.indexOf(a.shift) - REGULAR_SHIFTS.indexOf(b.shift));
					for (const slot of planSlots) slots.push(slot);
					return;
				}
			}

			// Strategi A: urutan standar Pagi → Sore → Malam.
			const beforeA = new Set(chosen);
			const planA: DaySlot[] = [];
			for (const shift of openShifts) {
				for (const emp of pickFor(shift, perShift)) planA.push(makeSlot(shift, emp));
			}
			const chosenA = new Set(chosen);

			// Strategi B: isi dulu shift dengan peminat paling sedikit, sehingga
			// shift yang tidak bisa diisi karyawan terbatas (mis. tanpa Malam)
			// tidak kehilangan slot gara-gara crew lain menghabiskan Pagi/Sore.
			chosen.clear();
			for (const id of beforeA) chosen.add(id);
			const demand = (shift: ShiftKind): number =>
				availableCrew.filter((e) => shiftOf(e) === shift && canTakeShift(e, shift)).length;
			const planB: DaySlot[] = [];
			for (const shift of [...openShifts].sort((a, b) => demand(a) - demand(b))) {
				for (const emp of pickFor(shift, perShift)) planB.push(makeSlot(shift, emp));
			}

			const covered = (plan: DaySlot[]): number => new Set(plan.map((s) => s.shift)).size;
			const usePlanB = covered(planB) > covered(planA);
			// Urutkan hasilnya Pagi → Sore → Malam supaya daftar "siapa di shift
			// apa" terbaca konsisten (planB menulis Malam lebih dulu).
			const winner = (usePlanB ? planB : planA)
				.map((slot, idx) => ({ slot, idx }))
				.sort((a, b) => REGULAR_SHIFTS.indexOf(a.slot.shift) - REGULAR_SHIFTS.indexOf(b.slot.shift) || a.idx - b.idx)
				.map((x) => x.slot);

			chosen.clear();
			if (!usePlanB) {
				for (const id of chosenA) chosen.add(id);
			} else {
				for (const s of planB) if (s.employeeId) chosen.add(s.employeeId);
			}
			for (const slot of winner) slots.push(slot);
		};

		/**
		 * Dua orang menutup 24 jam: satu 08:00–20:00, satu 20:00–08:00 (Aturan 6, 7, 11).
		 * Aturan 3 & 9: Hormati larangan shift. Mbak Koperasi HANYA bisa shift pagi.
		 */
		const pushSplit12 = (reason: string): void => {
			const yesterday = addDays(date, -1);
			const eligibleForPagi12 = availableCrew.filter((e) => {
				if (!canTakeShift(e, "pagi")) return false;
				const prev = lastWorkedShift.get(e.id);
				return !(prev && prev.date === yesterday && (prev.shift === "malam" || prev.shift === "sore12"));
			});
			const eligibleForSore12 = availableCrew.filter((e) => canTakeShift(e, "malam"));

			const newHire = availableCrew.find((e) => isNewHireMorningPeriod(e, date));
			const dayOnly = availableCrew.find((e) => !canTakeShift(e, "malam") && canTakeShift(e, "pagi"));
			const nightOnly = availableCrew.find((e) => !canTakeShift(e, "pagi") && canTakeShift(e, "malam"));

			let daylight =
				newHire && eligibleForPagi12.includes(newHire)
					? newHire
					: dayOnly && eligibleForPagi12.includes(dayOnly)
						? dayOnly
						: null;
			let night = nightOnly ?? null;

			if (!daylight || !night) {
				let bestPair: [ShiftEmployee, ShiftEmployee] | null = null;
				let bestScore = Infinity;

				for (const d of eligibleForPagi12) {
					for (const n of eligibleForSore12) {
						if (d.id === n.id) continue;
						if (newHire && n.id === newHire.id) continue;
						let score = 0;
						if (shiftOf(d) !== "pagi") score += 20;
						if (shiftOf(n) !== "malam") score += 20;
						score += used(n.id, "malam") * 30;
						if (score < bestScore) {
							bestScore = score;
							bestPair = [d, n];
						}
					}
				}
				if (bestPair) {
					daylight = daylight ?? bestPair[0];
					night = night ?? bestPair[1];
				}
			}

			if (!daylight) daylight = pickFor("pagi12", 1)[0] ?? null;
			if (!night) night = availableCrew.find((e) => e.id !== daylight?.id && canTakeShift(e, "malam")) ?? null;

			if (daylight) {
				chosen.add(daylight.id);
				slots.push(makeSlot("pagi12", daylight, "Cover 08:00–20:00"));
			}
			if (night && night.id !== daylight?.id) {
				chosen.add(night.id);
				slots.push(makeSlot("sore12", night, "Cover 20:00–08:00"));
			} else {
				// Tidak ada crew yang bisa malam
				if (hasMagang && backupReadyOn(date)) {
					// Anak magang bisa malam (Aturan 10)
					slots.push(backupSlot("sore12", "20:00", "08:00", 12, "Anak magang menutup shift malam"));
				} else {
					// Aturan 9 & 10 & 12: Mbak Koperasi TIDAK BOLEH shift malam!
					warnings.push({
						date,
						level: "danger",
						message: `[PERLU KONFIRMASI] Shift malam 20:00–08:00 pada ${formatDateShort(date)} kosong — karyawan yang ada terhalang larangan shift & Mbak Koperasi hanya bisa shift pagi.`,
					});
				}
			}

			if (!slots.some((s) => s.startTime === "08:00")) {
				warnings.push({
					date,
					level: "danger",
					message: `[PERLU KONFIRMASI] Tidak ada yang bisa jaga 08:00–20:00 pada ${formatDateShort(date)} — perlu konfirmasi manual.`,
				});
			}
			notes.push(reason);
		};

		/**
		 * Sabtu dengan backup: Mbak Koperasi / magang buka 08:00–13:00 (Aturan 5 & 9),
		 * lalu sisa 19 jam dibagi rata ke 2 crew (±9,5 jam per orang) supaya tetap adil.
		 */
		const pushBackupSplit = (): void => {
			slots.push(backupSlot("pagi", "08:00", "13:00", 5, "Mbak Koperasi / magang buka 08:00–13:00"));
			const first = pickFor("pagi12", 1)[0];
			const second =
				availableCrew.find((e) => e.id !== first?.id && canTakeShift(e, "malam")) ?? pickFor("sore12", 1)[0];
			if (first) {
				slots.push({
					...makeSlot("pagi12", first, "Lanjutan 13:00–22:30"),
					startTime: "13:00",
					endTime: "22:30",
					hours: 9.5,
				});
			}
			if (second) {
				slots.push({
					...makeSlot("sore12", second, "Lanjutan 22:30–08:00"),
					startTime: "22:30",
					endTime: "08:00",
					hours: 9.5,
				});
			}
			if (!first || !second) {
				warnings.push({
					date,
					level: "danger",
					message: `[PERLU KONFIRMASI] Crew tidak cukup untuk menutup sisa jam pada ${formatDateShort(date)} — perlu bantuan manual.`,
				});
			}
		};

		/**
		 * Penanganan jika crew tersisa tinggal 1 orang (Aturan 9, 10, 11, 12).
		 */
		const handleSingleCrew = (context: string): void => {
			mode = "emergency";
			const only = availableCrew[0];
			if (!only) {
				notes.push("Tidak ada karyawan yang hadir.");
				warnings.push({
					date,
					level: "danger",
					message: `[PERLU KONFIRMASI] Tidak ada crew yang hadir pada ${formatDateShort(date)} — cari pengganti segera.`,
				});
				return;
			}

			if (canTakeShift(only, "malam")) {
				// Crew bisa malam: Mbak Koperasi jaga 08:00–20:00 (pagi), crew jaga 20:00–08:00 (malam)
				if (backupReadyOn(date)) {
					slots.push(backupSlot("pagi12", "08:00", "20:00", 12, `${backupName} cover 08:00–20:00`));
					slots.push(makeSlot("sore12", only, "Cover malam 20:00–08:00"));
					notes.push(
						`${context}: hanya ${only.name} hadir — ${backupName} cover 08:00–20:00, ${only.name} cover 20:00–08:00.`,
					);
				} else {
					slots.push(makeSlot("sore12", only, "Cover malam 20:00–08:00"));
					notes.push(`${context}: hanya ${only.name} hadir tanpa backup.`);
					warnings.push({
						date,
						level: "danger",
						message: `[PERLU KONFIRMASI] Hanya 1 crew hadir (${only.name}) tanpa backup pada ${formatDateShort(date)} — shift pagi kosong.`,
					});
				}
			} else {
				// Crew TIDAK bisa malam: Crew ambil pagi12.
				// Mbak Koperasi TIDAK BOLEH shift malam (Aturan 9).
				slots.push(makeSlot("pagi12", only, "Cover pagi 08:00–20:00"));
				if (hasMagang && backupReadyOn(date)) {
					slots.push(backupSlot("sore12", "20:00", "08:00", 12, "Anak magang menutup shift malam"));
					notes.push(`${context}: ${only.name} cover pagi, anak magang cover malam.`);
				} else {
					notes.push(`${context}: ${only.name} cover pagi, shift malam kosong.`);
					warnings.push({
						date,
						level: "danger",
						message: `[PERLU KONFIRMASI] Shift malam kosong pada ${formatDateShort(date)}: ${only.name} tidak bisa malam & Mbak Koperasi hanya bisa shift pagi.`,
					});
				}
			}
		};

		// Cek jika tanggal ini memiliki penugasan manual dari user
		if (manualOverrides && manualOverrides[date] && manualOverrides[date].length > 0) {
			mode = "3shift";
			const overrideSlots = manualOverrides[date];
			for (const s of overrideSlots) {
				slots.push({ ...s });
				if (s.employeeId) {
					chosen.add(s.employeeId);
					// Sinkronkan state rotasi agar pekan/hari berikutnya berotasi dari shift ini
					const base = baseShiftOf(s.shift);
					const prevRot = weekState.get(s.employeeId);
					const wks = prevRot && prevRot.shift === base ? prevRot.weeks : 1;
					weekState.set(s.employeeId, { shift: base, weeks: wks });
				}
			}
			notes.push("Jadwal input manual oleh pengguna.");
		}
		// ===================== MINGGU =====================
		// Normal: 3 shift 8 jam.
		// Aturan 6: Libur dadakan di hari Minggu otomatis memakai 2 orang jaga (2 shift @12 jam).
		else if (isSunday(date)) {
			if (availableCrew.length >= 3) {
				fillThreeShifts();
				if (absentCrew.length > 0) {
					notes.push(`${absentNames} berhalangan — crew tersisa tetap menutup 3 shift.`);
				}
			} else if (availableCrew.length === 2) {
				mode = "sunday-2x12";
				pushSplit12(
					absentCrew.length > 0
						? `Minggu: ${absentNames} berhalangan — 2 orang jaga 12 jam (Aturan 6).`
						: "Minggu dengan crew 2 orang — 2 shift @12 jam.",
				);
			} else {
				handleSingleCrew("Minggu");
			}
		}
		// ===================== SABTU =====================
		// Aturan 5: Jika 1 crew inti libur di hari Sabtu & ada backup, Mbak Koperasi / magang
		// masuk 08:00–13:00, 2 crew membagi sisa waktu.
		// Aturan 7: Jika ada orang libur di hari Sabtu & TIDAK ada mbak koperasi, 2 orang jaga 12 jam.
		else if (isSaturday(date)) {
			if (absentCrew.length === 0) {
				fillThreeShifts();
			} else if (backupReadyOn(date)) {
				mode = "backup";
				if (availableCrew.length >= 3) {
					slots.push(backupSlot("pagi", "08:00", "13:00", 5, "Mbak Koperasi / magang buka 08:00–13:00"));
					fillThreeShifts();
					const pagiCrew = slots.find((s) => s.shift === "pagi" && !s.isBackup);
					if (pagiCrew) {
						pagiCrew.startTime = "13:00";
						pagiCrew.endTime = "16:00";
						pagiCrew.hours = 3;
						pagiCrew.note = "Melanjutkan shift Pagi setelah backup";
					}
					notes.push(`${backupName} masuk 08:00–13:00 menggantikan ${absentNames} (Aturan 5).`);
				} else if (availableCrew.length === 2) {
					pushBackupSplit();
					notes.push(
						`Sabtu: ${absentNames} berhalangan — ${backupName} buka 08:00–13:00, 2 crew membagi 13:00–08:00 (Aturan 5).`,
					);
				} else {
					handleSingleCrew("Sabtu");
				}
			} else if (availableCrew.length >= 3) {
				fillThreeShifts();
				notes.push(`${absentNames} berhalangan tanpa backup — crew tersisa menutup 3 shift.`);
			} else if (availableCrew.length === 2) {
				// Aturan 7: Libur Sabtu tanpa mbak koperasi -> 2 orang jaga 12 jam.
				mode = "2shift12";
				pushSplit12(`Sabtu: ${absentNames} berhalangan & tidak ada mbak koperasi — 2 orang jaga 12 jam (Aturan 7).`);
			} else {
				handleSingleCrew("Sabtu tanpa backup");
			}
		}
		// ===================== HARI BIASA (Senin–Jumat) =====================
		// Aturan 4 & 8: Jika ada izin/sakit/libur/resign dadakan: shift pagi dijaga mbak koperasi/magang.
		// Aturan 11: Jika tidak ada backup, gunakan aturan cadangan: 2 orang jaga 12 jam.
		else if (absentCrew.length === 0) {
			fillThreeShifts();
		} else if (helpersToday.length > 0 && availableCrew.length >= 3) {
			fillThreeShifts();
			const helperNames = helpersToday.map((h) => h.name).join(", ");
			notes.push(
				`${absentNames} berhalangan — dibantu BKO dari cabang lain (${helperNames}), 3 shift tetap berjalan normal.`,
			);
		} else if (backupReadyOn(date)) {
			if (availableCrew.length >= 2) {
				mode = "backup";
				// Mbak Koperasi HANYA BISA shift pagi (Aturan 9)
				slots.push(backupSlot("pagi", "08:00", "16:00", 8, "Mbak Koperasi jaga shift Pagi"));
				fillThreeShifts(true);
				const bkoEmp = absentCrew.find((e) => unavailable.get(`${e.id}|${date}`)?.type === "bantuan");
				if (bkoEmp) {
					notes.push(
						`${bkoEmp.name} tugas bantuan (BKO) ke cabang lain — shift Pagi dijaga ${backupName}, crew sisanya mengisi Sore & Malam.`,
					);
				} else {
					notes.push(
						`${absentNames} berhalangan — shift Pagi dibackup ${backupName}, crew sisanya mengisi Sore & Malam.`,
					);
				}
			} else {
				handleSingleCrew("Hari biasa");
			}
		} else if (availableCrew.length >= 3) {
			fillThreeShifts();
			notes.push(`${absentNames} berhalangan tanpa backup — crew tersisa menutup 3 shift.`);
		} else if (availableCrew.length === 2) {
			// Aturan 11: 2 orang jaga 12 jam
			mode = "2shift12";
			pushSplit12(`${absentNames} berhalangan & tidak ada backup — 2 orang jaga 12 jam (Aturan 11).`);
		} else {
			handleSingleCrew("Hari biasa tanpa backup");
		}

		// --- Update statistik hari ini ---------------------------------------
		for (const slot of slots) {
			if (!slot.employeeId) continue;
			bump(slot.employeeId, slot.shift);
			lastWorkedShift.set(slot.employeeId, { date, shift: slot.shift });
			const row = summaryMap.get(slot.employeeId);
			if (!row) continue;
			row.totalHours += slot.hours;
			// Shift 12 jam dicatat terpisah supaya rotasi 8 jam tetap seimbang.
			if (slot.shift === "pagi12" || slot.shift === "sore12") row.emergency += 1;
			else row[slot.shift] += 1;
		}

		const workingIds = new Set(slots.map((s) => s.employeeId).filter((v): v is string => Boolean(v)));
		for (const emp of crew) {
			if (workingIds.has(emp.id)) continue;
			const row = summaryMap.get(emp.id);
			if (row) row.offDays += 1;
		}

		for (const slot of slots) {
			assignments.push({
				branch_id: branchId,
				date,
				employee_id: slot.employeeId,
				employee_name: slot.employeeName,
				shift: slot.shift,
				start_time: slot.startTime,
				end_time: slot.endTime,
				hours: slot.hours,
				is_backup: slot.isBackup,
				is_emergency: slot.isEmergency,
				note: slot.note ?? null,
			});
		}

		days.push({ date, mode, slots, notes, off: crew.filter((e) => !workingIds.has(e.id)).map((e) => e.name) });
	}

	// -------------------------------------------------------------------------
	// Validasi hasil
	// -------------------------------------------------------------------------
	for (const day of days) {
		const crewSlots = day.slots.filter((s) => !s.isBackup);

		// Cakupan 24 jam: jumlahkan jam semua slot (crew + backup).
		const coveredHours = day.slots.reduce((sum, s) => sum + s.hours, 0);
		if (coveredHours < 23.5) {
			warnings.push({
				date: day.date,
				level: "danger",
				message: `[PERLU KONFIRMASI] Operasional ${formatDateShort(day.date)} baru tertutup ${coveredHours} dari 24 jam — perlu konfirmasi manual.`,
			});
		}

		// Hari normal 3 shift: pastikan tiap shift 8 jam ada yang jaga.
		if (day.mode === "3shift") {
			const ideal = perShiftOn(day.date);
			for (const shift of REGULAR_SHIFTS) {
				const count = crewSlots.filter((s) => s.shift === shift).length;
				if (count === 0) {
					warnings.push({
						date: day.date,
						level: "danger",
						message: `[PERLU KONFIRMASI] Shift ${SHIFT_META[shift].label} kosong pada ${formatDateShort(day.date)} — tidak ada karyawan yang bisa mengisi.`,
					});
				} else if (count < ideal) {
					warnings.push({
						date: day.date,
						level: "warning",
						message: `Shift ${SHIFT_META[shift].label} hanya ${count} orang (ideal ${ideal}).`,
					});
				}
			}
		}

		// Restriksi: tidak boleh ada crew yang dapat shift di luar daftar izinnya.
		for (const slot of day.slots) {
			if (!slot.employeeId) continue;
			const emp = crew.find((c) => c.id === slot.employeeId);
			if (!emp) continue;
			if (canTakeShift(emp, slot.shift)) continue;
			warnings.push({
				date: day.date,
				level: "danger",
				message: `[PERLU KONFIRMASI] ${emp.name} dijadwalkan ${SHIFT_META[slot.shift].label} padahal shift itu dilarang untuknya.`,
			});
		}

		// Jam kerja berlebih dalam sehari.
		const hoursByEmp = new Map<string, number>();
		for (const s of crewSlots) {
			if (!s.employeeId) continue;
			hoursByEmp.set(s.employeeId, (hoursByEmp.get(s.employeeId) ?? 0) + s.hours);
		}
		for (const [empId, total] of hoursByEmp) {
			if (total <= MAX_HOURS_PER_DAY) continue;
			const name = crew.find((c) => c.id === empId)?.name ?? empId;
			warnings.push({
				date: day.date,
				level: "danger",
				message: `${name} dijadwalkan ${total} jam dalam sehari (batas wajar ${MAX_HOURS_PER_DAY} jam).`,
			});
		}

		// Pola Malam → Pagi.
		const nextDay = days.find((d) => d.date === addDays(day.date, 1));
		if (!nextDay) continue;
		for (const slot of crewSlots) {
			if (!slot.employeeId) continue;
			if (slot.shift !== "malam" && slot.shift !== "sore12") continue;
			const conflict = nextDay.slots.find(
				(s) => s.employeeId === slot.employeeId && (s.shift === "pagi" || s.shift === "pagi12"),
			);
			if (conflict) {
				warnings.push({
					date: nextDay.date,
					level: "danger",
					message: `${slot.employeeName} kena pola Malam → Pagi (${formatDateShort(day.date)} → ${formatDateShort(nextDay.date)}).`,
				});
			}
		}
	}

	// Fairness keseluruhan periode.
	const summary = Array.from(summaryMap.values());
	for (const row of summary) {
		const regular = row.pagi + row.siang + row.malam;
		if (regular >= 9 && row.malam / regular > 0.55) {
			warnings.push({
				date: from,
				level: "warning",
				message: `${row.name} mendapat ${row.malam} dari ${regular} shift reguler di Malam (>55%). Rotasi perlu diseimbangkan.`,
			});
		}
	}

	if (stressTest) {
		warnings.push({
			date: from,
			level: "warning",
			message: `Cabang hanya punya ${crew.length} karyawan aktif (ideal ${IDEAL_CREW_SIZE}). Sistem jalan mode mitigasi — sebagian shift terpaksa kosong atau diisi backup.`,
		});
	}

	warnings.sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? -1 : 1));

	return {
		days,
		assignments,
		warnings,
		summary,
		meta: {
			branchId,
			from,
			to,
			crewCount: crew.length,
			perShift: Math.max(1, Math.floor(crew.length / IDEAL_CREW_SIZE)),
			stressTest,
			backupName,
			hasBackup: backupReadyOn(dates[0] ?? from),
			backupAvailable: backupAvailable !== false,
		},
	};
}

// ---------------------------------------------------------------------------
// Generator teks WhatsApp
// ---------------------------------------------------------------------------

export const buildWhatsAppText = (
	branchName: string,
	days: DaySchedule[],
	options?: { from?: string; to?: string; includeNotes?: boolean },
): string => {
	const start = options?.from ?? days[0]?.date ?? "";
	const end = options?.to ?? days[days.length - 1]?.date ?? "";
	const lines: string[] = [];

	lines.push("*JADWAL SHIFT MBA LAUNDRY EXPRESS*");
	lines.push(`🏠 Cabang: *${branchName}*`);
	if (start && end) lines.push(`📅 Periode: ${formatDateId(start)} – ${formatDateId(end)}`);
	lines.push("");

	let week = "";
	for (const day of days) {
		const wk = startOfWeek(day.date);
		if (wk !== week) {
			week = wk;
			lines.push("━━━━━━━━━━━━━━");
		}
		lines.push(`*${formatDateId(day.date)}*`);
		if (day.slots.length === 0) lines.push("❌ Belum ada petugas");
		for (const slot of day.slots) {
			const meta = SHIFT_META[slot.shift];
			const tag = slot.isBackup ? " _(backup)_" : "";
			lines.push(`${meta.emoji} ${meta.label} ${slot.startTime}–${slot.endTime} • ${slot.employeeName}${tag}`);
		}
		if (day.off.length > 0) lines.push(`🛌 Libur: ${day.off.join(", ")}`);
		if (options?.includeNotes && day.notes.length > 0) {
			for (const note of day.notes) lines.push(`ℹ️ ${note}`);
		}
		lines.push("");
	}

	lines.push("━━━━━━━━━━━━━━");
	lines.push("Mohon hadir tepat waktu. Tukar shift wajib lapor admin ya 🙏");
	return lines.join("\n");
};

// ---------------------------------------------------------------------------
// Helper untuk UI
// ---------------------------------------------------------------------------

/** Penjelasan singkat efek sebuah status ke admin. */
export const describeStatusImpact = (type: "resign" | "izin" | "sakit" | "libur"): string => {
	switch (type) {
		case "resign":
			return "Karyawan keluar dari rotasi. Slot Pagi hari-hari berikutnya diisi Mbak Koperasi/magang, sisanya dirotasi ulang tanpa melanggar aturan Malam → Pagi.";
		case "izin":
			return "Shift Pagi dibackup otomatis (bila backup tersedia), Siang & Malam diisi crew aktif tanpa melewati batas 12 jam/hari.";
		case "sakit":
			return "Sama seperti izin, tapi sebaiknya backup disiapkan minimal 3 hari.";
		case "libur":
			return "Hari libur dirotasi ulang. Kalau Sabtu dan tanpa backup, hari itu otomatis jadi 2 shift @12 jam.";
	}
};

export const eventTypeLabel: Record<string, string> = {
	izin: "Izin",
	sakit: "Sakit",
	libur: "Libur",
	resign: "Resign",
	bantuan: "Tugas Bantuan (BKO)",
};

export const eventTypeColor: Record<string, string> = {
	izin: "blue",
	sakit: "red",
	libur: "default",
	resign: "black",
	bantuan: "purple",
};
