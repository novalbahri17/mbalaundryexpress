import { useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { Calendar, Info, Lock, Megaphone, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { getPublicSchedule, type PublicScheduleSlot, type SchedulePopupConfig } from "@/api/publicSchedule.api";
import { ScheduleAnnouncementPopup } from "@/components/public/ScheduleAnnouncementPopup";
import { useBranding } from "@/hooks/useBranding";
import { DAY_NAMES, MONTH_NAMES, SHIFT_META, eachDate, parseDateKey } from "@/lib/shiftScheduler";

const getWibNow = (): { dateKey: string; minutes: number } => {
	const now = new Date();
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Jakarta",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).formatToParts(now);
	const get = (t: string) => parts.find((p) => p.type === t)?.value || "00";
	const h = Number(get("hour")) % 24;
	const m = Number(get("minute"));
	return {
		dateKey: `${get("year")}-${get("month")}-${get("day")}`,
		minutes: h * 60 + m,
	};
};

const parseTimeMinutes = (hhmm: string): number => {
	const [h, m] = hhmm.split(":").map(Number);
	return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};

const isSlotActiveNow = (slot: PublicScheduleSlot, currentMinutes: number): boolean => {
	const startMin = parseTimeMinutes(slot.start_time || "00:00");
	let endMin = parseTimeMinutes(slot.end_time || "00:00");
	if (endMin === 0 && startMin > 0) endMin = 1440;
	if (startMin < endMin) {
		return currentMinutes >= startMin && currentMinutes < endMin;
	}
	return currentMinutes >= startMin || currentMinutes < endMin;
};

const getPopupStorageKeys = (popup: SchedulePopupConfig, branchSlug: string) => {
	const scope = popup.scope === "global" ? "global" : `branch_${branchSlug}`;
	return {
		storageKey: `mba_sched_popup_${scope}`,
		sessionKey: `mba_sched_popup_sess_${scope}`,
	};
};

const shouldShowPopup = (popup: SchedulePopupConfig, branchSlug: string, todayKey: string): boolean => {
	const hasContent = Boolean(popup.title?.trim() || popup.content?.trim() || popup.images?.length);
	if (!popup.enabled || !hasContent) return false;

	const { storageKey, sessionKey } = getPopupStorageKeys(popup, branchSlug);

	try {
		if (popup.frequency === "always") return true;
		if (popup.frequency === "session") {
			return sessionStorage.getItem(sessionKey) !== "1";
		}
		const raw = localStorage.getItem(storageKey);
		const saved = raw ? (JSON.parse(raw) as { dateKey?: string; timestamp?: number; version?: string }) : {};
		if (popup.frequency === "daily") {
			return saved.dateKey !== todayKey;
		}
		if (popup.frequency === "weekly") {
			return !saved.timestamp || Date.now() - saved.timestamp >= 7 * 86_400_000;
		}
		if (popup.frequency === "once") {
			return saved.version !== (popup.updatedAt || "v1");
		}
	} catch {
		return true;
	}
	return true;
};

const markPopupSeen = (popup: SchedulePopupConfig, branchSlug: string, todayKey: string): void => {
	const { storageKey, sessionKey } = getPopupStorageKeys(popup, branchSlug);
	try {
		if (popup.frequency === "session") {
			sessionStorage.setItem(sessionKey, "1");
			return;
		}
		if (popup.frequency === "daily" || popup.frequency === "weekly" || popup.frequency === "once") {
			localStorage.setItem(
				storageKey,
				JSON.stringify({
					dateKey: todayKey,
					timestamp: Date.now(),
					version: popup.updatedAt || "v1",
				}),
			);
		}
	} catch {
		// abaikan jika storage diblokir
	}
};

export default function JadwalKaryawanPage() {
	const { branchSlug, secretToken } = useParams<{ branchSlug: string; secretToken: string }>();
	const { data: branding } = useBranding();

	const { data, isLoading, error } = useQuery({
		queryKey: ["public-employee-schedule", branchSlug, secretToken],
		queryFn: () => getPublicSchedule(branchSlug || "", secretToken || ""),
		enabled: Boolean(branchSlug && secretToken),
		staleTime: 60_000,
	});

	const [wibNow, setWibNow] = useState(getWibNow);
	const [logoFailed, setLogoFailed] = useState(false);
	const [popupQueue, setPopupQueue] = useState<SchedulePopupConfig[]>([]);
	const [popupQueueIndex, setPopupQueueIndex] = useState(0);
	const popupCheckedRef = useRef<string | null>(null);

	useEffect(() => {
		const timer = window.setInterval(() => {
			setWibNow(getWibNow());
		}, 30_000);
		return () => window.clearInterval(timer);
	}, []);

	const branch = data?.branch;
	const todayKey = data?.todayKey || wibNow.dateKey;
	const isWeekend = data?.isWeekend ?? false;
	const activePopups = useMemo(() => {
		if (Array.isArray(data?.popups) && data.popups.length > 0) return data.popups;
		return data?.popup ? [data.popup] : [];
	}, [data?.popups, data?.popup]);

	const currentPopup = popupQueue[popupQueueIndex] ?? null;
	const popupOpen = Boolean(currentPopup);

	const resolvedLogoUrl =
		data?.logoUrl && data.logoUrl !== "/logo.png"
			? data.logoUrl
			: branding?.logo_url || data?.logoUrl || "/logo.png";

	useEffect(() => {
		setLogoFailed(false);
	}, [resolvedLogoUrl]);

	useEffect(() => {
		if (!data || activePopups.length === 0 || !branchSlug) return;
		const checkKey = `${branchSlug}|${activePopups.map((p) => `${p.scope}:${p.updatedAt}`).join(",")}`;
		if (popupCheckedRef.current === checkKey) return;
		popupCheckedRef.current = checkKey;

		const duePopups = activePopups.filter((p) => shouldShowPopup(p, branchSlug, todayKey));
		if (duePopups.length > 0) {
			setPopupQueue(duePopups);
			setPopupQueueIndex(0);
		}
	}, [data, activePopups, branchSlug, todayKey]);

	const handleClosePopup = useCallback(() => {
		if (currentPopup && branchSlug) {
			markPopupSeen(currentPopup, branchSlug, todayKey);
		}
		if (popupQueueIndex + 1 < popupQueue.length) {
			setPopupQueueIndex((idx) => idx + 1);
		} else {
			setPopupQueue([]);
			setPopupQueueIndex(0);
		}
	}, [currentPopup, branchSlug, todayKey, popupQueueIndex, popupQueue.length]);

	const handleReopenAllPopups = useCallback(() => {
		if (activePopups.length === 0) return;
		setPopupQueue(activePopups);
		setPopupQueueIndex(0);
	}, [activePopups]);

	// Urutan shift standar operasional: Pagi -> Sore -> Malam
	const SHIFT_SORT_ORDER: Record<string, number> = {
		pagi: 1,
		pagi12: 1.5,
		siang: 2,
		sore12: 2.5,
		malam: 3,
	};

	// Build map slot per tanggal (mendukung format 'YYYY-MM-DD' maupun 'YYYY-MM-DDTHH:mm:ss.sssZ')
	// dan diurutkan selalu: Pagi -> Sore -> Malam
	const assignmentsByDate = useMemo(() => {
		const map = new Map<string, PublicScheduleSlot[]>();
		for (const asg of data?.assignments || []) {
			const cleanDate = (asg.date || "").slice(0, 10);
			const list = map.get(cleanDate) ?? [];
			list.push(asg);
			map.set(cleanDate, list);
		}
		for (const list of map.values()) {
			list.sort((a, b) => {
				const oa = SHIFT_SORT_ORDER[a.shift] ?? 99;
				const ob = SHIFT_SORT_ORDER[b.shift] ?? 99;
				return oa - ob;
			});
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

		return (
			<div
				key={dateStr}
				className="relative overflow-hidden rounded-2xl border transition-all duration-200"
				style={{
					background: isToday ? "color-mix(in srgb, #C62828 8%, var(--bg-card, #ffffff))" : "var(--bg-card, #ffffff)",
					borderColor: isToday ? "#C62828" : "var(--border, #E2E8F0)",
					borderWidth: isToday ? 2 : 1,
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

				{/* Daftar Slot Shift Hari Ini */}
				<div className="space-y-2 p-3.5">
					{slots.length === 0 ? (
						<div className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-[13px] text-slate-700 dark:border-slate-800 dark:text-slate-300">
							Belum ada jadwal tersimpan untuk hari ini.
						</div>
					) : (
						slots.map((slot, idx) => {
							const meta = SHIFT_META[slot.shift] || SHIFT_META.pagi;
							const isActiveShift = isToday && isSlotActiveNow(slot, wibNow.minutes);

							// Warna & Style Kartu Shift
							const bgCard = meta.bg;
							const borderCard = isActiveShift ? "#C62828" : `${meta.color}40`;
							const textColor = meta.color;
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
										background: bgCard,
										border: `${isActiveShift ? "2.5px" : "1.5px"} solid ${borderCard}`,
										boxShadow: isActiveShift
											? "0 0 0 3px rgba(198, 40, 40, 0.16), 0 4px 12px rgba(198, 40, 40, 0.14)"
											: undefined,
										color: textColor,
									}}
								>
									{/* Info Shift & Jam */}
									<div className="flex items-center gap-2.5 min-w-0">
										<span className="text-[20px] shrink-0 leading-none">{shiftEmoji}</span>
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-1.5">
												<span
													className="text-[13px] font-black uppercase tracking-wide"
													style={{ color: textColor }}
												>
													{shiftTitle}
												</span>
												{isActiveShift && (
													<span className="inline-flex items-center gap-1 rounded-full bg-[#C62828] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
														<span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
														SEDANG JAGA
													</span>
												)}
												{Boolean(slot.is_backup) && (
													<span className="rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-bold text-purple-700 dark:bg-purple-900 dark:text-purple-200">
														BACKUP
													</span>
												)}
											</div>
											<div
												className="text-[12px] font-bold"
												style={{ color: "inherit", opacity: 0.85 }}
											>
												Jam: {slot.start_time} – {slot.end_time} ({slot.hours} Jam)
											</div>
										</div>
									</div>

									{/* Nama Petugas */}
									<div className="text-right shrink-0 pl-2">
										<span
											className="block text-[15px] font-black tracking-tight"
											style={{ color: "#0F172A" }}
										>
											{slot.employee_name}
										</span>
										{slot.note &&
											!slot.note.toLowerCase().includes("manual") &&
											!slot.note.toLowerCase().includes("input") &&
											!slot.note.toLowerCase().includes("diedit") && (
												<span
													className="block text-[10px] font-medium italic"
													style={{ color: "#64748B" }}
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
		return null;
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
						{!logoFailed && resolvedLogoUrl ? (
							<div className="flex h-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-1.5 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-800">
								<img
									src={resolvedLogoUrl}
									alt="Logo MBA Laundry"
									className="h-8 w-auto max-w-[90px] object-contain"
									onError={() => setLogoFailed(true)}
								/>
							</div>
						) : (
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C62828] text-white font-black shadow-sm">
								MBA
							</div>
						)}
						<div className="min-w-0">
							<span className="block text-[10px] font-black uppercase tracking-wider text-red-600">
								JADWAL KERJA RESMI KARYAWAN
							</span>
							<h1 className="truncate text-[16px] font-black text-slate-900 dark:text-white">{branch?.name}</h1>
						</div>
					</div>

					<div className="flex shrink-0 items-center gap-2 text-right">
						{activePopups.length > 0 && !popupOpen && (
							<button
								type="button"
								onClick={handleReopenAllPopups}
								className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-700 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300"
							>
								<Megaphone size={11} />
								<span>Info{activePopups.length > 1 ? ` (${activePopups.length})` : ""}</span>
							</button>
						)}
						<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
							<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
							RESMI AKTIF
						</span>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-4xl space-y-5 px-3.5 pt-4 sm:px-6">
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

			{/* ============ POP-UP PENGUMUMAN KARYAWAN ============ */}
			<ScheduleAnnouncementPopup
				open={popupOpen}
				onClose={handleClosePopup}
				popup={currentPopup}
				queueStep={
					popupQueue.length > 1
						? { current: popupQueueIndex + 1, total: popupQueue.length }
						: undefined
				}
			/>
		</div>
	);
}
