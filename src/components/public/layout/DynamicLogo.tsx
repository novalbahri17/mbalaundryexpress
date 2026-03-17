import { useBranding } from "@/hooks/useBranding";
import { Link } from "react-router-dom";

interface DynamicLogoProps {
	className?: string;
	onClick?: () => void;
}

export function DynamicLogo({ className = "", onClick }: DynamicLogoProps) {
	const { data: branding, isLoading } = useBranding();

	if (isLoading || !branding) {
		// Fallback loading state
		return (
			<Link to="/" className={`flex items-center gap-2 ${className}`} onClick={onClick}>
				<div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200" />
				<div className="flex flex-col">
					<div className="h-3 w-8 animate-pulse rounded bg-neutral-200" />
					<div className="mt-1 h-4 w-24 animate-pulse rounded bg-neutral-200" />
				</div>
			</Link>
		);
	}

	const {
		logo_url,
		logo_width,
		logo_height,
		text_mba_size,
		text_mba_weight,
		text_mba_color,
		text_brand_size,
		text_brand_weight,
		text_brand_color,
		text_brand_gradient,
		text_brand_gradient_from,
		text_brand_gradient_to,
	} = branding;

	const brandTextStyle: React.CSSProperties = text_brand_gradient
		? {
				backgroundImage: `linear-gradient(135deg, ${text_brand_gradient_from}, ${text_brand_gradient_to})`,
				WebkitBackgroundClip: "text",
				backgroundClip: "text",
				color: "transparent",
		  }
		: { color: text_brand_color };

	return (
		<Link to="/" className={`flex items-center gap-2 ${className}`} onClick={onClick}>
			{/* Logo Image */}
			<img
				src={logo_url}
				alt="MBA Laundry"
				width={logo_width}
				height={logo_height}
				className="object-contain"
				style={{ width: logo_width, height: logo_height }}
			/>

			{/* Text */}
			<div className="flex flex-col leading-none">
				<span
					className="tracking-wider uppercase"
					style={{
						fontSize: text_mba_size,
						fontWeight: text_mba_weight,
						color: text_mba_color,
					}}
				>
					MBA
				</span>
				<span
					className="tracking-wide uppercase"
					style={{
						fontSize: text_brand_size,
						fontWeight: text_brand_weight,
						...brandTextStyle,
					}}
				>
					LAUNDRY EXPRESS
				</span>
			</div>
		</Link>
	);
}
