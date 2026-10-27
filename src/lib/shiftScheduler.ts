import type { ShiftAssignment, ShiftEmployee, ShiftEvent, ShiftKind } from "@/types/database.types";

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
	siang: { label: "Siang", emoji: "☀️", start: "16:00", end: "00:00", hours: 8, color: "#EA580C", bg: "#FFEDD5" },
	malam: { label: "Malam", emoji: "🌙", start: "00:00", end: "08:00", hours: 8, color: "#1E3A8A", bg: "#DBEAFE" },
	pagi12: { label: "Pagi 12 Jam", emoji: "🔥", start: "08:00", end: "20:00", hours: 12, color: "#DC2626", bg: "#FEE2E2" },
	sore12: { label: "Malam 12 Jam", emoji: "🌗", start: "20:00", end: "08:00", hours: 12, color: "#7C3AED", bg: "#EDE9FE" },
};

/** Jumlah karyawan ideal per cabang (1 orang per shift). */
export const IDEAL_CREW_SIZE = 3;

/** Batas jam kerja wajar per orang per hari. */
export const MAX_HOURS_PER_DAY = 12;

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
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
	for (let i = 0; i < 400 && cur <= to; i += 1) {
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

interface RotState {
	/** Shift utama pekan ini. */
	shift: ShiftKind;
	/** true kalau shift pekan ini hanya penyangga antar-masa Malam → Pagi. */
	filler: boolean;
	/** Berapa pekan berturut-turut crew ini ada di shift tersebut. */
	weeks: number;
}

// ---------------------------------------------------------------------------
// Engine utama
// ---------------------------------------------------------------------------

export function generateSchedule(input: ScheduleInput): ScheduleResult {
	const { branchId, from, to, employees, events, previousAssignments = [], priorUsage = {} } = input;

	const warnings: ScheduleWarning[] = [];
	const dates = eachDate(from, to);

	const scoped = employees.filter((e) => e.branch_id === branchId);
	const crew = scoped
		.filter((e) => e.role !== "backup" && e.status !== "resigned")
		.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
	const backupStaff = scoped.filter((e) => e.role === "backup" && e.status !== "resigned");
	const backupName = backupStaff[0]?.name ?? "Mbak Koperasi / Anak Magang";

	const perShift = Math.max(1, Math.floor(crew.length / IDEAL_CREW_SIZE));
	const stressTest = crew.length < IDEAL_CREW_SIZE;

	// --- Index event -------------------------------------------------------
	const unavailable = new Map<string, ShiftEvent>();
	const declaredBackup = new Set<string>();
	for (const ev of events) {
		if (ev.branch_id && ev.branch_id !== branchId) continue;
		for (const date of eachDate(ev.date, ev.end_date || ev.date)) {
			if (ev.type !== "resign") unavailable.set(`${ev.employee_id}|${date}`, ev);
			if (ev.backup_available) declaredBackup.add(date);
		}
	}

	const backupBusy = new Set<string>();
	for (const b of backupStaff) {
		for (const ev of events) {
			if (ev.employee_id !== b.id) continue;
			for (const date of eachDate(ev.date, ev.end_date || ev.date)) backupBusy.add(date);
		}
	}

	/**
	 * Backup tersedia bila ada staf backup, dia tidak sedang cuti, dan minimal
	 * satu catatan absensi di tanggal itu menyatakan backup siap masuk.
	 */
	const backupReadyOn = (date: string): boolean => {
		if (backupStaff.length === 0) return false;
		if (backupBusy.has(date)) return false;
		return declaredBackup.has(date);
	};

	// --- Statistik fairness ------------------------------------------------
	const usage: ShiftUsage = { ...priorUsage };
	const bump = (employeeId: string, shift: ShiftKind): void => {
		const key = usageKey(employeeId, shift);
		usage[key] = (usage[key] ?? 0) + 1;
	};
	const used = (employeeId: string, shift: ShiftKind): number => usage[usageKey(employeeId, shift)] ?? 0;
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

	const summaryMap = new Map<string, EmployeeSummary>(
		crew.map((e) => [
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
	 * Aturan rotasi: shift bergeser satu langkah tiap pekan Pagi → Siang →
	 * Malam → Pagi, TAPI perpindahan Malam → Pagi dilarang (anti-fatigue).
	 * Kalau seorang crew sudah dua pekan ada di Malam, dia "mampir" ke Siang
	 * selama satu pekan lalu lanjut ke Pagi.
	 */
	const planWeek = (weekStart: string, isFirstWeek: boolean): void => {
		for (const emp of crew) {
			const prevState = weekState.get(emp.id);
			const history = isFirstWeek ? lastWorkedShift.get(emp.id) : undefined;
			const baseShift: ShiftKind | null =
				prevState?.shift ?? (history ? normalizeShift(history.shift, emp.can_night) : null);
			const baseWeeks = prevState?.weeks ?? (history ? 1 : 0);
			const cycle: ShiftKind[] = emp.can_night ? ["pagi", "siang", "malam"] : ["pagi", "siang"];

			let next: ShiftKind;
			let filler = false;
			let weeks = 1;

			if (!baseShift) {
				next = cycle[0];
			} else if (prevState?.filler) {
				// Keluar dari masa penyangga: kembali ke Pagi.
				next = "pagi";
			} else {
				const idx = Math.max(0, cycle.indexOf(baseShift));
				const candidate = cycle[(idx + 1) % cycle.length];
				if (baseShift === "malam" && candidate === "pagi" && baseWeeks >= 2) {
					// Anti-fatigue: dua pekan Malam berturut-turut → wajib mampir Siang.
					next = "siang";
					filler = true;
					warnings.push({
						date: weekStart,
						level: "info",
						message: `${emp.name} sudah dua pekan di shift Malam — pekan ini masuk Siang dulu (anti-fatigue, tidak boleh langsung Pagi).`,
					});
				} else if (baseShift === "malam" && candidate === "pagi") {
					// Baru satu pekan Malam: lanjut Malam sekali lagi, pekan depan Siang.
					next = "malam";
					weeks = baseWeeks + 1;
				} else {
					next = candidate;
				}
			}

			// Jaring pengaman terakhir: tanpa akses Malam tidak boleh masuk Malam.
			if (!emp.can_night && next === "malam") next = "siang";

			weekState.set(emp.id, { shift: next, filler, weeks });
		}
	};

	for (const date of dates) {
		const weekStart = startOfWeek(date);
		if (weekStart !== currentWeek) {
			const isFirstWeek = currentWeek === "";
			currentWeek = weekStart;
			planWeek(weekStart, isFirstWeek);
		}

		const shiftOf = (emp: ShiftEmployee): ShiftKind => weekState.get(emp.id)?.shift ?? "pagi";
		const isFiller = (emp: ShiftEmployee): boolean => weekState.get(emp.id)?.filler ?? false;

		const availableCrew = crew.filter((e) => !unavailable.has(`${e.id}|${date}`));
		const absentCrew = crew.filter((e) => unavailable.has(`${e.id}|${date}`));

		// --- Pemilih shift ---------------------------------------------------
		const chosen = new Set<string>();
		const pickFor = (shift: ShiftKind, count: number): ShiftEmployee[] => {
			if (count <= 0) return [];
			const wantsMorning = shift === "pagi" || shift === "pagi12";
			const isNight = shift === "malam" || shift === "sore12";
			const yesterday = addDays(date, -1);

			const eligible = (emp: ShiftEmployee): boolean => {
				if (chosen.has(emp.id)) return false;
				if (isNight && !emp.can_night) return false;
				if (!wantsMorning) return true;
				// Anti-fatigue harian: tidak boleh Pagi kalau kemarin selesai shift malam.
				const prev = lastWorkedShift.get(emp.id);
				return !(prev && prev.date === yesterday && (prev.shift === "malam" || prev.shift === "sore12"));
			};

			const comparator = (strict: boolean) => (a: ShiftEmployee, b: ShiftEmployee): number => {
				if (strict) {
					// Karyawan "penyangga" (baru lepas Malam, wajib lewat Siang) hanya
					// dipakai kalau shift-nya sendiri; jangan menghabiskan slot crew lain.
					const aFiller = isFiller(a) ? 1 : 0;
					const bFiller = isFiller(b) ? 1 : 0;
					if (aFiller !== bFiller) return aFiller - bFiller;
				}
				const aPref = shiftOf(a) === shift ? 0 : 1;
				const bPref = shiftOf(b) === shift ? 0 : 1;
				if (aPref !== bPref) return aPref - bPref;
				const aUse = used(a.id, shift);
				const bUse = used(b.id, shift);
				if (aUse !== bUse) return aUse - bUse;
				return totalUsed(a.id) - totalUsed(b.id);
			};

			const priority = availableCrew.filter(eligible).sort(comparator(true)).slice(0, count);
			const picked = new Set(priority.map((e) => e.id));
			const rest =
				priority.length < count
					? availableCrew
							.filter((e) => !picked.has(e.id) && eligible(e))
							.sort(comparator(false))
							.slice(0, count - priority.length)
					: [];

			const result = [...priority, ...rest];
			for (const e of result) chosen.add(e.id);
			return result;
		};

		const makeSlot = (shift: ShiftKind, emp: ShiftEmployee, note?: string): DaySlot => {
			const meta = SHIFT_META[shift];
			return {
				shift,
				employeeId: emp.id,
				employeeName: emp.name,
				startTime: meta.start,
				endTime: meta.end,
				hours: meta.hours,
				isBackup: false,
				isEmergency: shift === "pagi12" || shift === "sore12",
				note,
			};
		};

		const backupSlot = (start: string, end: string, hours: number, note: string): DaySlot => ({
			shift: "pagi",
			employeeId: null,
			employeeName: backupName,
			startTime: start,
			endTime: end,
			hours,
			isBackup: true,
			isEmergency: true,
			note,
		});

		const slots: DaySlot[] = [];
		const notes: string[] = [];
		let mode: DayMode = "3shift";

		const fillThreeShifts = (backupCoversPagi = false): void => {
			const openShifts = REGULAR_SHIFTS.filter((s) => !(backupCoversPagi && s === "pagi"));

			// Strategi A: urutan standar Pagi → Siang → Malam.
			const beforeA = new Set(chosen);
			const planA: DaySlot[] = [];
			for (const shift of openShifts) {
				for (const emp of pickFor(shift, perShift)) planA.push(makeSlot(shift, emp));
			}
			const chosenA = new Set(chosen);

			// Strategi B: isi dulu shift dengan peminat paling sedikit, sehingga
			// shift yang tidak bisa diisi karyawan terbatas (mis. tanpa Malam)
			// tidak kehilangan slot gara-gara crew lain menghabiskan Pagi/Siang.
			chosen.clear();
			for (const id of beforeA) chosen.add(id);
			const demand = (shift: ShiftKind): number =>
				availableCrew.filter((e) => shiftOf(e) === shift && (shift !== "malam" || e.can_night)).length;
			const planB: DaySlot[] = [];
			for (const shift of [...openShifts].sort((a, b) => demand(a) - demand(b))) {
				for (const emp of pickFor(shift, perShift)) planB.push(makeSlot(shift, emp));
			}

			const covered = (plan: DaySlot[]): number => new Set(plan.map((s) => s.shift)).size;
			const winner = covered(planB) > covered(planA) ? planB : planA;

			chosen.clear();
			if (winner === planA) {
				for (const id of chosenA) chosen.add(id);
			} else {
				for (const s of planB) if (s.employeeId) chosen.add(s.employeeId);
			}
			for (const slot of winner) slots.push(slot);
		};

		// ===================== MINGGU — Kondisi D =====================
		if (isSunday(date)) {
			if (availableCrew.length >= 2) {
				mode = "sunday-2x12";
				const daylight = pickFor("pagi12", 1)[0];
				const night = pickFor("sore12", 1)[0];
				if (daylight) slots.push(makeSlot("pagi12", daylight, "Cover 08:00–20:00"));
				if (night) slots.push(makeSlot("sore12", night, "Cover 20:00–08:00"));
				notes.push("Minggu: format 3 shift diabaikan — 2 orang jaga masing-masing 12 jam.");
			} else if (availableCrew.length === 1) {
				mode = "emergency";
				const only = pickFor("pagi12", 1)[0];
				if (only) slots.push(makeSlot("pagi12", only, "Satu-satunya crew yang hadir"));
				notes.push("Hanya 1 karyawan hadir pada Minggu — perlu bantuan backup manual.");
			} else {
				mode = "emergency";
				notes.push("Tidak ada karyawan aktif pada Minggu — cari pengganti segera.");
			}
		}
		// ===================== SABTU — Kondisi C =====================
		else if (isSaturday(date)) {
			const needsBackup = absentCrew.length > 0;

			if (needsBackup && backupReadyOn(date)) {
				mode = "backup";
				slots.push(backupSlot("08:00", "13:00", 5, "Backup pagi 08:00–13:00"));
				fillThreeShifts();
				const pagiCrew = slots.find((s) => s.shift === "pagi" && !s.isBackup);
				if (pagiCrew) {
					pagiCrew.startTime = "13:00";
					pagiCrew.hours = 3;
					pagiCrew.note = "Melanjutkan shift Pagi setelah backup";
				}
				notes.push(
					`${backupName} masuk 08:00–13:00 menggantikan ${absentCrew.map((e) => e.name).join(", ")}, lalu karyawan reguler melanjutkan shift Pagi.`,
				);
			} else if (needsBackup && availableCrew.length >= 2) {
				mode = "2shift12";
				const daylight = pickFor("pagi12", 1)[0];
				const night = pickFor("sore12", 1)[0];
				if (daylight) slots.push(makeSlot("pagi12", daylight, "Cover 08:00–20:00"));
				if (night) slots.push(makeSlot("sore12", night, "Cover 20:00–08:00"));
				notes.push("Sabtu tanpa backup: operasional jadi 2 shift @12 jam dibagi ke karyawan yang hadir.");
			} else {
				if (needsBackup) {
					mode = "emergency";
					notes.push("Sabtu tanpa backup dan crew < 2 orang — memakai 3 shift dengan peringatan.");
				}
				fillThreeShifts();
			}
		}
		// ===================== HARI BIASA — Kondisi A & B =====================
		else if (absentCrew.length > 0 && backupReadyOn(date)) {
			mode = "backup";
			slots.push(backupSlot("08:00", "16:00", 8, "Backup shift Pagi"));
			fillThreeShifts(true);
			notes.push(
				`${absentCrew.map((e) => e.name).join(", ")} berhalangan — shift Pagi dibackup ${backupName}, crew sisanya mengisi Siang & Malam.`,
			);
		} else {
			fillThreeShifts();
			if (absentCrew.length > 0) {
				notes.push(
					`${absentCrew.map((e) => e.name).join(", ")} berhalangan dan tidak ada backup — sisa crew menutup semua shift.`,
				);
			}
		}

		// --- Update statistik hari ini ---------------------------------------
		for (const slot of slots) {
			if (!slot.employeeId) continue;
			bump(slot.employeeId, slot.shift);
			lastWorkedShift.set(slot.employeeId, { date, shift: slot.shift });
			const row = summaryMap.get(slot.employeeId);
			if (!row) continue;
			row.totalHours += slot.hours;
			if (slot.isEmergency) row.emergency += 1;
			if (slot.shift === "pagi") row.pagi += 1;
			if (slot.shift === "siang") row.siang += 1;
			if (slot.shift === "malam") row.malam += 1;
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

		if (day.mode === "3shift" || day.mode === "backup") {
			const backupCoversPagi = day.slots.some((s) => s.isBackup && s.shift === "pagi");
			for (const shift of REGULAR_SHIFTS) {
				if (shift === "pagi" && backupCoversPagi) continue;
				const count = crewSlots.filter((s) => s.shift === shift).length;
				if (count === 0) {
					warnings.push({
						date: day.date,
						level: "danger",
						message: `Shift ${SHIFT_META[shift].label} kosong — tidak ada karyawan yang bisa mengisi.`,
					});
				} else if (count < perShift) {
					warnings.push({
						date: day.date,
						level: "warning",
						message: `Shift ${SHIFT_META[shift].label} hanya ${count} orang (ideal ${perShift}).`,
					});
				}
			}
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
			perShift,
			stressTest,
			backupName,
			hasBackup: backupStaff.length > 0,
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
};

export const eventTypeColor: Record<string, string> = {
	izin: "blue",
	sakit: "red",
	libur: "default",
	resign: "black",
};