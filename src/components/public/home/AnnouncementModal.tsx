import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Wrench, BadgePercent } from "lucide-react";
import { usePageContentMap } from "@/hooks/usePageContent";
import { usePublicText } from "@/hooks/usePublicText";
import { useUserInfo } from "@/store/userStore";
import dayjs from "dayjs";

export type AnnouncementType = "info" | "promo" | "libur" | "maintenance";

export interface AnnouncementCardProps {
	title?: string;
	text: string;
	image?: string;
	type?: AnnouncementType;
	endDate?: dayjs.Dayjs | null;
	userName?: string;
	ctaLabel?: string;
	ctaUrl?: string;
	onClose?: () => void;
}

const formatText = (text: string, userName: string, fallbackName: string) => {
	let parsed = text.replace(/\{Nama Pelanggan\}/gi, userName || fallbackName);
	parsed = parsed.replace(/\n/g, "<br/>");
	return parsed;
};

export function AnnouncementCard({
	title,
	text,
	image,
	type = "info",
	endDate,
	userName = "",
	ctaLabel,
	ctaUrl,
	onClose,
}: AnnouncementCardProps) {
	const text_ = usePublicText();
	const labels = text_.home.announcement;
	const [timeLeft, setTimeLeft] = useState<string>("");
	const [imgFailed, setImgFailed] = useState(false);

	// Reset imgFailed whenever image src changes
	useEffect(() => {
		setImgFailed(false);
	}, [image]);

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
			setTimeLeft(`${days > 0 ? `${days} ${labels.days} ` : ""}${hours} ${labels.hours} ${mins} ${labels.minutes}`);
		};

		calculateTime();
		const timer = setInterval(calculateTime, 60000);
		return () => clearInterval(timer);
	}, [endDate, type, labels.days, labels.hours, labels.minutes]);

	const config = {
		info: {
			headerBg: "bg-sky-600",
			iconColor: "text-sky-500",
			buttonBg: "bg-sky-500 hover:bg-sky-600 shadow-sky-500/25",
			ctaBg: "bg-sky-100 hover:bg-sky-200 text-sky-700 dark:bg-sky-900/40 dark:hover:bg-sky-900/60 dark:text-sky-300",
			countdownBg: "bg-sky-50 border-sky-100 text-sky-700 dark:bg-sky-900/30 dark:border-sky-800 dark:text-sky-300",
			countdownText: "text-sky-600/70 dark:text-sky-400/70",
			Icon: (props: React.SVGProps<SVGSVGElement>) => (
				<motion.svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					{...(props as object)}
				>
					<title>Lonceng notifikasi</title>
					<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
					<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
				</motion.svg>
			),
		},
		promo: {
			headerBg: "bg-amber-500",
			iconColor: "text-amber-500",
			buttonBg: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25",
			ctaBg:
				"bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-300",
			countdownBg:
				"bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300",
			countdownText: "text-amber-600/70 dark:text-amber-400/70",
			Icon: (props: React.SVGProps<SVGSVGElement>) => <BadgePercent {...(props as object)} />,
		},
		libur: {
			headerBg: "bg-ruby-700",
			iconColor: "text-ruby-500",
			buttonBg: "bg-ruby-500 hover:bg-ruby-600 shadow-ruby-500/25",
			ctaBg:
				"bg-ruby-50 hover:bg-ruby-100 text-ruby-700 dark:bg-ruby-900/30 dark:hover:bg-ruby-900/50 dark:text-ruby-300",
			countdownBg:
				"bg-ruby-50 border-ruby-100 text-ruby-700 dark:bg-ruby-900/30 dark:border-ruby-800 dark:text-ruby-300",
			countdownText: "text-ruby-600/70 dark:text-ruby-400/70",
			Icon: Lock,
		},
		maintenance: {
			headerBg: "bg-orange-600",
			iconColor: "text-orange-500",
			buttonBg: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/25",
			ctaBg:
				"bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 dark:text-orange-300",
			countdownBg:
				"bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-300",
			countdownText: "text-orange-600/70 dark:text-orange-400/70",
			Icon: (props: React.SVGProps<SVGSVGElement>) => <Wrench {...(props as object)} />,
		},
	};

	const style = config[type] ?? config.info;
	const AnimatedIcon = style.Icon;
	const displayTitle = title?.trim() || labels.typeLabels[type] || labels.fallbackTitle;

	const showImage = Boolean(image) && !imgFailed;

	return (
		<div className="relative z-10 w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:bg-neutral-900 pointer-events-auto">
			{/* Header - solid brand surface; image overlays on top */}
			<div className={`relative h-32 sm:h-40 w-full ${style.headerBg} overflow-hidden`}>
				{showImage && (
					<img
						src={image}
						alt=""
						onError={() => setImgFailed(true)}
						className="absolute inset-0 h-full w-full object-cover"
					/>
				)}
				{/* Subtle overlay for readability */}
				<div className="absolute inset-0 bg-black/10" />
			</div>

			{/* Close button */}
			{onClose && (
				<button
					type="button"
					onClick={onClose}
					className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-md text-white transition-colors hover:bg-black/50"
					aria-label={labels.closeAria}
				>
					<X className="h-4 w-4" />
				</button>
			)}

			{/* Content */}
			<div className="px-6 pb-7 text-center">
				{/* Floating icon badge */}
				<div className="mx-auto mb-4 flex h-20 w-20 -translate-y-10 items-center justify-center rounded-full border-4 border-white bg-white shadow-xl dark:border-neutral-900 dark:bg-neutral-800">
					<AnimatedIcon className={`h-10 w-10 ${style.iconColor}`} />
				</div>

				<div className="-mt-8 space-y-3">
					{/* Dynamic title */}
					<h3 className="text-xl font-bold text-neutral-900 sm:text-2xl dark:text-white">{displayTitle}</h3>

					{/* Main body text: supports HTML */}
					<div
						className="html-renderer text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: intentional HTML injection for admin WYSIWYG
						dangerouslySetInnerHTML={{ __html: formatText(text, userName, labels.defaultUserName) }}
					/>

					{/* Smart Countdown: only for libur/maintenance with an end date */}
					{timeLeft && endDate && (
						<div className={`mt-4 rounded-lg border p-3 text-sm ${style.countdownBg}`}>
							<div className="font-semibold mb-1">{labels.endsIn}</div>
							<div className="font-mono font-bold text-lg">{timeLeft}</div>
							<div className={`text-xs mt-1 ${style.countdownText}`}>
								{labels.backOn} <span className="font-medium">{endDate.format("DD MMMM YYYY")}</span>
							</div>
						</div>
					)}

					{/* CTA Button: optional */}
					{ctaUrl && ctaLabel && (
						<a
							href={ctaUrl}
							target="_blank"
							rel="noopener noreferrer"
							className={`mt-2 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${style.ctaBg}`}
						>
							{ctaLabel}
						</a>
					)}

					{/* Dismiss button */}
					{onClose && (
						<button
							type="button"
							onClick={onClose}
							className={`mt-2 w-full rounded-xl py-3.5 font-semibold text-white shadow-sm transition-colors sm:py-3 ${style.buttonBg}`}
						>
							{labels.dismiss}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

export function AnnouncementModal() {
	const text_ = usePublicText();
	const { data: content = {} } = usePageContentMap();
	const userInfo = useUserInfo();
	const [isOpen, setIsOpen] = useState(false);
	const userName = userInfo?.username || text_.home.announcement.defaultUserName;

	const enabled = content.announcement_active === "1" || content.announcement_active === "true";
	const title = content.announcement_title?.trim() || "";
	const text = content.announcement_text ?? "";
	const image = content.announcement_image ?? "";
	const start = content.announcement_start ? dayjs(content.announcement_start) : null;
	const end = content.announcement_end ? dayjs(content.announcement_end) : null;
	const type = (content.announcement_type as AnnouncementType) || "info";
	const recurring = content.announcement_recurring || "none";
	const frequency = content.announcement_frequency || "session";
	const ctaLabel = content.announcement_cta_label?.trim() || "";
	const ctaUrl = content.announcement_cta_url?.trim() || "";

	// Bind "once" dismissal to specific content so changing text resets it
	const contentHash = text.substring(0, 20).replace(/\s+/g, "_");

	useEffect(() => {
		if (!enabled || !text.trim()) return;

		const now = dayjs();

		// Day-of-week recurring filter
		let shouldShowToday = true;
		if (recurring === "friday" && now.day() !== 5) shouldShowToday = false;
		if (recurring === "weekend" && now.day() !== 0 && now.day() !== 6) shouldShowToday = false;

		// Scheduled date range
		let withinSchedule = true;
		if (start && now.isBefore(start)) withinSchedule = false;
		if (end && now.isAfter(end)) withinSchedule = false;

		if (!shouldShowToday || !withinSchedule) return;

		// Frequency / dismissal logic
		let isDismissed = false;
		if (frequency === "session") {
			isDismissed = sessionStorage.getItem("has_seen_announcement") === "true";
		} else if (frequency === "once") {
			isDismissed = localStorage.getItem(`announcement_seen_${contentHash}`) === "true";
		}
		// "always" → isDismissed stays false

		if (!isDismissed) {
			const timer = setTimeout(() => setIsOpen(true), 1200);
			return () => clearTimeout(timer);
		}
	}, [enabled, text, title, start, end, recurring, frequency, contentHash]);

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
					transition={{ duration: 0.2 }}
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-md pointer-events-auto"
				>
					{/* Click-outside to close */}
					<button
						type="button"
						className="absolute inset-0 w-full h-full cursor-default"
						onClick={handleClose}
						aria-label={text_.home.announcement.closeOverlayAria}
						tabIndex={-1}
					/>

					<motion.div
						initial={{ scale: 0.9, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.85, opacity: 0, y: -10 }}
						transition={{
							type: "spring",
							stiffness: 350,
							damping: 25,
							exit: { duration: 0.2 },
						}}
					>
						<AnnouncementCard
							title={title}
							text={text}
							image={image}
							type={type}
							endDate={end}
							userName={userName}
							ctaLabel={ctaLabel}
							ctaUrl={ctaUrl}
							onClose={handleClose}
						/>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
