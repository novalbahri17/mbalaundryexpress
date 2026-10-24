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
			render: (kind: string) => (
				<Tag color={kind === "wash" ? "volcano" : "blue"}>{kind === "wash" ? "Cuci" : "Kering"}</Tag>
			),
		},
		{
			title: "Kapasitas",
			key: "capacity",
			render: (_, r) =>
				r.capacity_min === r.capacity_max ? `${r.capacity_min}kg` : `${r.capacity_min}-${r.capacity_max}kg`,
		},
		{
			title: "Durasi",
			key: "duration",
			render: (_, r) => {
				if (!r.duration_max || r.duration_min === r.duration_max) return `${r.duration_min} menit`;
				return `${r.duration_min}-${r.duration_max} menit`;
			},
		},
		{ title: "Coin", dataIndex: "coins" },
		{
			title: "Harga Tunai",
			key: "price",
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
			render: (v: boolean) => (v ? "Ya" : "Tidak"),
		},
		{
			title: "Aksi",
			key: "action",
			width: 140,
			render: (_, record) => (
				<Space>
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

			<div className="mt-5 mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
				<p className="text-sm text-neutral-600 dark:text-neutral-400">
					1 coin = <strong>Rp {coinValue.toLocaleString("id-ID")}</strong> (diatur di data cabang)
				</p>
				<p className={`text-sm ${cashEnabled ? "text-emerald-600" : "text-neutral-500"}`}>
					Pembayaran tunai: <strong>{cashEnabled ? "diterima" : "tidak diterima"}</strong>
				</p>
				<p className={`text-sm ${qrisEnabled ? "text-emerald-600" : "text-neutral-500"}`}>
					Pembayaran QRIS: <strong>{qrisEnabled ? "aktif" : "tidak aktif"}</strong>
				</p>
			</div>

			<div className="card mb-6">
				<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
					<p className="text-sm font-semibold">Mesin Cuci</p>
					<Button
						icon={<PlusOutlined />}
						onClick={() => {
							openCreate("wash");
						}}
					>
						Tambah Mesin Cuci
					</Button>
				</div>
				<div className="table-container">
					{isError ? (
						<TableErrorState title="Gagal memuat mesin" error={error} onRetry={() => void refetch()} />
					) : (
						<Table<BranchMachine>
							rowKey="id"
							loading={isLoading}
							dataSource={washMachines}
							columns={columns}
							pagination={false}
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

			<div className="card">
				<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
					<p className="text-sm font-semibold">Pengering</p>
					<Button
						icon={<PlusOutlined />}
						onClick={() => {
							openCreate("dry");
						}}
					>
						Tambah Pengering
					</Button>
				</div>
				<div className="table-container">
					{isError ? (
						<TableErrorState title="Gagal memuat mesin" error={error} onRetry={() => void refetch()} />
					) : (
						<Table<BranchMachine>
							rowKey="id"
							loading={isLoading}
							dataSource={dryMachines}
							columns={columns}
							pagination={false}
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
