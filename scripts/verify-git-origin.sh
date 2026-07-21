#!/usr/bin/env bash
set -euo pipefail

REMOTE_NAME="${1:-origin}"
MAIN_BRANCH="${2:-main}"
REPOSITORY="Paradispartiet/History-Go"

local_git_unavailable() {
  local exit_code="$1"
  shift

  echo "LOCAL_GIT_UNAVAILABLE: $*" >&2
  echo "This only diagnoses local git transport; the repository may still be fully available through the GitHub connector." >&2
  echo "Fallback: use the GitHub connector for $REPOSITORY." >&2
  echo "For executable audits without a working clone, use .github/workflows/remote-audit.yml via .github/audit-request.json." >&2
  exit "$exit_code"
}

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  local_git_unavailable 1 "not inside a local git work tree"
fi

if ! git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  local_git_unavailable 2 "remote '$REMOTE_NAME' is missing"
fi

REMOTE_URL="$(git remote get-url "$REMOTE_NAME")"
echo "Remote URL: $REMOTE_URL"

echo "Checking remote branch refs/heads/$MAIN_BRANCH..."
if ! git ls-remote --heads "$REMOTE_NAME" "$MAIN_BRANCH" >/dev/null; then
  local_git_unavailable 3 "cannot reach $REMOTE_NAME/$MAIN_BRANCH through local git"
fi

echo "Fetching $REMOTE_NAME/$MAIN_BRANCH..."
if ! git fetch "$REMOTE_NAME" "+refs/heads/$MAIN_BRANCH:refs/remotes/$REMOTE_NAME/$MAIN_BRANCH" --prune; then
  local_git_unavailable 4 "fetch failed for $REMOTE_NAME/$MAIN_BRANCH"
fi

echo "Verifying remote tracking ref..."
if ! git rev-parse --verify "refs/remotes/$REMOTE_NAME/$MAIN_BRANCH" >/dev/null; then
  local_git_unavailable 5 "remote tracking ref refs/remotes/$REMOTE_NAME/$MAIN_BRANCH is missing after fetch"
fi

echo "OK: $REMOTE_NAME/$MAIN_BRANCH is reachable and verified through local git."
