import {
	AppstoreOutlined,
	ClockCircleOutlined,
	EnvironmentOutlined,
	PictureOutlined,
	ShopOutlined,
} from "@ant-design/icons";
import { Alert, Skeleton, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { getBranchById } from "@/api/branches.api";
import type { Branch } from "@/types/database.types";

type BranchContextTab = "jam" | "fasilitas" | "galeri";

type BranchContextHeaderProps = {
	branchId?: string;
	activeTab: BranchContextTab;
};

type NavItem = {
	key: BranchContextTab;
	label: string;
	icon: ReactNode;
};

const navItems: NavItem[] = [
	{ key: "jam", label: "Jam Operasional", icon: <ClockCircleOutlined /> },
	{ key: "fasilitas", label: "Fasilitas", icon: <AppstoreOutlined /> },
	{ key: "galeri", label: "Galeri Cabang", icon: <PictureOutlined /> },
];

const statusMap: Record<Branch["status"], { text: string; color: string }> = {
	buka: { text: "Buka", color: "green" },
	ramai: { text: "Ramai", color: "gold" },
	tutup: { text: "Tutup", color: "red" },
};

export function BranchContextHeader({ branchId, activeTab }: BranchContextHeaderProps) {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["admin-branch-context", branchId],
		queryFn: () => getBranchById(branchId ?? ""),
		enabled: Boolean(branchId),
	});

	if (!branchId) {
		return (
			<Alert
				type="error"
				showIcon
				message="ID cabang tidak valid"
				description="Kembali ke daftar cabang lalu pilih cabang yang ingin dikelola."
			/>
		);
	}

	if (isLoading) {
		return (
			<div className="rounded-2xl border border-mba-border bg-white p-4 dark:border-mba-darkBorder dark:bg-mba-darkSurface">
				<Skeleton active paragraph={{ rows: 2 }} />
			</div>
		);
	}

	if (isError || !data) {
		const text = error instanceof Error ? error.message : "Cabang tidak ditemukan";
		return (
			<Alert
				type="warning"
				showIcon
				message="Gagal memuat konteks cabang"
				description={text}
			/>
		);
	}

	const statusInfo = statusMap[data.status] ?? statusMap.buka;

	return (
		<div className="rounded-2xl border border-mba-border bg-white/95 p-4 shadow-sm dark:border-mba-darkBorder dark:bg-mba-darkSurface">
			<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
				<div>
					<p className="text-xs font-semibold tracking-wide text-mba-subtext uppercase dark:text-mba-darkSubtext">
						Sedang Mengelola Cabang
					</p>
					<h2 className="mt-1 text-lg font-bold text-mba-text dark:text-mba-darkText">{data.name}</h2>
					<div className="mt-2 flex flex-wrap items-center gap-2">
						<Tag color={statusInfo.color}>{statusInfo.text}</Tag>
						<Tag color={data.is_active ? "blue" : "default"}>{data.is_active ? "Aktif" : "Nonaktif"}</Tag>
						<Tag>{data.slug}</Tag>
					</div>
					<p className="mt-2 flex items-start gap-2 text-sm text-mba-subtext dark:text-mba-darkSubtext">
						<EnvironmentOutlined className="mt-0.5" />
						<span>{data.address}</span>
					</p>
				</div>

				<Link
					to="/admin/cabang"
					className="inline-flex h-9 items-center justify-center rounded-lg border border-mba-border px-3 text-sm font-semibold text-mba-subtext transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-mba-darkBorder dark:text-mba-darkSubtext dark:hover:border-brand-500/40 dark:hover:text-brand-400"
				>
					<ShopOutlined className="mr-2" />
					Kembali ke Daftar Cabang
				</Link>
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				{navItems.map((item) => {
					const isActive = item.key === activeTab;
					return (
						<Link
							key={item.key}
							to={`/admin/cabang/${data.id}/${item.key}`}
							className={`inline-flex h-9 items-center rounded-lg border px-3 text-sm font-semibold transition-all ${
								isActive
									? "border-brand-400 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
									: "border-mba-border text-mba-subtext hover:border-brand-400 hover:text-brand-600 dark:border-mba-darkBorder dark:text-mba-darkSubtext dark:hover:border-brand-500/30 dark:hover:text-brand-400"
							}`}
						>
							<span className="mr-2 text-xs">{item.icon}</span>
							{item.label}
						</Link>
					);
				})}
			</div>
		</div>
	);
}
