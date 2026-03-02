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
	],
};
