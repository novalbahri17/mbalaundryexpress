import { useMemo, useState } from "react";
import { Badge, Button, Card, Container, Heading, Section } from "@/components/ui";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { useBranches } from "@/hooks/useBranches";
import { groupMachines, isCashEnabled, isQrisEnabled, effectivePrice, useBranchMachines } from "@/hooks/useBranchMachines";
import { formatRupiah } from "@/utils/format";
import { usePublicText } from "@/hooks/usePublicText";

export default function KalkulatorPage() {
	const text = usePublicText();
	const t = text.pages.kalkulator;
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const [load, setLoad] = useState(2);
	const [wash, setWash] = useState(true);
	const [dry, setDry] = useState(true);
	const [branchId, setBranchId] = useState("");

	const branch = useMemo(() => branches.find((b) => b.id === branchId) ?? branches[0], [branches, branchId]);
	const { data: machines = [] } = useBranchMachines(branch?.id);
	const machineRows = useMemo(() => groupMachines(machines), [machines]);
	const coinValue = branch?.coin_value ?? 10000;
	const qrisEnabled = isQrisEnabled(branch);
	const cashEnabled = isCashEnabled(branch);

	// Tarif acuan = harga termurah tiap jenis mesin di cabang terpilih.
	const washPrice = useMemo(() => {
		const rows = machineRows.filter((m) => m.kind === "wash");
		return rows.length ? Math.min(...rows.map((m) => effectivePrice(m, coinValue, qrisEnabled))) : 0;
	}, [machineRows, coinValue, qrisEnabled]);

	const dryPrice = useMemo(() => {
		const rows = machineRows.filter((m) => m.kind === "dry");
		return rows.length ? Math.min(...rows.map((m) => effectivePrice(m, coinValue, qrisEnabled))) : 0;
	}, [machineRows, coinValue, qrisEnabled]);

	const total = useMemo(() => {
		const washTotal = wash ? washPrice * load : 0;
		const dryTotal = dry ? dryPrice * load : 0;
		return washTotal + dryTotal;
	}, [dry, dryPrice, load, wash, washPrice]);

	// Harga tunai (coin) selalu dihitung, walau cabang punya tarif QRIS.
	const cashWash = useMemo(() => {
		const rows = machineRows.filter((m) => m.kind === "wash");
		return rows.length ? Math.min(...rows.map((m) => effectivePrice(m, coinValue, false))) : 0;
	}, [machineRows, coinValue]);

	const cashDry = useMemo(() => {
		const rows = machineRows.filter((m) => m.kind === "dry");
		return rows.length ? Math.min(...rows.map((m) => effectivePrice(m, coinValue, false))) : 0;
	}, [machineRows, coinValue]);

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />
			<Section size="sm">
				<Container size="md">
					<Card variant="glass" interactive={false}>
						<Badge tone="warning">{t.badge}</Badge>
						<Heading variant="h3" className="mt-3">
							{t.estimateTitle}
						</Heading>
						{cashEnabled ? (
							<p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
								{t.noteCash} {t.wash} {formatRupiah(cashWash)} • {t.dry} {formatRupiah(cashDry)}
							</p>
						) : null}
						{qrisEnabled ? (
							<p className={`${cashEnabled ? "mt-1" : "mt-2"} text-sm text-emerald-600 dark:text-emerald-400`}>
								{t.noteQris} {t.wash} {formatRupiah(washPrice)} • {t.dry} {formatRupiah(dryPrice)}
							</p>
						) : null}
						{branches.length > 1 ? (
							<select
								value={branch?.id ?? ""}
								onChange={(event) => setBranchId(event.target.value)}
								className="mt-3 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
							>
								{branches.map((b) => (
									<option key={b.id} value={b.id}>
										{b.name}
									</option>
								))}
							</select>
						) : null}
						<input
							type="range"
							min={1}
							max={10}
							value={load}
							onChange={(event) => setLoad(Number(event.target.value))}
							className="mt-5 w-full accent-ruby-600"
							aria-label={t.loadAria}
						/>
						<p className="mt-1 text-sm text-neutral-500">{load} {text.common.loads}</p>

						<div className="mt-4 flex flex-wrap gap-2">
							<Button variant={wash ? "primary" : "outline"} size="sm" onClick={() => setWash((prev) => !prev)}>
								{t.wash}
							</Button>
							<Button variant={dry ? "primary" : "outline"} size="sm" onClick={() => setDry((prev) => !prev)}>
								{t.dry}
							</Button>
						</div>

						<p className="mt-5 text-3xl font-extrabold text-neutral-900 dark:text-white">{formatRupiah(total)}</p>
						<p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
							{qrisEnabled ? t.noteQris : cashEnabled ? t.noteCash : t.noteQrisOnly}
						</p>
					</Card>
				</Container>
			</Section>
		</section>
	);
}
