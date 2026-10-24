import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Button,
	Form,
	Input,
	InputNumber,
	Modal,
	message,
	Popconfirm,
	Select,
	Space,
	Switch,
	Table,
	TimePicker,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { deleteBranchHour, getBranchHours, saveBranchHour } from "@/api/branches.api";
import { BranchContextHeader } from "@/components/admin/BranchContextHeader";
import { MetronicPage } from "@/components/admin/MetronicPage";
import { TableEmptyState, TableErrorState } from "@/components/admin/QueryState";
import type { BranchHour, DayName } from "@/types/database.types";

const days: DayName[] = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"];

type JamFormValues = {
	day: DayName;
	open_time?: Dayjs;
	close_time?: Dayjs;
	is_closed: boolean;
	is_24_hours?: boolean;
};

// Jam operasional 24 jam disimpan sebagai 00:00 - 23:59.
const FULL_DAY_OPEN = dayjs("00:00", "HH:mm");
const FULL_DAY_CLOSE = dayjs("23:59", "HH:mm");

const isFullDay = (open?: string, close?: string): boolean =>
	Boolean(open && close && open.slice(0, 5) === "00:00" && close.slice(0, 5) === "23:59");

// Database menyimpan "07:00" atau "07:00:00". dayjs(str, "HH:mm:ss") hanya
// menerima bentuk kedua, jadi normalisasi dulu supaya TimePicker tidak
// menampilkan "Invalid Date".
const toTimeValue = (value?: string): Dayjs | undefined => {
	if (!value) return undefined;
	const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(value.trim());
	if (!match) return undefined;
	const hour = Number(match[1]);
	const minute = Number(match[2]);
	if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 23 || minute > 59) return undefined;
	return dayjs()
		.hour(hour)
		.minute(minute)
		.second(Number(match[3] ?? 0))
		.millisecond(0);
};

