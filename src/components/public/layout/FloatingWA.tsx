import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { usePublicText } from "@/hooks/usePublicText";
import { toWhatsappLink } from "@/utils/format";

export function FloatingWA({ phone }: { phone?: string }) {
	const text = usePublicText();

	return (
		<motion.a
			href={toWhatsappLink(phone ?? "6281234567890", text.floating.waMessage)}
			target="_blank"
			rel="noreferrer"
			whileHover={{ scale: 1.04 }}
			whileTap={{ scale: 0.97 }}
			className="group fixed bottom-24 right-4 z-50 md:bottom-6 md:right-6"
			aria-label={text.floating.ariaLabel}
		>
			<div className="btn-primary grid h-14 w-14 place-items-center rounded-full shadow-card">
				<MessageCircle className="h-6 w-6" />
			</div>
			<span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
				{text.floating.tooltip}
			</span>
		</motion.a>
	);
}
