import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Clock3,
	Facebook,
	Instagram,
	MapPin,
	MessageCircle,
	Music2,
	Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getBranchHoursByDay } from "@/api/branches.api";
import { BrandLogo } from "@/components/public/layout/BrandLogo";
import { useBranches } from "@/hooks/useBranches";
import { usePageContentMap } from "@/hooks/usePageContent";
import type { BranchHour } from "@/types/database.types";
import { dayNameId, sanitizeUrl, toWhatsappLink } from "@/utils/format";

const quickLinks = [
	{ to: "/cabang", label: "Lokasi Cabang" },
	{ to: "/promo", label: "Promo Aktif" },
	{ to: "/harga", label: "Daftar Harga" },
	{ to: "/cara-pakai", label: "Cara Pakai" },
	{ to: "/blog", label: "Blog Tips" },
	{ to: "/faq", label: "FAQ" },
	{ to: "/kontak", label: "Kontak" },
];

export function Footer() {
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const { data: contentMap = {} } = usePageContentMap();
	const today = dayNameId() as BranchHour["day"];

	const { data: todayHours = [] } = useQuery({
		queryKey: ["footer-branch-hours", today],
		queryFn: () => getBranchHoursByDay(today),
	});

	const hoursMap = useMemo(() => new Map(todayHours.map((hour) => [hour.branch_id, hour])), [todayHours]);

	const socials = [
		{ key: "social_instagram", icon: Instagram, url: contentMap.social_instagram, label: "Instagram" },
		{ key: "social_tiktok", icon: Music2, url: contentMap.social_tiktok, label: "TikTok" },
		{ key: "social_facebook", icon: Facebook, url: contentMap.social_facebook, label: "Facebook" },
		{ key: "social_youtube", icon: Youtube, url: contentMap.social_youtube, label: "YouTube" },
	]
		.map((item) => ({ ...item, safeUrl: sanitizeUrl(item.url) }))
		.filter((item) => Boolean(item.safeUrl));

	return (
		<footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-[#0A0A0F] text-slate-300">
			<div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-brand-500/20 blur-[100px]" />
			<div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-sapphire-500/20 blur-[120px]" />

			<div className="section-wrap relative z-10 pb-10 pt-16">
				<div className="grid gap-12 lg:grid-cols-12">
					<div className="lg:col-span-4">
						<BrandLogo />
						<p className="mt-6 max-w-md text-sm leading-7 text-slate-300/80">
							{contentMap.footer_desc ||
								"Laundry self-service modern dengan mesin bersih, harga transparan, dan proses cepat untuk gaya hidup aktif."}
						</p>
						<p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
							{contentMap.footer_tagline || "Bersih Itu Mudah, Cepat, dan Terjangkau"}
						</p>
						<div className="mt-7 flex flex-wrap items-center gap-2.5">
							{socials.map((social) => {
								const Icon = social.icon;
								return (
									<a
										key={social.key}
										href={social.safeUrl}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={social.label}
										className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/5 text-slate-200 transition hover:-translate-y-0.5 hover:border-brand-400/40 hover:bg-brand-500/20"
									>
										<Icon className="h-[17px] w-[17px]" />
									</a>
								);
							})}
						</div>
					</div>

					<div className="lg:col-span-6">
						<h4 className="mb-5 text-sm font-extrabold uppercase tracking-[0.16em] text-slate-200">
							Cabang Aktif
						</h4>
						<div className="grid gap-4 sm:grid-cols-2">
							{branches.map((branch) => {
								const todayHour = hoursMap.get(branch.id);
								const hourText = todayHour?.is_closed
									? "Tutup hari ini"
									: `${todayHour?.open_time ?? "08:00"} - ${todayHour?.close_time ?? "22:00"}`;
								return (
									<div
										key={branch.id}
										className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
									>
										<p className="text-sm font-bold text-white">
											<Link to={`/cabang/${branch.slug}`} className="hover:text-brand-300">
												{branch.name}
											</Link>
										</p>
										<p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-300/85">
											{branch.address}
										</p>
										<div className="mt-3 space-y-1.5 text-xs">
											<p className="flex items-center gap-2 text-slate-300/90">
												<Clock3 className="h-3.5 w-3.5 text-brand-300" />
												{hourText}
											</p>
											{branch.whatsapp ? (
												<a
													href={toWhatsappLink(branch.whatsapp)}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 text-slate-300/90 transition hover:text-brand-300"
												>
													<MessageCircle className="h-3.5 w-3.5 text-brand-300" />
													{branch.whatsapp}
												</a>
											) : null}
											<p className="flex items-center gap-2 text-slate-400">
												<MapPin className="h-3.5 w-3.5" />
												Detail cabang tersedia
											</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<div className="lg:col-span-2">
						<h4 className="mb-5 text-sm font-extrabold uppercase tracking-[0.16em] text-slate-200">
							Quick Links
						</h4>
						<ul className="space-y-3">
							{quickLinks.map((link) => (
								<li key={link.to}>
									<Link
										to={link.to}
										className="text-sm text-slate-300/90 transition hover:pl-1 hover:text-brand-300"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

				<div className="mt-5 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
					<p>© {new Date().getFullYear()} MBA Laundry Express. All rights reserved.</p>
					<p>Tidak ada tautan admin di halaman publik.</p>
				</div>
			</div>
		</footer>
	);
}
