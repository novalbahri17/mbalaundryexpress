/**
 * MBA Laundry Express - Tabs Component
 * Premium tabs with animated indicator
 */

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils";
import { transitions } from "@/design-system/tokens/animations";

// ============================================
// TYPES
// ============================================
export interface Tab {
	id: string;
	label: string;
	icon?: React.ReactNode;
	badge?: number;
	disabled?: boolean;
}

export interface TabsProps {
	/** Tab items */
	tabs: Tab[];
	/** Active tab ID */
	activeTab: string;
	/** Tab change handler */
	onChange: (tabId: string) => void;
	/** Tab variant */
	variant?: "default" | "pills" | "underline" | "buttons";
	/** Tab size */
	size?: "sm" | "md" | "lg";
	/** Full width tabs */
	fullWidth?: boolean;
	/** Custom className */
	className?: string;
}

// ============================================
// COMPONENT
// ============================================
export function Tabs({
	tabs,
	activeTab,
	onChange,
	variant = "default",
	size = "md",
	fullWidth = false,
	className,
}: TabsProps) {
	const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
	const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
	const containerRef = useRef<HTMLDivElement>(null);

	// Update indicator position
	useEffect(() => {
		const activeTabElement = tabRefs.current.get(activeTab);
		const container = containerRef.current;

		if (activeTabElement && container) {
			const containerRect = container.getBoundingClientRect();
			const tabRect = activeTabElement.getBoundingClientRect();

			setIndicatorStyle({
				left: tabRect.left - containerRect.left,
				width: tabRect.width,
			});
		}
	}, [activeTab]);

	const sizes = {
		sm: "h-8 text-xs",
		md: "h-10 text-sm",
		lg: "h-12 text-base",
	};

	const variantClasses = {
		default: {
			container: "bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl",
			tab: "relative z-10 px-4 font-medium text-neutral-600 dark:text-neutral-400 transition-colors",
			active: "text-neutral-900 dark:text-white",
			disabled: "opacity-50 cursor-not-allowed",
			indicator: "absolute top-1 bottom-1 bg-white dark:bg-neutral-700 rounded-lg shadow-sm",
		},
		pills: {
			container: "gap-2",
			tab: "px-4 py-2 rounded-full font-medium transition-all",
			active: "bg-ruby-600 text-white shadow-lg shadow-ruby-500/25",
			inactive:
				"bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700",
			disabled: "opacity-50 cursor-not-allowed",
			indicator: "",
		},
		underline: {
			container: "border-b border-neutral-200 dark:border-neutral-700",
			tab: "px-4 pb-3 font-medium text-neutral-500 dark:text-neutral-400 transition-colors",
			active: "text-ruby-600 dark:text-ruby-400",
			disabled: "opacity-50 cursor-not-allowed",
			indicator: "absolute bottom-0 h-0.5 bg-ruby-600 dark:bg-ruby-400 rounded-full",
		},
		buttons: {
			container: "gap-2",
			tab: "px-4 rounded-lg font-medium border-2 transition-all",
			active: "border-ruby-600 bg-ruby-50 dark:bg-ruby-950/30 text-ruby-600 dark:text-ruby-400",
			inactive:
				"border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600",
			disabled: "opacity-50 cursor-not-allowed",
			indicator: "",
		},
	};

	const currentVariant = variantClasses[variant];

	return (
		<div
			ref={containerRef}
			className={cn(
				"relative flex",
				currentVariant.container,
				fullWidth && "w-full",
				variant !== "underline" && "overflow-x-auto scrollbar-hide",
				className,
			)}
		>
			{/* Animated indicator (for default and underline variants) */}
			{(variant === "default" || variant === "underline") && (
				<motion.div
					className={currentVariant.indicator}
					animate={{
						left: indicatorStyle.left,
						width: indicatorStyle.width,
					}}
					transition={transitions.spring}
				/>
			)}

			{/* Tabs */}
			{tabs.map((tab) => {
				const isActive = tab.id === activeTab;

				return (
					<motion.button
						key={tab.id}
						ref={(el) => {
							if (el) tabRefs.current.set(tab.id, el);
						}}
						onClick={() => !tab.disabled && onChange(tab.id)}
						disabled={tab.disabled}
						className={cn(
							"flex items-center gap-2 whitespace-nowrap",
							sizes[size],
							currentVariant.tab,
							isActive && currentVariant.active,
							!isActive && "inactive" in currentVariant && currentVariant.inactive,
							tab.disabled && currentVariant.disabled,
							fullWidth && "flex-1 justify-center",
						)}
						whileHover={tab.disabled ? undefined : { scale: 1.02 }}
						whileTap={tab.disabled ? undefined : { scale: 0.98 }}
					>
						{tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
						<span>{tab.label}</span>
						{tab.badge !== undefined && tab.badge > 0 && (
							<span
								className={cn(
									"ml-1 px-1.5 py-0.5 text-xs rounded-full",
									isActive
										? "bg-white/20 text-white"
										: "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400",
								)}
							>
								{tab.badge}
							</span>
						)}
					</motion.button>
				);
			})}
		</div>
	);
}

// ============================================
// TAB PANEL
// ============================================
export interface TabPanelProps {
	/** Panel content */
	children: React.ReactNode;
	/** Panel ID (matches tab ID) */
	id: string;
	/** Active tab ID */
	activeTab: string;
	/** Animate panel switch */
	animate?: boolean;
}

export function TabPanel({ children, id, activeTab, animate = true }: TabPanelProps) {
	const isActive = id === activeTab;

	if (!isActive) return null;

	if (!animate) {
		return <div>{children}</div>;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			transition={transitions.normal}
		>
			{children}
		</motion.div>
	);
}

export default Tabs;
