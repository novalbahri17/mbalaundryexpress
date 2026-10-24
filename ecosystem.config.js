module.exports = {
	apps: [
		{
			name: "mba-web",
			script: "pnpm",
			args: "preview --host 127.0.0.1 --port 3000",
			cwd: "/var/www/mba-laundry",
			exec_mode: "cluster",
			instances: 2,
			max_memory_restart: "500M",
			env: {
				NODE_ENV: "production",
			},
		},
		{
			// API server Express + MySQL. Nginx meneruskan /api/* dan
			// /uploads/* ke port ini.
			name: "mba-api",
			script: "node",
			args: "server/index.mjs",
			cwd: "/var/www/mba-laundry",
			exec_mode: "fork",
			instances: 1,
			max_memory_restart: "400M",
			env_file: ".env",
			env: {
				NODE_ENV: "production",
			},
		},
	],
};
