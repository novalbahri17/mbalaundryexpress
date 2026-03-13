import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { getFaqs } from "@/api/faqs.api";

export function FAQSection() {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const { data: faqs = [], isLoading } = useQuery({
		queryKey: ["home-faqs"],
		queryFn: () => getFaqs({ activeOnly: true }),
	});

	const filteredFaq = faqs.filter(
		(item) =>
			item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const toggleFaq = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section className="bg-white px-6 py-24 md:px-12 md:py-32 dark:bg-neutral-950">
			<div className="mx-auto flex max-w-[800px] flex-col items-center">
				{/* HEADER */}
				<span className="rounded-full bg-ruby-500 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white">
					FAQ
				</span>
				<h2 className="mt-3 text-center text-[32px] font-bold leading-[1.2] text-neutral-900 md:text-[40px] dark:text-white">
					Pertanyaan yang paling sering ditanyakan
				</h2>

				{/* SEARCH BAR */}
				<div className="mt-10 w-full max-w-[600px]">
					<div className="relative flex w-full items-center">
						<Search className="absolute left-4 h-5 w-5 text-neutral-500 dark:text-neutral-400" />
						<input
							type="text"
							placeholder="Cari pertanyaan..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-[12px] border-2 border-neutral-200 bg-neutral-50 py-[14px] pl-[44px] pr-[20px] text-[16px] text-neutral-900 placeholder-neutral-500 outline-none transition-all focus:border-ruby-500 focus:bg-white focus:shadow-[0_0_8px_rgba(239,83,80,0.2)] dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder-neutral-400 dark:focus:bg-neutral-900"
						/>
					</div>
				</div>

				{/* ACCORDION */}
				<div className="mt-12 flex w-full flex-col gap-4">
					{isLoading ? (
						<p className="text-center text-neutral-500 dark:text-neutral-400">Memuat FAQ...</p>
					) : filteredFaq.length > 0 ? (
						filteredFaq.map((item, index) => {
							const isOpen = openIndex === index;
							return (
								<div
									key={item.id}
									className={`overflow-hidden rounded-[12px] transition-all duration-300 ${
										isOpen
											? "border-2 border-ruby-500 bg-ruby-50"
											: "border border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
									}`}
								>
									<button
										type="button"
										onClick={() => toggleFaq(index)}
										className="flex w-full items-center justify-between px-6 py-5 text-left"
									>
										<span className="text-[18px] font-semibold text-neutral-900 dark:text-white">{item.question}</span>
										<ChevronDown
											className={`h-6 w-6 shrink-0 text-neutral-500 transition-transform duration-300 ${
												isOpen ? "rotate-180" : ""
											}`}
										/>
									</button>
									<div
										className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
											isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
										}`}
									>
										<div className="overflow-hidden">
											<div
												className="prose prose-sm border-t border-ruby-100 px-6 pb-6 pt-4 text-[16px] leading-[1.75] text-neutral-600 prose-p:my-1 dark:border-ruby-900/30 dark:text-neutral-300"
												// biome-ignore lint/security/noDangerouslySetInnerHtml: FAQ content from dashboard may contain safe HTML tags
												dangerouslySetInnerHTML={{ __html: item.answer }}
											/>
										</div>
									</div>
								</div>
							);
						})
					) : (
						<p className="text-center text-neutral-500 dark:text-neutral-400">Pertanyaan tidak ditemukan.</p>
					)}
				</div>

				{/* BOTTOM CTA */}
				<div className="mt-12 flex flex-col items-center">
					<p className="text-[16px] text-neutral-500 dark:text-neutral-400">Masih ada pertanyaan?</p>
					<a
						href="https://wa.me/628123456789"
						target="_blank"
						rel="noreferrer"
						className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ruby-600 to-ruby-500 px-7 py-[14px] text-[16px] font-semibold text-white shadow-[0_4px_12px_rgba(239,83,80,0.3)] transition-all hover:scale-105"
					>
						<svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-label="WhatsApp" role="img">
							<title>WhatsApp</title>
							<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
						</svg>
						Hubungi Tim Support
					</a>
				</div>
			</div>
		</section>
	);
}
