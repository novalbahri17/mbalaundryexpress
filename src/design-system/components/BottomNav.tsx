/**
 * MBA Laundry Express - Bottom Navigation
 * Mobile-first bottom navigation with animations
 */

import { motion } from "framer-motion";
import { useState } from "react";
import { transitions } from "@/design-system/tokens/animations";
import { cn } from "@/utils";

// ============================================
// TYPES
// ============================================
export interface NavItem {
	id: string;
	label: string;
	icon: React.ReactNode;
	activeIcon?: React.ReactNode;
	badge?: number;
}

export interface BottomNavProps {
	/** Navigation items */
	items: NavItem[];
	/** Currently active item */
	activeId: string;
	/** Callback when item is clicked */
	onChange: (id: string) => void;
	/** Custom className */
	className?: string;
}

// ============================================
// COMPONENT
// ============================================
export function BottomNav({ items, activeId, onChange, className }: BottomNavProps) {
	const [pressedId, setPressedId] = useState<string | null>(null);

	return (
		<motion.nav
			className={cn(
				"fixed bottom-0 left-0 right-0 z-50",
				"bg-white dark:bg-neutral-900",
				"border-t border-neutral-200 dark:border-neutral-800",
				"safe-area-pb",
				className,
			)}
			initial={{ y: 100 }}
			animate={{ y: 0 }}
			transition={{ ...transitions.spring, delay: 0.2 }}
		>
			<div className="flex items-center justify-around px-2 py-2">
				{items.map((item) => {
					const isActive = item.id === activeId;
					const isPressed = item.id === pressedId;

					return (
						<motion.button
							key={item.id}
							className={cn(
								"relative flex flex-col items-center justify-center",
								"min-w-[64px] px-3 py-2 rounded-2xl",
								"transition-colors duration-200",
								isActive
									? "text-ruby-600 dark:text-ruby-400"
									: "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300",
								isActive && "bg-ruby-50 dark:bg-ruby-950/30",
							)}
							onClick={() => onChange(item.id)}
							onMouseDown={() => setPressedId(item.id)}
							onMouseUp={() => setPressedId(null)}
							onMouseLeave={() => setPressedId(null)}
							onTouchStart={() => setPressedId(item.id)}
							onTouchEnd={() => setPressedId(null)}
							whileTap={{ scale: 0.9 }}
							transition={transitions.spring}
						>
							{/* Icon container */}
							<div className="relative">
								<motion.div
									animate={{
										scale: isActive ? 1.1 : isPressed ? 0.9 : 1,
										y: isActive ? -2 : 0,
									}}
									transition={transitions.spring}
								>
									{isActive && item.activeIcon ? item.activeIcon : item.icon}
								</motion.div>

								{/* Badge */}
								{item.badge && item.badge > 0 && (
									<motion.span
										className={cn(
											"absolute -top-1 -right-1",
											"min-w-[18px] h-[18px] px-1",
											"flex items-center justify-center",
											"bg-ruby-500 text-white",
											"text-[10px] font-bold rounded-full",
										)}
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={transitions.spring}
									>
										{item.badge > 99 ? "99+" : item.badge}
									</motion.span>
								)}

								{/* Active indicator dot */}
								{isActive && (
									<motion.div
										className="absolute -bottom-1 left-1/2 w-1 h-1 rounded-full bg-ruby-500"
										layoutId="bottomNavIndicator"
										initial={{ scale: 0, x: "-50%" }}
										animate={{ scale: 1, x: "-50%" }}
										transition={transitions.spring}
									/>
								)}
							</div>

							{/* Label */}
							<motion.span
								className={cn("text-[10px] font-medium mt-1", isActive && "font-semibold")}
								animate={{
									opacity: isActive ? 1 : 0.8,
								}}
							>
								{item.label}
							</motion.span>
						</motion.button>
					);
				})}
			</div>
		</motion.nav>
	);
}

// ============================================
// FLOATING ACTION BUTTON (FAB)
// ============================================
export interface FABProps {
	/** Button icon */
	icon: React.ReactNode;
	/** Button label (for accessibility) */
	label: string;
	/** Click handler */
	onClick: () => void;
	/** Variant style */
	variant?: "primary" | "secondary" | "gradient";
	/** Position offset */
	position?: "center" | "right";
	className?: string;
}

export function FAB({ icon, label, onClick, variant = "primary", position = "center", className }: FABProps) {
	const variantClasses = {
		primary: "bg-ruby-600 text-white shadow-lg shadow-ruby-500/30",
		secondary: "bg-sapphire-600 text-white shadow-lg shadow-sapphire-500/30",
		gradient: "bg-ruby-700 text-white shadow-lg",
	};

	const positionClasses = {
		center: "left-1/2 -translate-x-1/2",
		right: "right-6",
	};

	return (
		<motion.button
			className={cn(
				"fixed bottom-24 z-50",
				positionClasses[position],
				"w-14 h-14 rounded-full",
				"flex items-center justify-center",
				variantClasses[variant],
				className,
			)}
			onClick={onClick}
			whileHover={{ scale: 1.1 }}
			whileTap={{ scale: 0.9 }}
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ ...transitions.spring, delay: 0.3 }}
			aria-label={label}
		>
			{icon}
		</motion.button>
	);
}

export default BottomNav;
