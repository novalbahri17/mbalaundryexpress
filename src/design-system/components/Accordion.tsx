/**
 * MBA Laundry Express - Accordion Component
 * Premium accordion with smooth animations
 */

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { transitions } from "@/design-system/tokens/animations";
import { cn } from "@/utils";

// ============================================
// TYPES
// ============================================
export interface AccordionItem {
	id: string;
	title: string;
	content: React.ReactNode;
	disabled?: boolean;
}

export interface AccordionProps {
	/** Accordion items */
	items: AccordionItem[];
	/** Allow multiple open items */
	allowMultiple?: boolean;
	/** Default open item IDs */
	defaultOpen?: string[];
	/** Custom className */
	className?: string;
	/** Variant style */
	variant?: "default" | "separated" | "bordered";
}

// ============================================
// COMPONENT
// ============================================
export function Accordion({
	items,
	allowMultiple = false,
	defaultOpen = [],
	className,
	variant = "default",
}: AccordionProps) {
	const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

	const toggleItem = (id: string) => {
		if (openItems.includes(id)) {
			setOpenItems(openItems.filter((item) => item !== id));
		} else {
			if (allowMultiple) {
				setOpenItems([...openItems, id]);
			} else {
				setOpenItems([id]);
			}
		}
	};

	const variantClasses = {
		default: {
			container: "divide-y divide-neutral-200 dark:divide-neutral-700",
			item: "",
		},
		separated: {
			container: "space-y-3",
			item: "bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden",
		},
		bordered: {
			container:
				"border border-neutral-200 dark:border-neutral-700 rounded-2xl divide-y divide-neutral-200 dark:divide-neutral-700 overflow-hidden",
			item: "",
		},
	};

	const currentVariant = variantClasses[variant];

	return (
		<div className={cn(currentVariant.container, className)}>
			{items.map((item) => {
				const isOpen = openItems.includes(item.id);

				return (
					<div key={item.id} className={currentVariant.item}>
						<motion.button
							onClick={() => !item.disabled && toggleItem(item.id)}
							disabled={item.disabled}
							className={cn(
								"w-full flex items-center justify-between p-5 text-left",
								"transition-colors duration-200",
								!item.disabled && "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
								item.disabled && "opacity-50 cursor-not-allowed",
							)}
							whileHover={item.disabled ? undefined : { x: 2 }}
						>
							<span
								className={cn(
									"font-semibold text-neutral-900 dark:text-white",
									isOpen && "text-ruby-600 dark:text-ruby-400",
								)}
							>
								{item.title}
							</span>

							<motion.div
								animate={{ rotate: isOpen ? 180 : 0 }}
								transition={transitions.spring}
								className={cn(
									"flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
									isOpen
										? "bg-ruby-100 text-ruby-600 dark:bg-ruby-950/30 dark:text-ruby-400"
										: "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400",
								)}
							>
								<ChevronDown className="w-5 h-5" />
							</motion.div>
						</motion.button>

						<AnimatePresence initial={false}>
							{isOpen && (
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
									className="overflow-hidden"
								>
									<div className="px-5 pb-5 text-neutral-600 dark:text-neutral-300">{item.content}</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				);
			})}
		</div>
	);
}

// ============================================
// FAQ ACCORDION (Specialized)
// ============================================
export interface FAQItem {
	question: string;
	answer: React.ReactNode;
}

export interface FAQAccordionProps {
	items: FAQItem[];
	className?: string;
}

export function FAQAccordion({ items, className }: FAQAccordionProps) {
	const accordionItems: AccordionItem[] = items.map((item, index) => ({
		id: `faq-${index}`,
		title: item.question,
		content: item.answer,
	}));

	return <Accordion items={accordionItems} variant="separated" allowMultiple className={className} />;
}

export default Accordion;
