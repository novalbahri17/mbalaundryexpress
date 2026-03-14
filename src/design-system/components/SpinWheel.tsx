/**
 * MBA Laundry Express - Spin Wheel
 * Premium gamified spin wheel with physics
 */

import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/utils";

// ============================================
// TYPES
// ============================================
export interface SpinPrize {
	id: string;
	label: string;
	value: number;
	color: string;
	icon?: React.ReactNode;
	rare?: boolean;
}

export interface SpinWheelProps {
	/** Prizes to display */
	prizes: SpinPrize[];
	/** Callback when spin ends */
	onSpinEnd?: (prize: SpinPrize) => void;
	/** Callback when spin starts */
	onSpinStart?: () => void;
	/** Size of wheel (px) */
	size?: number;
	/** Spin duration (seconds) */
	spinDuration?: number;
	/** Custom className */
	className?: string;
	/** Disable spin */
	disabled?: boolean;
	/** Remaining spins */
	remainingSpins?: number;
}

// ============================================
// UTILITY: Calculate segment paths
// ============================================
function getSegmentPath(index: number, total: number, radius: number): string {
	const angle = (360 / total) * (Math.PI / 180);
	const startAngle = index * angle - Math.PI / 2;
	const endAngle = (index + 1) * angle - Math.PI / 2;

	const x1 = radius + radius * Math.cos(startAngle);
	const y1 = radius + radius * Math.sin(startAngle);
	const x2 = radius + radius * Math.cos(endAngle);
	const y2 = radius + radius * Math.sin(endAngle);

	return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
}

function getTextPosition(index: number, total: number, radius: number) {
	const angle = (360 / total) * (Math.PI / 180);
	const midAngle = (index + 0.5) * angle - Math.PI / 2;
	const textRadius = radius * 0.65;

	return {
		x: radius + textRadius * Math.cos(midAngle),
		y: radius + textRadius * Math.sin(midAngle),
		rotate: (midAngle * 180) / Math.PI,
	};
}

