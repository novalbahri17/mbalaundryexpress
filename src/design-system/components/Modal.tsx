/**
 * MBA Laundry Express - Modal Component
 * Premium modal with backdrop blur and animations
 */

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { transitions } from "@/design-system/tokens/animations";
import { cn } from "@/utils";

// ============================================
// TYPES
// ============================================
export interface ModalProps {
	/** Modal visibility */
	isOpen: boolean;
	/** Close handler */
	onClose: () => void;
	/** Modal content */
	children: React.ReactNode;
	/** Modal title */
	title?: string;
	/** Modal description */
	description?: string;
	/** Modal size */
	size?: "sm" | "md" | "lg" | "xl" | "full";
	/** Show close button */
	showCloseButton?: boolean;
	/** Close on backdrop click */
	closeOnBackdrop?: boolean;
	/** Close on escape key */
	closeOnEscape?: boolean;
	/** Custom className */
	className?: string;
	/** Header content */
	header?: React.ReactNode;
	/** Footer content */
	footer?: React.ReactNode;
}

// ============================================
// STYLES
// ============================================
const sizes = {
	sm: "max-w-md",
	md: "max-w-lg",
	lg: "max-w-2xl",
	xl: "max-w-4xl",
	full: "max-w-full mx-4",
};

// ============================================
// COMPONENT
// ============================================
export function Modal({
	isOpen,
	onClose,
	children,
	title,
	description,
	size = "md",
	showCloseButton = true,
	closeOnBackdrop = true,
	closeOnEscape = true,
	className,
	header,
	footer,
}: ModalProps) {
	// Handle escape key
	const handleEscape = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape" && closeOnEscape) {
				onClose();
			}
		},
		[closeOnEscape, onClose],
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "";
		};
	}, [isOpen, handleEscape]);

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget && closeOnBackdrop) {
			onClose();
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* Backdrop */}
					<motion.div
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={transitions.normal}
						onClick={handleBackdropClick}
					/>

					{/* Modal */}
					<motion.div
						className={cn("relative w-full mx-4", sizes[size], className)}
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={transitions.spring}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
							{/* Header */}
							{(title || description || header || showCloseButton) && (
								<div className="flex items-start justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
									<div className="flex-1">
										{header || (
											<>
												{title && <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{title}</h2>}
												{description && (
													<p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
												)}
											</>
										)}
									</div>
									{showCloseButton && (
										<motion.button
											onClick={onClose}
											className="ml-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
											whileHover={{ scale: 1.1 }}
											whileTap={{ scale: 0.9 }}
										>
											<X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
										</motion.button>
									)}
								</div>
							)}

							{/* Content */}
							<div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>

							{/* Footer */}
							{footer && (
								<div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
									{footer}
								</div>
							)}
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}

// ============================================
// CONFIRM MODAL
// ============================================
export interface ConfirmModalProps extends Omit<ModalProps, "children" | "footer"> {
	/** Confirm button text */
	confirmText?: string;
	/** Cancel button text */
	cancelText?: string;
	/** Confirm button variant */
	confirmVariant?: "primary" | "danger" | "success";
	/** Confirm handler */
	onConfirm: () => void;
	/** Message content */
	message: React.ReactNode;
}

export function ConfirmModal({
	confirmText = "Konfirmasi",
	cancelText = "Batal",
	confirmVariant = "primary",
	message,
	onConfirm,
	...props
}: ConfirmModalProps) {
	const variantClasses = {
		primary: "bg-ruby-600 hover:bg-ruby-700 text-white",
		danger: "bg-red-600 hover:bg-red-700 text-white",
		success: "bg-teal-600 hover:bg-teal-700 text-white",
	};

	return (
		<Modal
			{...props}
			footer={
				<div className="flex justify-end gap-3">
					<button
						onClick={props.onClose}
						className="px-4 py-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						className={cn("px-4 py-2 rounded-xl font-medium transition-colors", variantClasses[confirmVariant])}
					>
						{confirmText}
					</button>
				</div>
			}
		>
			{message}
		</Modal>
	);
}

export default Modal;
