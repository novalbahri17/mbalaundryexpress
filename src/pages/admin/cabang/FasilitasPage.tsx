import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteBranchFacility, getBranchFacilities, saveBranchFacility } from "@/api/branches.api";
import { BranchContextHeader } from "@/components/admin/BranchContextHeader";
import { MetronicPage } from "@/components/admin/MetronicPage";
import type { BranchFacility } from "@/types/database.types";

const iconOptions = [
	"washing-machine",
	"droplets",
	"wind",
	"wifi",
	"air-vent",
	"sofa",
	"parking-square",
	"shield-check",
];

type FasilitasFormValues = {
	name: string;
	icon?: string;
	sort_order: number;
};

export default function CabangFasilitasPage() {
	const { id } = useParams();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<BranchFacility | null>(null);
	const [form] = Form.useForm<FasilitasFormValues>();
	const queryClient = useQueryClient();

	const { data = [], isLoading } = useQuery({
		queryKey: ["branch-facilities", id],
		queryFn: () => getBranchFacilities(id ?? ""),
		enabled: Boolean(id),
	});

	const handleEdit = (record: BranchFacility) => {
		setEditing(record);
		form.setFieldsValue({
			name: record.name,
			icon: record.icon,
			sort_order: record.sort_order,
		});
		setOpen(true);
	};

	const handleDelete = async (record: BranchFacility) => {
		await deleteBranchFacility(record.id);
		message.success("Fasilitas dihapus");
		await queryClient.invalidateQueries({ queryKey: ["branch-facilities", id] });
	};

	const onSubmit = async (): Promise<void> => {
		if (!id) return;
		const values = await form.validateFields();
		await saveBranchFacility({
			id: editing?.id,
			branch_id: id,
			name: values.name,
			icon: values.icon,
			sort_order: values.sort_order ?? 0,
		});
		message.success("Fasilitas tersimpan");
		setOpen(false);
		setEditing(null);
		form.resetFields();
		await queryClient.invalidateQueries({ queryKey: ["branch-facilities", id] });
	};

	const columns: ColumnsType<BranchFacility> = [
		{ title: "Nama", dataIndex: "name" },
		{ title: "Icon", dataIndex: "icon", render: (value?: string) => value || "-" },
		{ title: "Urutan", dataIndex: "sort_order" },
		{
			title: "Aksi",
			width: 150,
			render: (_, record: BranchFacility) => (
				<Space>
					<Button
						type="text"
						icon={<EditOutlined />}
						className="action-btn action-btn-edit"
						onClick={() => handleEdit(record)}
					>
						Edit
					</Button>
					<Popconfirm
						title="Hapus fasilitas ini?"
						okText="Hapus"
						cancelText="Batal"
						onConfirm={() => handleDelete(record)}
					>
						<Button type="text" danger icon={<DeleteOutlined />} className="action-btn action-btn-delete">
							Hapus
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<MetronicPage
			title="Kelola Fasilitas Cabang"
			subtitle="Tambah dan edit fasilitas yang tersedia di cabang"
			actionLabel="Tambah Fasilitas"
			onAction={() => {
				setEditing(null);
				form.setFieldsValue({ name: "", icon: undefined, sort_order: 0 });
				setOpen(true);
			}}
		>
			<div className="card">
				<BranchContextHeader branchId={id} activeTab="fasilitas" />
			</div>

			<div className="card mt-4">
				<div className="table-container">
					<Table rowKey="id" loading={isLoading} dataSource={data} columns={columns} />
				</div>
			</div>

			<Modal
				title={editing ? "Edit Fasilitas" : "Tambah Fasilitas"}
				open={open}
				onCancel={() => {
					setOpen(false);
					setEditing(null);
					form.resetFields();
				}}
				onOk={() => void onSubmit()}
				okText="Simpan"
				cancelText="Batal"
				destroyOnClose
				className="metronic-modal"
			>
				<Form layout="vertical" form={form} initialValues={{ sort_order: 0 }}>
					<Form.Item label="Nama" name="name" rules={[{ required: true, message: "Nama fasilitas wajib diisi" }]}>
						<Input className="form-input" />
					</Form.Item>
					<Form.Item label="Icon" name="icon">
						<Input placeholder={`Contoh: ${iconOptions.join(", ")}`} className="form-input" />
					</Form.Item>
					<Form.Item label="Sort Order" name="sort_order">
						<InputNumber className="form-input w-full" min={0} />
					</Form.Item>
				</Form>
			</Modal>
		</MetronicPage>
	);
}