// ============================================
// COMPONENT
// ============================================
export function SpinWheel({
	prizes,
	onSpinEnd,
	onSpinStart,
	size = 320,
	spinDuration = 5,
	className,
	disabled = false,
	remainingSpins = 1,
}: SpinWheelProps) {
	const [isSpinning, setIsSpinning] = useState(false);
	const [rotation, setRotation] = useState(0);
	const [winner, setWinner] = useState<SpinPrize | null>(null);
	const [showCelebration, setShowCelebration] = useState(false);

	const controls = useAnimation();
	const wheelRef = useRef<HTMLDivElement>(null);

	const radius = size / 2;
	const center = radius;

	// Spin function
	const spin = useCallback(async () => {
		if (isSpinning || disabled || remainingSpins <= 0) return;

		setIsSpinning(true);
		setShowCelebration(false);
		onSpinStart?.();

		// Random winner
		const winningIndex = Math.floor(Math.random() * prizes.length);
		const winningPrize = prizes[winningIndex];

		// Calculate rotation
		const segmentAngle = 360 / prizes.length;
		const winningAngle = winningIndex * segmentAngle;
		const extraSpins = 5 + Math.random() * 3; // 5-8 full rotations
		const targetRotation = rotation + extraSpins * 360 + (360 - winningAngle) + segmentAngle / 2;

		// Animate
		await controls.start({
			rotate: targetRotation,
			transition: {
				duration: spinDuration,
				ease: [0.15, 0.5, 0.35, 1], // Custom easing for realistic spin
			},
		});

		setRotation(targetRotation);
		setWinner(winningPrize);
		setIsSpinning(false);
		setShowCelebration(true);
		onSpinEnd?.(winningPrize);

		// Hide celebration after 3s
		setTimeout(() => setShowCelebration(false), 3000);
	}, [isSpinning, disabled, remainingSpins, prizes, rotation, controls, spinDuration, onSpinStart, onSpinEnd]);

	return (
		<div className={cn("relative flex flex-col items-center", className)}>
			{/* Wheel Container */}
			<div ref={wheelRef} className="relative" style={{ width: size, height: size }}>
				{/* Outer ring decoration */}
				<div
					className="absolute inset-0 rounded-full border-8 border-neutral-200 dark:border-neutral-700 shadow-2xl"
					style={{ transform: "scale(1.05)" }}
				/>

				{/* Light effects */}
				<div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

				{/* Wheel SVG */}
				<motion.svg
					className="w-full h-full"
					viewBox={`0 0 ${size} ${size}`}
					animate={controls}
					initial={{ rotate: 0 }}
				>
					{/* Segments */}
					{prizes.map((prize, index) => (
						<g key={prize.id}>
							<path
								d={getSegmentPath(index, prizes.length, radius)}
								fill={prize.color}
								stroke="white"
								strokeWidth="2"
							/>
							<text
								x={getTextPosition(index, prizes.length, radius).x}
								y={getTextPosition(index, prizes.length, radius).y}
								fill="white"
								fontSize="12"
								fontWeight="bold"
								textAnchor="middle"
								dominantBaseline="middle"
								transform={`rotate(${getTextPosition(index, prizes.length, radius).rotate}, ${getTextPosition(index, prizes.length, radius).x}, ${getTextPosition(index, prizes.length, radius).y})`}
								style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
							>
								{prize.label}
							</text>
						</g>
					))}

					{/* Center decoration */}
					<circle cx={center} cy={center} r={radius * 0.12} fill="white" stroke="#E5E5E5" strokeWidth="3" />
					<circle cx={center} cy={center} r={radius * 0.08} fill="#DC2626" />
				</motion.svg>

				{/* Pointer */}
				<div
					className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10"
					style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
				>
					<div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-ruby-600" />
				</div>

				{/* Center button */}
				<motion.button
					className={cn(
						"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
						"w-16 h-16 rounded-full",
						"bg-gradient-to-br from-ruby-500 to-ruby-700",
						"text-white font-bold text-sm",
						"shadow-lg shadow-ruby-500/30",
						"border-4 border-white dark:border-neutral-800",
						"disabled:opacity-50 disabled:cursor-not-allowed",
						"z-20",
					)}
					onClick={spin}
					disabled={isSpinning || disabled || remainingSpins <= 0}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					animate={isSpinning ? { scale: [1, 1.1, 1] } : {}}
					transition={{ duration: 0.3, repeat: isSpinning ? Infinity : 0 }}
				>
					{isSpinning ? "..." : "SPIN"}
				</motion.button>
			</div>

			{/* Remaining spins indicator */}
			<div className="mt-6 flex items-center gap-2">
				<span className="text-sm text-neutral-500 dark:text-neutral-400">Sisa spin:</span>
				<div className="flex gap-1">
					{Array.from({ length: Math.max(remainingSpins, 3) }).map((_, i) => (
						<motion.div
							key={i}
							className={cn(
								"w-3 h-3 rounded-full",
								i < remainingSpins ? "bg-ruby-500" : "bg-neutral-200 dark:bg-neutral-700",
							)}
							initial={i < remainingSpins ? { scale: 0 } : { scale: 1 }}
							animate={{ scale: 1 }}
							transition={{ delay: i * 0.1 }}
						/>
					))}
				</div>
			</div>

			{/* Winner celebration */}
			<AnimatePresence>
				{showCelebration && winner && (
					<motion.div
						className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						{/* Backdrop blur */}
						<div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

						{/* Confetti */}
						<Confetti />

						{/* Winner card */}
						<motion.div
							className="relative bg-white dark:bg-neutral-800 rounded-3xl p-8 text-center shadow-2xl"
							initial={{ scale: 0, rotate: -10 }}
							animate={{ scale: 1, rotate: 0 }}
							exit={{ scale: 0, rotate: 10 }}
							transition={{ type: "spring", stiffness: 300, damping: 20 }}
						>
							<motion.div
								className="text-6xl mb-4"
								animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
								transition={{ duration: 0.5, repeat: 2 }}
							>
								🎉
							</motion.div>
							<h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Selamat!</h3>
							<p className="text-neutral-600 dark:text-neutral-300 mb-4">Kamu mendapatkan</p>
							<div
								className="inline-block px-6 py-3 rounded-2xl text-white font-bold text-xl"
								style={{ backgroundColor: winner.color }}
							>
								{winner.label}
							</div>
							{winner.rare && <span className="block mt-3 text-sm text-amber-500 font-semibold">⭐ Rare Item!</span>}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ============================================
// CONFETTI COMPONENT
// ============================================
function Confetti() {
	const particles = Array.from({ length: 50 });

	return (
		<div className="absolute inset-0 overflow-hidden">
			{particles.map((_, i) => (
				<motion.div
					key={i}
					className="absolute w-3 h-3 rounded-sm"
					style={{
						backgroundColor: ["#DC2626", "#2563EB", "#14B8A6", "#F59E0B", "#8B5CF6"][i % 5],
						left: `${Math.random() * 100}%`,
						top: "-10%",
					}}
					animate={{
						y: ["0vh", "100vh"],
						x: [0, (Math.random() - 0.5) * 200],
						rotate: [0, Math.random() * 720],
					}}
					transition={{
						duration: 2 + Math.random() * 2,
						ease: "easeOut",
						delay: Math.random() * 0.5,
					}}
				/>
			))}
		</div>
	);
}

export default SpinWheel;
