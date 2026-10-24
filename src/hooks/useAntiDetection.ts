/**
 * MBA Laundry Express - Anti-Detection Hook
 * React hook untuk menghindari deteksi teknologi
 */

import { useEffect } from "react";
import { initAntiDetection } from "@/utils/anti-fingerprint";

export function useAntiDetection(): void {
	useEffect(() => {
		initAntiDetection();
	}, []);
}

export default useAntiDetection;
