import { Clock, Droplet, MapPin, Tag } from "lucide-react";
import { useLandingText } from "@/hooks/useLandingText";
import { cn } from "@/utils";

export function WhyUsSection() {
	const { values: landing } = useLandingText();

	const features = [
		{
			key: "price",
			title: landing.landing_why_price_title,
			desc: landing.landing_why_price_desc,
			icon: Tag,
			bgClass: "bg-ruby-100 dark:bg-ruby-900/30",
			iconClass: "text-ruby-500 dark:text-ruby-400",
			gridClass: "md:col-span-2 md:row-span-1",
		},
		{
			key: "clean",
			title: landing.landing_why_clean_title,
			desc: landing.landing_why_clean_desc,
			icon: Droplet,
			bgClass: "bg-sapphire-100 dark:bg-sapphire-900/30",
			iconClass: "text-sapphire-500 dark:text-sapphire-400",
			gridClass: "md:col-span-1 md:row-span-2",
		},
		{
			key: "fast",
			title: landing.landing_why_fast_title,
			desc: landing.landing_why_fast_desc,
			icon: Clock,
			bgClass: "bg-amber-100 dark:bg-amber-900/30",
			iconClass: "text-amber-500 dark:text-amber-400",
			gridClass: "md:col-span-1 md:row-span-1",
		},
		{
			key: "location",
			title: landing.landing_why_location_title,
			desc: landing.landing_why_location_desc,
			icon: MapPin,
			bgClass: "bg-teal-100 dark:bg-teal-900/30",
			iconClass: "text-teal-500 dark:text-teal-400",
			gridClass: "md:col-span-1 md:row-span-1",
		},
	];

	return (
		<section className="section-block bg-neutral-50 dark:bg-neutral-900">
			<div className="section-inner flex flex-col items-center">
				{/* HEADER */}
				<p className="section-kicker">{landing.landing_why_kicker}</p>
				<h2 className="section-title text-center">{landing.landing_why_title}</h2>

				{/* CONTENT */}
				<div className="mt-14 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
					{features.map((item) => {
						const Icon = item.icon;
						return (
							<div
								key={item.key}
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
