import { Link } from "react-router-dom";
import { usePageContentMap } from "@/hooks/usePageContent";

export function Footer() {
	const { data: pageContents = {} } = usePageContentMap();

	return (
		<footer className="bg-neutral-100 px-6 py-16 text-neutral-700 md:px-12 md:py-[64px] dark:bg-neutral-900 dark:text-neutral-300">
			<div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-16 lg:grid-cols-[2fr_1fr] lg:gap-16">
				{/* COLUMN 1 - BRAND */}
				<div className="flex flex-col">
					<span className="text-[20px] font-bold tracking-widest text-neutral-900 dark:text-white">MBA LAUNDRY EXPRESS</span>
					<p className="mt-3 max-w-[300px] text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400">
						Laundry self-service modern, mesin bersih, harga transparan.
					</p>
					<p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.15em] text-neutral-500 dark:text-neutral-500">
						Bersih itu mudah, cepat, dan terjangkau
					</p>
				</div>
				<div className="flex flex-col">
					<h3 className="text-[14px] font-semibold uppercase tracking-wider text-neutral-900 dark:text-white">Quick Links</h3>
					<ul className="mt-6 flex flex-col gap-3">
						{pageContents.module_cabang !== "false" && (
							<li>
								<Link to="/cabang" className="text-[16px] text-neutral-600 transition-colors hover:text-ruby-600 dark:text-neutral-400 dark:hover:text-ruby-400">
									Lokasi Cabang
								</Link>
							</li>
						)}
						{pageContents.module_promo !== "false" && (
							<li>
								<Link to="/promo" className="text-[16px] text-neutral-600 transition-colors hover:text-ruby-600 dark:text-neutral-400 dark:hover:text-ruby-400">
									Promo Aktif
								</Link>
							</li>
						)}
						{pageContents.module_harga !== "false" && (
							<li>
								<Link to="/harga" className="text-[16px] text-neutral-600 transition-colors hover:text-ruby-600 dark:text-neutral-400 dark:hover:text-ruby-400">
									Daftar Harga
								</Link>
							</li>
						)}
						{pageContents.module_carapakai !== "false" && (
							<li>
								<Link to="/cara-pakai" className="text-[16px] text-neutral-600 transition-colors hover:text-ruby-600 dark:text-neutral-400 dark:hover:text-ruby-400">
									Cara Pakai
								</Link>
							</li>
						)}
						{pageContents.module_blog !== "false" && (
							<li>
								<Link to="/blog" className="text-[16px] text-neutral-600 transition-colors hover:text-ruby-600 dark:text-neutral-400 dark:hover:text-ruby-400">
									Blog Tips
								</Link>
							</li>
						)}
						<li>
							<Link to="/faq" className="text-[16px] text-neutral-600 transition-colors hover:text-ruby-600 dark:text-neutral-400 dark:hover:text-ruby-400">
								FAQ
							</Link>
						</li>
						{pageContents.module_kontak !== "false" && (
							<li>
								<Link to="/kontak" className="text-[16px] text-neutral-600 transition-colors hover:text-ruby-600 dark:text-neutral-400 dark:hover:text-ruby-400">
									Kontak
								</Link>
							</li>
						)}
					</ul>
				</div>
			</div>

			{/* BOTTOM BAR */}
			<div className="mx-auto mt-16 max-w-[1200px] border-t border-neutral-200 pt-8 dark:border-neutral-700">
				<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
					<p className="text-[14px] text-neutral-500 dark:text-neutral-500">© 2026 MBA Laundry Express. All rights reserved.</p>
					<p className="text-[14px] text-neutral-500 dark:text-neutral-500">Tidak ada tautan admin di halaman publik.</p>
				</div>
			</div>
		</footer>
	);
}
