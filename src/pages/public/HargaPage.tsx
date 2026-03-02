import { useMemo, useState } from "react";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { useBranches } from "@/hooks/useBranches";
import { formatRupiah } from "@/utils/format";

export default function HargaPage() {
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const [load, setLoad] = useState(1);
	const [washOn, setWashOn] = useState(true);
	const [dryOn, setDryOn] = useState(true);
	const [selectedBranchId, setSelectedBranchId] = useState("");

	const selectedBranch = useMemo(() => {
		if (selectedBranchId) {
			return branches.find((branch) => branch.id === selectedBranchId) ?? branches[0];
		}
		return branches[0];
	}, [branches, selectedBranchId]);

	const washPrice = selectedBranch?.price_wash ?? 0;
	const dryPrice = selectedBranch?.price_dry ?? 0;

	const total = useMemo(() => {
		const wash = washOn ? load * washPrice : 0;
		const dry = dryOn ? load * dryPrice : 0;
		return wash + dry;
	}, [dryOn, dryPrice, load, washOn, washPrice]);

	return (
		<section className="pb-20">
			<PageHeader
				kicker="Harga"
				title="Harga"
				highlight="Transparan"
				description="Harga dapat berbeda per cabang dan selalu diambil dari database terbaru."
			/>
			<div className="mx-auto max-w-5xl px-4 md:px-8">
				<div className="mb-5">
					<select
						value={selectedBranchId}
						onChange={(event) => setSelectedBranchId(event.target.value)}
						className="glass-card h-11 w-full max-w-sm rounded-xl px-3 text-sm focus:border-red-400 focus:outline-none"
					>
						<option value="">Pilih Cabang</option>
						{branches.map((branch) => (
							<option key={branch.id} value={branch.id}>
								{branch.name}
							</option>
						))}
					</select>
				</div>

				<div className="grid gap-5 md:grid-cols-2">
					<div className="glass-card rounded-2xl p-6">
						<p className="text-sm font-semibold">Tarif {selectedBranch?.name ?? "MBA Laundry"}</p>
						<p className="mt-3 text-4xl font-extrabold text-red-600 dark:text-red-300">{formatRupiah(washPrice)}</p>
						<p className="text-sm text-[var(--text-muted)]">Mencuci (30-40 menit)</p>
						<p className="mt-5 text-4xl font-extrabold text-rose-600 dark:text-rose-300">{formatRupiah(dryPrice)}</p>
						<p className="text-sm text-[var(--text-muted)]">Mengeringkan (20-30 menit)</p>
					</div>
					<div className="glass-card rounded-2xl p-6">
						<p className="text-sm font-semibold">Kalkulator</p>
						<input
							type="range"
							min={1}
							max={10}
							value={load}
							onChange={(event) => setLoad(Number(event.target.value))}
							className="mt-3 w-full accent-red-600"
						/>
						<p className="mt-2 text-sm">Muatan: {load}</p>
						<div className="mt-4 flex gap-3 text-sm">
							<label>
								<input type="checkbox" checked={washOn} onChange={(event) => setWashOn(event.target.checked)} className="mr-1" />
								Cuci
							</label>
							<label>
								<input type="checkbox" checked={dryOn} onChange={(event) => setDryOn(event.target.checked)} className="mr-1" />
								Kering
							</label>
						</div>
						<p className="mt-4 text-2xl font-bold">Estimasi: {formatRupiah(total)}</p>
					</div>
				</div>
			</div>
		</section>
	);
}
