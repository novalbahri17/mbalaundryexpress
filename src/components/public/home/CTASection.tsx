import { Clock, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useBranches } from "@/hooks/useBranches";
import { useSiteSettingsMap } from "@/hooks/useSiteSettings";
import { Button } from "@/design-system";

export function CTASection() {
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const { data: settings = {} } = useSiteSettingsMap();

	const branchCount = branches.length;
	const whatsapp = settings.site_whatsapp || "628123456789";

	return (
		<section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 px-4 py-16 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 sm:px-6 sm:py-20 md:px-12 md:py-32">
			{/* Background Effects */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-ruby-500/10 blur-[80px] sm:h-[400px] sm:w-[400px] md:h-[500px] md:w-[500px]" />
				<div className="absolute bottom-0 right-1/4 h-[250px] w-[250px] rounded-full bg-sapphire-500/10 blur-[70px] sm:h-[300px] sm:w-[300px] md:h-[400px] md:w-[400px]" />
			</div>

			<div className="relative mx-auto max-w-[800px] text-center">
				<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
					<h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
						Yuk, Coba Sekarang!
					</h2>
					<p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-neutral-300 sm:mt-6 sm:text-lg md:text-xl">
						Laundry sendiri lebih hemat dan praktis. Pilih cabang terdekat dan langsung datang rasakan kualitasnya!
					</p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
						className="mt-8 sm:mt-10"
					>
						<a
							href={`https://wa.me/${whatsapp}`}
							target="_blank"
							rel="noreferrer"
							className="inline-block w-full sm:w-auto"
						>
							<Button
								size="lg"
								variant="secondary"
								className="w-full sm:w-auto"
								leftIcon={
									<svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
										<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
									</svg>
								}
							>
								Chat WhatsApp Sekarang
							</Button>
						</a>
					</motion.div>

					{/* Stats */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.4 }}
						className="mt-10 inline-flex flex-wrap items-center justify-center gap-4 rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md sm:mt-12 sm:gap-6 sm:px-8 sm:py-4"
					>
						<div className="flex items-center gap-2 text-white">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 sm:h-10 sm:w-10">
								<MapPin className="h-4 w-4 text-teal-400 sm:h-5 sm:w-5" />
							</div>
							<span className="text-sm font-medium sm:text-base">{branchCount || 0} Cabang</span>
						</div>
						<div className="h-6 w-px bg-white/20 hidden sm:block" />
						<div className="flex items-center gap-2 text-white">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 sm:h-10 sm:w-10">
								<Star className="h-4 w-4 text-amber-400 sm:h-5 sm:w-5" />
							</div>
							<span className="text-sm font-medium sm:text-base">4.9 Rating</span>
						</div>
						<div className="h-6 w-px bg-white/20 hidden sm:block" />
						<div className="flex items-center gap-2 text-white">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-ruby-500/20 sm:h-10 sm:w-10">
								<Clock className="h-4 w-4 text-ruby-400 sm:h-5 sm:w-5" />
							</div>
							<span className="text-sm font-medium sm:text-base">Buka Sampai Malam</span>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
