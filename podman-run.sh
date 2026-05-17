#!/usr/bin/env bash
set -euo pipefail

IMAGE="coinvibetracker:latest"

echo "Building image..."
podman build -t "$IMAGE" \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" \
  .

echo "Starting container on http://localhost:3000 ..."
podman run --rm -it \
  -p 3000:3000 \
  -e COINGECKO_API_KEY="${COINGECKO_API_KEY:-}" \
  -e NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" \
  -e SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}" \
  "$IMAGE"
