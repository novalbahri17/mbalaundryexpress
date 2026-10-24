#!/usr/bin/env node
/**
 * ============================================================================
 * Create the MySQL mirror tables (no `mysql` CLI required)
 * ----------------------------------------------------------------------------
 * Reads scripts/mysql-schema.sql, strips the comments, and executes each
 * CREATE TABLE statement against the MySQL server configured in .env.
 *
 * Safe to re-run: every statement is CREATE TABLE IF NOT EXISTS.
 *
 * USAGE
 *   node scripts/create-mysql-tables.mjs
 *   node scripts/create-mysql-tables.mjs --schema=path/to/other.sql
 *   node scripts/create-mysql-tables.mjs --drop    (drop mirror tables first)
 *
 * REQUIRED ENV (.env)
 *   MYSQL_HOST / MYSQL_PORT / MYSQL_DATABASE / MYSQL_USER / MYSQL_PASSWORD
 *
 * NOTE
 *   --drop only touches the tables defined in the schema file. It does not
 *   drop the database itself.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// ---------------------------------------------------------------------------
// Minimal .env loader
// ---------------------------------------------------------------------------
function loadEnv(file = ".env") {
	const full = path.resolve(process.cwd(), file);
	if (!fs.existsSync(full)) return;
	for (const rawLine of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) continue;
		const eq = line.indexOf("=");
		if (eq === -1) continue;
		const key = line.slice(0, eq).trim();
		let value = line.slice(eq + 1).trim();
		if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
			value = value.slice(1, -1);
		}
		if (process.env[key] === undefined) process.env[key] = value;
	}
}
loadEnv();

const log = (...args) => console.log("[schema]", ...args);
const warn = (...args) => console.warn("[schema][warn]", ...args);
const fail = (...args) => {
	console.error("[schema][error]", ...args);
	process.exitCode = 1;
};

// ---------------------------------------------------------------------------
// Split the SQL file into executable statements.
// The schema file is plain CREATE TABLE statements separated by ';' plus
// leading SET commands, so a comment-aware split on ';' is sufficient.
// ---------------------------------------------------------------------------
function splitStatements(sql) {
	const withoutBlockComments = sql.replace(/\/\*[\s\S]*?\*\//g, "");
	const lines = withoutBlockComments
		.split(/\r?\n/)
		.map((line) => (line.trim().startsWith("--") ? "" : line))
		.join("\n");

	return lines
		.split(";")
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
}

function extractTableNames(statements) {
	const names = new Set();
	for (const stmt of statements) {
		const match = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?([A-Za-z0-9_]+)`?/i);
		if (match) names.add(match[1]);
	}
	return [...names];
}

async function main() {
	const args = process.argv.slice(2);
	const schemaArg = args.find((a) => a.startsWith("--schema="));
	const drop = args.includes("--drop");
	const schemaPath = schemaArg
		? path.resolve(process.cwd(), schemaArg.slice("--schema=".length))
		: path.resolve(process.cwd(), "scripts/mysql-schema.sql");

	const { MYSQL_HOST, MYSQL_PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD } = process.env;

	const missing = [];
	if (!MYSQL_HOST) missing.push("MYSQL_HOST");
	if (!MYSQL_DATABASE) missing.push("MYSQL_DATABASE");
	if (!MYSQL_USER) missing.push("MYSQL_USER");
	if (missing.length) {
		fail(`Missing env vars: ${missing.join(", ")}. Add them to .env`);
		return;
	}

	if (!fs.existsSync(schemaPath)) {
		fail(`Schema file not found: ${schemaPath}`);
		return;
	}

	const statements = splitStatements(fs.readFileSync(schemaPath, "utf8"));
	if (!statements.length) {
		fail(`No executable statements found in ${schemaPath}`);
		return;
	}
	const tables = extractTableNames(statements);
	log(`schema file: ${path.relative(process.cwd(), schemaPath)}`);
	log(`statements: ${statements.length}, tables: ${tables.length}`);

	let mysql;
	try {
		mysql = await import("mysql2/promise");
	} catch {
		fail("Package 'mysql2' is not installed. Run:  pnpm add -D mysql2");
		return;
	}

	let connection;
	try {
		connection = await mysql.createConnection({
			host: MYSQL_HOST,
			port: Number(MYSQL_PORT || 3306),
			database: MYSQL_DATABASE,
			user: MYSQL_USER,
			password: MYSQL_PASSWORD ?? "",
			charset: "utf8mb4",
			timezone: "Z",
			multipleStatements: false,
			connectTimeout: 15000,
		});
	} catch (error) {
		fail(`Cannot connect to MySQL ${MYSQL_HOST}:${MYSQL_PORT || 3306}/${MYSQL_DATABASE} — ${error.code || ""} ${error.message}`);
		return;
	}

	try {
		const [who] = await connection.query("SELECT VERSION() AS v, CURRENT_USER() AS u, DATABASE() AS d");
		log(`connected to ${who[0].d} as ${who[0].u} (MySQL ${who[0].v})`);

		if (drop) {
			if (!tables.length) {
				warn("nothing to drop — no CREATE TABLE statements were parsed");
			}
			await connection.query("SET FOREIGN_KEY_CHECKS = 0");
			for (const table of tables) {
				await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
				log(`dropped \`${table}\``);
			}
			await connection.query("SET FOREIGN_KEY_CHECKS = 1");
		}

		let created = 0;
		for (const stmt of statements) {
			const oneLine = stmt.replace(/\s+/g, " ").trim();
			const label = oneLine.slice(0, 64);
			try {
				await connection.query(stmt);
				created += 1;
				log(`ok  ${label}`);
			} catch (error) {
				fail(`${error.code || ""} ${error.message}  <<< ${label}`);
			}
		}

		const [rows] = await connection.query(
			"SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
			[MYSQL_DATABASE],
		);
		const present = rows.map((r) => r.TABLE_NAME);
		log(`executed ${created}/${statements.length} statement(s)`);
		log(`database \`${MYSQL_DATABASE}\` now has ${present.length} table(s): ${present.join(", ")}`);
	} finally {
		await connection.end();
	}

	if (process.exitCode) {
		fail("finished with errors — see messages above");
	} else {
		log("done — tables ready. Next:  pnpm api");
	}
}

main().catch((error) => {
	fail(error.stack || error.message);
});
