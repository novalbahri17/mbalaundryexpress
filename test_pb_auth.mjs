const ADMIN_EMAIL = "admin@mba-laundry.com";
const ADMIN_PASSWORD = "Admin12345!";
const BASE_URL = "http://127.0.0.1:8090";

async function testAuth() {
	const endpoints = [
		"/api/collections/_superusers/auth-with-password",
		"/api/admins/auth-with-password",
		"/api/collections/users/auth-with-password",
	];

	for (const endpoint of endpoints) {
		console.log(`Testing ${BASE_URL}${endpoint}...`);
		try {
			const res = await fetch(`${BASE_URL}${endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
			});
			console.log(`Status: ${res.status} ${res.statusText}`);
			const body = await res.json();
			if (res.ok) {
				console.log(`SUCCESS on ${endpoint}! Token starts with: ${body.token.substring(0, 10)}...`);
				return;
			} else {
				console.log(`Error body:`, JSON.stringify(body));
			}
		} catch (err) {
			console.log(`Fetch failed: ${err.message}`);
		}
	}
}

testAuth();