export default function CabangJamPage() {
	const { id } = useParams();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<BranchHour | null>(null);
	const [form] = Form.useForm<JamFormValues>();
	const queryClient = useQueryClient();

	const {
		data = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: ["branch-hours", id],
		queryFn: () => getBranchHours(id ?? ""),
		enabled: Boolean(id),
	});

	const handleEdit = (record: BranchHour) => {
		setEditing(record);
		form.setFieldsValue({
			day: record.day,
			open_time: toTimeValue(record.open_time),
			close_time: toTimeValue(record.close_time),
			is_closed: record.is_closed,
			is_24_hours: isFullDay(record.open_time, record.close_time),
		});
		setOpen(true);
	};

	const handleDelete = async (record: BranchHour) => {
		await deleteBranchHour(record.id);
		message.success("Jadwal dihapus");
		await queryClient.invalidateQueries({ queryKey: ["branch-hours", id] });
	};

	const onSubmit = async (): Promise<void> => {
		if (!id) return;
		const values = await form.validateFields();
		const existingSameDay = data.find((item) => item.day === values.day);
		const targetId = editing?.id ?? existingSameDay?.id;
		const fullDay = Boolean(values.is_24_hours) && !values.is_closed;

		await saveBranchHour({
			id: targetId,
			branch_id: id,
			day: values.day,
			open_time: fullDay ? "00:00:00" : values.open_time?.format("HH:mm:ss"),
			close_time: fullDay ? "23:59:00" : values.close_time?.format("HH:mm:ss"),
			is_closed: values.is_closed,
		} as Partial<BranchHour>);
		message.success("Jam operasional tersimpan");
		setOpen(false);
		setEditing(null);
		form.resetFields();
		await queryClient.invalidateQueries({ queryKey: ["branch-hours", id] });
	};

	const columns: ColumnsType<BranchHour> = [
		{
			title: "Hari",
			dataIndex: "day",
			render: (value: DayName) => value.charAt(0).toUpperCase() + value.slice(1),
		},
		{ title: "Buka", dataIndex: "open_time", render: (value?: string) => value?.slice(0, 5) ?? "-" },
		{
			title: "Tutup",
			dataIndex: "close_time",
			render: (value: string | undefined, record: BranchHour) =>
				record.is_closed ? "-" : isFullDay(record.open_time, value) ? "24 JAM" : (value?.slice(0, 5) ?? "-"),
		},
		{
			title: "Status",
			dataIndex: "is_closed",
			render: (value: boolean) => (
				<span className={`badge ${value ? "badge-danger" : "badge-success"}`}>{value ? "Tutup" : "Buka"}</span>
			),
		},
		{
			title: "Aksi",
			width: 150,
			render: (_, record: BranchHour) => (
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
						title="Hapus jadwal ini?"
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
			title="Kelola Jam Operasional"
			subtitle="Atur jadwal operasional cabang"
			actionLabel="Tambah Jadwal"
			onAction={() => {
				setEditing(null);
				form.setFieldsValue({
					day: "senin",
					open_time: FULL_DAY_OPEN,
					close_time: FULL_DAY_CLOSE,
					is_closed: false,
					is_24_hours: false,
				});
				setOpen(true);
			}}
		>
			<div className="card">
				<BranchContextHeader branchId={id} activeTab="jam" />
			</div>

			<div className="card mt-4">
				<div className="table-container">
					{isError ? (
						<TableErrorState title="Gagal memuat jam operasional" error={error} onRetry={() => void refetch()} />
					) : (
						<Table
							rowKey="id"
							loading={isLoading}
							dataSource={data}
							columns={columns}
							locale={{
								emptyText: (
									<TableEmptyState
										title="Belum ada jam operasional."
										hint="Tambahkan jadwal buka per hari supaya pelanggan datang di jam yang tepat."
									/>
								),
							}}
						/>
					)}
				</div>
			</div>

			<Modal
				title={editing ? "Edit Jadwal" : "Tambah Jadwal"}
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
				<Form layout="vertical" form={form} initialValues={{ day: "senin", is_closed: false, is_24_hours: false }}>
					<Form.Item label="Hari" name="day" rules={[{ required: true }]}>
						<Select
							className="form-input"
							options={days.map((day) => ({ value: day, label: day.charAt(0).toUpperCase() + day.slice(1) }))}
						/>
					</Form.Item>
					<Form.Item label="Tutup (Libur)" name="is_closed" valuePropName="checked">
						<Switch />
					</Form.Item>
					<Form.Item
						label="Buka 24 Jam"
						name="is_24_hours"
						valuePropName="checked"
						tooltip="Otomatis mengisi jam buka 00:00 dan jam tutup 23:59."
					>
						<Switch
							disabled={Form.useWatch("is_closed", form)}
							onChange={(checked) => {
								form.setFieldsValue({
									open_time: checked ? FULL_DAY_OPEN : dayjs().hour(7).minute(0).second(0).millisecond(0),
									close_time: checked ? FULL_DAY_CLOSE : dayjs().hour(23).minute(0).second(0).millisecond(0),
								});
							}}
						/>
					</Form.Item>
					<Form.Item
						noStyle
						shouldUpdate={(prev, next) => prev.is_24_hours !== next.is_24_hours || prev.is_closed !== next.is_closed}
					>
						{({ getFieldValue }) => {
							const disabled = Boolean(getFieldValue("is_24_hours")) || Boolean(getFieldValue("is_closed"));
							return (
								<>
									<Form.Item label="Jam Buka" name="open_time">
										<TimePicker className="form-input w-full" format="HH:mm" disabled={disabled} />
									</Form.Item>
									<Form.Item label="Jam Tutup" name="close_time">
										<TimePicker className="form-input w-full" format="HH:mm" disabled={disabled} />
									</Form.Item>
								</>
							);
						}}
					</Form.Item>
				</Form>
			</Modal>
		</MetronicPage>
	);
}
