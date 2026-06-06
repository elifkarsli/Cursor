#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
TUNNEL_NAME="getpark-hackathon"
HOSTNAME="hackathon.getpark.org"
ORIGIN="http://127.0.0.1:8080"

cd "$ROOT"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared yok. Kur: brew install cloudflared"
  exit 1
fi

if [[ ! -f "$HOME/.cloudflared/cert.pem" ]]; then
  echo "Cloudflare girişi gerekli. Tarayıcıda zone seç (getpark.org) ve onayla."
  cloudflared tunnel login
fi

if ! cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
  cloudflared tunnel create "$TUNNEL_NAME"
fi

TUNNEL_ID="$(cloudflared tunnel list | awk -v n="$TUNNEL_NAME" '$2 == n {print $1; exit}')"
if [[ -z "$TUNNEL_ID" ]]; then
  echo "Tunnel ID alınamadı"
  exit 1
fi

CREDS="$HOME/.cloudflared/${TUNNEL_ID}.json"
CONFIG="$HOME/.cloudflared/config-getpark.yml"

cat > "$CONFIG" <<EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CREDS}

ingress:
  - hostname: ${HOSTNAME}
    service: ${ORIGIN}
  - service: http_status:404
EOF

cloudflared tunnel route dns --overwrite-dns "$TUNNEL_NAME" "$HOSTNAME" || true

echo "Tunnel başlatılıyor: ${HOSTNAME} -> ${ORIGIN}"
exec cloudflared tunnel --config "$CONFIG" run "$TUNNEL_NAME"
