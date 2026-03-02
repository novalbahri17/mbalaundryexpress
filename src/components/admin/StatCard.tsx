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
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-[#1e1e2d] dark:shadow-none">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">{title}</p>
					<p className="mt-2 text-[2rem] font-bold text-gray-900 dark:text-white tabular-nums leading-none">{value}</p>
					{helper ? <p className="mt-2 text-xs font-medium text-gray-400">{helper}</p> : null}
					{extra ? <div className="mt-2 text-xs text-gray-400">{extra}</div> : null}
				</div>
				{icon ? (
					<div className="grid h-[50px] w-[50px] place-items-center rounded-lg bg-blue-50 text-xl text-blue-500 dark:bg-white/5 dark:text-blue-400">
						{icon}
					</div>
				) : null}
			</div>
		</div>
	);
}
