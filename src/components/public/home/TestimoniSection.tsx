import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Star, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTestimonials } from "@/api/testimonials.api";
import { SkeletonCard } from "@/components/public/shared/SkeletonCard";
import { Badge, Button, Card, Container, Heading, Section } from "@/components/ui";
import { useBranches } from "@/hooks/useBranches";

type VideoTestimonial = {
	id: string;
	name: string;
	location: string;
	rating: number;
	comment: string;
	video: string;
};

const fallbackVideos: VideoTestimonial[] = [
	{
		id: "v1",
		name: "Nadia Putri",
		location: "Sidoarjo",
		rating: 5,
		comment: "Laundry paling stabil hasilnya, cepat dan bersih.",
		video: "https://cdn.coverr.co/videos/coverr-woman-folding-clean-laundry-1578567514220?download=1080p",
	},
	{
		id: "v2",
		name: "Fajar Ramadhan",
		location: "Surabaya",
		rating: 5,
		comment: "Express 3 jam sangat membantu ketika butuh cepat.",
		video: "https://cdn.coverr.co/videos/coverr-man-working-in-a-laundry-shop-1578567563492?download=1080p",
	},
	{
		id: "v3",
		name: "Alya Sari",
		location: "Pagesangan",
		rating: 4,
		comment: "Tempat nyaman, tinggal drop dan ambil tepat waktu.",
		video: "https://cdn.coverr.co/videos/coverr-laundry-room-4737/1080p.mp4",
	},
];

export function TestimoniSection() {
	const { data: testimonials = [], isLoading } = useQuery({
		queryKey: ["home-video-testimonials"],
		queryFn: () => getTestimonials({ approvedOnly: true, limit: 20 }),
	});
	const { data: branches = [] } = useBranches({ activeOnly: true });
	const [activeIndex, setActiveIndex] = useState(0);
	const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);
	const [hovered, setHovered] = useState(false);
	const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

	const items = useMemo<VideoTestimonial[]>(() => {
		if (testimonials.length === 0) return fallbackVideos;
		return testimonials.slice(0, 6).map((item, index) => ({
			id: item.id,
			name: item.customer_name,
			location: branches.find((branch) => branch.id === item.branch_id)?.name ?? "MBA Laundry",
			rating: item.rating,
			comment: item.comment,
			video: fallbackVideos[index % fallbackVideos.length].video,
		}));
	}, [branches, testimonials]);

	useEffect(() => {
		if (items.length <= 1 || selectedVideo || hovered) return;
		const timer = window.setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % items.length);
		}, 5000);
		return () => window.clearInterval(timer);
	}, [hovered, items.length, selectedVideo]);

	useEffect(() => {
		setActiveIndex(0);
	}, [items.length]);

	useEffect(() => {
		items.forEach((item, index) => {
			const video = videoRefs.current.get(item.id);
			if (!video) return;
			if (index === activeIndex && !selectedVideo) {
				void video.play().catch(() => undefined);
			} else {
				video.pause();
			}
		});
	}, [activeIndex, items, selectedVideo]);

	useEffect(() => {
		if (!selectedVideo) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setSelectedVideo(null);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [selectedVideo]);

	const goPrev = () => {
		setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
	};

	const goNext = () => {
		setActiveIndex((prev) => (prev + 1) % items.length);
	};

	const active = items[activeIndex] ?? fallbackVideos[0];

	return (
		<Section reveal>
			<Container size="xl">
				<div className="mb-8 flex items-end justify-between gap-4">
					<div>
						<Badge tone="info">Testimoni Video</Badge>
						<Heading variant="h2" className="mt-3">
							Review pelanggan dengan format video first
						</Heading>
					</div>
					<div className="hidden gap-2 md:flex">
						<Button variant="outline" size="sm" onClick={goPrev} aria-label="Geser kiri">
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button variant="outline" size="sm" onClick={goNext} aria-label="Geser kanan">
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{isLoading ? (
					<div className="grid gap-4 md:grid-cols-2">
						<SkeletonCard />
						<SkeletonCard />
					</div>
				) : (
					<div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
					<Card variant="glass" className="overflow-hidden p-0">
						<div className="relative">
							<video
								ref={(node) => {
									if (node) {
										videoRefs.current.set(active.id, node);
									} else {
										videoRefs.current.delete(active.id);
									}
								}}
								className="h-[260px] w-full object-cover md:h-[360px]"
								src={active.video}
								muted
								playsInline
								loop
								preload="metadata"
								autoPlay
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/10 to-transparent" />
							<button
								type="button"
								onClick={() => setSelectedVideo(active)}
								className="absolute right-4 top-4 inline-flex h-11 min-w-[44px] items-center justify-center rounded-full border border-white/30 bg-neutral-900/35 p-2 text-white backdrop-blur-glass"
								aria-label={`Putar video ${active.name}`}
							>
								<Play className="h-4 w-4 fill-current" />
							</button>
							<div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 text-white">
								<div>
									<p className="font-bold">{active.name}</p>
									<p className="text-xs text-white/80">{active.location}</p>
								</div>
								<p className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-sm font-semibold backdrop-blur-glass">
									<Star className="mr-1 h-4 w-4 fill-current text-amber-400" /> {active.rating}/5
								</p>
							</div>
						</div>
						<div className="p-4 md:p-5">
							<p className="text-sm text-neutral-600 dark:text-neutral-300">{active.comment}</p>
						</div>
						</Card>

						<div className="mt-4 flex items-center justify-center gap-2">
						{items.map((item, index) => (
							<button
								key={item.id}
								type="button"
								onClick={() => setActiveIndex(index)}
								aria-label={`Lihat testimoni ${index + 1}`}
								className={`h-2.5 rounded-full transition ${activeIndex === index ? "w-8 bg-sapphire-600" : "w-2.5 bg-neutral-300 dark:bg-neutral-700"}`}
							/>
						))}
					</div>
					</div>
				)}

				<div className="mt-4 text-right">
					<a href="/testimoni" className="text-sm font-semibold text-ruby-700 hover:text-ruby-600 dark:text-ruby-300">
						Lihat 500+ Review
					</a>
				</div>
			</Container>

			<AnimatePresence>
				{selectedVideo ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[90] grid place-items-center bg-neutral-950/85 p-4"
						role="dialog"
						aria-modal="true"
						aria-label={`Video testimoni ${selectedVideo.name}`}
					>
						<button
							type="button"
							onClick={() => setSelectedVideo(null)}
							className="absolute right-4 top-4 inline-flex h-11 min-w-[44px] items-center justify-center rounded-full border border-white/25 bg-white/10 text-white"
							aria-label="Tutup video"
						>
							<X className="h-4 w-4" />
						</button>
						<video className="max-h-[90vh] w-full max-w-4xl rounded-2xl" src={selectedVideo.video} controls autoPlay />
					</motion.div>
				) : null}
			</AnimatePresence>
		</Section>
	);
}
