import type { ColumnsType } from "antd/es/table";
import { CrudManager } from "@/components/admin/CrudManager";
import {
	createContactMessage,
	deleteContactMessage,
	getContactMessages,
	updateContactMessage,
} from "@/api/settings.api";
import { MetronicPage } from "@/components/admin/MetronicPage";
import type { ContactMessage } from "@/types/database.types";

const columns: ColumnsType<ContactMessage> = [
	{ title: "Nama", dataIndex: "name" },
	{ title: "Phone", dataIndex: "phone" },
	{ title: "Email", dataIndex: "email" },
	{ title: "Subjek", dataIndex: "subject" },
	{ title: "Status", dataIndex: "status" },
];

export default function PesanAdminPage() {
	return (
		<MetronicPage
			title="Pesan Kontak"
			subtitle="Kelola pesan kontak dari pelanggan"
		>
			<CrudManager<ContactMessage>
				title="Pesan Kontak"
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
					{ name: "message", label: "Pesan", type: "textarea", required: true },
					{
						name: "status",
						label: "Status",
						type: "select",
						options: ["new", "read", "replied", "closed"].map((value) => ({ value, label: value })),
						required: true,
					},
				]}
			/>
		</MetronicPage>
	);
}
