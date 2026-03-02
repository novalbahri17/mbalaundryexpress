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
	const [currentSrc, setCurrentSrc] = useState(() =>
		resolveImageUrl(src, fallbackLabel, fallbackStart, fallbackEnd),
	);

	useEffect(() => {
		setCurrentSrc(resolveImageUrl(src, fallbackLabel, fallbackStart, fallbackEnd));
	}, [src, fallbackLabel, fallbackStart, fallbackEnd]);

	return (
		<img
			{...props}
			src={currentSrc}
			onError={(event) => {
				setCurrentSrc(resolveImageUrl(undefined, fallbackLabel, fallbackStart, fallbackEnd));
				onError?.(event);
			}}
		/>
	);
}
