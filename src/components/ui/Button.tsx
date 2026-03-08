import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/index";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		"bg-gradient-to-r from-ruby-700 to-sapphire-700 text-white shadow-ruby-glow hover:shadow-sapphire-glow",
	secondary:
		"bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
	outline:
		"border border-neutral-300 bg-transparent text-neutral-900 hover:border-ruby-500 hover:text-ruby-600 dark:border-neutral-700 dark:text-neutral-100 dark:hover:border-ruby-400 dark:hover:text-ruby-300",
	ghost:
		"bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800/70",
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "h-10 px-4 text-sm",
	md: "h-11 px-5 text-sm",
	lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	motionDisabled?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{
		variant = "primary",
		size = "md",
		loading = false,
		motionDisabled = false,
		className,
		children,
		disabled,
		"aria-label": ariaLabel,
		...props
	},
		ref,
) {
	const isDisabled = disabled || loading;
	const needsAriaLabel = typeof children === "undefined" || children === null;

	return (
		<button
			ref={ref}
			type="button"
			disabled={isDisabled}
			aria-busy={loading}
			aria-label={needsAriaLabel ? ariaLabel ?? "button" : ariaLabel}
			className={cn(
				"inline-flex min-w-[44px] items-center justify-center gap-2 rounded-xl font-semibold outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-sapphire-500 disabled:cursor-not-allowed disabled:opacity-60",
				!motionDisabled && !isDisabled && "hover:scale-[1.02] active:scale-[0.98]",
				sizeClasses[size],
				variantClasses[variant],
				className,
			)}
			{...props}
		>
			{loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
			{children}
		</button>
	);
});

