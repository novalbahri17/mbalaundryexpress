import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/public/layout/BottomNav";
import { FloatingWA } from "@/components/public/layout/FloatingWA";
import { Footer } from "@/components/public/layout/Footer";
import { Navbar } from "@/components/public/layout/Navbar";
import { usePageContentMap } from "@/hooks/usePageContent";

function ScrollProgress() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let frameId = 0;
		const onScroll = () => {
			if (frameId) return;
			frameId = window.requestAnimationFrame(() => {
				const top = window.scrollY;
				const height = document.documentElement.scrollHeight - window.innerHeight;
				setProgress(height > 0 ? (top / height) * 100 : 0);
				frameId = 0;
			});
		};

		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			if (frameId) window.cancelAnimationFrame(frameId);
		};
	}, []);

	return <span className="scroll-progress" style={{ width: `${progress}%` }} />;
}

function CursorFollower() {
	const nodeRef = useRef<HTMLSpanElement | null>(null);

	useEffect(() => {
		const node = nodeRef.current;
		if (!node) return;

		let frameId = 0;
		let latestX = 0;
		let latestY = 0;

		const render = () => {
			node.style.left = `${latestX}px`;
			node.style.top = `${latestY}px`;
			frameId = 0;
		};

		const onMove = (event: MouseEvent) => {
			latestX = event.clientX;
			latestY = event.clientY;
			if (!frameId) {
				frameId = window.requestAnimationFrame(render);
			}
		};

		window.addEventListener("mousemove", onMove, { passive: true });
		return () => {
			window.removeEventListener("mousemove", onMove);
			if (frameId) window.cancelAnimationFrame(frameId);
		};
	}, []);

	return <span ref={nodeRef} className="custom-cursor" />;
}

export function PublicLayout() {
	const { data: content = {} } = usePageContentMap();
	const location = useLocation();

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "auto" });
	}, [location.pathname]);

	return (
		<div className="relative min-h-screen bg-[var(--bg)] text-[var(--text-main)]">
			<ScrollProgress />
			<CursorFollower />
			<Navbar whatsapp={content.whatsapp_cs} />
			<main>
				<Outlet />
			</main>
			<Footer />
			<FloatingWA phone={content.whatsapp_cs} />
			<BottomNav />
		</div>
	);
}
