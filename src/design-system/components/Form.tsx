/**
 * MBA Laundry Express - Form Components
 * Premium form elements with validation states
 */

import { motion } from "framer-motion";
import { forwardRef, useState } from "react";
import { Eye, EyeOff, Check, ChevronDown } from "lucide-react";
import { cn } from "@/utils";

// ============================================
// INPUT COMPONENT
// ============================================
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
	/** Input label */
	label?: string;
	/** Helper text */
	helperText?: string;
	/** Error message */
	error?: string;
	/** Left icon */
	leftIcon?: React.ReactNode;
	/** Right icon */
	rightIcon?: React.ReactNode;
	/** Input size */
	inputSize?: "sm" | "md" | "lg";
	/** Full width */
	fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{ label, helperText, error, leftIcon, rightIcon, inputSize = "md", fullWidth = false, className, ...props },
		ref,
	) => {
		const [isFocused, setIsFocused] = useState(false);
		const [showPassword, setShowPassword] = useState(false);

		const isPassword = props.type === "password";
		const inputType = isPassword ? (showPassword ? "text" : "password") : props.type;

		const sizes = {
			sm: "h-9 px-3 text-sm",
			md: "h-11 px-4 text-base",
			lg: "h-13 px-5 text-lg",
		};

		const iconSizes = {
			sm: "w-4 h-4",
			md: "w-5 h-5",
			lg: "w-6 h-6",
		};

		return (
			<div className={cn(fullWidth && "w-full")}>
				{/* Label */}
				{label && (
					<label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
						{label}
						{props.required && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}

				{/* Input wrapper */}
				<div className="relative">
					{/* Left icon */}
					{leftIcon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">{leftIcon}</div>}

					{/* Input */}
					<input
						ref={ref}
						className={cn(
							"w-full bg-white dark:bg-neutral-800",
							"border-2 rounded-xl",
							"text-neutral-900 dark:text-white placeholder-neutral-400",
							"transition-all duration-200",
							"focus:outline-none",
							sizes[inputSize],
							leftIcon && "pl-11",
							(rightIcon || isPassword) && "pr-11",
							error
								? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
								: "border-neutral-200 dark:border-neutral-700 focus:border-ruby-500 focus:ring-4 focus:ring-ruby-500/10 dark:focus:border-ruby-400",
							className,
						)}
						onFocus={() => setIsFocused(true)}
						onBlur={() => setIsFocused(false)}
						type={inputType}
						{...props}
					/>
					<motion.div
						className="absolute inset-0 pointer-events-none rounded-xl"
						animate={{ scale: isFocused ? 1.005 : 1 }}
						transition={{ duration: 0.2 }}
					/>

					{/* Right icon / Password toggle */}
					<div className="absolute right-4 top-1/2 -translate-y-1/2">
						{isPassword ? (
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
							>
								{showPassword ? <EyeOff className={iconSizes[inputSize]} /> : <Eye className={iconSizes[inputSize]} />}
							</button>
						) : (
							rightIcon && <span className="text-neutral-400">{rightIcon}</span>
						)}
					</div>
				</div>

				{/* Helper text / Error */}
				{(helperText || error) && (
					<motion.p
						className={cn("mt-2 text-sm", error ? "text-red-500" : "text-neutral-500 dark:text-neutral-400")}
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
					>
						{error || helperText}
					</motion.p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

// ============================================
// SELECT COMPONENT
// ============================================
export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
	/** Select label */
	label?: string;
	/** Helper text */
	helperText?: string;
	/** Error message */
	error?: string;
	/** Options */
	options: SelectOption[];
	/** Select size */
	size?: "sm" | "md" | "lg";
	/** Full width */
	fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ label, helperText, error, options, size = "md", fullWidth = false, className, ...props }, ref) => {
		const sizes = {
			sm: "h-9 px-3 text-sm",
			md: "h-11 px-4 text-base",
			lg: "h-13 px-5 text-lg",
		};

		return (
			<div className={cn(fullWidth && "w-full")}>
				{/* Label */}
				{label && (
					<label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
						{label}
						{props.required && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}

				{/* Select wrapper */}
				<div className="relative">
					<select
						ref={ref}
						className={cn(
							"w-full appearance-none bg-white dark:bg-neutral-800",
							"border-2 rounded-xl pr-10",
							"text-neutral-900 dark:text-white",
							"transition-all duration-200",
							"focus:outline-none focus:border-ruby-500 focus:ring-4 focus:ring-ruby-500/10",
							error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
							sizes[size],
							className,
						)}
						{...props}
					>
						{options.map((option) => (
							<option key={option.value} value={option.value} disabled={option.disabled}>
								{option.label}
							</option>
						))}
					</select>

					{/* Chevron icon */}
					<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
						<ChevronDown className="w-5 h-5" />
					</div>
				</div>

				{/* Helper text / Error */}
				{(helperText || error) && (
					<p className={cn("mt-2 text-sm", error ? "text-red-500" : "text-neutral-500 dark:text-neutral-400")}>
						{error || helperText}
					</p>
				)}
			</div>
		);
	},
);

Select.displayName = "Select";

// ============================================
// CHECKBOX COMPONENT
// ============================================
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	/** Checkbox label */
	label?: string;
	/** Helper text */
	helperText?: string;
	/** Error message */
	error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ label, helperText, error, className, ...props }, ref) => {
		return (
			<div className={className}>
				<label className="flex items-start gap-3 cursor-pointer">
					<div className="relative flex-shrink-0 mt-0.5">
						<input ref={ref} type="checkbox" className="peer sr-only" {...props} />
						<div
							className={cn(
								"w-5 h-5 rounded-md border-2 transition-all duration-200",
								"bg-white dark:bg-neutral-800",
								"border-neutral-300 dark:border-neutral-600",
								"peer-checked:bg-ruby-600 peer-checked:border-ruby-600",
								"peer-focus:ring-2 peer-focus:ring-ruby-500/20",
								error && "border-red-500",
							)}
						>
							<Check className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity" />
						</div>
					</div>

					<div className="flex-1">
						{label && <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</span>}
						{helperText && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{helperText}</p>}
						{error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
					</div>
				</label>
			</div>
		);
	},
);

Checkbox.displayName = "Checkbox";

// ============================================
// TEXTAREA COMPONENT
// ============================================
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	/** Textarea label */
	label?: string;
	/** Helper text */
	helperText?: string;
	/** Error message */
	error?: string;
	/** Full width */
	fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ label, helperText, error, fullWidth = false, className, ...props }, ref) => {
		return (
			<div className={cn(fullWidth && "w-full")}>
				{/* Label */}
				{label && (
					<label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
						{label}
						{props.required && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}

				{/* Textarea */}
				<textarea
					ref={ref}
					className={cn(
						"w-full min-h-[120px] p-4",
						"bg-white dark:bg-neutral-800",
						"border-2 rounded-xl",
						"text-neutral-900 dark:text-white placeholder-neutral-400",
						"transition-all duration-200",
						"focus:outline-none focus:border-ruby-500 focus:ring-4 focus:ring-ruby-500/10",
						"resize-y",
						error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
						className,
					)}
					{...props}
				/>

				{/* Helper text / Error */}
				{(helperText || error) && (
					<p className={cn("mt-2 text-sm", error ? "text-red-500" : "text-neutral-500 dark:text-neutral-400")}>
						{error || helperText}
					</p>
				)}
			</div>
		);
	},
);

Textarea.displayName = "Textarea";

export default { Input, Select, Checkbox, Textarea };
