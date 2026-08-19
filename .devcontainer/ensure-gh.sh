#!/usr/bin/env bash
set -Eeuo pipefail

readonly GH_KEYRING="/etc/apt/keyrings/githubcli-archive-keyring.gpg"
readonly GH_SOURCE="/etc/apt/sources.list.d/github-cli.list"
export DEBIAN_FRONTEND=noninteractive

if command -v gh >/dev/null 2>&1; then
  gh --version | head -n 1
  exit 0
fi

echo "[codespaces] GitHub CLI missing; repairing installation..."

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=()
elif command -v sudo >/dev/null 2>&1; then
  SUDO=(sudo -n)
else
  echo "[codespaces] GitHub CLI repair failed: need root or passwordless sudo." >&2
  exit 1
fi

apt_retry() {
  local attempt
  for attempt in 1 2 3; do
    if "${SUDO[@]}" apt-get -o Acquire::Retries=3 "$@"; then
      return 0
    fi
    echo "[codespaces] apt-get $* failed (attempt ${attempt}/3)." >&2
    sleep $((attempt * 2))
  done
  return 1
}

# Fast path: Debian/Ubuntu repositories often already provide gh.
apt_retry update
if apt_retry install -y gh && command -v gh >/dev/null 2>&1; then
  gh --version | head -n 1
  exit 0
fi

# Fallback: configure GitHub's official package repository.
apt_retry install -y ca-certificates curl gpg
"${SUDO[@]}" install -d -m 0755 /etc/apt/keyrings
TMP_KEY="$(mktemp)"
trap 'rm -f "$TMP_KEY"' EXIT
curl --fail --silent --show-error --location \
  --retry 3 --retry-delay 2 --connect-timeout 10 --max-time 60 \
  https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  --output "$TMP_KEY"
"${SUDO[@]}" install -m 0644 "$TMP_KEY" "$GH_KEYRING"
printf 'deb [arch=%s signed-by=%s] https://cli.github.com/packages stable main\n' \
  "$(dpkg --print-architecture)" "$GH_KEYRING" | "${SUDO[@]}" tee "$GH_SOURCE" >/dev/null

apt_retry update
apt_retry install -y gh

if ! command -v gh >/dev/null 2>&1; then
  echo "[codespaces] GitHub CLI repair failed: gh is still unavailable." >&2
  exit 1
fi

gh --version | head -n 1
