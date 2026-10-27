import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFaqs } from "@/api/faqs.api";
import { PageHeader } from "@/components/public/shared/PageHeader";
import { usePublicText } from "@/hooks/usePublicText";

const categories = ["harga", "mesin", "waktu", "pembayaran", "keamanan", "barang-hilang", "umum"] as const;

export default function FaqPage() {
	const text = usePublicText();
	const t = text.pages.faq;
	const [category, setCategory] = useState<(typeof categories)[number] | "all">("all");
	const [openId, setOpenId] = useState<string | null>(null);
	const { data: faqs = [], isLoading } = useQuery({
		queryKey: ["faqs", category],
		queryFn: () => getFaqs({ activeOnly: true, category: category === "all" ? undefined : category }),
	});

	const grouped = useMemo(() => {
		if (category !== "all") return [{ category, items: faqs }];
		return categories.map((key) => ({
			category: key,
			items: faqs.filter((item) => item.category === key),
		}));
	}, [category, faqs]);

	return (
		<section className="pb-20">
			<PageHeader kicker={t.kicker} title={t.title} highlight={t.highlight} description={t.description} />
			<div className="mx-auto max-w-5xl px-4 md:px-8">
				<div className="mb-6 flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => setCategory("all")}
						className={`rounded-full px-4 py-2 text-xs font-semibold ${category === "all" ? "bg-ruby-700 text-white" : "glass-card"}`}
					>
						{t.all}
					</button>
					{categories.map((key) => (
						<button
							key={key}
							type="button"
							onClick={() => setCategory(key)}
							className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${category === key ? "bg-ruby-700 text-white" : "glass-card"}`}
						>
							{t.categories[key]}
						</button>
					))}
				</div>
				{isLoading ? <p className="text-sm text-[var(--text-muted)]">{t.loading}</p> : null}
				{grouped.map((group) => (
					<div key={group.category} className="mb-6">
						<h2 className="mb-3 text-lg font-bold capitalize">{t.categories[group.category as (typeof categories)[number]] ?? group.category}</h2>
						<div className="space-y-2">
							{group.items.map((item) => {
								const open = openId === item.id;
								return (
									<div key={item.id} className="glass-card rounded-xl">
										<button
											type="button"
											onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
											className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold text-neutral-900 dark:text-neutral-50"
										>
											<span>{item.question}</span>
											<span className="text-neutral-500 dark:text-neutral-300">{open ? "-" : "+"}</span>
										</button>
										{open ? (
											<div className="border-t border-slate-200 px-4 py-3 text-sm text-[var(--text-muted)] dark:border-neutral-700">
												{item.answer}
											</div>
										) : null}
									</div>
								);
							})}
						</div>
						{group.items.length === 0 ? <p className="mt-2 text-sm text-[var(--text-muted)]">{t.empty}</p> : null}
					</div>
				))}
			</div>
		</section>
	);
}
