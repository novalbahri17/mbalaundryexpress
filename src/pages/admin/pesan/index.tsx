import type { ColumnsType } from "antd/es/table";
import { Tag } from "antd";
import {
	createContactMessage,
	deleteContactMessage,
	getContactMessages,
	updateContactMessage,
} from "@/api/settings.api";
import { CrudManager } from "@/components/admin/CrudManager";
import { MetronicPage } from "@/components/admin/MetronicPage";
import type { ContactMessage } from "@/types/database.types";

const topicMeta: Record<string, { label: string; color: string }> = {
	kehilangan: { label: "Kehilangan Barang", color: "gold" },
	saran: { label: "Saran", color: "cyan" },
	kritik: { label: "Kritik", color: "blue" },
};

const statusMeta: Record<string, { label: string; color: string }> = {
	new: { label: "Baru", color: "red" },
	read: { label: "Dibaca", color: "gold" },
	replied: { label: "Dijawab", color: "green" },
	closed: { label: "Selesai", color: "default" },
};

const formatDate = (value?: string | null): string => {
	if (!value) return "-";
	const date = new Date(String(value).replace(" ", "T"));
	if (Number.isNaN(date.getTime())) return String(value);
	return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

/** Tanggal + jam kirim laporan, mis. "24 Okt 2026 14:05". */
const formatDateTime = (value?: string | null): string => {
	if (!value) return "-";
	const date = new Date(String(value).replace(" ", "T"));
	if (Number.isNaN(date.getTime())) return String(value);
	return date.toLocaleString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

const columns: ColumnsType<ContactMessage> = [
	{
		title: "Dikirim",
		dataIndex: "created",
		width: 170,
		sorter: (a, b) => new Date(String(a.created ?? 0)).getTime() - new Date(String(b.created ?? 0)).getTime(),
		defaultSortOrder: "descend",
		render: (value: string | null | undefined) => formatDateTime(value),
	},
	{
		title: "Jenis",
		dataIndex: "topic",
		width: 160,
		render: (value: string | null | undefined) => {
			const meta = value ? topicMeta[value] : undefined;
			if (!meta) return <Tag>Lainnya</Tag>;
			return <Tag color={meta.color}>{meta.label}</Tag>;
		},
	},
	{ title: "Nama", dataIndex: "name", width: 160 },
	{ title: "Phone", dataIndex: "phone", width: 140 },
	{ title: "Subjek", dataIndex: "subject", ellipsis: true },
	{
		title: "Tgl Kejadian",
		dataIndex: "incident_date",
		width: 130,
		render: (value: string | null | undefined) => formatDate(value),
	},
	{
		title: "Status",
		dataIndex: "status",
		width: 110,
		render: (value: string) => {
			const meta = statusMeta[value];
			return <Tag color={meta?.color}>{meta?.label ?? value}</Tag>;
		},
	},
];

export default function PesanAdminPage() {
	return (
		<MetronicPage title="Laporan Bantuan" subtitle="Kehilangan barang, kritik, dan saran dari pelanggan">
			<CrudManager<ContactMessage>
				title="Laporan Bantuan"
				queryKey="admin-contact-messages"
				fetcher={getContactMessages}
				createItem={createContactMessage}
				updateItem={updateContactMessage}
				deleteItem={deleteContactMessage}
				columns={columns}
				fields={[
					{ name: "name", label: "Nama", type: "text", required: true },
					{ name: "phone", label: "Phone", type: "text" },
					{ name: "email", label: "Email", type: "text" },
					{ name: "subject", label: "Subjek", type: "text" },
					{
						name: "created",
						label: "Dikirim pada",
						type: "text",
						readOnly: true,
						formatValue: (value) => formatDateTime(value as string | undefined),
					},
					{ name: "message", label: "Isi Laporan", type: "textarea", required: true },
					{
						name: "topic",
						label: "Jenis Laporan",
						type: "select",
						options: Object.entries(topicMeta).map(([value, meta]) => ({ value, label: meta.label })),
					},
					{
						name: "status",
						label: "Status",
						type: "select",
						options: Object.entries(statusMeta).map(([value, meta]) => ({ value, label: meta.label })),
						required: true,
					},
				]}
			/>
		</MetronicPage>
	);
}
