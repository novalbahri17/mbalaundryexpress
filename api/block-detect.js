/**
 * MBA Laundry Express - Server-side Detection Blocker
 * Vercel Edge Function untuk memblokir deteksi teknologi
 */

export const config = {
	runtime: 'edge',
};

export default async function handler(request) {
	const url = new URL(request.url);
	const userAgent = request.headers.get('user-agent') || '';
	
	// Detect Wappalyzer/BuiltWith bots
	const detectionBots = [
		/Wappalyzer/i,
		/BuiltWith/i,
		/WhatRuns/i,
		/SimilarTech/i,
		/technology-detector/i,
		/cms-detector/i,
	];
	
	const isDetectionBot = detectionBots.some(bot => bot.test(userAgent));
	
	if (isDetectionBot) {
		// Return generic HTML without any technology signatures
		return new Response(
			`<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>MBA Laundry Express</title>
    <meta name="description" content="Self Service Laundry Terpercaya">
</head>
<body>
    <h1>MBA Laundry Express</h1>
    <p>Self Service Laundry Terpercaya di Surabaya</p>
</body>
</html>`,
			{
				status: 200,
				headers: {
					'Content-Type': 'text/html',
					'Cache-Control': 'no-store',
					// Remove all technology headers
					'X-Powered-By': 'Generic Server',
					'Server': 'Generic',
				},
			}
		);
	}
	
	// For normal requests, continue to the app
	return fetch(request);
}
