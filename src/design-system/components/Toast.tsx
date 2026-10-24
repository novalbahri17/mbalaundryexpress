/**
 * MBA Laundry Express - Toast Component
 * Premium toast notifications with stack management
 */

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { transitions } from "@/design-system/tokens/animations";
import { cn } from "@/utils";

// ============================================
// TYPES
// ============================================
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
}

export interface ToastProps {
	toast: Toast;
	onRemove: (id: string) => void;
}

export interface ToastContainerProps {
	/** Toast position */
	position?: "top-left" | "top-right" | "top-center" | "bottom-left" | "bottom-right" | "bottom-center";
	/** Maximum visible toasts */
	maxToasts?: number;
}

// ============================================
// TOAST STORE (Global state)
// ============================================
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

const notifyListeners = () => {
	toastListeners.forEach((listener) => listener([...toasts]));
};

const toastService = {
	add: (toast: Omit<Toast, "id">) => {
		const id = Math.random().toString(36).substring(2, 9);
		const newToast = { ...toast, id, duration: toast.duration ?? 5000 };
		toasts = [newToast, ...toasts].slice(0, 5); // Max 5 toasts
		notifyListeners();

		// Auto remove
		if (newToast.duration > 0) {
			setTimeout(() => {
				toastService.remove(id);
			}, newToast.duration);
		}

		return id;
	},

	remove: (id: string) => {
		toasts = toasts.filter((t) => t.id !== id);
		notifyListeners();
	},

	success: (title: string, message?: string, duration?: number) => {
		return toastService.add({ type: "success", title, message, duration });
	},

	error: (title: string, message?: string, duration?: number) => {
		return toastService.add({ type: "error", title, message, duration });
	},

	warning: (title: string, message?: string, duration?: number) => {
		return toastService.add({ type: "warning", title, message, duration });
	},

	info: (title: string, message?: string, duration?: number) => {
		return toastService.add({ type: "info", title, message, duration });
	},

	subscribe: (listener: (toasts: Toast[]) => void) => {
		toastListeners.push(listener);
		return () => {
			toastListeners = toastListeners.filter((l) => l !== listener);
		};
	},
};

// Export toast object
export const toast = toastService;

// ============================================
// TOAST ICONS
// ============================================
const icons = {
	success: CheckCircle,
	error: AlertCircle,
	warning: AlertTriangle,
	info: Info,
};

const iconColors = {
	success: "text-teal-500 bg-teal-50 dark:bg-teal-950/30",
	error: "text-red-500 bg-red-50 dark:bg-red-950/30",
	warning: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
	info: "text-sapphire-500 bg-sapphire-50 dark:bg-sapphire-950/30",
};

const borderColors = {
	success: "border-teal-200 dark:border-teal-800",
	error: "border-red-200 dark:border-red-800",
	warning: "border-amber-200 dark:border-amber-800",
	info: "border-sapphire-200 dark:border-sapphire-800",
};

// ============================================
// TOAST ITEM
// ============================================
export function ToastItem({ toast, onRemove }: ToastProps) {
	const Icon = icons[toast.type];

	return (
		<motion.div
			className={cn(
				"relative w-full max-w-sm",
				"bg-white dark:bg-neutral-800",
				"border rounded-2xl shadow-lg",
				"overflow-hidden",
				borderColors[toast.type],
			)}
			layout
			initial={{ opacity: 0, y: -20, scale: 0.9 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, x: 100, scale: 0.9 }}
			transition={transitions.spring}
		>
			{/* Progress bar */}
			{toast.duration && toast.duration > 0 && (
				<motion.div
					className={cn(
						"absolute bottom-0 left-0 h-1",
						toast.type === "success" && "bg-teal-500",
						toast.type === "error" && "bg-red-500",
						toast.type === "warning" && "bg-amber-500",
						toast.type === "info" && "bg-sapphire-500",
					)}
					initial={{ width: "100%" }}
					animate={{ width: "0%" }}
					transition={{ duration: toast.duration / 1000, ease: "linear" }}
				/>
			)}

			<div className="flex items-start gap-3 p-4">
				{/* Icon */}
				<div
					className={cn("flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center", iconColors[toast.type])}
				>
					<Icon className="w-5 h-5" />
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<h4 className="font-semibold text-neutral-900 dark:text-white">{toast.title}</h4>
					{toast.message && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{toast.message}</p>}
				</div>

				{/* Close button */}
				<motion.button
					onClick={() => onRemove(toast.id)}
					className="flex-shrink-0 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
				>
					<X className="w-4 h-4 text-neutral-400" />
				</motion.button>
			</div>
		</motion.div>
	);
}

// ============================================
// TOAST CONTAINER
// ============================================
export function ToastContainer({ position = "top-right", maxToasts = 5 }: ToastContainerProps) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	useEffect(() => {
		return toast.subscribe(setToasts);
	}, []);

	const handleRemove = useCallback((id: string) => {
		toast.remove(id);
	}, []);

	const positionClasses = {
		"top-left": "top-4 left-4",
		"top-right": "top-4 right-4",
		"top-center": "top-4 left-1/2 -translate-x-1/2",
		"bottom-left": "bottom-4 left-4",
		"bottom-right": "bottom-4 right-4",
		"bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
	};

	const visibleToasts = toasts.slice(0, maxToasts);

	return (
		<div className={cn("fixed z-[9999] flex flex-col gap-3", positionClasses[position])}>
			<AnimatePresence mode="popLayout">
				{visibleToasts.map((t) => (
					<ToastItem key={t.id} toast={t} onRemove={handleRemove} />
				))}
			</AnimatePresence>
		</div>
	);
}

export default ToastContainer;
