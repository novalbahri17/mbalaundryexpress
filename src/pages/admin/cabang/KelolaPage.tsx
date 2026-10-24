import {
	AppstoreOutlined,
	ClockCircleOutlined,
	GiftOutlined,
	PictureOutlined,
	ShopOutlined,
	ToolOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { BranchContextHeader } from "@/components/admin/BranchContextHeader";
import { MetronicPage } from "@/components/admin/MetronicPage";

type SectionItem = {
	key: string;
	label: string;
	description: string;
	icon: ReactNode;
	tone: string;
};

const sections: SectionItem[] = [
	{
		key: "jam",
		label: "Jam Operasional",
		description: "Hari buka, jam buka, dan jam tutup cabang.",
		icon: <ClockCircleOutlined />,
		tone: "brand",
	},
	{
		key: "mesin",
		label: "Mesin & Tarif",
		description: "Daftar mesin cuci dan pengering beserta harga tunai dan QRIS.",
		icon: <ToolOutlined />,
		tone: "sapphire",
	},
	{
		key: "fasilitas",
		label: "Fasilitas",
		description: "Fasilitas yang tersedia di cabang, mis. WiFi, sofa, parkir.",
		icon: <AppstoreOutlined />,
		tone: "emerald",
	},
	{
		key: "galeri",
		label: "Galeri Cabang",
		description: "Foto-foto suasana cabang untuk ditampilkan di halaman publik.",
		icon: <PictureOutlined />,
		tone: "amber",
	},
	{
		key: "promo",
		label: "Promo Cabang",
		description: "Promo yang tayang khusus di cabang ini, di luar promo global.",
		icon: <GiftOutlined />,
		tone: "rose",
	},
];

/**
 * Halaman hub untuk mengelola satu cabang.
 * Semua pengaturan cabang (jam, mesin, fasilitas, galeri) masuk di sini
 * supaya admin tidak perlu bolak-balik antar menu.
 */
export default function CabangKelolaPage() {
	const { id } = useParams();

	return (
		<MetronicPage
			title="Kelola Cabang"
			subtitle="Semua pengaturan cabang ada di satu tempat. Pilih bagian yang ingin diubah."
		>
			<BranchContextHeader branchId={id} activeTab="ringkasan" />

			<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
				{sections.map((section) => (
					<Link
						key={section.key}
						to={`/admin/cabang/${id}/${section.key}`}
						className="group flex items-start gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
						style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
					>
						<span
							className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
							style={{ backgroundColor: "var(--brand-bg)", color: "var(--brand)" }}
						>
							{section.icon}
						</span>
						<span className="min-w-0">
							<span className="block text-base font-bold" style={{ color: "var(--text-primary)" }}>
								{section.label}
							</span>
							<span className="mt-1 block text-sm" style={{ color: "var(--text-secondary)" }}>
								{section.description}
							</span>
							<span
								className="mt-2 inline-flex items-center gap-1 text-sm font-semibold"
								style={{ color: "var(--brand)" }}
							>
								Atur sekarang
							</span>
						</span>
					</Link>
				))}
			</div>

			<div className="mt-6">
				<Link
					to="/admin/cabang"
					className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors"
					style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
				>
					<ShopOutlined className="mr-2" />
					Kembali ke Daftar Cabang
				</Link>
			</div>
		</MetronicPage>
	);
}
