import { motion } from "framer-motion";
import { ShieldCheck, Star, Truck } from "lucide-react";
import { Container, Heading, Section } from "@/components/ui";
import { useBranches } from "@/hooks/useBranches";
import { usePageContentMap } from "@/hooks/usePageContent";

const partnerLogos = ["CampusHub", "KosConnect", "OfficeHub", "FamilyCare", "ExpressGo"];

export function TrustBadges() {
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const { data: content = {} } = usePageContentMap();

	return (
		<Section size="sm">
			<Container size="xl">
				<div className="grid gap-6 rounded-glass-lg border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-[1.1fr_0.9fr]">
					<div>
						<p className="text-caption font-semibold uppercase tracking-[0.14em] text-neutral-500">Trusted by local community</p>
						<Heading variant="h3" className="mt-2">
							Dipercaya ribuan pelanggan setiap minggu
						</Heading>
						<div className="mt-4 flex flex-wrap gap-2">
							{partnerLogos.map((logo) => (
								<motion.span
									key={logo}
									whileHover={{ y: -4 }}
									className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
								>
									{logo}
								</motion.span>
							))}
						</div>
					</div>

					<div className="grid grid-cols-3 gap-3">
						<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
							<Star className="h-4 w-4 text-amber-500" aria-hidden />
							<p className="mt-2 text-lg font-extrabold text-neutral-900 dark:text-white">
								{Number(content.stats_rating ?? 4.9).toFixed(1)} star
							</p>
							<p className="text-xs text-neutral-500">Rating</p>
						</div>
						<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
							<Truck className="h-4 w-4 text-sapphire-500" aria-hidden />
							<p className="mt-2 text-lg font-extrabold text-neutral-900 dark:text-white">3 Jam</p>
							<p className="text-xs text-neutral-500">Express</p>
						</div>
						<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800">
							<ShieldCheck className="h-4 w-4 text-teal-500" aria-hidden />
							<p className="mt-2 text-lg font-extrabold text-neutral-900 dark:text-white">{branches.length}+</p>
							<p className="text-xs text-neutral-500">Cabang</p>
						</div>
					</div>
				</div>
			</Container>
		</Section>
	);
}
