import { Tooltip } from "antd";
import { MoonStar, Sun, Sunrise } from "lucide-react";
import type { DaySchedule, ShiftKind } from "@/lib/shiftScheduler";
import { formatDateShort, isSunday, SHIFT_META } from "@/lib/shiftScheduler";

const SHIFT_ICON: Record<ShiftKind, React.ReactNode> = {
	pagi: <Sunrise size={13} />,
	siang: <Sun size={13} />,
	malam: <MoonStar size={13} />,
	pagi12: <Sunrise size={13} />,
	sore12: <MoonStar size={13} />,
};

/**
 * Satu orang di satu shift. Ditampilkan sebagai kartu kecil: ikon shift,
 * nama, dan jam kerja. Warna mengikuti jenis shift supaya langsung kebaca.
 */
export function ShiftChip({
	shift,
	name,
	muted,
	backup,
	title,
	compact,
}: {
	shift: ShiftKind;
	name: string;
	muted?: boolean;
	backup?: boolean;
	title?: string;
	compact?: boolean;
}) {
	const meta = SHIFT_META[shift];
	const tooltip =
		title ?? `${meta.label} • ${meta.start}–${meta.end} (${meta.hours} jam)${backup ? " • staf backup" : ""}`;
	return (
		<Tooltip title={tooltip}>
			<div
				className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 leading-tight"
				style={{
					background: muted ? "var(--bg-surface)" : meta.bg,
					color: muted ? "var(--text-muted)" : meta.color,
					border: `1px ${backup ? "dashed" : "solid"} ${muted ? "var(--border)" : `${meta.color}40`}`,
				}}
			>
				<span className="shrink-0">{SHIFT_ICON[shift]}</span>
				<span className="min-w-0 flex-1">
					<span className="block truncate text-[12px] font-semibold">{name}</span>
					{!compact && (
						<span className="block truncate text-[10px] font-medium opacity-80">
							{meta.start}–{meta.end}
							{backup ? " • backup" : ""}
						</span>
					)}
				</span>
			</div>
		</Tooltip>
	);
}

/** Chip ringkas untuk sel tabel roster. */
export function RosterPerson({ shift, name, backup }: { shift: ShiftKind; name: string; backup?: boolean }) {
	const meta = SHIFT_META[shift];
	return (
		<Tooltip title={`${meta.emoji} ${meta.label} ${meta.start}–${meta.end}${backup ? " (backup)" : ""}`}>
			<div
				className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold"
				style={{
					background: meta.bg,
					color: meta.color,
					border: `1px ${backup ? "dashed" : "solid"} ${meta.color}40`,
				}}
			>
				<span className="shrink-0 text-[10px]">{meta.emoji}</span>
				<span className="truncate">{name}</span>
			</div>
		</Tooltip>
	);
}

/** Header kolom tanggal. Minggu diberi warna merah muda, hari ini biru brand. */
export function WeekDateHeader({ date, isToday }: { date: string; isToday?: boolean }) {
	const sunday = isSunday(date);
	return (
		<div
			className="rounded-md px-2 py-1 text-center text-[11px] font-bold"
			style={{
				background: isToday ? "var(--brand)" : sunday ? "#FEE2E2" : "var(--bg-surface)",
				color: isToday ? "#fff" : sunday ? "#B91C1C" : "var(--text-secondary)",
			}}
		>
			{formatDateShort(date)}
		</div>
	);
}

/** Baris legenda "🌅 Pagi — 08.00–16.00". */
export function ShiftLegendRow({ shift, extra }: { shift: ShiftKind; extra?: string }) {
	const meta = SHIFT_META[shift];
	return (
		<div className="flex items-center gap-2">
			<span
				className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-[12px]"
				style={{ background: meta.bg, border: `1px solid ${meta.color}40` }}
			>
				{meta.emoji}
			</span>
			<div className="leading-tight">
				<div className="text-[12px] font-semibold" style={{ color: meta.color }}>
					{meta.label}
				</div>
				<div className="text-[10px] text-[var(--text-muted)]">
					{meta.start}–{meta.end} • {meta.hours} jam{extra ? ` • ${extra}` : ""}
				</div>
			</div>
		</div>
	);
}

/** Badge label kecil (mis. "Minggu 2×12 jam"). */
export function ModeBadge({ text, tone = "neutral" }: { text: string; tone?: "neutral" | "warn" | "info" }) {
	const palette = {
		neutral: { bg: "var(--bg-surface)", color: "var(--text-muted)", border: "var(--border)" },
		warn: { bg: "#FEF3C7", color: "#92400E", border: "#F59E0B55" },
		info: { bg: "#DBEAFE", color: "#1E40AF", border: "#3B82F655" },
	}[tone];
	return (
		<span
			className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold"
			style={{ background: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}
		>
			{text}
		</span>
	);
}

export function DayCell({ day }: { day: DaySchedule }) {
	const weekend = isSunday(day.date);
	if (day.slots.length === 0) {
		return (
			<div className="flex h-full min-h-[64px] items-center justify-center rounded-md border border-dashed border-[var(--border-strong)] px-2 text-[11px] text-[var(--text-muted)]">
				Belum ada petugas
			</div>
		);
	}

	return (
		<div className="flex min-h-[64px] flex-col gap-1">
			{day.slots.map((slot, i) => (
				<ShiftChip
					// biome-ignore lint/suspicious/noArrayIndexKey: slot urutan tetap per hari
					key={`${day.date}-${slot.shift}-${i}`}
					shift={slot.shift}
					name={slot.employeeName}
					backup={slot.isBackup}
					title={`${SHIFT_META[slot.shift].label} ${slot.startTime}–${slot.endTime} • ${slot.employeeName}${slot.isBackup ? " (backup)" : ""}`}
				/>
			))}
			{weekend && day.off.length > 0 && (
				<div className="text-[10px] text-[var(--text-muted)]">Libur: {day.off.join(", ")}</div>
			)}
		</div>
	);
}
