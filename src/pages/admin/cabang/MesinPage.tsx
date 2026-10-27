import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, InputNumber, Modal, message, Popconfirm, Select, Space, Switch, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { deleteBranchMachine, getBranchMachines, saveBranchMachine } from "@/api/branches.api";
import { BranchContextHeader } from "@/components/admin/BranchContextHeader";
import { MetronicPage } from "@/components/admin/MetronicPage";
import { TableEmptyState, TableErrorState } from "@/components/admin/QueryState";
import { useBranches } from "@/hooks/useBranches";
import type { BranchMachine } from "@/types/database.types";

type MachineFormValues = {
	kind: "wash" | "dry";
	capacity_min: number;
	capacity_max: number;
	coins: number;
	duration_min: number;
	duration_max: number;
	qris_price?: number | null;
	note?: string;
	sort_order: number;
	is_active: boolean;
};

export default function CabangMesinPage() {
	const { id } = useParams();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<BranchMachine | null>(null);
	const [form] = Form.useForm<MachineFormValues>();
	const queryClient = useQueryClient();

	const { data: branches = [] } = useBranches();
	const branch = useMemo(() => branches.find((b) => b.id === id), [branches, id]);
	const coinValue = branch?.coin_value ?? 10000;
	const qrisEnabled = Boolean(branch?.qris_enabled);
	const cashEnabled = branch?.cash_enabled !== false;

	const {
		data = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["branch_machines", id],
		queryFn: () => getBranchMachines(id ?? ""),
		enabled: Boolean(id),
	});

	const washMachines = useMemo(() => data.filter((m) => m.kind === "wash"), [data]);
	const dryMachines = useMemo(() => data.filter((m) => m.kind === "dry"), [data]);

	const openCreate = (kind: "wash" | "dry") => {
		setEditing(null);
		form.resetFields();
		form.setFieldsValue({
			kind,
			capacity_min: 17,
			capacity_max: 17,
			coins: 2,
			duration_min: 25,
			duration_max: 25,
			qris_price: null,
			sort_order: 0,
			is_active: true,
		});
		setOpen(true);
	};

	const handleEdit = (record: BranchMachine) => {
		setEditing(record);
		form.setFieldsValue({
			kind: record.kind,
			capacity_min: record.capacity_min,
			capacity_max: record.capacity_max,
			coins: record.coins,
			duration_min: record.duration_min,
			duration_max: record.duration_max,
			qris_price: record.qris_price ?? null,
			note: record.note,
			sort_order: record.sort_order,
			is_active: record.is_active,
		});
		setOpen(true);
	};

	const handleDelete = async (record: BranchMachine) => {
		await deleteBranchMachine(record.id);
		message.success("Mesin dihapus");
		await queryClient.invalidateQueries({ queryKey: ["branch_machines", id] });
	};

	const onSubmit = async (): Promise<void> => {
		if (!id) return;
		const values = await form.validateFields();
		await saveBranchMachine({
			id: editing?.id,
			branch_id: id,
			kind: values.kind,
			capacity_min: values.capacity_min,
			capacity_max: values.capacity_max ?? values.capacity_min,
			coins: values.coins,
			duration_min: values.duration_min,
			duration_max: values.duration_max ?? values.duration_min,
			qris_price: values.qris_price ?? null,
			note: values.note,
			sort_order: values.sort_order ?? 0,
			is_active: values.is_active,
		});
		message.success("Mesin tersimpan");
		setOpen(false);
		setEditing(null);
		form.resetFields();
		await queryClient.invalidateQueries({ queryKey: ["branch_machines", id] });
	};

	const columns: ColumnsType<BranchMachine> = [
		{
			title: "Jenis",
			dataIndex: "kind",
			width: 95,
			render: (kind: string) => (
				<Tag color={kind === "wash" ? "volcano" : "blue"}>{kind === "wash" ? "Cuci" : "Kering"}</Tag>
			),
		},
		{
			title: "Kapasitas",
			key: "capacity",
			width: 105,
			render: (_, r) =>
				r.capacity_min === r.capacity_max ? `${r.capacity_min} kg` : `${r.capacity_min}-${r.capacity_max} kg`,
		},
		{
			title: "Durasi",
			key: "duration",
			width: 118,
			render: (_, r) => {
				if (!r.duration_max || r.duration_min === r.duration_max) return `${r.duration_min} menit`;
				return `${r.duration_min}-${r.duration_max} menit`;
			},
		},
		{
			title: "Coin",
			dataIndex: "coins",
			width: 76,
			align: "center",
			render: (coins: number) => <span className="font-semibold">{coins}</span>,
		},
		{
			title: "Harga Tunai",
			key: "price",
			width: 128,
			render: (_, r) => {
				const text = `Rp ${(r.coins * coinValue).toLocaleString("id-ID")}`;
				return cashEnabled ? (
					<span className="font-semibold">{text}</span>
				) : (
					<span className="text-neutral-400 line-through">{text}</span>
				);
			},
		},
		{
			title: "Harga QRIS",
			key: "qris",
			width: 128,
			render: (_, r) => {
				if (!r.qris_price) return <span className="text-neutral-400">-</span>;
				return (
					<span className={qrisEnabled ? "font-semibold" : "text-neutral-400 line-through"}>
						Rp {r.qris_price.toLocaleString("id-ID")}
					</span>
				);
			},
		},
		{
			title: "Aktif",
			dataIndex: "is_active",
			width: 86,
			align: "center",
			render: (v: boolean) => (v ? <Tag color="success">Ya</Tag> : <Tag color="default">Tidak</Tag>),
		},
		{
			title: "Aksi",
			key: "action",
			width: 104,
			align: "center",
			render: (_, record) => (
				<Space size={4}>
					<Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
					<Popconfirm title="Hapus mesin ini?" onConfirm={() => handleDelete(record)}>
						<Button danger icon={<DeleteOutlined />} />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<MetronicPage title="Mesin & Tarif" subtitle="Atur kapasitas, durasi, jumlah coin, dan harga QRIS tiap mesin.">
			<BranchContextHeader branchId={id} activeTab="mesin" />

			{/* Ringkasan tarif: satu kartu dengan tiga blok terpisah supaya tiap
			    nilai tidak berdempetan seperti sebelumnya. */}
			<div className="card mt-5">
				<div className="grid grid-cols-1 divide-y divide-neutral-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-neutral-700">
					<div className="px-5 py-4">
						<p className="m-0 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">Nilai 1 Coin</p>
						<p className="m-0 mt-1 text-sm font-bold text-neutral-800 dark:text-neutral-100">
							Rp {coinValue.toLocaleString("id-ID")}
						</p>
						<p className="m-0 mt-1 text-xs text-neutral-500 dark:text-neutral-400">Diatur di data cabang</p>
					</div>
					<div className="px-5 py-4">
						<p className="m-0 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">Pembayaran Tunai</p>
						<p className={`m-0 mt-1 text-sm font-bold ${cashEnabled ? "text-emerald-600" : "text-neutral-500"}`}>
							{cashEnabled ? "Diterima" : "Tidak diterima"}
						</p>
						<p className="m-0 mt-1 text-xs text-neutral-500 dark:text-neutral-400">Harga tunai mengikuti coin</p>
					</div>
					<div className="px-5 py-4">
						<p className="m-0 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">Pembayaran QRIS</p>
						<p className={`m-0 mt-1 text-sm font-bold ${qrisEnabled ? "text-emerald-600" : "text-neutral-500"}`}>
							{qrisEnabled ? "Aktif" : "Tidak aktif"}
						</p>
						<p className="m-0 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
							{qrisEnabled ? "Bisa dibayar pakai QRIS" : "Hanya coin / tunai"}
						</p>
					</div>
				</div>
			</div>

			<div className="card mb-6">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
					<div className="flex items-center gap-2">
						<p className="m-0 text-sm font-bold text-neutral-800 dark:text-neutral-100">Mesin Cuci</p>
						<Tag color="volcano" className="m-0">
							{washMachines.length} mesin
						</Tag>
					</div>
					<Button
						className="admin-soft-btn"
						icon={<PlusOutlined />}
						onClick={() => {
							openCreate("wash");
						}}
					>
						Tambah Mesin Cuci
					</Button>
				</div>
				<div className="p-5">
					<div className="table-container admin-data-table">
						{isError ? (
							<TableErrorState title="Gagal memuat mesin" error={error} onRetry={() => void refetch()} />
						) : (
							<Table<BranchMachine>
								rowKey="id"
								loading={isLoading}
								dataSource={washMachines}
								columns={columns}
								pagination={false}
								scroll={{ x: 840 }}
								locale={{
									emptyText: (
										<TableEmptyState
											title="Belum ada mesin cuci."
											hint="Tambahkan mesin cuci beserta jumlah coin per sekali pakai."
										/>
									),
								}}
							/>
						)}
					</div>
				</div>
			</div>

			<div className="card">
				<div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-700">
					<div className="flex items-center gap-2">
						<p className="m-0 text-sm font-bold text-neutral-800 dark:text-neutral-100">Pengering</p>
						<Tag color="blue" className="m-0">
							{dryMachines.length} mesin
						</Tag>
					</div>
					<Button
						className="admin-soft-btn"
						icon={<PlusOutlined />}
						onClick={() => {
							openCreate("dry");
						}}
					>
						Tambah Pengering
					</Button>
				</div>
				<div className="p-5">
					<div className="table-container admin-data-table">
						{isError ? (
							<TableErrorState title="Gagal memuat mesin" error={error} onRetry={() => void refetch()} />
						) : (
							<Table<BranchMachine>
								rowKey="id"
								loading={isLoading}
								dataSource={dryMachines}
								columns={columns}
								pagination={false}
								scroll={{ x: 840 }}
								locale={{
									emptyText: (
										<TableEmptyState
											title="Belum ada pengering."
											hint="Tambahkan pengering supaya pelanggan tahu tarif keringnya."
										/>
									),
								}}
							/>
						)}
					</div>
				</div>
			</div>

			<Modal
				title={editing ? "Edit Mesin" : "Tambah Mesin"}
				open={open}
				onCancel={() => {
					setOpen(false);
					setEditing(null);
				}}
				onOk={onSubmit}
				okText="Simpan"
				cancelText="Batal"
				destroyOnClose
				className="admin-modal"
				width={560}
			>
				<Form form={form} layout="vertical">
					<Form.Item label="Jenis Mesin" name="kind" rules={[{ required: true }]}>
						<Select
							options={[
								{ value: "wash", label: "Mesin Cuci" },
								{ value: "dry", label: "Pengering" },
							]}
						/>
					</Form.Item>

					<div className="grid grid-cols-2 gap-3">
						<Form.Item label="Kapasitas Min (kg)" name="capacity_min" rules={[{ required: true }]}>
							<InputNumber className="w-full" min={1} max={50} />
						</Form.Item>
						<Form.Item label="Kapasitas Max (kg)" name="capacity_max">
							<InputNumber className="w-full" min={1} max={50} />
						</Form.Item>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Form.Item label="Durasi Min (menit)" name="duration_min" rules={[{ required: true }]}>
							<InputNumber className="w-full" min={1} max={300} />
						</Form.Item>
						<Form.Item label="Durasi Max (menit)" name="duration_max">
							<InputNumber className="w-full" min={1} max={300} />
						</Form.Item>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<Form.Item label="Jumlah Coin" name="coins" rules={[{ required: true }]}>
							<InputNumber className="w-full" min={1} max={50} />
						</Form.Item>
						<Form.Item
							label="Urutan"
							name="sort_order"
							tooltip="Urutan tampil mesin di daftar harga publik. Angka kecil tampil lebih dulu."
						>
							<InputNumber className="w-full" min={0} />
						</Form.Item>
					</div>

					<Form.Item
						label="Harga QRIS (Rp)"
						name="qris_price"
						tooltip="Kosongkan kalau mesin ini tidak punya tarif QRIS khusus"
					>
						<InputNumber className="w-full" min={0} step={1000} placeholder="mis. 9000" />
					</Form.Item>

					<Form.Item label="Catatan (opsional)" name="note">
						<Input placeholder="mis. khusus pakaian tebal" />
					</Form.Item>

					<Form.Item label="Aktif" name="is_active" valuePropName="checked">
						<Switch />
					</Form.Item>
				</Form>
			</Modal>
		</MetronicPage>
	);
}
