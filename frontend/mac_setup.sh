#!/bin/bash
# setup.sh

IP=$(ipconfig getifaddr en0)  # Mac-specific; use `hostname -I` for Linux

echo "EXPO_PUBLIC_SOCKET_URL=http://$IP:3000" > .env
echo ".env.local generated with IP: $IP"
