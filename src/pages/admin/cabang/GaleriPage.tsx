import { DeleteOutlined, EditOutlined, PlusOutlined, InboxOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Popconfirm, Space, Table, message, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBranchGallery, saveBranchGallery, deleteBranchGallery } from "@/api/branches.api";
import { BranchContextHeader } from "@/components/admin/BranchContextHeader";
import { MetronicPage } from "@/components/admin/MetronicPage";
import type { BranchGallery } from "@/types/database.types";
import { resolveImageUrl } from "@/utils/format";

type GaleriFormValues = {
	caption?: string;
};

export default function CabangGaleriPage() {
	const { id } = useParams();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<BranchGallery | null>(null);
	const [form] = Form.useForm<GaleriFormValues>();
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const queryClient = useQueryClient();

	const { data = [], isLoading } = useQuery({
		queryKey: ["branch-gallery", id],
		queryFn: () => getBranchGallery(id),
		enabled: Boolean(id),
	});

	const handleEdit = (record: BranchGallery) => {
		setEditing(record);
		setFileList([]);
		form.setFieldsValue({ caption: record.caption });
		setOpen(true);
	};

	const handleDelete = async (record: BranchGallery) => {
		await deleteBranchGallery(record.id);
		message.success("Gambar dihapus");
		await queryClient.invalidateQueries({ queryKey: ["branch-gallery", id] });
	};

	const onSubmit = async (): Promise<void> => {
		if (!id) return;
		const values = await form.validateFields();

		if (!editing && fileList.length === 0) {
			message.error("Gambar wajib diisi");
			return;
		}

		message.loading({ content: "Menyimpan...", key: "uploading" });

		if (editing) {
			const isNewFile = fileList[0]?.originFileObj;
			if (isNewFile) {
				const formData = new FormData();
				formData.append("id", editing.id);
				formData.append("branch_id", id);
				formData.append("caption", values.caption ?? "");
				formData.append("image", fileList[0].originFileObj as File);
				await saveBranchGallery(formData, editing.id);
			} else {
				await saveBranchGallery({
					id: editing.id,
					branch_id: id,
					caption: values.caption,
				});
			}
		} else {
			for (const fileItem of fileList) {
				if (!fileItem.originFileObj) continue;
				const formData = new FormData();
				formData.append("branch_id", id);
				formData.append("caption", values.caption ?? "");
				formData.append("image", fileItem.originFileObj as File);
				await saveBranchGallery(formData);
			}
		}

		message.success({ content: "Galeri tersimpan!", key: "uploading", duration: 2 });
		setOpen(false);
		setEditing(null);
		setFileList([]);
		form.resetFields();
		await queryClient.invalidateQueries({ queryKey: ["branch-gallery", id] });
	};

	const columns: ColumnsType<BranchGallery> = [
		{
			title: "Gambar",
			dataIndex: "image",
			width: 120,
			render: (value: string, row: BranchGallery) => (
				<img
					src={resolveImageUrl(value, row.caption || "Galeri")}
					alt={row.caption || "galeri"}
					className="h-14 w-24 rounded object-cover"
				/>
			),
		},
		{ title: "Caption", dataIndex: "caption", render: (value?: string) => value || "-" },
		{
			title: "Aksi",
			width: 150,
			render: (_, record: BranchGallery) => (
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
						title="Hapus gambar ini?"
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
			title="Kelola Galeri Cabang"
			subtitle="Upload dan kelola foto galeri cabang"
			actionLabel="Tambah Gambar"
			onAction={() => {
				setEditing(null);
				setFileList([]);
				form.setFieldsValue({ caption: "" });
				setOpen(true);
			}}
		>
			<div className="card">
				<BranchContextHeader branchId={id} activeTab="galeri" />
			</div>

			<div className="card mt-4">
				<div className="table-container">
					<Table rowKey="id" loading={isLoading} dataSource={data} columns={columns} />
				</div>
			</div>

			<Modal
				title={editing ? "Edit Gambar Galeri" : "Tambah Gambar Galeri"}
				open={open}
				onCancel={() => {
					setOpen(false);
					setEditing(null);
					setFileList([]);
					form.resetFields();
				}}
				onOk={() => void onSubmit()}
				okText="Simpan"
				cancelText="Batal"
				destroyOnClose
				className="metronic-modal"
			>
				<Form layout="vertical" form={form}>
					<Form.Item label="Gambar">
						<Upload.Dragger
							multiple={!editing}
							maxCount={editing ? 1 : 20}
							fileList={fileList}
							beforeUpload={() => false}
							onChange={(info) => setFileList(info.fileList)}
							accept="image/*"
							listType="picture"
						>
							<p className="ant-upload-drag-icon">
								<InboxOutlined />
							</p>
							<p className="ant-upload-text">Klik atau tarik gambar ke area ini untuk upload</p>
							{!editing && (
								<p className="ant-upload-hint">Anda dapat memilih dan mengunggah banyak gambar sekaligus.</p>
							)}
						</Upload.Dragger>
						{editing && !fileList.length && editing.image && (
							<div className="mt-4">
								<p className="mb-2 text-sm text-gray-500">Gambar saat ini:</p>
								<img
									src={resolveImageUrl(editing.image, editing.caption || "galeri")}
									alt="Preview"
									className="max-h-32 rounded-lg object-contain shadow-sm"
								/>
							</div>
						)}
					</Form.Item>
					<Form.Item label="Caption" name="caption">
						<Input className="form-input" />
					</Form.Item>
				</Form>
			</Modal>
		</MetronicPage>
	);
}
