export function SkeletonCard() {
	return (
		<div className="glass-card animate-pulse rounded-2xl border border-neutral-200 p-4">
			<div className="h-40 rounded-xl bg-slate-200/60 dark:bg-slate-700/40" />
			<div className="mt-4 h-4 w-3/4 rounded bg-slate-200/60 dark:bg-slate-700/40" />
			<div className="mt-2 h-4 w-2/3 rounded bg-slate-200/60 dark:bg-slate-700/40" />
		</div>
	);
}
