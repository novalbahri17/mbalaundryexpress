/**
 * MBA Laundry Express - API Security Wrapper
 * Secure wrapper untuk API calls
 */

import {
	checkRateLimit,
	decryptData,
	encryptData,
	flagSuspiciousIP,
	isIPBlocked,
	logSecurityEvent,
	sanitizeInput,
} from "@/middleware/security";
import { pb } from "./client";

// ============================================
// SECURE API CLIENT
// ============================================
class SecureAPIClient {
	private requestQueue: Map<string, Promise<unknown>> = new Map();

	// Get client IP (works on Vercel)
	private getClientIP(): string {
		if (typeof window === "undefined") return "server";

		// Use a simple fingerprint for rate limiting
		const fingerprint = [navigator.userAgent, navigator.language, screen.width, screen.height].join("|");

		// Simple hash
		let hash = 0;
		for (let i = 0; i < fingerprint.length; i++) {
			const char = fingerprint.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}

		return `client_${Math.abs(hash)}`;
	}

	// Rate limit check
	private checkRateLimit(action: string): boolean {
		const ip = this.getClientIP();
		const key = `${ip}:${action}`;

		const result = checkRateLimit(key, 50); // 50 requests per 15 min

		if (!result.allowed) {
			if (result.blocked) {
				throw new Error("Access temporarily blocked due to excessive requests");
			}
			throw new Error("Rate limit exceeded. Please try again later.");
		}

		return true;
	}

	// Input validation
	private validateInput(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
		const errors: string[] = [];

		for (const [key, value] of Object.entries(data)) {
			if (typeof value === "string") {
				// Check length
				if (value.length > 10000) {
					errors.push(`${key}: Input too long`);
				}

				// Sanitize
				const sanitized = sanitizeInput(value);
				if (sanitized.threats.length > 0) {
					errors.push(`${key}: Potentially malicious content detected`);
					flagSuspiciousIP(this.getClientIP());
				}
			}
		}

		return { valid: errors.length === 0, errors };
	}

	// Secure list records
	async listRecords<T>(collection: string, params?: Record<string, unknown>): Promise<T[]> {
		this.checkRateLimit(`list:${collection}`);

		try {
			const result = await pb.collection(collection).getFullList<T>({
				...params,
				$autoCancel: false,
			});

			return result;
		} catch (error) {
			this.handleError(error, `list:${collection}`);
			throw error;
		}
	}

	// Secure get single record
	async getRecord<T>(collection: string, id: string): Promise<T> {
		this.checkRateLimit(`get:${collection}`);

		// Validate ID format (prevent injection)
		if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
			throw new Error("Invalid record ID format");
		}

		try {
			const result = await pb.collection(collection).getOne<T>(id, {
				$autoCancel: false,
			});

			return result;
		} catch (error) {
			this.handleError(error, `get:${collection}:${id}`);
			throw error;
		}
	}

	// Secure create record
	async createRecord<T>(collection: string, data: Record<string, unknown>): Promise<T> {
		this.checkRateLimit(`create:${collection}`);

		// Validate input
		const validation = this.validateInput(data);
		if (!validation.valid) {
			logSecurityEvent("VALIDATION_FAILED", this.getClientIP(), {
				collection,
				errors: validation.errors,
			});
			throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
		}

		try {
			const result = await pb.collection(collection).create<T>(data);
			return result;
		} catch (error) {
			this.handleError(error, `create:${collection}`);
			throw error;
		}
	}

	// Secure update record
	async updateRecord<T>(collection: string, id: string, data: Record<string, unknown>): Promise<T> {
		this.checkRateLimit(`update:${collection}`);

		// Validate ID
		if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
			throw new Error("Invalid record ID format");
		}

		// Validate input
		const validation = this.validateInput(data);
		if (!validation.valid) {
			throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
		}

		try {
			const result = await pb.collection(collection).update<T>(id, data);
			return result;
		} catch (error) {
			this.handleError(error, `update:${collection}:${id}`);
			throw error;
		}
	}

	// Secure delete record
	async deleteRecord(collection: string, id: string): Promise<boolean> {
		this.checkRateLimit(`delete:${collection}`);

		// Validate ID
		if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
			throw new Error("Invalid record ID format");
		}

		try {
			await pb.collection(collection).delete(id);
			return true;
		} catch (error) {
			this.handleError(error, `delete:${collection}:${id}`);
			throw error;
		}
	}

	// Secure auth
	async authWithPassword(email: string, password: string): Promise<unknown> {
		this.checkRateLimit("auth:password");

		// Validate email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new Error("Invalid email format");
		}

		// Validate password length
		if (password.length < 6) {
			throw new Error("Password too short");
		}

		try {
			const result = await pb.collection("admins").authWithPassword(email, password);
			return result;
		} catch (error) {
			// Log failed auth attempt
			logSecurityEvent("AUTH_FAILED", this.getClientIP(), { email });
			throw error;
		}
	}

	// Error handler
	private handleError(error: unknown, context: string): void {
		const ip = this.getClientIP();

		if (error instanceof Error) {
			// Log suspicious errors
			if (error.message.includes("SQL") || error.message.includes("injection") || error.message.includes("script")) {
				flagSuspiciousIP(ip);
				logSecurityEvent("SUSPICIOUS_ERROR", ip, {
					context,
					message: error.message,
				});
			}
		}
	}
}

