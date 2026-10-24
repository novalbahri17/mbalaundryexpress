/**
 * MBA Laundry Express - Security Hooks
 * React hooks untuk keamanan client-side
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { logSecurityEvent } from "@/middleware/security";

// ============================================
// USE RATE LIMITER
// ============================================
interface RateLimitState {
	count: number;
	resetTime: number;
	blocked: boolean;
}

export function useRateLimiter(maxRequests: number = 10, windowMs: number = 60000) {
	const [state, setState] = useState<RateLimitState>({
		count: 0,
		resetTime: Date.now() + windowMs,
		blocked: false,
	});

	const checkLimit = useCallback((): boolean => {
		const now = Date.now();

		setState((prev) => {
			// Reset if window expired
			if (now > prev.resetTime) {
				return {
					count: 1,
					resetTime: now + windowMs,
					blocked: false,
				};
			}

			// Check limit
			if (prev.count >= maxRequests) {
				return { ...prev, blocked: true };
			}

			return { ...prev, count: prev.count + 1 };
		});

		return state.count < maxRequests && !state.blocked;
	}, [maxRequests, windowMs, state.count, state.blocked]);

	return { checkLimit, state };
}

// ============================================
// USE INPUT SANITIZER
// ============================================
const XSS_PATTERNS = [
	/<script[^>]*>.*?<\/script>/gi,
	/javascript:/gi,
	/on\w+\s*=/gi,
	/<iframe/gi,
	/<object/gi,
	/<embed/gi,
];

export function useInputSanitizer() {
	const sanitize = useCallback((input: string): string => {
		let clean = input;

		XSS_PATTERNS.forEach((pattern) => {
			clean = clean.replace(pattern, "");
		});

		return clean.replace(/[<>]/g, "").trim();
	}, []);

	const validateEmail = useCallback((email: string): boolean => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email) && email.length <= 254;
	}, []);

	const validatePhone = useCallback((phone: string): boolean => {
		const regex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
		return regex.test(phone.replace(/\s/g, ""));
	}, []);

	return { sanitize, validateEmail, validatePhone };
}

// ============================================
// USE CLICKJACKING PROTECTION
// ============================================
export function useClickjackingProtection() {
	useEffect(() => {
		// Prevent iframe embedding
		if (window.top !== window.self) {
			window.top.location = window.self.location;
		}

		// Add frame-busting script
		const style = document.createElement("style");
		style.textContent = `
			body { display: none !important; }
		`;

		const checkFrame = () => {
			if (window.top !== window.self) {
				document.head.appendChild(style);
				logSecurityEvent("CLICKJACKING_ATTEMPT", "client", {
					referrer: document.referrer,
				});
			}
		};

		checkFrame();
		window.addEventListener("load", checkFrame);

		return () => {
			window.removeEventListener("load", checkFrame);
		};
	}, []);
}

// ============================================
// USE SESSION TIMEOUT
// ============================================
export function useSessionTimeout(timeoutMinutes: number = 30, onTimeout: () => void) {
	const timeoutRef = useRef<NodeJS.Timeout>();
	const lastActivityRef = useRef<number>(Date.now());

	const resetTimer = useCallback(() => {
		lastActivityRef.current = Date.now();

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(
			() => {
				onTimeout();
			},
			timeoutMinutes * 60 * 1000,
		);
	}, [timeoutMinutes, onTimeout]);

	useEffect(() => {
		const events = ["mousedown", "keydown", "touchstart", "scroll"];

		const handleActivity = () => {
			resetTimer();
		};

		events.forEach((event) => {
			document.addEventListener(event, handleActivity);
		});

		resetTimer();

		return () => {
			events.forEach((event) => {
				document.removeEventListener(event, handleActivity);
			});
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [resetTimer]);

	return { resetTimer };
}

// ============================================
// USE SECURE FORM
// ============================================
export function useSecureForm<T extends Record<string, string>>(
	initialValues: T,
	onSubmit: (values: T) => Promise<void>,
) {
	const [values, setValues] = useState<T>(initialValues);
	const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { sanitize, validateEmail, validatePhone } = useInputSanitizer();
	const { checkLimit } = useRateLimiter(5, 60000); // 5 submits per minute

	const handleChange = useCallback(
		(name: keyof T, value: string) => {
			const sanitized = sanitize(value);
			setValues((prev) => ({ ...prev, [name]: sanitized }));
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		},
		[sanitize],
	);

	const validate = useCallback((): boolean => {
		const newErrors: Partial<Record<keyof T, string>> = {};

		for (const [key, value] of Object.entries(values)) {
			if (!value.trim()) {
				newErrors[key as keyof T] = "Field required";
				continue;
			}

			// Email validation
			if (key.includes("email") && !validateEmail(value)) {
				newErrors[key as keyof T] = "Invalid email format";
			}

			// Phone validation
			if (key.includes("phone") && !validatePhone(value)) {
				newErrors[key as keyof T] = "Invalid phone format";
			}

			// Length validation
			if (value.length > 1000) {
				newErrors[key as keyof T] = "Input too long";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [values, validateEmail, validatePhone]);

	const handleSubmit = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault();

			// Check rate limit
			if (!checkLimit()) {
				setErrors({ submit: "Too many attempts. Please try again later." } as Partial<Record<keyof T, string>>);
				return;
			}

			// Validate
			if (!validate()) {
				return;
			}

			setIsSubmitting(true);
			try {
				await onSubmit(values);
			} catch (error) {
				setErrors({ submit: "Submission failed. Please try again." } as Partial<Record<keyof T, string>>);
			} finally {
				setIsSubmitting(false);
			}
		},
		[checkLimit, validate, values, onSubmit],
	);

	return {
		values,
		errors,
		isSubmitting,
		handleChange,
		handleSubmit,
		setValues,
	};
}

// ============================================
// USE DEVTOOLS DETECTION
// ============================================
export function useDevtoolsDetection(onDetect: () => void) {
	useEffect(() => {
		const threshold = 160;

		const detect = () => {
			const widthThreshold = window.outerWidth - window.innerWidth > threshold;
			const heightThreshold = window.outerHeight - window.innerHeight > threshold;

			if (widthThreshold || heightThreshold) {
				onDetect();
				logSecurityEvent("DEVTOOLS_DETECTED", "client", {
					outerWidth: window.outerWidth,
					innerWidth: window.innerWidth,
				});
			}
		};

		window.addEventListener("resize", detect);
		detect();

		return () => {
			window.removeEventListener("resize", detect);
		};
	}, [onDetect]);
}

// ============================================
// USE BOT DETECTION
// ============================================
export function useBotDetection(): boolean {
	const [isBot, setIsBot] = useState(false);

	useEffect(() => {
		const checkBot = () => {
			const indicators = [
				!navigator.webdriver,
				navigator.languages?.length > 0,
				screen.colorDepth > 0,
				window.devicePixelRatio > 0,
				navigator.plugins?.length > 0,
			];

			// If more than 2 indicators fail, likely a bot
			const failedChecks = indicators.filter((i) => !i).length;

			if (failedChecks > 2) {
				setIsBot(true);
				logSecurityEvent("BOT_DETECTED", "client", {
					userAgent: navigator.userAgent,
					failedChecks,
				});
			}
		};

		checkBot();
	}, []);

	return isBot;
}

// ============================================
// USE ENCRYPTED STORAGE
// ============================================
export function useEncryptedStorage(key: string) {
	const [value, setValue] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const { secureStorage } = await import("@/api/security-wrapper");
				const stored = await secureStorage.getItem(key);
				setValue(stored);
			} catch {
				setValue(localStorage.getItem(key));
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [key]);

	const setStoredValue = useCallback(
		async (newValue: string | null) => {
			try {
				const { secureStorage } = await import("@/api/security-wrapper");
				if (newValue === null) {
					secureStorage.removeItem(key);
				} else {
					await secureStorage.setItem(key, newValue);
				}
				setValue(newValue);
			} catch {
				if (newValue === null) {
					localStorage.removeItem(key);
				} else {
					localStorage.setItem(key, newValue);
				}
				setValue(newValue);
			}
		},
		[key],
	);

	return { value, setValue: setStoredValue, loading };
}
