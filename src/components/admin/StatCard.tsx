import type { ReactNode } from "react";

type StatCardProps = {
	title: string;
	value: string | number;
	icon?: ReactNode;
	extra?: ReactNode;
	helper?: string;
};

export function StatCard({ title, value, icon, extra, helper }: StatCardProps) {
	return (
		<div
			className="rounded-xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
			style={{
				backgroundColor: "var(--bg-card)",
				borderColor: "var(--border)",
			}}
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>{title}</p>
					<p className="mt-2 text-[2rem] font-bold tabular-nums leading-none" style={{ color: "var(--text-primary)" }}>{value}</p>
					{helper ? <p className="mt-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>{helper}</p> : null}
					{extra ? <div className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>{extra}</div> : null}
				</div>
				{icon ? (
					<div
						className="grid h-[50px] w-[50px] place-items-center rounded-lg text-xl"
						style={{ backgroundColor: "var(--info-bg)", color: "var(--info)" }}
					>
						{icon}
					</div>
				) : null}
			</div>
		</div>
	);
}
