import { useQuery } from "@tanstack/react-query";
import { getAllBranchMachines, getBranchMachines } from "@/api/branches.api";
import type { BranchMachine, MachineKind } from "@/types/database.types";

export const BRANCH_MACHINES_QUERY_KEY = "branch_machines";

/** Mesin untuk satu cabang. */
export const useBranchMachines = (branchId?: string) =>
	useQuery({
		queryKey: [BRANCH_MACHINES_QUERY_KEY, branchId ?? "all"],
		queryFn: () => getBranchMachines(branchId),
		staleTime: 60_000,
	});

/** Semua mesin, dipakai halaman listing supaya tidak query per cabang. */
export const useAllBranchMachines = () =>
	useQuery({
		queryKey: [BRANCH_MACHINES_QUERY_KEY, "*"],
		queryFn: getAllBranchMachines,
		staleTime: 60_000,
	});

export type MachineGroup = {
	key: string;
	kind: MachineKind;
	capacity_min: number;
	capacity_max: number;
	coins: number;
	duration_min: number;
	duration_max: number;
	/** Harga QRIS terkecil untuk grup ini (null kalau tidak ada). */
	qris_price: number | null;
	note?: string;
};

/** Cabang ini menampilkan tarif QRIS? */
export function isQrisEnabled(branch?: { qris_enabled?: boolean } | null): boolean {
	return Boolean(branch?.qris_enabled);
}

/** Cabang ini menerima pembayaran tunai / coin? (default aktif kalau kolomnya kosong) */
export function isCashEnabled(branch?: { cash_enabled?: boolean } | null): boolean {
	return branch?.cash_enabled !== false;
}

/**
 * Harga efektif satu baris mesin.
 * Kalau QRIS aktif dan mesin punya harga QRIS, pakai itu; kalau tidak, coin × harga coin.
 */
export function effectivePrice(
	machine: { qris_price?: number | null; coins: number },
	coinValue: number,
	qrisEnabled: boolean,
): number {
	if (qrisEnabled && machine.qris_price && machine.qris_price > 0) return machine.qris_price;
	return machine.coins * coinValue;
}

/** Kapasitas ditulis "17kg" kalau min = max, kalau tidak "7-10kg". */
export function formatCapacity(min: number, max: number): string {
	if (!min && !max) return "-";
	return min === max ? `${min}kg` : `${min}-${max}kg`;
}

/**
 * Durasi "25 menit" kalau rentangnya kosong/sama, kalau tidak "24-45 menit".
 *
 * `unit` bisa diisi kalau halaman sedang berbahasa Inggris. Nilainya
 * dipanggil dari `usePublicText().common.minuteShort`, bukan di-hardcode,
 * supaya hook ini tetap bebas dari store bahasa.
 */
export function formatDuration(min: number, max: number, unit = "menit"): string {
	if (!min && !max) return "-";
	if (!max || min === max) return `${min} ${unit}`;
	return `${min}-${max} ${unit}`;
}

/**
 * Satu baris tabel per tipe mesin.
 * Mesin dengan kapasitas & durasi sama digabung, jadi data lama
 * (7-10kg, 25-33 menit) tetap tampil sebagai satu entri.
 */
export function groupMachines(machines: BranchMachine[]): MachineGroup[] {
	const map = new Map<string, MachineGroup>();
	for (const m of machines) {
		const key = [m.kind, m.capacity_min, m.capacity_max, m.duration_min, m.duration_max].join("|");
		const existing = map.get(key);
		if (existing) {
			// Ambil coin terkecil supaya tidak menampilkan harga yang lebih mahal.
			existing.coins = Math.min(existing.coins, m.coins);
			const price = m.qris_price ?? null;
			if (price && price > 0) {
				existing.qris_price =
					existing.qris_price && existing.qris_price > 0 ? Math.min(existing.qris_price, price) : price;
			}
			continue;
		}
		map.set(key, {
			key,
			kind: m.kind,
			capacity_min: m.capacity_min,
			capacity_max: m.capacity_max,
			coins: m.coins,
			duration_min: m.duration_min,
			duration_max: m.duration_max,
			qris_price: m.qris_price && m.qris_price > 0 ? m.qris_price : null,
			note: m.note,
		});
	}
	return Array.from(map.values()).sort((a, b) =>
		a.kind === b.kind ? a.capacity_min - b.capacity_min : a.kind === "wash" ? -1 : 1,
	);
}
