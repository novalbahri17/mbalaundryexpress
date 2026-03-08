import { useMemo, useState } from "react";
import { Badge, Button, Card, Container, Heading, Section } from "@/components/ui";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { useBranches } from "@/hooks/useBranches";
import { formatRupiah } from "@/utils/format";

export default function KalkulatorPage() {
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const [load, setLoad] = useState(2);
	const [wash, setWash] = useState(true);
	const [dry, setDry] = useState(true);
	const branch = branches[0];
	const washPrice = branch?.price_wash ?? 10000;
	const dryPrice = branch?.price_dry ?? 10000;

	const total = useMemo(() => {
		const washTotal = wash ? washPrice * load : 0;
		const dryTotal = dry ? dryPrice * load : 0;
		return washTotal + dryTotal;
	}, [dry, dryPrice, load, wash, washPrice]);

	return (
		<section className="pb-20">
			<PageHeader
				kicker="Kalkulator"
				title="Kalkulator"
				highlight="Biaya Laundry"
				description="Hitung estimasi biaya berdasarkan jumlah load dan jenis layanan."
			/>
			<Section size="sm">
				<Container size="md">
					<Card variant="glass" interactive={false}>
						<Badge tone="warning">Calculator</Badge>
						<Heading variant="h3" className="mt-3">
							Estimasi biaya real-time
						</Heading>
						<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
							Harga acuan: Cuci {formatRupiah(washPrice)} • Kering {formatRupiah(dryPrice)}
						</p>
						<input
							type="range"
							min={1}
							max={10}
							value={load}
							onChange={(event) => setLoad(Number(event.target.value))}
							className="mt-5 w-full accent-ruby-600"
							aria-label="Jumlah load"
						/>
						<p className="mt-1 text-sm text-neutral-500">{load} load</p>

						<div className="mt-4 flex flex-wrap gap-2">
							<Button variant={wash ? "primary" : "outline"} size="sm" onClick={() => setWash((prev) => !prev)}>
								Cuci
							</Button>
							<Button variant={dry ? "primary" : "outline"} size="sm" onClick={() => setDry((prev) => !prev)}>
								Kering
							</Button>
						</div>

						<p className="mt-5 text-3xl font-extrabold text-neutral-900 dark:text-white">{formatRupiah(total)}</p>
					</Card>
				</Container>
			</Section>
		</section>
	);
}
