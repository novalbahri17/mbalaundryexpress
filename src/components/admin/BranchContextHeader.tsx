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
			<div
				className="rounded-2xl border p-4 shadow-sm"
				style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
			>
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
		<div
			className="rounded-2xl border p-4 shadow-sm"
			style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
		>
			<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
				<div>
					<p className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>
						Sedang Mengelola Cabang
					</p>
					<h2 className="mt-1 text-lg font-bold" style={{ color: "var(--text-primary)" }}>{data.name}</h2>
					<div className="mt-2 flex flex-wrap items-center gap-2">
						<Tag color={statusInfo.color}>{statusInfo.text}</Tag>
						<Tag color={data.is_active ? "blue" : "default"}>{data.is_active ? "Aktif" : "Nonaktif"}</Tag>
						<Tag>{data.slug}</Tag>
					</div>
					<p className="mt-2 flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
						<EnvironmentOutlined className="mt-0.5" />
						<span>{data.address}</span>
					</p>
				</div>

				<Link
					to="/admin/cabang"
					className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors"
					style={{
						borderColor: "var(--border)",
						color: "var(--text-secondary)",
					}}
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
							className="inline-flex h-9 items-center rounded-lg border px-3 text-sm font-semibold transition-all"
							style={
								isActive
									? {
											borderColor: "var(--brand)",
											backgroundColor: "var(--brand-bg)",
											color: "var(--brand)",
									  }
									: {
											borderColor: "var(--border)",
											color: "var(--text-secondary)",
									  }
							}
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
