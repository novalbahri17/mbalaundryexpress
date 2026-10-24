import { Input, Segmented } from "antd";
import { useMemo, useState } from "react";
import {
	FACILITY_ICON_CATEGORIES,
	FACILITY_ICONS,
	type FacilityIconCategory,
	type FacilityIconOption,
} from "@/lib/facility-icons";

type Props = {
	/** Nilai dari Form.Item (nama kolom `icon`). */
	value?: string;
	onChange?: (value: string) => void;
};

type FilterKey = FacilityIconCategory | "Semua";

/** Cocokkan kata kunci ke label, nama ikon, dan kategori. */
function matches(option: FacilityIconOption, query: string): boolean {
	const q = query.trim().toLowerCase();
	if (!q) return true;
	const haystack = `${option.label} ${option.value} ${option.category}`.toLowerCase();
	return q.split(/\s+/).every((token) => haystack.includes(token));
}

/**
 * Picker ikon fasilitas: kotak pencarian + filter kategori + grid scrollable,
 * supaya admin tidak perlu menghafal nama ikon.
 */
export function FacilityIconPicker({ value, onChange }: Props) {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<FilterKey>("Semua");

	const results = useMemo(() => {
		return FACILITY_ICONS.filter((option) => {
			if (filter !== "Semua" && option.category !== filter) return false;
			return matches(option, query);
		});
	}, [query, filter]);

	/** Dikelompokkan per kategori supaya tetap mudah dibaca. */
	const grouped = useMemo(() => {
		const map = new Map<FacilityIconCategory, FacilityIconOption[]>();
		for (const option of results) {
			const list = map.get(option.category) ?? [];
			list.push(option);
			map.set(option.category, list);
		}
		return [...map.entries()];
	}, [results]);

	const selected = FACILITY_ICONS.find((option) => option.value === value);

	const handlePick = (optionValue: string) => {
		onChange?.(value === optionValue ? "" : optionValue);
	};

	const renderTile = (option: FacilityIconOption) => {
		const Icon = option.icon;
		const active = value === option.value;
		return (
			<button
				key={option.value}
				type="button"
				onClick={() => handlePick(option.value)}
				aria-pressed={active}
				title={option.label}
				className={`flex flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2.5 text-center transition ${
					active
						? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)] shadow-sm"
						: "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand)]/50 hover:text-[var(--text)]"
				}`}
			>
				<Icon className="h-5 w-5" />
				<span className="line-clamp-2 text-[10px] leading-tight">{option.label}</span>
			</button>
		);
	};

	return (
		<div className="space-y-3">
			<Input.Search
				allowClear
				placeholder="Cari ikon… mis. cuci, parkir, wifi, kopi"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
				className="form-input"
			/>

			<div className="-mx-1 overflow-x-auto px-1 pb-1">
				<Segmented<FilterKey>
					size="small"
					value={filter}
					onChange={(next) => setFilter(next)}
					options={["Semua", ...FACILITY_ICON_CATEGORIES]}
				/>
			</div>

			<div className="max-h-[280px] overflow-y-auto rounded-xl border border-[var(--border)] p-2">
				{results.length === 0 ? (
					<p className="py-8 text-center text-sm text-[var(--text-muted)]">
						Ikon tidak ditemukan. Coba kata kunci lain.
					</p>
				) : (
					grouped.map(([category, options]) => (
						<div key={category} className="mb-3 last:mb-0">
							<p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
								{category}
							</p>
							<div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">{options.map(renderTile)}</div>
						</div>
					))
				)}
			</div>

			<p className="text-xs text-[var(--text-muted)]">
				{selected ? (
					<>
						Dipilih: <span className="font-semibold text-[var(--brand)]">{selected.label}</span>. Klik lagi untuk
						membatalkan.
					</>
				) : (
					`${FACILITY_ICONS.length} ikon tersedia. Kalau tidak dipilih, ikon ditebak dari nama fasilitas.`
				)}
			</p>
		</div>
	);
}
