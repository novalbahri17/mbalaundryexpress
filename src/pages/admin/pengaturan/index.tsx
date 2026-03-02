import type { ColumnsType } from "antd/es/table";
import { CrudManager } from "@/components/admin/CrudManager";
import { deleteSiteSetting, getSiteSettings, upsertSiteSetting } from "@/api/settings.api";
import type { SiteSetting } from "@/types/database.types";

const columns: ColumnsType<SiteSetting> = [
	{ title: "Key", dataIndex: "key" },
	{ title: "Value", dataIndex: "value" },
	{ title: "Deskripsi", dataIndex: "description" },
];

export default function PengaturanAdminPage() {
	return (
		<CrudManager<SiteSetting>
			title="Pengaturan Global"
			queryKey="admin-site-settings"
			fetcher={getSiteSettings}
			createItem={upsertSiteSetting}
			updateItem={(_, payload) => upsertSiteSetting(payload)}
			deleteItem={deleteSiteSetting}
			columns={columns}
			fields={[
				{ name: "key", label: "Key", type: "text", required: true },
				{ name: "value", label: "Value", type: "text", required: true },
				{ name: "description", label: "Deskripsi", type: "textarea" },
			]}
		/>
	);
}
