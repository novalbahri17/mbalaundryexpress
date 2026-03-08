import { Link } from "react-router-dom";

export function Footer() {
	return (
		<footer className="bg-[#0a0a0a] px-6 py-16 md:px-12 md:py-[64px]">
			<div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-16 lg:grid-cols-[2fr_1fr] lg:gap-16">
				{/* COLUMN 1 - BRAND */}
				<div className="flex flex-col">
					<span className="text-[20px] font-bold tracking-widest text-white">MBA LAUNDRY EXPRESS</span>
					<p className="mt-3 max-w-[300px] text-[14px] leading-relaxed text-[#a3a3a3]">
						Laundry self-service modern, mesin bersih, harga transparan.
					</p>
					<p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#737373]">
						Bersih itu mudah, cepat, dan terjangkau
					</p>
				</div>
				<div className="flex flex-col">
					<h3 className="text-[14px] font-semibold uppercase tracking-wider text-white">Quick Links</h3>
					<ul className="mt-6 flex flex-col gap-3">
						<li>
							<Link to="/cabang" className="text-[16px] text-[#a3a3a3] transition-colors hover:text-white">
								Lokasi Cabang
							</Link>
						</li>
						<li>
							<Link to="/promo" className="text-[16px] text-[#a3a3a3] transition-colors hover:text-white">
								Promo Aktif
							</Link>
						</li>
						<li>
							<Link to="/harga" className="text-[16px] text-[#a3a3a3] transition-colors hover:text-white">
								Daftar Harga
							</Link>
						</li>
						<li>
							<Link to="/cara-pakai" className="text-[16px] text-[#a3a3a3] transition-colors hover:text-white">
								Cara Pakai
							</Link>
						</li>
						<li>
							<Link to="/blog" className="text-[16px] text-[#a3a3a3] transition-colors hover:text-white">
								Blog Tips
							</Link>
						</li>
						<li>
							<Link to="/faq" className="text-[16px] text-[#a3a3a3] transition-colors hover:text-white">
								FAQ
							</Link>
						</li>
						<li>
							<Link to="/kontak" className="text-[16px] text-[#a3a3a3] transition-colors hover:text-white">
								Kontak
							</Link>
						</li>
					</ul>
				</div>
			</div>

			{/* BOTTOM BAR */}
			<div className="mx-auto mt-16 max-w-[1200px] border-t border-[#262626] pt-8">
				<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
					<p className="text-[14px] text-[#737373]">© 2026 MBA Laundry Express. All rights reserved.</p>
					<p className="text-[14px] text-[#737373]">Tidak ada tautan admin di halaman publik.</p>
				</div>
			</div>
		</footer>
	);
}
