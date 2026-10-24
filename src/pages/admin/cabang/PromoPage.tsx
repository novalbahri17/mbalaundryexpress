import { DeleteOutlined, LinkOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Modal, Popconfirm, Select, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPromoBranches, getPromos, listPromoBranchLinks, setPromoBranches } from "@/api/promos.api";
import { BranchContextHeader } from "@/components/admin/BranchContextHeader";
import { MetronicPage } from "@/components/admin/MetronicPage";
import { TableEmptyState, TableErrorState } from "@/components/admin/QueryState";
import { useBranches } from "@/hooks/useBranches";
import type { Promo } from "@/types/database.types";

const statusColor: Record<Promo["status"], string> = {
	published: "green",
	draft: "orange",
	archived: "default",
};

/**
 * Kelola promo untuk satu cabang.
 * Promo bertipe "global" otomatis tayang di semua cabang, jadi di sini
 * hanya bisa dilihat (read-only). Promo per cabang bisa ditambah/dilepas.
 */
export default function CabangPromoPage() {
	const { id } = useParams();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<string[]>([]);

	const { data: branches = [] } = useBranches({ activeOnly: false });
	const branch = useMemo(() => branches.find((item) => item.id === id), [branches, id]);

	const {
		data: promos = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["admin-promos"],
		queryFn: async () => {
			const res = await getPromos({ perPage: 500 });
			return res.items;
		},
	});

	const {
		data: relations = [],
		isLoading: relationsLoading,
		refetch: refetchRelations,
	} = useQuery({
		queryKey: ["admin-promo-branch-links", id],
		queryFn: listPromoBranchLinks,
		enabled: Boolean(id),
	});

	const linkedIds = useMemo(
		() => new Set(relations.filter((item) => item.branch_id === id).map((item) => item.promo_id)),
		[relations, id],
	);

	const rows = useMemo(() => promos.filter((promo) => promo.is_global || linkedIds.has(promo.id)), [promos, linkedIds]);

	const assignable = useMemo(
		() => promos.filter((promo) => !promo.is_global && !linkedIds.has(promo.id)),
		[promos, linkedIds],
	);

	const refresh = async () => {
		await queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
		await refetchRelations();
	};

	const handleAttach = async (): Promise<void> => {
		if (!id || selected.length === 0) return;
		for (const promoId of selected) {
			const existing = relations.filter((item) => item.promo_id === promoId).map((item) => item.branch_id);
			await setPromoBranches(promoId, Array.from(new Set([...existing, id])));
		}
		message.success("Promo ditambahkan ke cabang ini");
		setSelected([]);
		setOpen(false);
		await refresh();
	};

	const handleDetach = async (promoId: string): Promise<void> => {
		if (!id) return;
		const remaining = relations
			.filter((item) => item.promo_id === promoId && item.branch_id !== id)
			.map((item) => item.branch_id);
		await setPromoBranches(promoId, remaining);
		message.success("Promo dilepas dari cabang ini");
		await refresh();
	};

	const columns: ColumnsType<Promo> = [
		{
			title: "Judul",
			dataIndex: "title",
			render: (value: string, record) => (
				<div className="min-w-0">
					<Link to="/admin/promo" className="font-semibold" style={{ color: "var(--brand)" }}>
						{value}
					</Link>
					<p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
						{record.slug}
					</p>
				</div>
			),
		},
		{
			title: "Cakupan",
			dataIndex: "is_global",
			width: 140,
			render: (value: boolean) => (value ? <Tag color="blue">Global</Tag> : <Tag color="purple">Cabang Tertentu</Tag>),
		},
		{
			title: "Status",
			dataIndex: "status",
			width: 120,
			render: (value: Promo["status"]) => <Tag color={statusColor[value] ?? "default"}>{value}</Tag>,
		},
		{
			title: "Periode",
			key: "period",
			render: (_, record) => {
				const start = dayjs(record.start_date).format("DD/MM/YYYY");
				if (!record.end_date) return <Tag color="cyan">{start} - Tanpa tenggat</Tag>;
				return `${start} - ${dayjs(record.end_date).format("DD/MM/YYYY")}`;
			},
		},
		{
			title: "Beranda",
			dataIndex: "show_on_home",
			width: 100,
			render: (value: boolean) => (value ? "Ya" : "Tidak"),
		},
		{
			title: "Aksi",
			width: 150,
			render: (_, record) =>
				record.is_global ? (
					<span className="text-sm" style={{ color: "var(--text-muted)" }}>
						Otomatis
					</span>
				) : (
					<Popconfirm
						title="Lepas promo dari cabang ini?"
						description="Promo tetap ada di menu Promo, hanya tidak tayang di cabang ini."
						okText="Lepas"
						cancelText="Batal"
						onConfirm={() => void handleDetach(record.id)}
					>
						<Button type="text" danger icon={<DeleteOutlined />} className="action-btn action-btn-delete">
							Lepas
						</Button>
					</Popconfirm>
				),
		},
	];

	return (
		<MetronicPage
			title="Promo Cabang"
			subtitle={
				branch ? `Promo yang tayang di ${branch.name}` : "Promo yang tayang khusus di cabang ini, di luar promo global."
			}
			actionLabel="Tambah Promo"
			onAction={() => {
				setSelected([]);
				setOpen(true);
			}}
		>
			<div className="card">
				<BranchContextHeader branchId={id} activeTab="promo" />
			</div>

			<div className="card mt-4">
				<Alert
					type="info"
					showIcon
					className="mb-4"
					message="Promo global otomatis tayang di semua cabang"
					description={
						<span>
							Ingin promo baru untuk cabang ini? Buat dulu di menu{" "}
							<Link to="/admin/promo" className="font-semibold" style={{ color: "var(--brand)" }}>
								Promo <LinkOutlined />
							</Link>{" "}
							(atau klik tombol Tambah Promo di sini), lalu pilih distribusi “Cabang Tertentu”.
						</span>
					}
				/>

				<div className="table-container">
					{isError ? (
						<TableErrorState title="Gagal memuat promo" error={error} onRetry={() => void refetch()} />
					) : (
						<Table<Promo>
							rowKey="id"
							columns={columns}
							dataSource={rows}
							loading={isLoading || relationsLoading}
							pagination={{ pageSize: 10, showSizeChanger: false }}
							scroll={{ x: 720 }}
							locale={{
								emptyText: (
									<TableEmptyState
										title="Belum ada promo di cabang ini."
										hint="Tambahkan promo supaya tayang di halaman cabang dan beranda."
									/>
								),
							}}
						/>
					)}
				</div>
			</div>

			<Modal
				title="Tambah Promo ke Cabang Ini"
				open={open}
				onCancel={() => setOpen(false)}
				onOk={() => void handleAttach()}
				okText="Tambahkan"
				cancelText="Batal"
				okButtonProps={{ disabled: selected.length === 0 }}
				destroyOnClose
				className="metronic-modal"
			>
				<p className="mb-3 text-sm" style={{ color: "var(--text-secondary)" }}>
					Pilih promo yang distribusinya bukan global. Promo global tidak perlu ditambahkan manual.
				</p>
				<div className="mb-4">
					<Link
						to="/admin/promo"
						className="inline-flex items-center gap-1 text-sm font-semibold"
						style={{ color: "var(--brand)" }}
					>
						<PlusOutlined /> Buat promo baru
					</Link>
				</div>
				<Select
					mode="multiple"
					className="w-full"
					placeholder={assignable.length === 0 ? "Tidak ada promo per cabang yang tersedia" : "Pilih promo"}
					value={selected}
					onChange={setSelected}
					options={assignable.map((promo) => ({ value: promo.id, label: promo.title }))}
					disabled={assignable.length === 0}
				/>
			</Modal>
		</MetronicPage>
	);
}
