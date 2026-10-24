/**
 * MBA Laundry Express - Security Middleware
 * Comprehensive security layer for Vercel deployment
 * Protects against: XSS, CSRF, SQL Injection, DDoS, Clickjacking
 */

import type { NextApiRequest, NextApiResponse } from "next";

// ============================================
// SECURITY CONFIGURATION
// ============================================
export const SECURITY_CONFIG = {
	// Rate Limiting
	RATE_LIMIT: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		maxRequests: 100, // per IP
		maxAuthRequests: 5, // login attempts
		blockDuration: 60 * 60 * 1000, // 1 hour block
	},

	// CORS Settings
	CORS: {
		allowedOrigins: [
			"https://mbalaundryexpress.com",
			"https://www.mbalaundryexpress.com",
			"https://*.vercel.app", // Only for development
		],
		allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
	},

	// Content Security Policy
	CSP: {
		"default-src": ["'self'"],
		"script-src": [
			"'self'",
			"'unsafe-inline'",
			"'unsafe-eval'",
			"https://www.google-analytics.com",
			"https://www.googletagmanager.com",
		],
		"style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
		"img-src": ["'self'", "data:", "https:", "blob:"],
		"font-src": ["'self'", "https://fonts.gstatic.com"],
		"connect-src": ["'self'", "https://www.google-analytics.com", "https://www.googletagmanager.com"],
		"frame-ancestors": ["'none'"],
		"base-uri": ["'self'"],
		"form-action": ["'self'"],
	},
};

