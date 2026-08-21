import { Droplet, MapPin, Tag, Zap } from "lucide-react";
import { cn } from "@/utils";

const features = [
	{
		title: "Harga Transparan",
		desc: "Tidak ada biaya tambahan. Tarif per layanan tampil jelas dan selalu update.",
		icon: Tag,
		bgClass: "bg-ruby-100 dark:bg-ruby-900/30",
		iconClass: "text-ruby-500 dark:text-ruby-400",
		gridClass: "md:col-span-2 md:row-span-1",
	},
	{
		title: "Mesin Selalu Bersih",
		desc: "Perawatan rutin harian dengan standar kebersihan tinggi untuk setiap drum mesin.",
		icon: Droplet,
		bgClass: "bg-sapphire-100 dark:bg-sapphire-900/30",
		iconClass: "text-sapphire-500 dark:text-sapphire-400",
		gridClass: "md:col-span-1 md:row-span-2",
	},
	{
		title: "Proses Super Cepat",
		desc: "Siklus cuci dan kering yang efisien untuk jadwal harian yang padat.",
		icon: Zap,
		bgClass: "bg-amber-100 dark:bg-amber-900/30",
		iconClass: "text-amber-500 dark:text-amber-400",
		gridClass: "md:col-span-1 md:row-span-1",
	},
	{
		title: "Lokasi Strategis",
		desc: "Dekat area kampus, kos, dan pusat aktivitas agar laundry makin praktis.",
		icon: MapPin,
		bgClass: "bg-teal-100 dark:bg-teal-900/30",
		iconClass: "text-teal-500 dark:text-teal-400",
		gridClass: "md:col-span-1 md:row-span-1",
	},
];

export function WhyUsSection() {
	return (
		<section className="bg-gradient-to-b from-neutral-50 to-white px-6 py-24 md:px-12 md:py-32 dark:from-neutral-900 dark:to-neutral-950">
			<div className="mx-auto flex max-w-[1200px] flex-col items-center">
				{/* HEADER */}
				<span className="rounded-full bg-teal-500 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-white">
					Keunggulan
				</span>
				<h2 className="mt-3 text-center text-[32px] font-bold leading-[1.2] text-neutral-900 md:text-[40px] dark:text-white">
					Kenapa Pilih MBA Laundry?
				</h2>

				{/* CONTENT */}
				<div className="mt-16 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
					{features.map((item) => {
						const Icon = item.icon;
						return (
							<div
								key={item.title}
								className={cn(
									"group flex flex-col rounded-[24px] border border-neutral-200 bg-white p-8 transition-all duration-250 hover:-translate-y-[2px] hover:border-ruby-500 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800",
									item.gridClass,
								)}
							>
								<div className={cn("flex h-[64px] w-[64px] items-center justify-center rounded-full", item.bgClass)}>
									<Icon className={cn("h-[32px] w-[32px]", item.iconClass)} />
								</div>
								<h3 className="mt-5 text-[20px] font-semibold text-neutral-900 dark:text-white">{item.title}</h3>
								<p className="mt-3 text-[16px] leading-[1.75] text-neutral-600 dark:text-neutral-300">{item.desc}</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
