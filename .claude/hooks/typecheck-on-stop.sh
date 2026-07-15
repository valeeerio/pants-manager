#!/bin/bash
# Stop hook: typecheck veloce se ci sono modifiche non committate a .ts/.tsx.
# La build completa gira solo in pre-git-check.sh, prima di commit/push.
cd "$CLAUDE_PROJECT_DIR" || exit 0
input=$(cat)
stop_hook_active=$(echo "$input" | jq -r '.stop_hook_active // false')
[[ "$stop_hook_active" == "true" ]] && exit 0

changed=$(git status --porcelain -- '*.ts' '*.tsx' 2>/dev/null)
[[ -z "$changed" ]] && exit 0

output=$(npm run typecheck 2>&1)
if [[ $? -ne 0 ]]; then
  echo "$output" | tail -n 40 >&2
  echo "BLOCCATO: errori di tipo (tsc --noEmit). Regola CLAUDE.md #2 — correggi prima di terminare il turno." >&2
  exit 2
fi

exit 0
