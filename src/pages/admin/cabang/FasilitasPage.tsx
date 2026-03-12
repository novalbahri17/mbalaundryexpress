import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, message } from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteBranchFacility, getBranchFacilities, saveBranchFacility } from "@/api/branches.api";
import { BranchContextHeader } from "@/components/admin/BranchContextHeader";
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

	return (
		<div className="space-y-4">
			<BranchContextHeader branchId={id} activeTab="fasilitas" />

			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Kelola Fasilitas Cabang</h1>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						setEditing(null);
						form.setFieldsValue({ name: "", icon: undefined, sort_order: 0 });
						setOpen(true);
					}}
				>
					Tambah Fasilitas
				</Button>
			</div>
			<Table
				rowKey="id"
				loading={isLoading}
				dataSource={data}
				columns={[
					{ title: "Nama", dataIndex: "name" },
					{ title: "Icon", dataIndex: "icon", render: (value?: string) => value || "-" },
					{ title: "Urutan", dataIndex: "sort_order" },
					{
						title: "Aksi",
						render: (_, record: BranchFacility) => (
							<Space>
								<Button
									type="link"
									icon={<EditOutlined />}
									onClick={() => {
										setEditing(record);
										form.setFieldsValue({
											name: record.name,
											icon: record.icon,
											sort_order: record.sort_order,
										});
										setOpen(true);
									}}
								>
									Edit
								</Button>
								<Popconfirm
									title="Hapus fasilitas ini?"
									okText="Hapus"
									cancelText="Batal"
									onConfirm={async () => {
										await deleteBranchFacility(record.id);
										message.success("Fasilitas dihapus");
										await queryClient.invalidateQueries({ queryKey: ["branch-facilities", id] });
									}}
								>
									<Button type="link" danger icon={<DeleteOutlined />}>
										Hapus
									</Button>
								</Popconfirm>
							</Space>
						),
					},
				]}
			/>
			<Modal
				title={editing ? "Edit Fasilitas" : "Tambah Fasilitas"}
				open={open}
				onCancel={() => setOpen(false)}
				onOk={() => void onSubmit()}
				destroyOnClose
			>
				<Form layout="vertical" form={form} initialValues={{ sort_order: 0 }}>
					<Form.Item label="Nama" name="name" rules={[{ required: true, message: "Nama fasilitas wajib diisi" }]}>
						<Input />
					</Form.Item>
					<Form.Item label="Icon" name="icon">
						<Input placeholder={`Contoh: ${iconOptions.join(", ")}`} />
					</Form.Item>
					<Form.Item label="Sort Order" name="sort_order">
						<InputNumber className="w-full" min={0} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