// Export singleton instance
export const secureAPI = new SecureAPIClient();

// ============================================
// SECURE STORAGE
// ============================================
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "mba-laundry-default-key";

export const secureStorage = {
	async setItem(key: string, value: string): Promise<void> {
		try {
			const encrypted = await encryptData(value, ENCRYPTION_KEY);
			localStorage.setItem(`secure_${key}`, encrypted);
		} catch {
			// Fallback to unencrypted if encryption fails
			localStorage.setItem(key, value);
		}
	},

	async getItem(key: string): Promise<string | null> {
		try {
			// Try encrypted first
			const encrypted = localStorage.getItem(`secure_${key}`);
			if (encrypted) {
				return await decryptData(encrypted, ENCRYPTION_KEY);
			}

			// Fallback to unencrypted
			return localStorage.getItem(key);
		} catch {
			return localStorage.getItem(key);
		}
	},

	removeItem(key: string): void {
		localStorage.removeItem(`secure_${key}`);
		localStorage.removeItem(key);
	},

	clear(): void {
		localStorage.clear();
	},
};

// ============================================
// REQUEST DEBOUNCING
// ============================================
export function debounceRequest<T>(key: string, request: () => Promise<T>, delay: number = 300): Promise<T> {
	const debounceKey = `debounce_${key}`;

	return new Promise((resolve, reject) => {
		// Clear existing timeout
		const existing = window.clearTimeout as unknown as number;
		if (existing) {
			clearTimeout(existing);
		}

		// Set new timeout
		const timeout = setTimeout(async () => {
			try {
				const result = await request();
				resolve(result);
			} catch (error) {
				reject(error);
			}
		}, delay);

		// Store timeout reference
		(window as unknown as Record<string, unknown>)[debounceKey] = timeout;
	});
}

// ============================================
// DATA MASKING
// ============================================
export function maskEmail(email: string): string {
	const [local, domain] = email.split("@");
	if (!domain) return email;

	const maskedLocal = local.charAt(0) + "*".repeat(local.length - 2) + local.charAt(local.length - 1);
	return `${maskedLocal}@${domain}`;
}

export function maskPhone(phone: string): string {
	const cleaned = phone.replace(/\D/g, "");
	if (cleaned.length < 4) return phone;

	return cleaned.slice(0, 2) + "*".repeat(cleaned.length - 4) + cleaned.slice(-2);
}

export function maskName(name: string): string {
	if (name.length < 3) return name;

	const parts = name.split(" ");
	return parts
		.map((part) => {
			if (part.length < 3) return part;
			return part.charAt(0) + "*".repeat(part.length - 2) + part.charAt(part.length - 1);
		})
		.join(" ");
}
