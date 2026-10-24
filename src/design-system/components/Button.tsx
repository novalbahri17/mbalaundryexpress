/**
 * MBA Laundry Express - Button Component
 * Premium button with motion design
 */

import { type HTMLMotionProps, motion } from "framer-motion";
import { forwardRef, useState } from "react";
import { transitions } from "@/design-system/tokens/animations";
import { cn } from "@/utils";

// ============================================
// TYPES
// ============================================
export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
	/** Visual style variant */
	variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
	/** Button size */
	size?: "sm" | "md" | "lg" | "xl" | "icon";
	/** Full width button */
	fullWidth?: boolean;
	/** Loading state */
	isLoading?: boolean;
	/** Disabled state */
	isDisabled?: boolean;
	/** Show ripple effect */
	ripple?: boolean;
	/** Icon before text */
	leftIcon?: React.ReactNode;
	/** Icon after text */
	rightIcon?: React.ReactNode;
}

// ============================================
// STYLES
// ============================================
const variants = {
	primary: cn(
		"bg-ruby-600 text-white",
		"hover:bg-ruby-700",
		"active:bg-ruby-800",
		"focus:ring-2 focus:ring-ruby-500 focus:ring-offset-2",
		"dark:bg-ruby-500 dark:hover:bg-ruby-600",
		"shadow-lg shadow-ruby-500/25 dark:shadow-ruby-500/10",
	),

	secondary: cn(
		"bg-sapphire-600 text-white",
		"hover:bg-sapphire-700",
		"active:bg-sapphire-800",
		"focus:ring-2 focus:ring-sapphire-500 focus:ring-offset-2",
		"dark:bg-sapphire-500 dark:hover:bg-sapphire-600",
		"shadow-lg shadow-sapphire-500/25 dark:shadow-sapphire-500/10",
	),

	outline: cn(
		"border-2 border-neutral-300 bg-transparent text-neutral-700",
		"hover:border-ruby-500 hover:text-ruby-600",
		"active:border-ruby-600 active:text-ruby-700",
		"focus:ring-2 focus:ring-ruby-500 focus:ring-offset-2",
		"dark:border-neutral-600 dark:text-neutral-300",
		"dark:hover:border-ruby-400 dark:hover:text-ruby-400",
	),

	ghost: cn(
		"bg-transparent text-neutral-700",
		"hover:bg-neutral-100",
		"active:bg-neutral-200",
		"focus:ring-2 focus:ring-neutral-400",
		"dark:text-neutral-300 dark:hover:bg-neutral-800",
		"dark:active:bg-neutral-700",
	),

	danger: cn(
		"bg-red-600 text-white",
		"hover:bg-red-700",
		"active:bg-red-800",
		"focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
		"dark:bg-red-500 dark:hover:bg-red-600",
		"shadow-lg shadow-red-500/25",
	),

	success: cn(
		"bg-teal-600 text-white",
		"hover:bg-teal-700",
		"active:bg-teal-800",
		"focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
		"dark:bg-teal-500 dark:hover:bg-teal-600",
		"shadow-lg shadow-teal-500/25",
	),
};

const sizes = {
	sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
	md: "h-10 px-4 text-sm rounded-xl gap-2",
	lg: "h-12 px-6 text-base rounded-xl gap-2",
	xl: "h-14 px-8 text-lg rounded-2xl gap-3",
	icon: "h-11 w-11 p-0 rounded-xl",
};

const iconSizes = {
	sm: "w-3.5 h-3.5",
	md: "w-4 h-4",
	lg: "w-5 h-5",
	xl: "w-6 h-6",
	icon: "w-5 h-5",
};

// ============================================
// RIPPLE EFFECT
// ============================================
interface Ripple {
	x: number;
	y: number;
	id: number;
}

function useRipple() {
	const [ripples, setRipples] = useState<Ripple[]>([]);

	const addRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
		const button = event.currentTarget;
		const rect = button.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const id = Date.now();

		setRipples((prev) => [...prev, { x, y, id }]);
		setTimeout(() => {
			setRipples((prev) => prev.filter((r) => r.id !== id));
		}, 600);
	};

	return { ripples, addRipple };
}

// ============================================
// COMPONENT
// ============================================
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "primary",
			size = "md",
			fullWidth = false,
			isLoading = false,
			isDisabled = false,
			ripple = true,
			leftIcon,
			rightIcon,
			children,
			className,
			onClick,
			...props
		},
		ref,
	) => {
		const { ripples, addRipple } = useRipple();
		const isDisabledState = isDisabled || isLoading;

		const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			if (ripple && !isDisabledState) {
				addRipple(event);
			}
			onClick?.(event);
		};

		return (
			<motion.button
				ref={ref}
				disabled={isDisabledState}
				className={cn(
					// Base styles
					"relative inline-flex items-center justify-center",
					"font-semibold tracking-wide",
					"transition-colors duration-200",
					"focus:outline-none focus-visible:ring-2",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"overflow-hidden",

					// Variant & Size
					variants[variant],
					sizes[size],

					// Full width
					fullWidth && "w-full",

					className,
				)}
				whileHover={isDisabledState ? undefined : { scale: 1.02 }}
				whileTap={isDisabledState ? undefined : { scale: 0.98 }}
				transition={transitions.spring}
				onClick={handleClick}
				{...props}
			>
				{/* Ripple effects */}
				{ripple &&
					ripples.map((r) => (
						<motion.span
							key={r.id}
							className="absolute rounded-full bg-white/30 pointer-events-none"
							style={{
								left: r.x,
								top: r.y,
								width: 10,
								height: 10,
								marginLeft: -5,
								marginTop: -5,
							}}
							initial={{ scale: 0, opacity: 0.5 }}
							animate={{ scale: 20, opacity: 0 }}
							transition={{ duration: 0.6, ease: "easeOut" }}
						/>
					))}

				{/* Loading spinner */}
				{isLoading && (
					<motion.svg
						className={cn("animate-spin mr-2", iconSizes[size])}
						fill="none"
						viewBox="0 0 24 24"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</motion.svg>
				)}

				{/* Left icon */}
				{!isLoading && leftIcon && <span className={cn("flex-shrink-0", iconSizes[size])}>{leftIcon}</span>}

				{/* Content */}
				<span className="relative z-10">{children as React.ReactNode}</span>

				{/* Right icon */}
				{rightIcon && <span className={cn("flex-shrink-0", iconSizes[size])}>{rightIcon}</span>}
			</motion.button>
		);
	},
);

Button.displayName = "Button";

export default Button;
