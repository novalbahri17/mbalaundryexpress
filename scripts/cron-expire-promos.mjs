import http from "node:http";

const port = Number(process.env.CRON_PORT || 3010);
const secret = process.env.CRON_SECRET;
const baseUrl = process.env.API_BASE_URL || `http://127.0.0.1:${process.env.API_PORT || 3002}`;
const adminEmail = process.env.API_ADMIN_EMAIL;
const adminPassword = process.env.API_ADMIN_PASSWORD;

if (!secret || !adminEmail || !adminPassword) {
	throw new Error("CRON_SECRET, API_ADMIN_EMAIL, dan API_ADMIN_PASSWORD wajib diisi");
}

const login = async () => {
	const response = await fetch(`${baseUrl}/api/collections/_superusers/auth-with-password`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ identity: adminEmail, password: adminPassword }),
	});
	if (!response.ok) throw new Error("Gagal login admin");
	return response.json();
};

const expirePromos = async (token) => {
	const listRes = await fetch(
		`${baseUrl}/api/collections/promos/records?perPage=200&filter=${encodeURIComponent('status!="expired" && end_date<@now')}`,
		{ headers: { Authorization: `Bearer ${token}` } },
	);
	if (!listRes.ok) throw new Error("Gagal ambil data promo");
	const data = await listRes.json();
	for (const item of data.items) {
		await fetch(`${baseUrl}/api/collections/promos/records/${item.id}`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${token}`,
				"content-type": "application/json",
			},
			body: JSON.stringify({ status: "expired", is_active: false }),
		});
	}
	return data.items.length;
};

const server = http.createServer(async (req, res) => {
	if (req.method !== "GET" || req.url !== "/api/cron/expire-promos") {
		res.writeHead(404);
		res.end("Not found");
		return;
	}

	if (req.headers["x-cron-secret"] !== secret) {
		res.writeHead(401);
		res.end("Unauthorized");
		return;
	}

	try {
		const auth = await login();
		const total = await expirePromos(auth.token);
		res.writeHead(200, { "content-type": "application/json" });
		res.end(JSON.stringify({ ok: true, expired: total }));
	} catch (error) {
		res.writeHead(500, { "content-type": "application/json" });
		res.end(JSON.stringify({ ok: false, message: error instanceof Error ? error.message : "Unknown error" }));
	}
});

server.listen(port, "127.0.0.1", () => {
	process.stdout.write(`Cron service listening at 127.0.0.1:${port}\n`);
});
