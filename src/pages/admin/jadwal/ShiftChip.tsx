import type { DaySchedule, ShiftKind } from "@/lib/shiftScheduler";
import { SHIFT_META, formatDateShort, isSunday } from "@/lib/shiftScheduler";
import { Tooltip } from "antd";
import { MoonStar, Sun, Sunrise } from "lucide-react";

const SHIFT_ICON: Record<ShiftKind, React.ReactNode> = {
	pagi: <Sunrise size={13} />,
	siang: <Sun size={13} />,
	malam: <MoonStar size={13} />,
	pagi12: <Sunrise size={13} />,
	sore12: <MoonStar size={13} />,
};

export function ShiftChip({
	shift,
	name,
	muted,
	backup,
	title,
}: {
	shift: ShiftKind;
	name: string;
	muted?: boolean;
	backup?: boolean;
	title?: string;
}) {
	const meta = SHIFT_META[shift];
	return (
		<Tooltip title={title ?? `${meta.label} • ${meta.start}–${meta.end} (${meta.hours} jam)`}>
			<div
				className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-semibold leading-tight"
				style={{
					background: muted ? "var(--bg-surface)" : meta.bg,
					color: muted ? "var(--text-muted)" : meta.color,
					border: `1px solid ${muted ? "var(--border)" : `${meta.color}33`}`,
					opacity: backup ? 0.85 : 1,
				}}
			>
				<span className="shrink-0">{SHIFT_ICON[shift]}</span>
				<span className="truncate">{name}</span>
			</div>
		</Tooltip>
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

export function WeekDateHeader({ date }: { date: string }) {
	const sunday = isSunday(date);
	return (
		<div
			className="rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide"
			style={{
				background: sunday ? "#FEE2E2" : "var(--bg-surface)",
				color: sunday ? "#B91C1C" : "var(--text-secondary)",
			}}
		>
			{formatDateShort(date)}
		</div>
	);
}
