import Lottie, { type LottieComponentProps } from "lottie-react";

type LottiePlayerProps = {
	animationData: object;
	loop?: boolean;
	autoplay?: boolean;
	className?: string;
	style?: LottieComponentProps["style"];
};

export function LottiePlayer({
	animationData,
	loop = true,
	autoplay = true,
	className,
	style,
}: LottiePlayerProps) {
	return <Lottie animationData={animationData} loop={loop} autoplay={autoplay} className={className} style={style} />;
}

