import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingCTA() {
	const [isVisible, setIsVisible] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [hasScrolled, setHasScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			// Show after scrolling 300px
			const scrolled = window.scrollY > 300;
			setHasScrolled(scrolled);
			setIsVisible(scrolled);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Auto collapse after 5 seconds
	useEffect(() => {
		if (!isExpanded) return;
		const timer = setTimeout(() => setIsExpanded(false), 5000);
		return () => clearTimeout(timer);
	}, [isExpanded]);

	if (!isVisible) return null;

	return (
		<>
			{/* Main Floating Button */}
			<motion.div
				initial={{ opacity: 0, scale: 0.8, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.8, y: 20 }}
				className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
			>
				<AnimatePresence>
					{isExpanded && (
						<motion.div
							initial={{ opacity: 0, y: 10, scale: 0.9 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 10, scale: 0.9 }}
							className="mb-2 flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-2xl dark:bg-neutral-900 dark:border dark:border-neutral-800"
						>
							<Link
								to="/cabang"
								className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-ruby-500 to-ruby-600 px-4 py-3 text-white shadow-lg transition-transform hover:scale-105"
								onClick={() => setIsExpanded(false)}
							>
								<MapPin className="h-5 w-5" />
								<div>
									<p className="text-[13px] font-semibold">Cek Cabang</p>
									<p className="text-[11px] opacity-90">Temukan lokasi terdekat</p>
								</div>
							</Link>
							<a
								href="https://wa.me/6281234567890?text=Halo%20MBA%20Laundry%2C%20saya%20ingin%20bertanya"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3 text-white shadow-lg transition-transform hover:scale-105"
								onClick={() => setIsExpanded(false)}
							>
								<MessageCircle className="h-5 w-5" />
								<div>
									<p className="text-[13px] font-semibold">Chat WhatsApp</p>
									<p className="text-[11px] opacity-90">Respon cepat 24 jam</p>
								</div>
							</a>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Toggle Button */}
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => setIsExpanded(!isExpanded)}
					className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all ${
						isExpanded 
							? "bg-neutral-800 text-white dark:bg-white dark:text-neutral-900" 
							: "bg-gradient-to-r from-ruby-500 to-ruby-600 text-white"
						}`}
				>
					{isExpanded ? (
						<X className="h-6 w-6" />
					) : (
						<div className="relative">
							<MapPin className="h-6 w-6" />
							{/* Pulse animation */}
							<span className="absolute -right-1 -top-1 flex h-3 w-3">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
								<span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
							</span>
						</div>
					)}
				</motion.button>
			</motion.div>

			{/* Scroll Progress Indicator */}
			{hasScrolled && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="fixed left-0 top-0 z-50 h-1 bg-gradient-to-r from-ruby-500 via-sapphire-500 to-teal-500"
					style={{
						width: `${(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%`,
					}}
				/>
			)}
		</>
	);
}
