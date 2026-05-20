#!/usr/bin/env bash
set -euo pipefail

REMOTE_NAME="${1:-origin}"
MAIN_BRANCH="${2:-main}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: not inside a git repository" >&2
  exit 1
fi

if ! git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  echo "ERROR: remote '$REMOTE_NAME' is missing" >&2
  echo "Hint: git remote add $REMOTE_NAME https://github.com/Paradispartiet/History-Go.git" >&2
  exit 2
fi

REMOTE_URL="$(git remote get-url "$REMOTE_NAME")"
echo "Remote URL: $REMOTE_URL"

echo "Checking remote HEAD..."
git ls-remote "$REMOTE_NAME" HEAD >/dev/null

echo "Fetching $REMOTE_NAME/$MAIN_BRANCH..."
git fetch "$REMOTE_NAME" "$MAIN_BRANCH" --prune

echo "Verifying remote tracking ref..."
git rev-parse --verify "$REMOTE_NAME/$MAIN_BRANCH" >/dev/null

echo "OK: $REMOTE_NAME/$MAIN_BRANCH is reachable and verified."
