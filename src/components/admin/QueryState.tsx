import { InboxOutlined, ReloadOutlined, WarningOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { ReactNode } from "react";

/**
 * Anti-slop R-27: every data view needs an empty, loading, and error state.
 * These two components keep that state consistent across admin tables so we
 * never ship a screen that only works when the ideal data happens to exist.
 */

type EmptyStateProps = {
	title: string;
	hint?: ReactNode;
	actionLabel?: string;
	onAction?: () => void;
};

export function TableEmptyState({ title, hint, actionLabel, onAction }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-2 py-8 text-center">
			<InboxOutlined aria-hidden className="text-2xl text-[var(--text-muted)]" />
			<p className="text-sm font-semibold text-[var(--text-secondary)]">{title}</p>
			{hint ? <p className="max-w-sm text-xs text-[var(--text-muted)]">{hint}</p> : null}
			{actionLabel && onAction ? (
				<Button size="small" onClick={onAction} className="mt-1">
					{actionLabel}
				</Button>
			) : null}
		</div>
	);
}

type ErrorStateProps = {
	title?: string;
	error?: unknown;
	onRetry?: () => void;
};

export function TableErrorState({ title = "Gagal memuat data", error, onRetry }: ErrorStateProps) {
	const detail =
		error instanceof Error && error.message ? error.message : "Server tidak mengirim balasan. Coba lagi sebentar.";

	return (
		<div
			role="alert"
			className="flex flex-col items-start gap-2 rounded-xl border p-4"
			style={{
				borderColor: "var(--danger)",
				backgroundColor: "var(--danger-bg)",
			}}
		>
			<p className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--danger)" }}>
				<WarningOutlined aria-hidden />
				{title}
			</p>
			<p className="text-xs" style={{ color: "var(--text-secondary)" }}>
				{detail}
			</p>
			{onRetry ? (
				<Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
					Muat ulang
				</Button>
			) : null}
		</div>
	);
}
