#!/usr/bin/env bash
set -euo pipefail

# Restore the preinstalled GitHub CLI into PATH without reinstalling it.
# Canonical History-Go workspace locations:
#   binary: /workspace/bin/gh
#   config: /workspace/gh-config

candidates=()
if [[ -n "${GH_BIN:-}" ]]; then
  candidates+=("${GH_BIN}")
fi
if command -v gh >/dev/null 2>&1; then
  candidates+=("$(command -v gh)")
fi
candidates+=(
  "/workspace/bin/gh"
  "/usr/local/bin/gh"
  "/usr/bin/gh"
  "${HOME}/.local/bin/gh"
  "/opt/homebrew/bin/gh"
  "/home/linuxbrew/.linuxbrew/bin/gh"
)

gh_source=""
for candidate in "${candidates[@]}"; do
  if [[ -n "${candidate}" && -x "${candidate}" ]]; then
    gh_source="${candidate}"
    break
  fi
done

if [[ -z "${gh_source}" ]]; then
  cat >&2 <<'MSG'
History-Go could not see the preinstalled gh binary because the workspace mount is not exposed in this shell.
Do not reinstall gh and do not report it as uninstalled. Use the GitHub connector for repository work, or remount /workspace for CLI-only commands.
MSG
  exit 69
fi

if [[ -d /workspace/gh-config ]]; then
  export GH_CONFIG_DIR="${GH_CONFIG_DIR:-/workspace/gh-config}"
fi

resolved="$(command -v gh 2>/dev/null || true)"
if [[ -z "${resolved}" ]]; then
  target_dir=""
  IFS=':' read -r -a path_dirs <<< "${PATH}"
  for dir in "${path_dirs[@]}"; do
    if [[ -n "${dir}" && -d "${dir}" && -w "${dir}" ]]; then
      target_dir="${dir}"
      break
    fi
  done

  if [[ -n "${target_dir}" ]]; then
    ln -sfn "${gh_source}" "${target_dir}/gh"
  else
    target_dir="${HOME}/.local/bin"
    mkdir -p "${target_dir}"
    ln -sfn "${gh_source}" "${target_dir}/gh"
    export PATH="${target_dir}:${PATH}"
  fi
fi

persist_line() {
  local file="$1"
  local line="$2"
  touch "${file}"
  grep -Fqx "${line}" "${file}" || printf '%s\n' "${line}" >> "${file}"
}

if [[ "${gh_source}" == /workspace/bin/gh ]]; then
  persist_line "${HOME}/.profile" 'export PATH="/workspace/bin:$PATH"'
  persist_line "${HOME}/.bashrc" 'export PATH="/workspace/bin:$PATH"'
  if [[ -d /workspace/gh-config ]]; then
    persist_line "${HOME}/.profile" 'export GH_CONFIG_DIR="/workspace/gh-config"'
    persist_line "${HOME}/.bashrc" 'export GH_CONFIG_DIR="/workspace/gh-config"'
  fi
fi

if [[ -n "${GITHUB_PATH:-}" ]]; then
  printf '%s\n' "$(dirname "${gh_source}")" >> "${GITHUB_PATH}"
fi
if [[ -n "${GITHUB_ENV:-}" && -n "${GH_CONFIG_DIR:-}" ]]; then
  printf 'GH_CONFIG_DIR=%s\n' "${GH_CONFIG_DIR}" >> "${GITHUB_ENV}"
fi

hash -r 2>/dev/null || true
resolved="$(command -v gh 2>/dev/null || true)"
if [[ -z "${resolved}" ]]; then
  resolved="${gh_source}"
fi

"${resolved}" --version
printf 'GH_EXECUTABLE=%s\n' "${resolved}"
if [[ -n "${GH_CONFIG_DIR:-}" ]]; then
  printf 'GH_CONFIG_DIR=%s\n' "${GH_CONFIG_DIR}"
fi
