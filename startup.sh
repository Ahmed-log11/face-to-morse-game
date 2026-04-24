#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting backend…"
cd "${ROOT_DIR}/backend"

if [[ ! -d "venv" ]]; then
  python3 -m venv venv
fi

source venv/bin/activate
python -m pip install --upgrade pip >/dev/null
pip install -r requirements.txt

uvicorn main:app --reload &
BACKEND_PID=$!

cleanup() {
  if kill -0 "${BACKEND_PID}" 2>/dev/null; then
    kill "${BACKEND_PID}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "Starting frontend…"
cd "${ROOT_DIR}/frontend"
npm install
npm run dev
