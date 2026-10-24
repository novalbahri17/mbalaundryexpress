import { useMemo, useState } from "react";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { useBranches } from "@/hooks/useBranches";
import {
	effectivePrice,
	formatCapacity,
	formatDuration,
	groupMachines,
	isCashEnabled,
	isQrisEnabled,
	useBranchMachines,
} from "@/hooks/useBranchMachines";
import { formatRupiah } from "@/utils/format";
import { usePublicText } from "@/hooks/usePublicText";

type MachineRow = {
	key: string;
	kind: "wash" | "dry";
	label: string;
	capacity: string;
	duration: string;
	coins: number;
	price: number;
	coinPrice: number;
	qrisPrice: number | null;
	note?: string;
};

export default function HargaPage() {
	const text = usePublicText();
	const t = text.pages.harga;
	const { data: branches = [], isLoading } = useBranches({ activeOnly: true });
	const [selectedBranchId, setSelectedBranchId] = useState("");

	const selectedBranch = useMemo(() => {
		if (selectedBranchId) {
			return branches.find((branch) => branch.id === selectedBranchId) ?? branches[0];
		}
		return branches[0];
	}, [branches, selectedBranchId]);

	const { data: machines = [], isLoading: machinesLoading } = useBranchMachines(selectedBranch?.id);

	const coinValue = selectedBranch?.coin_value ?? 10000;
	const qrisEnabled = isQrisEnabled(selectedBranch);
	const cashEnabled = isCashEnabled(selectedBranch);
	const showTunai = cashEnabled;
	const showQris = qrisEnabled;

	// Semua tarif bersumber dari tabel branch_machines. Kalau kosong, tabel
	// menampilkan pesan supaya admin tahu datanya belum diisi.
	const rows = useMemo<MachineRow[]>(() => {
		const grouped = groupMachines(machines);
		if (grouped.length === 0) return [];
		return grouped.map((m) => {
			const coinPrice = m.coins * coinValue;
			return {
				key: m.key,
				kind: m.kind,
				label: m.kind === "wash" ? t.washMachine : t.dryMachine,
				capacity: formatCapacity(m.capacity_min, m.capacity_max),
				duration: formatDuration(m.duration_min, m.duration_max, text.common.minuteShort),
				coins: m.coins,
				price: effectivePrice(m, coinValue, qrisEnabled),
				coinPrice,
				qrisPrice: m.qris_price,
				note: m.note,
			};
		});
	}, [machines, coinValue, qrisEnabled, selectedBranch, t.washMachine, t.dryMachine, text.common.minuteShort]);

	const cheapestWash = useMemo(() => {
		const wash = rows.filter((r) => r.kind === "wash" && r.price > 0);
		return wash.length ? Math.min(...wash.map((r) => r.price)) : 0;
	}, [rows]);

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />
			<div className="mx-auto max-w-5xl px-4 md:px-8">
				<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<select
						value={selectedBranchId}
						onChange={(event) => setSelectedBranchId(event.target.value)}
						className="glass-card h-11 w-full max-w-sm rounded-xl px-3 text-sm focus:border-[var(--brand)] focus:outline-none"
					>
						<option value="">{t.chooseBranch}</option>
						{branches.map((branch) => (
							<option key={branch.id} value={branch.id}>
								{branch.name}
							</option>
						))}
					</select>
					<p className="text-sm text-[var(--text-muted)]">
						{t.coinValue} <span className="font-semibold text-[var(--text-primary)]">{formatRupiah(coinValue)}</span>
					</p>
				</div>

				{isLoading || machinesLoading ? (
					<p className="text-sm text-[var(--text-muted)]">{t.loadingMachines}</p>
				) : null}

				{qrisEnabled ? (
					<div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
						<span className="mt-0.5 inline-flex h-5 items-center rounded-full bg-emerald-600 px-2 text-[10px] font-bold uppercase tracking-wide text-white">
							QRIS
						</span>
						<p>{t.noteQris}</p>
					</div>
				) : null}

				<div className="glass-card overflow-hidden rounded-2xl">
					<div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
						<p className="text-sm font-semibold text-[var(--text-primary)]">
							{t.machineHeader} {selectedBranch?.name ?? "MBA Laundry"}
						</p>
						<p className="mt-1 text-xs text-[var(--text-muted)]">
							{cashEnabled && qrisEnabled
								? `${t.noteCash} ${formatRupiah(coinValue)}. ${t.noteQris}`
								: cashEnabled
									? `${t.noteCash} ${formatRupiah(coinValue)}.`
									: t.noteQrisOnly}
						</p>
					</div>

					<div className="overflow-x-auto">
						{rows.length === 0 ? (
							<p className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">
								{machinesLoading ? t.loadingMachines : t.emptyMachines}
							</p>
						) : (
						<table className="w-full min-w-[560px] text-left text-sm">
							<thead className="bg-neutral-50 text-xs uppercase tracking-wider text-[var(--text-muted)] dark:bg-neutral-900">
								<tr>
									<th className="px-5 py-3 font-semibold">{t.machineHeader}</th>
									<th className="px-5 py-3 font-semibold">{t.capacity}</th>
									<th className="px-5 py-3 font-semibold">{t.duration}</th>
									<th className="px-5 py-3 font-semibold">{t.coins}</th>
									{showTunai ? <th className="px-5 py-3 text-right font-semibold">{t.cash}</th> : null}
									{showQris ? <th className="px-5 py-3 text-right font-semibold">{t.qris}</th> : null}
								</tr>
							</thead>
							<tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
								{rows.map((row) => (
									<tr key={row.key}>
										<td className="px-5 py-4">
											<span className="font-semibold text-[var(--text-primary)]">{row.label}</span>
											{row.note ? <span className="block text-xs text-[var(--text-muted)]">{row.note}</span> : null}
										</td>
										<td className="px-5 py-4 text-[var(--text-secondary)]">{row.capacity}</td>
										<td className="px-5 py-4 text-[var(--text-secondary)]">{row.duration}</td>
										<td className="px-5 py-4 text-[var(--text-secondary)]">
											{row.coins ? `${row.coins} ${t.coins}` : "-"}
										</td>
										{showTunai ? (
											<td className="px-5 py-4 text-right font-bold text-[var(--brand)]">
												{formatRupiah(row.coinPrice)}
											</td>
										) : null}
										{showQris ? (
											<td className="px-5 py-4 text-right">
												{row.qrisPrice ? (
													<span className="font-bold text-emerald-600 dark:text-emerald-400">
														{formatRupiah(row.qrisPrice)}
													</span>
												) : (
													<span className="text-[var(--text-muted)]">-</span>
												)}
											</td>
										) : null}
									</tr>
								))}
							</tbody>
						</table>
						)}
					</div>
				</div>

				{cheapestWash > 0 ? (
					<p className="mt-4 text-xs text-[var(--text-muted)]">
						{t.cheapest} <span className="font-semibold">{formatRupiah(cheapestWash)}</span>. {t.cheapestSuffix}
					</p>
				) : null}
			</div>
		</section>
	);
}
