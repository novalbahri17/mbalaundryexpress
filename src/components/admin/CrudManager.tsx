import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
	Button,
	Form,
	Input,
	InputNumber,
	Modal,
	Popconfirm,
	Select,
	Skeleton,
	Space,
	Switch,
	Table,
	message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type CrudFieldType = "text" | "number" | "textarea" | "switch" | "select";

export type CrudField = {
	name: string;
	label: string;
	type: CrudFieldType;
	required?: boolean;
	options?: Array<{ label: string; value: string }>;
};

type CrudManagerProps<T extends { id: string }> = {
	title: string;
	queryKey: string;
	fetcher: () => Promise<T[]>;
	createItem: (payload: Partial<T>) => Promise<T>;
	updateItem: (id: string, payload: Partial<T>) => Promise<T>;
	deleteItem: (id: string) => Promise<void>;
	columns: ColumnsType<T>;
	fields: CrudField[];
};

function titleToSubtitle(title: string): string {
	return `Kelola data ${title.toLowerCase()} dengan workflow cepat dan aman.`;
}

export function CrudManager<T extends { id: string }>({
	title,
	queryKey,
	fetcher,
	createItem,
	updateItem,
	deleteItem,
	columns,
	fields,
}: CrudManagerProps<T>) {
	const [form] = Form.useForm();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<T | null>(null);
	const queryClient = useQueryClient();

	const { data = [], isLoading } = useQuery({
		queryKey: [queryKey],
		queryFn: fetcher,
	});

	useEffect(() => {
		if (!open) return;
		if (editing) {
			form.setFieldsValue(editing as object);
			return;
		}
		form.resetFields();
	}, [editing, form, open]);

	const composedColumns = useMemo<ColumnsType<T>>(
		() => [
			...columns,
			{
				title: "Aksi",
				key: "actions",
				width: 160,
				render: (_, record) => (
					<Space size={6}>
						<Button
							type="text"
							size="small"
							icon={<EditOutlined />}
							className="admin-soft-btn"
							style={{ color: "var(--info)" }}
							onClick={() => {
								setEditing(record);
								setOpen(true);
							}}
						/>
						<Popconfirm
							title="Hapus data ini?"
							onConfirm={async () => {
								await deleteItem(record.id);
								await queryClient.invalidateQueries({ queryKey: [queryKey] });
								message.success("Data berhasil dihapus");
							}}
						>
							<Button
								type="text"
								danger
								size="small"
								icon={<DeleteOutlined />}
								className="admin-soft-btn"
							/>
						</Popconfirm>
					</Space>
				),
			},
		],
		[columns, deleteItem, queryClient, queryKey],
	);

	const onSubmit = async (): Promise<void> => {
		const values = (await form.validateFields()) as Partial<T>;
		if (editing) {
			await updateItem(editing.id, values);
			message.success("Data berhasil diperbarui");
		} else {
			await createItem(values);
			message.success("Data berhasil dibuat");
		}
		setOpen(false);
		setEditing(null);
		form.resetFields();
		await queryClient.invalidateQueries({ queryKey: [queryKey] });
	};

	return (
		<div className="admin-page-shell">
			<div className="admin-page-head">
				<div>
					<h1 className="admin-page-title">{title}</h1>
					<p className="admin-page-subtitle">{titleToSubtitle(title)}</p>
				</div>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					size="large"
					onClick={() => {
						setEditing(null);
						setOpen(true);
					}}
				>
					Tambah Data
				</Button>
			</div>

			<div className="admin-page-body">
				{isLoading ? (
					<Skeleton active paragraph={{ rows: 6 }} />
				) : (
					<div className="admin-data-table">
						<Table
							rowKey="id"
							columns={composedColumns}
							dataSource={data}
							pagination={{ pageSize: 10, showSizeChanger: false }}
						/>
					</div>
				)}
			</div>

			<Modal
				title={editing ? `Edit ${title}` : `Tambah ${title}`}
				open={open}
				className="admin-modal"
				onCancel={() => {
					setOpen(false);
					setEditing(null);
					form.resetFields();
				}}
				onOk={() => void onSubmit()}
				okText={editing ? "Simpan Perubahan" : "Simpan Data"}
				cancelText="Batal"
				okButtonProps={{ className: "admin-soft-btn" }}
				cancelButtonProps={{ className: "admin-soft-btn" }}
				destroyOnClose
			>
				<Form form={form} layout="vertical" autoComplete="off">
					{fields.map((field) => (
						<Form.Item
							key={field.name}
							name={field.name}
							label={field.label}
							valuePropName={field.type === "switch" ? "checked" : "value"}
							rules={field.required ? [{ required: true, message: `${field.label} wajib diisi` }] : undefined}
						>
							{field.type === "textarea" ? <Input.TextArea rows={4} /> : null}
							{field.type === "text" ? <Input /> : null}
							{field.type === "number" ? <InputNumber className="w-full" /> : null}
							{field.type === "switch" ? <Switch /> : null}
							{field.type === "select" ? <Select options={field.options} /> : null}
						</Form.Item>
					))}
				</Form>
			</Modal>
		</div>
	);
}
