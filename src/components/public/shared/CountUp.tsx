import CountUpPrimitive from "react-countup";
import { useInView } from "framer-motion";
import { useRef } from "react";

type CountUpProps = {
	value: number;
	prefix?: string;
	suffix?: string;
	className?: string;
	duration?: number;
};

export function CountUp({ value, prefix = "", suffix = "", className, duration = 1.6 }: CountUpProps) {
	const ref = useRef<HTMLSpanElement | null>(null);
	const inView = useInView(ref, { once: true, margin: "-10%" });

	return (
		<span ref={ref} className={className}>
			{inView ? <CountUpPrimitive end={value} duration={duration} separator="." prefix={prefix} suffix={suffix} /> : `${prefix}0${suffix}`}
		</span>
	);
}

