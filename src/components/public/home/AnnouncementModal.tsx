import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Wrench, Sparkles } from "lucide-react";
import { usePageContentMap } from "@/hooks/usePageContent";
import { useUserInfo } from "@/store/userStore";
import dayjs from "dayjs";

export type AnnouncementType = "info" | "promo" | "libur" | "maintenance";

export interface AnnouncementCardProps {
	text: string;
	image?: string;
	type?: AnnouncementType;
	endDate?: dayjs.Dayjs | null;
	userName?: string;
	onClose?: () => void;
}

// Convert newline to <br/> properly outside since dangerouslySetInnerHTML ignores regular newlines unless styled with pre
const formatText = (text: string, userName: string) => {
	// Replaces '{Nama Pelanggan}' with actual user name, then converts newlines to <br/>
	let parsed = text.replace(/{Nama Pelanggan}/gi, userName || "Pelanggan Setia");
	parsed = parsed.replace(/\n/g, "<br/>");
	return parsed;
}

export function AnnouncementCard({ text, image, type = "info", endDate, userName = "", onClose }: AnnouncementCardProps) {
	const [timeLeft, setTimeLeft] = useState<string>("");

	useEffect(() => {
		if (!endDate || (type !== "libur" && type !== "maintenance")) return;

		const calculateTime = () => {
			const now = dayjs();
			if (now.isAfter(endDate)) {
				setTimeLeft("");
				return;
			}
			const totalHours = endDate.diff(now, "hour");
			const days = Math.floor(totalHours / 24);
			const hours = totalHours % 24;
			const mins = endDate.diff(now, "minute") % 60;
			setTimeLeft(`${days > 0 ? `${days} Hari ` : ""}${hours} Jam ${mins} Menit`);
		};

		calculateTime();
		const timer = setInterval(calculateTime, 60000); // update every minute
		return () => clearInterval(timer);
	}, [endDate, type]);
	const config = {
		info: {
			gradient: "from-sky-500 to-blue-600",
			iconColor: "text-sky-500",
			buttonBg: "bg-sky-500 shadow-sky-500/25",
			Icon: (props: any) => (
				<motion.svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					{...props}
					animate={{ rotate: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0] }}
					transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
				>
					<title>Lonceng Animasi</title>
					<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
					<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
				</motion.svg>
			),
		},
		promo: {
			gradient: "from-amber-400 to-yellow-500",
			iconColor: "text-amber-500",
			buttonBg: "bg-amber-500 shadow-amber-500/25",
			Icon: (props: any) => (
				<motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
					<Sparkles {...props} />
				</motion.div>
			),
		},
		libur: {
			gradient: "from-ruby-600 to-ruby-400",
			iconColor: "text-ruby-500",
			buttonBg: "bg-ruby-500 shadow-ruby-500/25",
			Icon: Lock,
		},
		maintenance: {
			gradient: "from-orange-500 to-red-500",
			iconColor: "text-orange-500",
			buttonBg: "bg-orange-500 shadow-orange-500/25",
			Icon: (props: any) => (
				<motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
					<Wrench {...props} />
				</motion.div>
			),
		},
	};

	const style = config[type] || config.info;
	const AnimatedIcon = style.Icon;

	return (
		<div className="relative z-10 w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-neutral-900 pointer-events-auto">
			{/* Header - Banner or Gradient */}
			<div className={`relative h-32 sm:h-40 w-full bg-gradient-to-r ${style.gradient} overflow-hidden`}>
				{image ? (
					<img src={image} alt="Pengumuman Banner" className="absolute inset-0 h-full w-full object-cover" />
				) : (
					<div className="absolute inset-0 bg-white/10" />
				)}
			</div>

			{/* Close button */}
			{onClose && (
				<button
					type="button"
					onClick={onClose}
					className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white transition-colors hover:bg-black/50"
					aria-label="Tutup Pengumuman"
				>
					<X className="h-4 w-4" />
				</button>
			)}

			{/* Content */}
			<div className="px-6 pb-8 text-center">
				<div className="mx-auto mb-4 flex h-20 w-20 -translate-y-10 items-center justify-center rounded-full border-4 border-white bg-white shadow-xl dark:border-neutral-900 dark:bg-neutral-800">
					<AnimatedIcon className={`h-10 w-10 ${style.iconColor}`} />
				</div>

				<div className="-mt-8 space-y-4">
					<h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-neutral-900 to-neutral-600 bg-clip-text text-transparent dark:from-white dark:to-neutral-300">
						Pengumuman Penting
					</h3>
					<div
						className="html-renderer text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: intentional HTML injection for admin WYSIWYG
						dangerouslySetInnerHTML={{ __html: formatText(text, userName) }}
					/>

					{/* Smart Countdown */}
					{timeLeft && (
						<div className="mt-4 rounded-lg bg-ruby-50 p-3 text-sm text-ruby-700 dark:bg-ruby-900/30 dark:text-ruby-300 border border-ruby-100 dark:border-ruby-800">
							<div className="font-semibold mb-1">⏱️ Tutup Berakhir Dalam:</div>
							<div className="font-mono font-bold text-lg">{timeLeft}</div>
							<div className="text-xs mt-1 text-ruby-600/70 dark:text-ruby-400/70">
								Kami akan kembali melayani Anda pada <span className="font-medium">{endDate?.add(1, 'day').format('DD MMMM YYYY')}</span>
							</div>
						</div>
					)}

					{onClose && (
						<button
							type="button"
							onClick={onClose}
							className={`mt-6 w-full rounded-xl py-3.5 sm:py-3 font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${style.buttonBg}`}
						>
							Baik, Mengerti
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

export function AnnouncementModal() {
	const { data: content = {} } = usePageContentMap();
	const userInfo = useUserInfo();
	const [isOpen, setIsOpen] = useState(false);
	const userName = userInfo?.username || "Pelanggan Setia"; 

	const enabled = content.announcement_active === "1" || content.announcement_active === "true";
	const text = content.announcement_text ?? "";
	const image = content.announcement_image ?? "";
	const start = content.announcement_start ? dayjs(content.announcement_start) : null;
	const end = content.announcement_end ? dayjs(content.announcement_end) : null;
	const type = (content.announcement_type as AnnouncementType) || "info";
	const recurring = content.announcement_recurring || "none";
	const frequency = content.announcement_frequency || "session";

	// Generate a unique hash chunk from text to bind "Sekali" dismissals to the current content string
	const contentHash = text.substring(0, 15).replace(/\s+/g, "_");

	useEffect(() => {
		if (!enabled || !text) return;

		const now = dayjs();

		let shouldShowToday = true;
		if (recurring === "friday" && now.day() !== 5) shouldShowToday = false;
		if (recurring === "weekend" && now.day() !== 0 && now.day() !== 6) shouldShowToday = false;

		let withinSchedule = true;
		if (start && now.isBefore(start)) withinSchedule = false;
		if (end && now.isAfter(end)) withinSchedule = false;

		if (!shouldShowToday || !withinSchedule) return;

		// Frequency Logic
		let isDismissed = false;
		if (frequency === "session") {
			isDismissed = sessionStorage.getItem("has_seen_announcement") === "true";
		} else if (frequency === "once") {
			isDismissed = localStorage.getItem(`announcement_seen_${contentHash}`) === "true";
		} // if "always", isDismissed stays false

		if (!isDismissed) {
			const timer = setTimeout(() => setIsOpen(true), 1200);
			return () => clearTimeout(timer);
		}
	}, [enabled, text, start, end, recurring, frequency, contentHash]);

	const handleClose = () => {
		setIsOpen(false);
		if (frequency === "session") {
			sessionStorage.setItem("has_seen_announcement", "true");
		} else if (frequency === "once") {
			localStorage.setItem(`announcement_seen_${contentHash}`, "true");
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-md pointer-events-auto"
				>
					<button
						type="button"
						className="absolute inset-0 w-full h-full cursor-default"
						onClick={handleClose}
						onKeyDown={(e) => {
							if (e.key === "Escape") handleClose();
						}}
						aria-label="Tutup Overlay"
						tabIndex={0}
					/>
					<motion.div
						initial={{ scale: 0.9, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.85, opacity: 0, y: -10 }}
						transition={{ type: "spring", stiffness: 350, damping: 25, exit: { duration: 0.2 } }}
					>
						<AnnouncementCard text={text} image={image} type={type} endDate={end} userName={userName} onClose={handleClose} />
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
