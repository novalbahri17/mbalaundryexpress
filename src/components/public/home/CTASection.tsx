import { Clock, MapPin, Star } from "lucide-react";
import { useBranches } from "@/hooks/useBranches";
import { useSiteSettingsMap } from "@/hooks/useSiteSettings";

export function CTASection() {
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const { data: settings = {} } = useSiteSettingsMap();

	const branchCount = branches.length;
	const whatsapp = settings.site_whatsapp || "628123456789";

	return (
		<section className="w-full bg-gradient-to-br from-[#1a1012] to-[#0d1421] px-6 py-24 md:px-12 md:py-32">
			<div className="mx-auto flex max-w-[800px] flex-col items-center text-center">
				<h2 className="text-[40px] font-bold leading-[1.2] text-white md:text-[56px] lg:text-[64px]">
					Yuk, Coba Sekarang!
				</h2>
				<p className="mt-6 text-[18px] leading-[1.8] text-white/70 md:text-[20px]">
					Laundry sendiri lebih hemat dan praktis. Pilih cabang terdekat dan langsung datang rasakan kualitasnya!
				</p>

				<a
					href={`https://wa.me/${whatsapp}`}
					target="_blank"
					rel="noreferrer"
					className="mt-10 inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-10 py-[18px] text-[18px] font-bold text-ruby-600 shadow-2xl transition-all hover:scale-105 hover:bg-ruby-50 hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
				>
					<svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
						<title>WhatsApp Icon</title>
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
					</svg>
					Chat WhatsApp Sekarang
				</a>

				<div className="mt-12 flex flex-wrap items-center justify-center gap-8 rounded-full border border-white/10 bg-white/5 py-3 px-8 backdrop-blur-md">
					<div className="flex items-center gap-2 text-white">
						<MapPin className="h-5 w-5 text-teal-400" />
						<span className="text-[15px] font-medium">{branchCount || 0} Cabang Aktif</span>
					</div>
					<div className="h-4 w-px bg-white/20 hidden md:block" />
					<div className="flex items-center gap-2 text-white">
						<Star className="h-5 w-5 fill-amber-400 text-amber-400" />
						<span className="text-[15px] font-medium">4.9★ Rating</span>
					</div>
					<div className="h-4 w-px bg-white/20 hidden md:block" />
					<div className="flex items-center gap-2 text-white">
						<Clock className="h-5 w-5 text-ruby-400" />
						<span className="text-[15px] font-medium">Buka Sampai Malam</span>
					</div>
				</div>
			</div>
		</section>
	);
}
