import { useEffect, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { resolveImageUrl } from "@/utils/format";

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
	src?: string;
	fallbackLabel: string;
	fallbackStart?: string;
	fallbackEnd?: string;
};

export function SafeImage({
	src,
	fallbackLabel,
	fallbackStart,
	fallbackEnd,
	onError,
	...props
}: SafeImageProps) {
	const [hasError, setHasError] = useState(false);
	
	const resolvedSrc = resolveImageUrl(
		hasError ? undefined : src, 
		fallbackLabel, 
		fallbackStart, 
		fallbackEnd
	);

	useEffect(() => {
		setHasError(false);
	}, [src]);

	return (
		<img
			{...props}
			src={resolvedSrc}
			onError={(event) => {
				console.warn(`Image failed to load: ${src}, falling back to placeholder`);
				setHasError(true);
				onError?.(event);
			}}
		/>
	);
}
