import { AnimatePresence, motion } from "framer-motion";
import { Gift, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CountdownTimer } from "@/components/public/shared/CountdownTimer";
import { GlassCard } from "@/components/public/shared/GlassCard";
import { SafeImage } from "@/components/public/shared/SafeImage";
import { usePromos } from "@/hooks/usePromos";

const getDailyKey = (): string => {
	const now = new Date();
	const y = now.getFullYear();
	const m = `${now.getMonth() + 1}`.padStart(2, "0");
	const d = `${now.getDate()}`.padStart(2, "0");
	return `mba_popup_${y}${m}${d}`;
};

export function PromoPopup() {
	const { data: promos = [] } = usePromos({ activeOnly: true, showOnHome: true });
	const [open, setOpen] = useState(false);
	const promo = promos[0];
	const storageKey = useMemo(getDailyKey, []);

	useEffect(() => {
		if (!promo) return;
		if (window.localStorage.getItem(storageKey)) return;
		const id = window.setTimeout(() => setOpen(true), 2000);
		return () => window.clearTimeout(id);
	}, [promo, storageKey]);

	if (!promo) return null;

	const closePopup = () => {
		setOpen(false);
		window.localStorage.setItem(storageKey, "1");
	};

	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					initial={{ y: 140, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 140, opacity: 0 }}
					className="fixed inset-x-3 bottom-3 z-50 md:left-auto md:right-6 md:max-w-sm"
				>
					<div className="animated-gradient-border rounded-3xl shadow-brand-glow">
						<GlassCard className="relative rounded-[23px] p-0" hoverable={false}>
							<button
								type="button"
								onClick={closePopup}
								className="absolute right-3 top-3 z-10 rounded-full bg-black/45 p-1.5 text-white"
								aria-label="Tutup popup promo"
							>
								<X className="h-4 w-4" />
							</button>

							<SafeImage
								src={promo.image}
								fallbackLabel={promo.title}
								alt={promo.title}
								className="h-36 w-full rounded-t-[23px] object-cover"
								loading="lazy"
							/>

							<div className="p-4">
								<div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
									<Gift className="h-3.5 w-3.5" />
									Promo Aktif
								</div>
								<p className="pr-8 text-base font-bold text-slate-900 dark:text-slate-100">
									{promo.title}
								</p>
								<CountdownTimer className="mt-2 text-sm" endDate={promo.end_date} />
								<Link
									to="/promo"
									onClick={closePopup}
									className="btn-primary mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold"
								>
									Lihat Promo
								</Link>
							</div>
						</GlassCard>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
