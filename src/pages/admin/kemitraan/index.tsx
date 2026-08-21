import type { ColumnsType } from "antd/es/table";
import { CrudManager } from "@/components/admin/CrudManager";
import { createPartnership, deletePartnership, getPartnerships, updatePartnership } from "@/api/settings.api";
import { MetronicPage } from "@/components/admin/MetronicPage";
import type { Partnership } from "@/types/database.types";

const columns: ColumnsType<Partnership> = [
	{ title: "Nama", dataIndex: "name" },
	{ title: "Perusahaan", dataIndex: "company" },
	{ title: "Phone", dataIndex: "phone" },
	{ title: "Kota", dataIndex: "city" },
	{ title: "Status", dataIndex: "status" },
];

export default function KemitraanAdminPage() {
	return (
		<MetronicPage
			title="Kemitraan"
			subtitle="Kelola form partnership dan kemitraan usaha"
		>
			<CrudManager<Partnership>
				title="Partnership"
				queryKey="admin-partnerships"
				fetcher={getPartnerships}
				createItem={createPartnership}
				updateItem={updatePartnership}
				deleteItem={deletePartnership}
				columns={columns}
				fields={[
					{ name: "name", label: "Nama", type: "text", required: true },
					{ name: "company", label: "Perusahaan", type: "text" },
					{ name: "phone", label: "Phone", type: "text", required: true },
					{ name: "email", label: "Email", type: "text" },
					{ name: "city", label: "Kota", type: "text" },
					{ name: "notes", label: "Catatan", type: "textarea" },
					{
						name: "status",
						label: "Status",
						type: "select",
						options: ["new", "contacted", "qualified", "closed", "rejected"].map((value) => ({ value, label: value })),
						required: true,
					},
				]}
			/>
		</MetronicPage>
	);
}