// ============================================
// RATE LIMITING STORE (In-memory with cleanup)
// ============================================
interface RateLimitEntry {
	count: number;
	resetTime: number;
	blocked: boolean;
	blockExpiry?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(
	() => {
		const now = Date.now();
		for (const [key, entry] of rateLimitStore.entries()) {
			if (now > entry.resetTime && !entry.blocked) {
				rateLimitStore.delete(key);
			}
		}
	},
	10 * 60 * 1000,
);

export function checkRateLimit(
	identifier: string,
	maxRequests: number = SECURITY_CONFIG.RATE_LIMIT.maxRequests,
	isAuth: boolean = false,
): { allowed: boolean; remaining: number; resetTime: number; blocked?: boolean } {
	const now = Date.now();
	const windowMs = isAuth
		? SECURITY_CONFIG.RATE_LIMIT.windowMs / 3 // Stricter for auth
		: SECURITY_CONFIG.RATE_LIMIT.windowMs;
	const limit = isAuth ? SECURITY_CONFIG.RATE_LIMIT.maxAuthRequests : maxRequests;

	const entry = rateLimitStore.get(identifier);

	// Check if blocked
	if (entry?.blocked && entry.blockExpiry && now < entry.blockExpiry) {
		return {
			allowed: false,
			remaining: 0,
			resetTime: entry.blockExpiry,
			blocked: true,
		};
	}

	// Unblock if expired
	if (entry?.blocked && entry.blockExpiry && now >= entry.blockExpiry) {
		rateLimitStore.delete(identifier);
	}

	// Create new entry or reset if window expired
	if (!entry || now > entry.resetTime) {
		rateLimitStore.set(identifier, {
			count: 1,
			resetTime: now + windowMs,
			blocked: false,
		});
		return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
	}

	// Check limit
	if (entry.count >= limit) {
		// Block for repeated violations
		if (entry.count >= limit * 2) {
			entry.blocked = true;
			entry.blockExpiry = now + SECURITY_CONFIG.RATE_LIMIT.blockDuration;
			rateLimitStore.set(identifier, entry);

			// Log security event
			logSecurityEvent("RATE_LIMIT_EXCEEDED", identifier, { count: entry.count });

			return {
				allowed: false,
				remaining: 0,
				resetTime: entry.blockExpiry,
				blocked: true,
			};
		}

		return { allowed: false, remaining: 0, resetTime: entry.resetTime };
	}

	// Increment count
	entry.count++;
	rateLimitStore.set(identifier, entry);

	return {
		allowed: true,
		remaining: limit - entry.count,
		resetTime: entry.resetTime,
	};
}

// ============================================
// SECURITY HEADERS
// ============================================
export function generateSecurityHeaders(): Record<string, string> {
	const cspString = Object.entries(SECURITY_CONFIG.CSP)
		.map(([key, values]) => `${key} ${values.join(" ")}`)
		.join("; ");

	return {
		// Prevent XSS
		"Content-Security-Policy": cspString,
		"X-XSS-Protection": "1; mode=block",

		// Prevent Clickjacking
		"X-Frame-Options": "DENY",

		// Prevent MIME sniffing
		"X-Content-Type-Options": "nosniff",

		// Referrer Policy
		"Referrer-Policy": "strict-origin-when-cross-origin",

		// Permissions Policy
		"Permissions-Policy": "camera=(), microphone=(), geolocation=(self), payment=()",

		// Strict Transport Security (HSTS)
		"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

		// Cross-Origin policies
		"Cross-Origin-Embedder-Policy": "require-corp",
		"Cross-Origin-Opener-Policy": "same-origin",
		"Cross-Origin-Resource-Policy": "same-origin",

		// Cache control for sensitive data
		"Cache-Control": "no-store, max-age=0",
	};
}

// ============================================
// INPUT SANITIZATION
// ============================================
const XSS_PATTERNS = [
	/<script[^>]*>.*?<\/script>/gi,
	/<script[^>]*\/>/gi,
	/javascript:/gi,
	/on\w+\s*=/gi, // onclick, onerror, etc
	/<iframe/gi,
	/<object/gi,
	/<embed/gi,
	/eval\s*\(/gi,
	/expression\s*\(/gi,
];

const SQL_INJECTION_PATTERNS = [
	/('|"|\s*)--/gi,
	/\/\*/gi,
	/\*\//gi,
	/;\s*drop\s+/gi,
	/;\s*delete\s+/gi,
	/;\s*insert\s+/gi,
	/;\s*update\s+/gi,
	/union\s+select/gi,
	/exec\s*\(/gi,
	/execute\s*\(/gi,
];

export function sanitizeInput(input: string): { clean: string; threats: string[] } {
	const threats: string[] = [];
	let clean = input;

	// Check XSS patterns
	XSS_PATTERNS.forEach((pattern, index) => {
		if (pattern.test(clean)) {
			threats.push(`XSS_PATTERN_${index}`);
			clean = clean.replace(pattern, "");
		}
	});

	// Check SQL Injection patterns
	SQL_INJECTION_PATTERNS.forEach((pattern, index) => {
		if (pattern.test(clean)) {
			threats.push(`SQL_INJECTION_${index}`);
			clean = clean.replace(pattern, "");
		}
	});

	// Additional sanitization
	clean = clean
		.replace(/[<>]/g, "") // Remove angle brackets
		.trim();

	return { clean, threats };
}

export function validateEmail(email: string): boolean {
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return emailRegex.test(email) && email.length <= 254;
}

export function validatePhone(phone: string): boolean {
	// Indonesian phone number validation
	const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
	return phoneRegex.test(phone.replace(/\s/g, ""));
}

// ============================================
// CSRF PROTECTION
// ============================================
const csrfTokens = new Map<string, { token: string; expiry: number }>();

export function generateCSRFToken(sessionId: string): string {
	const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	csrfTokens.set(sessionId, {
		token,
		expiry: Date.now() + 60 * 60 * 1000, // 1 hour
	});

	return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
	const stored = csrfTokens.get(sessionId);

	if (!stored) return false;
	if (Date.now() > stored.expiry) {
		csrfTokens.delete(sessionId);
		return false;
	}

	// Constant time comparison to prevent timing attacks
	let result = 0;
	for (let i = 0; i < token.length; i++) {
		result |= token.charCodeAt(i) ^ stored.token.charCodeAt(i);
	}

	return result === 0;
}

// ============================================
// SECURITY AUDIT LOGGING
// ============================================
interface SecurityEvent {
	type: string;
	timestamp: string;
	ip: string;
	userAgent?: string;
	details: Record<string, unknown>;
}

const securityLogs: SecurityEvent[] = [];
const MAX_LOGS = 1000;

export function logSecurityEvent(
	type: string,
	ip: string,
	details: Record<string, unknown> = {},
	userAgent?: string,
): void {
	const event: SecurityEvent = {
		type,
		timestamp: new Date().toISOString(),
		ip,
		userAgent,
		details,
	};

	securityLogs.unshift(event);

	// Keep only last 1000 logs
	if (securityLogs.length > MAX_LOGS) {
		securityLogs.pop();
	}

	// Also log to console in production
	if (process.env.NODE_ENV === "production") {
		console.warn(`[SECURITY] ${type}:`, { ip, details });
	}
}

export function getSecurityLogs(): SecurityEvent[] {
	return [...securityLogs];
}

// ============================================
// IP REPUTATION CHECK
// ============================================
const blockedIPs = new Set<string>();
const suspiciousIPs = new Map<string, number>();

export function blockIP(ip: string, duration: number = 24 * 60 * 60 * 1000): void {
	blockedIPs.add(ip);
	logSecurityEvent("IP_BLOCKED", ip, { duration });

	// Auto unblock after duration
	setTimeout(() => {
		blockedIPs.delete(ip);
	}, duration);
}

export function isIPBlocked(ip: string): boolean {
	return blockedIPs.has(ip);
}

export function flagSuspiciousIP(ip: string): void {
	const count = (suspiciousIPs.get(ip) || 0) + 1;
	suspiciousIPs.set(ip, count);

	// Auto block after 10 suspicious activities
	if (count >= 10) {
		blockIP(ip);
	}
}

// ============================================
// MAIN SECURITY MIDDLEWARE
// ============================================
export function securityMiddleware(req: NextApiRequest, res: NextApiResponse, next: () => void): void {
	const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";

	// Check if IP is blocked
	if (isIPBlocked(ip)) {
		res.status(403).json({ error: "Access denied" });
		return;
	}

	// Apply rate limiting
	const rateLimit = checkRateLimit(ip, undefined, req.url?.includes("/auth"));
	if (!rateLimit.allowed) {
		res.setHeader("Retry-After", Math.ceil((rateLimit.resetTime - Date.now()) / 1000));
		res.status(429).json({
			error: "Too many requests",
			blocked: rateLimit.blocked,
		});
		return;
	}

	// Set rate limit headers
	res.setHeader("X-RateLimit-Limit", SECURITY_CONFIG.RATE_LIMIT.maxRequests);
	res.setHeader("X-RateLimit-Remaining", rateLimit.remaining);
	res.setHeader("X-RateLimit-Reset", rateLimit.resetTime);

	// Apply security headers
	const headers = generateSecurityHeaders();
	Object.entries(headers).forEach(([key, value]) => {
		res.setHeader(key, value);
	});

	// Validate CORS
	const origin = req.headers.origin;
	if (origin && req.method === "OPTIONS") {
		const allowedOrigin = SECURITY_CONFIG.CORS.allowedOrigins.find(
			(o) => origin === o || (o.includes("*") && origin.match(o.replace("*", ".*"))),
		);

		if (allowedOrigin) {
			res.setHeader("Access-Control-Allow-Origin", origin);
			res.setHeader("Access-Control-Allow-Methods", SECURITY_CONFIG.CORS.allowedMethods.join(", "));
			res.setHeader("Access-Control-Allow-Headers", SECURITY_CONFIG.CORS.allowedHeaders.join(", "));
			res.setHeader("Access-Control-Max-Age", "86400");
			res.status(204).end();
			return;
		}
	}

	// Sanitize request body for POST/PUT
	if (req.body && (req.method === "POST" || req.method === "PUT")) {
		const sanitized: Record<string, string> = {};
		const threats: string[] = [];

		for (const [key, value] of Object.entries(req.body)) {
			if (typeof value === "string") {
				const result = sanitizeInput(value);
				sanitized[key] = result.clean;
				threats.push(...result.threats);
			}
		}

		if (threats.length > 0) {
			flagSuspiciousIP(ip);
			logSecurityEvent("INPUT_SANITIZATION", ip, { threats, path: req.url });

			// Block if too many threats
			if (threats.length > 5) {
				res.status(400).json({ error: "Invalid input detected" });
				return;
			}
		}

		req.body = sanitized;
	}

	next();
}

// ============================================
// ENCRYPTION UTILITIES
// ============================================
export async function encryptData(data: string, key: string): Promise<string> {
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);

	const keyBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(key));
	const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM", length: 256 }, false, [
		"encrypt",
	]);

	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, dataBuffer);

	const result = new Uint8Array(iv.length + encrypted.byteLength);
	result.set(iv);
	result.set(new Uint8Array(encrypted), iv.length);

	return btoa(String.fromCharCode(...result));
}

export async function decryptData(encryptedData: string, key: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

	const iv = data.slice(0, 12);
	const ciphertext = data.slice(12);

	const keyBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(key));
	const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-GCM", length: 256 }, false, [
		"decrypt",
	]);

	const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertext);

	return new TextDecoder().decode(decrypted);
}

export default securityMiddleware;
