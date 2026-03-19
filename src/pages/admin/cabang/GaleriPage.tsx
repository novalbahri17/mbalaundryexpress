import { DeleteOutlined, EditOutlined, PlusOutlined, InboxOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Popconfirm, Space, Table, message, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBranchGallery, saveBranchGallery, deleteBranchGallery } from "@/api/branches.api";
import { BranchContextHeader } from "@/components/admin/BranchContextHeader";
import type { BranchGallery } from "@/types/database.types";
import { resolveImageUrl } from "@/utils/format";

// Form values now only include optional caption
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

	const onSubmit = async (): Promise<void> => {
		if (!id) return;
		const values = await form.validateFields();

		if (!editing && fileList.length === 0) {
			message.error("Gambar wajib diisi");
			return;
		}

		message.loading({ content: "Menyimpan...", key: "uploading" });

		if (editing) {
			// EDIT MODE: single item
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
			// BULK CREATE MODE
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

	return (
		<div className="space-y-4">
			<BranchContextHeader branchId={id} activeTab="galeri" />

			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold">Kelola Galeri Cabang</h1>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						setEditing(null);
						setFileList([]);
						form.setFieldsValue({ caption: "" });
						setOpen(true);
					}}
				>
					Tambah Gambar
				</Button>
			</div>

			<Table
				rowKey="id"
				loading={isLoading}
				dataSource={data}
				columns={[
					{
						title: "Gambar",
						dataIndex: "image",
						render: (value: string, row: BranchGallery) => (
							<img
								src={resolveImageUrl(value, row.caption || "Galeri Cabang")}
								alt={row.caption || "galeri"}
								className="h-14 w-24 rounded object-cover"
							/>
						),
					},
					{ title: "Caption", dataIndex: "caption", render: (value?: string) => value || "-" },
					{
						title: "Aksi",
						render: (_, record: BranchGallery) => (
							<Space>
								<Button
									type="link"
									icon={<EditOutlined />}
									onClick={() => {
										setEditing(record);
										setFileList([]);
										form.setFieldsValue({ caption: record.caption });
										setOpen(true);
									}}
								>
									Edit
								</Button>
								<Popconfirm
									title="Hapus gambar ini?"
									okText="Hapus"
									cancelText="Batal"
									onConfirm={async () => {
										await deleteBranchGallery(record.id);
										message.success("Gambar dihapus");
										await queryClient.invalidateQueries({ queryKey: ["branch-gallery", id] });
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
				title={editing ? "Edit Gambar Galeri" : "Tambah Gambar Galeri"}
				open={open}
				onCancel={() => setOpen(false)}
				onOk={() => void onSubmit()}
				destroyOnClose
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
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
}
