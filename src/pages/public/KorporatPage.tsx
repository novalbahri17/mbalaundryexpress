import { PageHeader } from "@/components/public/shared/PageHeader";
import { useBranches } from "@/hooks/useBranches";

export default function KorporatPage() {
	const { data: branches = [] } = useBranches({ activeOnly: true });

	return (
		<section className="pb-20">
			<PageHeader
				kicker="Korporat"
				title="Layanan"
				highlight="Korporat"
				description="Solusi laundry skala tim, kantor, kos eksklusif, dan komunitas dengan SLA terukur."
			/>
			<div className="mx-auto grid max-w-6xl gap-5 px-4 md:grid-cols-3 md:px-8">
				<div className="glass-card rounded-2xl p-6">
					<p className="font-semibold">Corporate Plan</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">
						Skema harga volume, invoice bulanan, dan dashboard pemakaian.
					</p>
				</div>
				<div className="glass-card rounded-2xl p-6">
					<p className="font-semibold">On-site Activation</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">
						Aktivasi layanan laundry untuk event, kampus, atau properti sewa.
					</p>
				</div>
				<div className="glass-card rounded-2xl p-6">
					<p className="font-semibold">Cabang Tersedia</p>
					<p className="mt-2 text-sm text-[var(--text-muted)]">
						Saat ini terhubung ke {branches.length} cabang aktif dan bisa ditambah dinamis.
					</p>
				</div>
			</div>
		</section>
	);
}
