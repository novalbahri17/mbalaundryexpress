/**
 * MBA Laundry Express - Animation Hooks
 * Custom hooks for micro-interactions
 */

import { useMotionValue, useSpring } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================
// USE HOVER SCALE
// ============================================
export function useHoverScale(scale = 1.05) {
	const [isHovered, setIsHovered] = useState(false);

	const handlers = {
		onMouseEnter: () => setIsHovered(true),
		onMouseLeave: () => setIsHovered(false),
	};

	const springConfig = { stiffness: 300, damping: 20 };
	const motionValue = useMotionValue(1);
	const springValue = useSpring(motionValue, springConfig);

	useEffect(() => {
		motionValue.set(isHovered ? scale : 1);
	}, [isHovered, scale, motionValue]);

	return { scale: springValue, handlers, isHovered };
}

// ============================================
// USE PRESS
// ============================================
export function usePress(scale = 0.95) {
	const [isPressed, setIsPressed] = useState(false);

	const handlers = {
		onMouseDown: () => setIsPressed(true),
		onMouseUp: () => setIsPressed(false),
		onMouseLeave: () => setIsPressed(false),
		onTouchStart: () => setIsPressed(true),
		onTouchEnd: () => setIsPressed(false),
	};

	return { isPressed, handlers, scale: isPressed ? scale : 1 };
}

// ============================================
// USE MAGNETIC EFFECT
// ============================================
export function useMagnetic(strength = 0.3) {
	const ref = useRef<HTMLElement>(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!ref.current) return;

			const rect = ref.current.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;

			const distanceX = e.clientX - centerX;
			const distanceY = e.clientY - centerY;

			setPosition({
				x: distanceX * strength,
				y: distanceY * strength,
			});
		},
		[strength],
	);

	const handleMouseLeave = useCallback(() => {
		setPosition({ x: 0, y: 0 });
	}, []);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		element.addEventListener("mousemove", handleMouseMove);
		element.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			element.removeEventListener("mousemove", handleMouseMove);
			element.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [handleMouseMove, handleMouseLeave]);

	return { ref, position };
}

// ============================================
// USE SCROLL PROGRESS
// ============================================
export function useScrollProgress() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			const scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;
			setProgress(Math.min(1, Math.max(0, scrollProgress)));
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return progress;
}

// ============================================
// USE IN VIEW
// ============================================
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
	const ref = useRef<T>(null);
	const [isInView, setIsInView] = useState(false);
	const [hasAnimated, setHasAnimated] = useState(false);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsInView(true);
					setHasAnimated(true);
				} else if (!hasAnimated) {
					setIsInView(false);
				}
			},
			{ threshold: 0.1, ...options },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, [options, hasAnimated]);

	return { ref, isInView };
}

// ============================================
// USE COUNT UP
// ============================================
export function useCountUp(end: number, duration = 2000, start = 0) {
	const [count, setCount] = useState(start);
	const [isAnimating, setIsAnimating] = useState(false);

	const startAnimation = useCallback(() => {
		if (isAnimating) return;
		setIsAnimating(true);

		const startTime = Date.now();
		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Easing function (easeOutQuart)
			const easeOutQuart = 1 - (1 - progress) ** 4;
			const current = Math.floor(start + (end - start) * easeOutQuart);

			setCount(current);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				setIsAnimating(false);
			}
		};

		requestAnimationFrame(animate);
	}, [end, duration, start, isAnimating]);

	return { count, startAnimation, isAnimating };
}

// ============================================
// USE RIPPLE
// ============================================
interface Ripple {
	x: number;
	y: number;
	id: number;
}

export function useRipple() {
	const [ripples, setRipples] = useState<Ripple[]>([]);

	const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
		const element = event.currentTarget;
		const rect = element.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const id = Date.now();

		setRipples((prev) => [...prev, { x, y, id }]);

		setTimeout(() => {
			setRipples((prev) => prev.filter((r) => r.id !== id));
		}, 600);
	}, []);

	return { ripples, createRipple };
}

// ============================================
// USE PARALLAX
// ============================================
export function useParallax(speed = 0.5) {
	const ref = useRef<HTMLElement>(null);
	const [offset, setOffset] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			if (!ref.current) return;

			const rect = ref.current.getBoundingClientRect();
			const scrolled = window.innerHeight - rect.top;
			const rate = scrolled * speed;

			setOffset(rate);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => window.removeEventListener("scroll", handleScroll);
	}, [speed]);

	return { ref, offset };
}

// ============================================
// USE TILT
// ============================================
export function useTilt(maxTilt = 10) {
	const ref = useRef<HTMLElement>(null);
	const [tilt, setTilt] = useState({ x: 0, y: 0 });

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!ref.current) return;

			const rect = ref.current.getBoundingClientRect();
			const x = (e.clientX - rect.left) / rect.width;
			const y = (e.clientY - rect.top) / rect.height;

			setTilt({
				x: (y - 0.5) * maxTilt,
				y: (x - 0.5) * -maxTilt,
			});
		},
		[maxTilt],
	);

	const handleMouseLeave = useCallback(() => {
		setTilt({ x: 0, y: 0 });
	}, []);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		element.addEventListener("mousemove", handleMouseMove);
		element.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			element.removeEventListener("mousemove", handleMouseMove);
			element.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, [handleMouseMove, handleMouseLeave]);

	return { ref, tilt };
}

export default {
	useHoverScale,
	usePress,
	useMagnetic,
	useScrollProgress,
	useInView,
	useCountUp,
	useRipple,
	useParallax,
	useTilt,
};
