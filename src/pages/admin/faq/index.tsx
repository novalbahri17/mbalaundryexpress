import { DeleteOutlined, EditOutlined, PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Switch, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFaq, deleteFaq, getFaqs, updateFaq } from "@/api/faqs.api";
import { MetronicPage } from "@/components/admin/MetronicPage";
import type { Faq } from "@/types/database.types";
import { useThemeStore } from "@/store/themeStore";

const categories = ["harga", "mesin", "waktu", "pembayaran", "keamanan", "barang-hilang", "umum"];

export default function FaqAdminPage() {
	const { mode } = useThemeStore();
	const [form] = Form.useForm();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Faq | null>(null);
	const queryClient = useQueryClient();

	const isDark = mode === "dark";

	const { data: faqs = [], isLoading } = useQuery({
		queryKey: ["admin-faqs"],
		queryFn: () => getFaqs(),
	});

	const handleEdit = (record: Faq) => {
		setEditing(record);
		form.setFieldsValue(record);
		setOpen(true);
	};

	const handleDelete = async (id: string) => {
		await deleteFaq(id);
		message.success("FAQ berhasil dihapus");
		await queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();
		if (editing) {
			await updateFaq(editing.id, values);
			message.success("FAQ berhasil diperbarui");
		} else {
			await createFaq(values);
			message.success("FAQ berhasil dibuat");
		}
		setOpen(false);
		setEditing(null);
		form.resetFields();
		await queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
	};

	const columns: ColumnsType<Faq> = [
		{
			title: "Pertanyaan",
			dataIndex: "question",
			render: (text: string) => <span className="font-medium" style={{ color: isDark ? "#f8fafc" : "#111827" }}>{text}</span>,
		},
		{ title: "Kategori", dataIndex: "category" },
		{ title: "Urutan", dataIndex: "sort_order", width: 80 },
		{
			title: "Status",
			dataIndex: "is_active",
			width: 100,
			render: (value: boolean) => (
				<span className={`badge ${value ? "badge-success" : "badge-danger"}`}>
					{value ? "Aktif" : "Nonaktif"}
				</span>
			),
		},
		{
			title: "Aksi",
			width: 150,
			render: (_, record) => (
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
						title="Hapus FAQ ini?"
						onConfirm={() => handleDelete(record.id)}
						okText="Hapus"
						cancelText="Batal"
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
			title="FAQ"
			subtitle="Kelola pertanyaan yang sering ditanyakan"
			actionLabel="Tambah FAQ"
			onAction={() => {
				setEditing(null);
				form.resetFields();
				setOpen(true);
			}}
		>
			<div className="card">
				<div className="table-container">
					<Table
						rowKey="id"
						loading={isLoading}
						columns={columns}
						dataSource={faqs}
						pagination={{ pageSize: 10, showSizeChanger: false }}
					/>
				</div>
			</div>

			<Modal
				title={editing ? "Edit FAQ" : "Tambah FAQ"}
				open={open}
				onCancel={() => {
					setOpen(false);
					setEditing(null);
					form.resetFields();
				}}
				onOk={handleSubmit}
				okText={editing ? "Simpan" : "Buat"}
				cancelText="Batal"
				width={600}
				className="metronic-modal"
			>
				<Form form={form} layout="vertical">
					<Form.Item
						label="Pertanyaan"
						name="question"
						rules={[{ required: true, message: "Pertanyaan wajib diisi" }]}
					>
						<Input.TextArea rows={2} />
					</Form.Item>

					<Form.Item
						label="Jawaban"
						name="answer"
						rules={[{ required: true, message: "Jawaban wajib diisi" }]}
					>
						<Input.TextArea rows={4} />
					</Form.Item>

					<div className="form-grid">
						<Form.Item
							label="Kategori"
							name="category"
							rules={[{ required: true, message: "Kategori wajib diisi" }]}
						>
							<Select options={categories.map((c) => ({ value: c, label: c }))} />
						</Form.Item>

						<Form.Item label="Urutan" name="sort_order">
							<Input type="number" className="form-input" />
						</Form.Item>
					</div>

					<Form.Item label="Aktif" name="is_active" valuePropName="checked">
						<Switch />
					</Form.Item>
				</Form>
			</Modal>
		</MetronicPage>
	);
}
