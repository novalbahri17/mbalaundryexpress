import { useEffect } from "react";
import { toast } from "sonner";
import { usePromos } from "@/hooks/usePromos";

export function PromoToastNotice() {
	const { data: promos = [] } = usePromos({ activeOnly: true, showOnHome: true });

	useEffect(() => {
		const promo = promos[0];
		if (!promo) return;
		const key = `promo-toast-${new Date().toISOString().slice(0, 10)}`;
		if (window.sessionStorage.getItem(key) === "1") return;
		const timeout = window.setTimeout(() => {
			toast.info(`Promo aktif: ${promo.title}`, {
				description: "Cek detail promo terbaru di section Promo.",
				duration: 3500,
			});
			window.sessionStorage.setItem(key, "1");
		}, 1800);
		return () => window.clearTimeout(timeout);
	}, [promos]);

	return null;
}
