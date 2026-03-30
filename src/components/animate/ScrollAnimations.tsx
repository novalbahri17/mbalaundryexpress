import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useInView } from "framer-motion";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Parallax Scroll Component
export function ParallaxSection({ 
	children, 
	speed = 0.5,
	className = ""
}: { 
	children: React.ReactNode; 
	speed?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;
		
		const ctx = gsap.context(() => {
			gsap.to(ref.current, {
				yPercent: speed * 100,
				ease: "none",
				scrollTrigger: {
					trigger: ref.current,
					start: "top bottom",
					end: "bottom top",
					scrub: true,
				},
			});
		});

		return () => ctx.revert();
	}, [speed]);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

// Scroll Reveal Component with GSAP
export function ScrollRevealGSAP({
	children,
	direction = "up",
	delay = 0,
	duration = 0.8,
	className = ""
}: {
	children: React.ReactNode;
	direction?: "up" | "down" | "left" | "right";
	delay?: number;
	duration?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	const getInitialPosition = () => {
		switch (direction) {
			case "up": return { y: 50, x: 0 };
			case "down": return { y: -50, x: 0 };
			case "left": return { y: 0, x: 50 };
			case "right": return { y: 0, x: -50 };
		}
	};

	useEffect(() => {
		if (!ref.current) return;

		const initial = getInitialPosition();
		
		const ctx = gsap.context(() => {
			gsap.fromTo(
				ref.current,
				{ 
					opacity: 0, 
					y: initial.y, 
					x: initial.x 
				},
				{
					opacity: 1,
					y: 0,
					x: 0,
					duration,
					delay,
					ease: "power3.out",
					scrollTrigger: {
						trigger: ref.current,
						start: "top 85%",
						toggleActions: "play none none reverse",
					},
				}
			);
		});

		return () => ctx.revert();
	}, [direction, delay, duration]);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

// Stagger Children Reveal
export function StaggerReveal({
	children,
	stagger = 0.1,
	className = ""
}: {
	children: React.ReactNode;
	stagger?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		const ctx = gsap.context(() => {
			const children = ref.current?.children;
			if (!children) return;

			gsap.fromTo(
				children,
				{ opacity: 0, y: 30 },
				{
					opacity: 1,
					y: 0,
					duration: 0.6,
					ease: "power2.out",
					stagger,
					scrollTrigger: {
						trigger: ref.current,
						start: "top 80%",
						toggleActions: "play none none reverse",
					},
				}
			);
		});

		return () => ctx.revert();
	}, [stagger]);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

// Text Reveal Animation
export function TextReveal({
	children,
	className = ""
}: {
	children: string;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		const ctx = gsap.context(() => {
			gsap.fromTo(
				ref.current,
				{ 
					clipPath: "inset(0 100% 0 0)",
					opacity: 0 
				},
				{
					clipPath: "inset(0 0% 0 0)",
					opacity: 1,
					duration: 1,
					ease: "power4.inOut",
					scrollTrigger: {
						trigger: ref.current,
						start: "top 80%",
						toggleActions: "play none none reverse",
					},
				}
			);
		});

		return () => ctx.revert();
	}, []);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

// Scale on Scroll
export function ScaleOnScroll({
	children,
	className = ""
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		const ctx = gsap.context(() => {
			gsap.fromTo(
				ref.current,
				{ scale: 0.8, opacity: 0 },
				{
					scale: 1,
					opacity: 1,
					duration: 0.8,
					ease: "back.out(1.7)",
					scrollTrigger: {
						trigger: ref.current,
						start: "top 85%",
						toggleActions: "play none none reverse",
					},
				}
			);
		});

		return () => ctx.revert();
	}, []);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}

// Magnetic Button Effect
export function MagneticButton({
	children,
	className = ""
}: {
	children: React.ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!ref.current) return;

		const button = ref.current;
		
		const handleMouseMove = (e: MouseEvent) => {
			const rect = button.getBoundingClientRect();
			const x = e.clientX - rect.left - rect.width / 2;
			const y = e.clientY - rect.top - rect.height / 2;
			
			gsap.to(button, {
				x: x * 0.3,
				y: y * 0.3,
				duration: 0.3,
				ease: "power2.out"
			});
		};

		const handleMouseLeave = () => {
			gsap.to(button, {
				x: 0,
				y: 0,
				duration: 0.3,
				ease: "power2.out"
			});
		};

		button.addEventListener("mousemove", handleMouseMove);
		button.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			button.removeEventListener("mousemove", handleMouseMove);
			button.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, []);

	return (
		<button ref={ref} className={className}>
			{children}
		</button>
	);
}

// Horizontal Scroll Section
export function HorizontalScroll({
	children,
	className = ""
}: {
	children: React.ReactNode[];
	className?: string;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current || !scrollRef.current) return;

		const ctx = gsap.context(() => {
			const scrollWidth = scrollRef.current!.scrollWidth - window.innerWidth;

			gsap.to(scrollRef.current, {
				x: -scrollWidth,
				ease: "none",
				scrollTrigger: {
					trigger: containerRef.current,
					start: "top top",
					end: () => `+=${scrollWidth}`,
					pin: true,
					scrub: 1,
					anticipatePin: 1,
				},
			});
		});

		return () => ctx.revert();
	}, []);

	return (
		<div ref={containerRef} className={`overflow-hidden ${className}`}>
			<div ref={scrollRef} className="flex gap-8 w-max">
				{children.map((child, index) => (
					<div key={index} className="w-screen flex-shrink-0 flex items-center justify-center p-8">
						{child}
					</div>
				))}
			</div>
		</div>
	);
}

// Framer Motion Variants (for simpler animations)
export const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { 
		opacity: 1, 
		y: 0,
		transition: { duration: 0.6, ease: "easeOut" }
	}
};

export const fadeInScale = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: { 
		opacity: 1, 
		scale: 1,
		transition: { duration: 0.5, ease: "easeOut" }
	}
};

export const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.2
		}
	}
};

// Simple Framer Motion Wrapper
export function FadeInView({
	children,
	className = "",
	delay = 0
}: {
	children: React.ReactNode;
	className?: string;
	delay?: number;
}) {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, margin: "-100px" });

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 30 }}
			animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
			transition={{ duration: 0.6, delay, ease: "easeOut" }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// Export all GSAP utilities
export { gsap, ScrollTrigger };
