#!/usr/bin/env bash
set -euo pipefail

SSH_PORT="${1:-22}"

ufw --force reset
ufw default deny incoming
ufw default allow outgoing

ufw allow "${SSH_PORT}/tcp"
ufw allow 80/tcp
ufw allow 443/tcp

ufw deny 3000/tcp
ufw deny 8090/tcp

ufw --force enable
ufw status verbose

