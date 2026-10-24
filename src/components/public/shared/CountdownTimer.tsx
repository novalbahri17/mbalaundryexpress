import { useEffect, useMemo, useState } from "react";
import { usePublicText } from "@/hooks/usePublicText";

type CountdownTimerProps = {
	endDate: string;
	className?: string;
};

type TimeState = {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	isEnded: boolean;
};

const getTime = (endDate: string): TimeState => {
	const now = Date.now();
	const end = new Date(endDate).getTime();
	const diff = end - now;
	if (Number.isNaN(end) || diff <= 0) {
		return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
	}
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
	const minutes = Math.floor((diff / (1000 * 60)) % 60);
	const seconds = Math.floor((diff / 1000) % 60);
	return { days, hours, minutes, seconds, isEnded: false };
};

export function CountdownTimer({ endDate, className }: CountdownTimerProps) {
	const text = usePublicText();
	const [state, setState] = useState<TimeState>(() => getTime(endDate));

	useEffect(() => {
		setState(getTime(endDate));
		const timerId = window.setInterval(() => {
			setState(getTime(endDate));
		}, 1000);
		return () => window.clearInterval(timerId);
	}, [endDate]);

	const label = useMemo(() => {
		if (state.isEnded) return text.countdown.ended;
		return `${state.days} ${text.countdown.days} ${state.hours} ${text.countdown.hours} ${state.minutes} ${text.countdown.minutes}`;
	}, [state, text.countdown]);

	const urgent = !state.isEnded && state.days < 1;

	return (
		<p className={className ?? (urgent ? "text-[var(--danger)]" : "text-[var(--text-muted)]")}>
			{text.countdown.prefix} {label}
		</p>
	);
}
