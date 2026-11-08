import { useQuery } from "@tanstack/react-query";
import { Alert, Badge, Button, Card, Spin, Tag, message } from "antd";
import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	ChevronRight,
	Clock,
	Copy,
	Info,
	Lock,
	Moon,
	Share2,
	Sparkles,
	Sun,
	Sunrise,
	User,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { getPublicSchedule, type PublicScheduleSlot } from "@/api/publicSchedule.api";
import {
	DAY_NAMES,
	MONTH_NAMES,
	REGULAR_SHIFTS,
	SHIFT_META,
	addDays,
	eachDate,
	formatDateId,
	formatDateShort,
	generateSchedule,
	parseDateKey,
} from "@/lib/shiftScheduler";
import type { ShiftKind } from "@/types/database.types";

export default function JadwalKaryawanPage() {
	const { branchSlug, secretToken } = useParams<{ branchSlug: string; secretToken: string }>();
	const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["public-employee-schedule", branchSlug, secretToken],
		queryFn: () => getPublicSchedule(branchSlug || "", secretToken || ""),
		enabled: Boolean(branchSlug && secretToken),
		staleTime: 60_000,
	});

	const branch = data?.branch;
	const todayKey = data?.todayKey || new Date().toISOString().slice(0, 10);
	const isWeekend = data?.isWeekend ?? false;

	// Karyawan aktif di cabang ini
	const employeeNames = useMemo(() => {
		if (!data?.employees) return [];
		return data.employees.map((e) => e.name);
	}, [data?.employees]);

	// Build map slot per tanggal
	const assignmentsByDate = useMemo(() => {
		const map = new Map<string, PublicScheduleSlot[]>();
		for (const asg of data?.assignments || []) {
			const list = map.get(asg.date) ?? [];
			list.push(asg);
			map.set(asg.date, list);
		}
		return map;
	}, [data?.assignments]);

	// Format Hari Bahasa Indonesia Sangat Jelas
	const formatDayFull = (dateStr: string) => {
		try {
			const d = parseDateKey(dateStr);
			return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
		} catch {
			return dateStr;
		}
	};

	const formatDayNameOnly = (dateStr: string) => {
		try {
			const d = parseDateKey(dateStr);
			return DAY_NAMES[d.getDay()];
		} catch {
			return "";
		}
	};

	const formatDateShortOnly = (dateStr: string) => {
		try {
			const d = parseDateKey(dateStr);
			return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
		} catch {
			return dateStr;
		}
	};

	// Ambil daftar tanggal minggu ini & minggu depan
	const currentWeekDates = useMemo(() => {
		if (!data?.currentWeek) return [];
		return eachDate(data.currentWeek.from, data.currentWeek.to);
	}, [data?.currentWeek]);

	const nextWeekDates = useMemo(() => {
		if (!data?.nextWeek) return [];
		return eachDate(data.nextWeek.from, data.nextWeek.to);
	}, [data?.nextWeek]);

	// Render Kartu Jadwal 1 Hari (Sangat Jelas untuk Karyawan)
	const renderDayCard = (dateStr: string, isNextWeek = false) => {
		const isToday = dateStr === todayKey;
		const slots = assignmentsByDate.get(dateStr) || [];
		const dayName = formatDayNameOnly(dateStr);
		const dateFormatted = formatDateShortOnly(dateStr);

		// Cari shift karyawan yang dipilih (jika memilih nama saya)
		const mySlot = selectedEmployee ? slots.find((s) => s.employee_name === selectedEmployee) : null;
		const isMyDayOff = selectedEmployee && !mySlot;

		return (
			<div
				key={dateStr}
				className="relative overflow-hidden rounded-2xl border transition-all duration-200"
				style={{
					background: isToday ? "color-mix(in srgb, #C62828 8%, var(--bg-card, #ffffff))" : "var(--bg-card, #ffffff)",
					borderColor: isToday ? "#C62828" : selectedEmployee && mySlot ? "#1565C0" : "var(--border, #E2E8F0)",
					borderWidth: isToday || (selectedEmployee && mySlot) ? 2 : 1,
					boxShadow: isToday ? "0 4px 20px -2px rgba(198, 40, 40, 0.15)" : "0 2px 6px rgba(0,0,0,0.04)",
				}}
			>
				{/* Header Kartu Tanggal */}
				<div
					className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3"
					style={{
						borderColor: isToday ? "rgba(198, 40, 40, 0.2)" : "var(--border, #F1F5F9)",
						background: isToday ? "rgba(198, 40, 40, 0.06)" : "transparent",
					}}
				>
					<div className="flex items-center gap-2">
						<span
							className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[14px] font-black"
							style={{
								background: isToday ? "#C62828" : "#F1F5F9",
								color: isToday ? "#ffffff" : "#334155",
							}}
						>
							{dateFormatted.split(" ")[0]}
						</span>
						<div>
							<h3 className="text-[16px] font-black leading-tight text-slate-900 dark:text-white">{dayName}</h3>
							<p className="text-[12px] font-medium text-slate-700 dark:text-slate-300">{formatDayFull(dateStr)}</p>
						</div>
					</div>

					<div className="flex items-center gap-1.5">
						{isToday && (
							<span className="animate-pulse rounded-full bg-red-600 px-3 py-1 text-[11px] font-black tracking-wide text-white shadow-sm">
								🔥 HARI INI
							</span>
						)}
						{isNextWeek && (
							<span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
								Minggu Depan
							</span>
						)}
					</div>
				</div>

				{/* Notifikasi Khusus Karyawan yang Sedang Memilih Namanya */}
				{selectedEmployee && (
					<div
						className="mx-3 mt-3 rounded-xl p-2.5 text-center text-[13px] font-black"
						style={{
							background: mySlot ? "#1565C0" : "#059669",
							color: "#ffffff",
						}}
					>
						{mySlot ? (
							<div className="flex items-center justify-center gap-1.5">
								<span>
									👉 {selectedEmployee.toUpperCase()}: MASUK SHIFT {mySlot.shift.toUpperCase()}
								</span>
								<span className="text-[11px] font-normal opacity-90">
									({mySlot.start_time} - {mySlot.end_time})
								</span>
							</div>
						) : (
							<div className="flex items-center justify-center gap-1.5">
								<span>🛌 {selectedEmployee.toUpperCase()}: LIBUR / ISTIRAHAT</span>
							</div>
						)}
					</div>
				)}

				{/* Daftar Slot Shift Hari Ini */}
				<div className="space-y-2 p-3.5">
					{slots.length === 0 ? (
						<div className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-[13px] text-slate-700 dark:border-slate-800 dark:text-slate-300">
							Belum ada jadwal tersimpan untuk hari ini.
						</div>
					) : (
						slots.map((slot, idx) => {
							const meta = SHIFT_META[slot.shift] || SHIFT_META.pagi;
							const isMe = selectedEmployee && slot.employee_name === selectedEmployee;

							// Warna & Style Kartu Shift
							let bgCard = meta.bg;
							let borderCard = `${meta.color}40`;
							let textColor = meta.color;
							let shiftEmoji = meta.emoji;
							let shiftTitle = meta.label;

							if (slot.shift === "pagi12") {
								shiftTitle = "Pagi 12 Jam";
								shiftEmoji = "🌅";
							} else if (slot.shift === "sore12") {
								shiftTitle = "Malam 12 Jam";
								shiftEmoji = "🌙";
							}

							return (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: slot stabil
									key={`${slot.shift}-${idx}`}
									className="flex items-center justify-between rounded-xl p-3 transition-all"
									style={{
										background: isMe ? "#1565C0" : bgCard,
										border: `1.5px solid ${isMe ? "#0D47A1" : borderCard}`,
										color: isMe ? "#ffffff" : textColor,
										boxShadow: isMe ? "0 4px 14px rgba(21, 101, 192, 0.3)" : "none",
										transform: isMe ? "scale(1.02)" : "none",
									}}
								>
									{/* Info Shift & Jam */}
									<div className="flex items-center gap-2.5 min-w-0">
										<span className="text-[20px] shrink-0 leading-none">{shiftEmoji}</span>
										<div className="min-w-0">
											<div className="flex items-center gap-1.5">
												<span
													className="text-[13px] font-black uppercase tracking-wide"
													style={{ color: isMe ? "#ffffff" : textColor }}
												>
													{shiftTitle}
												</span>
												{slot.is_backup && (
													<span className="rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-bold text-purple-700 dark:bg-purple-900 dark:text-purple-200">
														BACKUP
													</span>
												)}
											</div>
											<div
												className="text-[12px] font-bold"
												style={{ color: isMe ? "#E0E7FF" : "inherit", opacity: isMe ? 1 : 0.8 }}
											>
												Jam: {slot.start_time} – {slot.end_time} ({slot.hours} Jam)
											</div>
										</div>
									</div>

									{/* Nama Petugas */}
									<div className="text-right shrink-0 pl-2">
										<span
											className="block text-[15px] font-black tracking-tight"
											style={{ color: isMe ? "#ffffff" : "#0F172A" }}
										>
											{slot.employee_name}
										</span>
										{slot.note && (
											<span
												className="block text-[10px] font-medium italic"
												style={{ color: isMe ? "#E0E7FF" : "#64748B" }}
											>
												{slot.note}
											</span>
										)}
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
				<Spin size="large" />
				<p className="mt-4 text-[14px] font-bold text-slate-700 dark:text-slate-300">Memuat Jadwal Shift Karyawan...</p>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
				<div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-lg dark:border-red-950 dark:bg-slate-900">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950">
						<Lock size={26} />
					</div>
					<h2 className="mt-4 text-[18px] font-black text-slate-900 dark:text-white">Akses Jadwal Tidak Ditemukan</h2>
					<p className="mt-2 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
						Link jadwal shift ini salah, tidak valid, atau kode rahasianya sudah diperbarui oleh manajemen.
					</p>
					<div className="mt-5">
						<p className="text-[12px] font-medium text-slate-700 dark:text-slate-300">
							Silakan hubungi koordinator cabang / pemilik untuk meminta link jadwal terbaru.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 pb-16 font-sans text-slate-900 dark:bg-slate-950 dark:text-white">
			{/* Tag SEO Khusus: Jangan Indeks di Google! */}
			<Helmet>
				<title>Jadwal Kerja Tim - {branch?.name || "MBA Laundry Express"}</title>
				<meta name="robots" content="noindex, nofollow, noarchive" />
				<meta name="googlebot" content="noindex, nofollow" />
			</Helmet>

			{/* ============ HEADER RESMI JADWAL ============ */}
			<header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
				<div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
					<div className="flex items-center gap-2.5 min-w-0">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C62828] text-white font-black shadow-sm">
							MBA
						</div>
						<div className="min-w-0">
							<span className="block text-[10px] font-black uppercase tracking-wider text-red-600">
								JADWAL KERJA RESMI KARYAWAN
							</span>
							<h1 className="truncate text-[16px] font-black text-slate-900 dark:text-white">{branch?.name}</h1>
						</div>
					</div>

					<div className="shrink-0 text-right">
						<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
							RESMI AKTIF
						</span>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-4xl space-y-5 px-3.5 pt-4 sm:px-6">
				{/* ============ PETUNJUK NAMA: SOROT JADWAL SAYA ============ */}
				<div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 shadow-sm dark:border-blue-950 dark:bg-blue-950/40">
					<div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
						<User size={18} className="text-blue-600 shrink-0" />
						<h2 className="text-[14px] font-black">Siapa nama kamu? Pilih namamu untuk melihat jadwalmu:</h2>
					</div>
					<p className="mt-1 text-[12px] text-blue-700 dark:text-blue-300">
						Klik nama kamu di bawah, maka jadwal kerja dan liburmu akan otomatis disorot terang.
					</p>

					<div className="mt-3 flex flex-wrap gap-2">
						{employeeNames.map((name) => {
							const isChosen = selectedEmployee === name;
							return (
								<button
									type="button"
									key={name}
									onClick={() => setSelectedEmployee(isChosen ? null : name)}
									className="cursor-pointer rounded-xl px-3.5 py-2 text-[13px] font-black transition-all shadow-sm"
									style={{
										background: isChosen ? "#1565C0" : "#ffffff",
										color: isChosen ? "#ffffff" : "#1E293B",
										border: `2px solid ${isChosen ? "#0D47A1" : "#CBD5E1"}`,
										transform: isChosen ? "scale(1.04)" : "none",
									}}
								>
									{isChosen ? `✓ Saya ${name}` : `👤 ${name}`}
								</button>
							);
						})}

						{selectedEmployee && (
							<button
								type="button"
								onClick={() => setSelectedEmployee(null)}
								className="cursor-pointer rounded-xl border border-slate-300 bg-slate-200 px-3 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
							>
								✕ Tampilkan Semua
							</button>
						)}
					</div>
				</div>

				{/* ============ JADWAL MINGGU INI ============ */}
				<section className="space-y-3">
					<div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 dark:border-slate-800">
						<div>
							<h2 className="text-[17px] font-black text-slate-900 dark:text-white flex items-center gap-2">
								<Calendar size={18} className="text-red-600" />
								<span>Jadwal Minggu Ini</span>
							</h2>
							<p className="text-[12px] font-medium text-slate-700 dark:text-slate-300">
								{data?.currentWeek?.from ? formatDayFull(data.currentWeek.from) : ""} –{" "}
								{data?.currentWeek?.to ? formatDayFull(data.currentWeek.to) : ""}
							</p>
						</div>

						<span className="rounded-lg bg-slate-200/80 px-2.5 py-1 text-[11px] font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
							7 HARI PENUH
						</span>
					</div>

					<div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
						{currentWeekDates.map((dateStr) => renderDayCard(dateStr, false))}
					</div>
				</section>

				{/* ============ PRATINJAU JADWAL MINGGU DEPAN (HANYA HARI SABTU & MINGGU) ============ */}
				{isWeekend && data?.nextWeek && (
					<section className="mt-8 space-y-3 rounded-3xl border-2 border-dashed border-blue-400 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20 sm:p-5">
						<div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200 pb-3 dark:border-blue-900">
							<div>
								<div className="flex items-center gap-2">
									<Sparkles size={18} className="text-blue-600 animate-spin" />
									<h2 className="text-[18px] font-black text-blue-950 dark:text-blue-200">👇 JADWAL MINGGU DEPAN</h2>
								</div>
								<p className="text-[12px] font-semibold text-blue-700 dark:text-blue-300">
									Persiapan mulai hari Senin besok ({formatDayFull(data.nextWeek.from)} –{" "}
									{formatDayFull(data.nextWeek.to)})
								</p>
							</div>

							<Tag color="blue" className="!m-0 font-bold">
								Otomatis Muncul di Akhir Pekan
							</Tag>
						</div>

						<div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 pt-2">
							{nextWeekDates.map((dateStr) => renderDayCard(dateStr, true))}
						</div>
					</section>
				)}

				{/* ============ KETERANGAN JAM SHIFT (MUDAH DIINGAT) ============ */}
				<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<h3 className="text-[13px] font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
						<Info size={15} className="text-red-600" />
						<span>Pengingat Jam Masuk & Pulang Kerja:</span>
					</h3>

					<div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
						<div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-950 dark:bg-amber-950/30">
							<span className="text-[13px] font-black text-amber-900 dark:text-amber-300">🌅 Shift 1 (PAGI)</span>
							<p className="mt-1 text-[12px] font-bold text-amber-800 dark:text-amber-200">
								Masuk: 08:00 Pagi <br />
								Pulang: 16:00 Sore
							</p>
						</div>

						<div className="rounded-xl border border-orange-200 bg-orange-50/80 p-3 dark:border-orange-950 dark:bg-orange-950/30">
							<span className="text-[13px] font-black text-orange-900 dark:text-orange-300">
								☀️ Shift 2 (SORE / SIANG)
							</span>
							<p className="mt-1 text-[12px] font-bold text-orange-800 dark:text-orange-200">
								Masuk: 16:00 Sore <br />
								Pulang: 00:00 Malam
							</p>
						</div>

						<div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3 dark:border-indigo-950 dark:bg-indigo-950/30">
							<span className="text-[13px] font-black text-indigo-900 dark:text-indigo-300">🌙 Shift 3 (MALAM)</span>
							<p className="mt-1 text-[12px] font-bold text-indigo-800 dark:text-indigo-200">
								Masuk: 00:00 Malam <br />
								Pulang: 08:00 Pagi
							</p>
						</div>
					</div>
				</div>

				{/* Footer Info */}
				<footer className="pt-4 text-center text-[11px] text-slate-600 dark:text-slate-400">
					<p>© MBA Laundry Express • Sistem Jadwal Kerja Otomatis</p>
					<p className="mt-0.5 text-[10px] text-slate-700 dark:text-slate-300">
						Link jadwal ini bersifat internal tim cabang. Jangan bagikan ke orang luar.
					</p>
				</footer>
			</main>
		</div>
	);
}
