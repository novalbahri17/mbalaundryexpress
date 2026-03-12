import { PageHeader } from "@/components/public/shared/PageHeader";
import { useBranches } from "@/hooks/useBranches";

export default function TentangPage() {
	const { data: branches = [] } = useBranches({ activeOnly: true });

	return (
		<section className="pb-20">
			<PageHeader
				kicker="Tentang"
				title="Tentang"
				highlight="MBA Laundry"
				description="Brand laundry self-service modern untuk mahasiswa, keluarga, dan pekerja urban."
			/>
			<div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-2 md:px-8">
				<div className="glass-card rounded-2xl p-6">
					<p className="text-lg font-bold">Misi Kami</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">
						Membuat proses cuci jadi mudah, transparan, dan konsisten lewat standar operasional berbasis data.
					</p>
				</div>
				<div className="glass-card rounded-2xl p-6">
					<p className="text-lg font-bold">Pertumbuhan Cabang</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">
						Jumlah cabang aktif saat ini: {branches.length}. Semua cabang dikelola dinamis dari database tanpa hardcode.
					</p>
				</div>
			</div>
		</section>
	);
}
