/**
 * MBA Laundry Express - Pull to Refresh
 * Mobile pull-to-refresh with elastic animation
 */

import { motion, useMotionValue, useSpring, useTransform, type PanInfo } from "framer-motion";
import { useState, useCallback, useRef } from "react";
import { cn } from "@/utils";

// ============================================
// TYPES
// ============================================
export interface PullToRefreshProps {
	/** Content to wrap */
	children: React.ReactNode;
	/** Refresh callback */
	onRefresh: () => Promise<void>;
	/** Maximum pull distance (px) */
	maxPullDistance?: number;
	/** Refresh trigger distance (px) */
	refreshThreshold?: number;
	/** Custom spinner */
	spinner?: React.ReactNode;
	/** Custom className */
	className?: string;
	/** Disable pull-to-refresh */
	disabled?: boolean;
}

// ============================================
// COMPONENT
// ============================================
export function PullToRefresh({
	children,
	onRefresh,
	maxPullDistance = 150,
	refreshThreshold = 100,
	spinner,
	className,
	disabled = false,
}: PullToRefreshProps) {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isPulling, setIsPulling] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// Motion values
	const pullY = useMotionValue(0);
	const springY = useSpring(pullY, { stiffness: 300, damping: 30 });

	// Transform values for visual feedback
	const rotate = useTransform(springY, [0, refreshThreshold], [0, 360]);
	const scale = useTransform(springY, [0, refreshThreshold], [0.8, 1]);
	const opacity = useTransform(springY, [0, refreshThreshold * 0.5], [0, 1]);

	// Check if at top of scroll
	const isAtTop = useCallback(() => {
		if (!containerRef.current) return true;
		return containerRef.current.scrollTop <= 0;
	}, []);

	// Handle pan (pull)
	const handlePan = useCallback(
		(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
			if (disabled || isRefreshing || !isAtTop()) return;

			const deltaY = info.delta.y;

			// Only allow pulling down
			if (deltaY > 0) {
				setIsPulling(true);
				const newY = Math.min(pullY.get() + deltaY * 0.5, maxPullDistance);
				pullY.set(newY);
			}
		},
		[disabled, isRefreshing, isAtTop, pullY, maxPullDistance],
	);

	// Handle pan end
	const handlePanEnd = useCallback(() => {
		if (disabled || isRefreshing) return;

		const currentY = pullY.get();

		if (currentY >= refreshThreshold) {
			// Trigger refresh
			setIsRefreshing(true);
			pullY.set(refreshThreshold);

			onRefresh().finally(() => {
				setIsRefreshing(false);
				setIsPulling(false);
				pullY.set(0);
			});
		} else {
			// Reset
			setIsPulling(false);
			pullY.set(0);
		}
	}, [disabled, isRefreshing, pullY, refreshThreshold, onRefresh]);

	// Default spinner
	const defaultSpinner = (
		<motion.div className="w-8 h-8 border-3 border-ruby-200 border-t-ruby-600 rounded-full" style={{ rotate }} />
	);

	return (
		<div ref={containerRef} className={cn("relative overflow-y-auto", className)}>
			{/* Pull indicator */}
			<motion.div
				className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-10"
				style={{
					y: useTransform(springY, (v) => v - 50),
					opacity,
					scale,
				}}
			>
				<div className="flex flex-col items-center gap-2">
					{spinner || defaultSpinner}
					<motion.span
						className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
						animate={{
							opacity: isRefreshing ? [0.5, 1, 0.5] : 1,
						}}
						transition={{ duration: 1.5, repeat: Infinity }}
					>
						{isRefreshing ? "Memperbarui..." : "Tarik untuk memperbarui"}
					</motion.span>
				</div>
			</motion.div>

			{/* Content */}
			<motion.div
				style={{ y: springY }}
				onPan={handlePan as any}
				onPanEnd={handlePanEnd}
				drag={isPulling && !isRefreshing ? "y" : false}
				dragConstraints={{ top: 0, bottom: 0 }}
				dragElastic={0.2}
			>
				{children}
			</motion.div>
		</div>
	);
}

// ============================================
// SIMPLE REFRESH BUTTON (for desktop/non-touch)
// ============================================
export interface RefreshButtonProps {
	/** Refresh callback */
	onRefresh: () => Promise<void>;
	/** Custom className */
	className?: string;
}

export function RefreshButton({ onRefresh, className }: RefreshButtonProps) {
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleClick = async () => {
		setIsRefreshing(true);
		await onRefresh();
		setIsRefreshing(false);
	};

	return (
		<motion.button
			className={cn(
				"p-2 rounded-full",
				"bg-neutral-100 dark:bg-neutral-800",
				"text-neutral-600 dark:text-neutral-300",
				"hover:bg-neutral-200 dark:hover:bg-neutral-700",
				"transition-colors",
				className,
			)}
			onClick={handleClick}
			whileTap={{ scale: 0.9 }}
			disabled={isRefreshing}
		>
			<motion.svg
				className="w-5 h-5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
				transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
				/>
			</motion.svg>
		</motion.button>
	);
}

export default PullToRefresh;
