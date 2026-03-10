#!/usr/bin/env bash
# Start ngrok tunnel for local Retell development.
# Retell's cloud needs to reach our /llm-websocket/:call_id endpoint.
#
# After starting, copy the https URL and set it in Retell dashboard:
#   Agent → Custom LLM → WebSocket URL → wss://<subdomain>.ngrok-free.app/llm-websocket/{{call_id}}
#
# Usage: bash scripts/dev-tunnel.sh [port]

PORT="${1:-4000}"

echo "Starting ngrok tunnel to localhost:$PORT..."
echo ""
echo "After ngrok starts, update your Retell agent's Custom LLM WebSocket URL to:"
echo "  wss://<YOUR_NGROK_SUBDOMAIN>.ngrok-free.app/llm-websocket/{{call_id}}"
echo ""

ngrok http "$PORT"
