#!/bin/bash
# PreToolUse hook su Bash: blocca commit/push diretti su main (CLAUDE.md #4)
# e impedisce commit/push se `npm run build` fallisce (CLAUDE.md #2).
input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty')
[[ -z "$command" ]] && exit 0

if echo "$command" | grep -qE '\bgit[[:space:]]+(commit|push)\b'; then
  branch=$(git -C "$CLAUDE_PROJECT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null)
  if [[ "$branch" == "main" ]]; then
    echo "BLOCCATO: sei su 'main'. Regola CLAUDE.md #4 — mai committare/pushare direttamente su main. Passa a un branch feature prima." >&2
    exit 2
  fi

  build_output=$(cd "$CLAUDE_PROJECT_DIR" && npm run build 2>&1)
  if [[ $? -ne 0 ]]; then
    echo "$build_output" | tail -n 40 >&2
    echo "BLOCCATO: 'npm run build' fallisce. Regola CLAUDE.md #2 — correggi gli errori sopra prima di commit/push." >&2
    exit 2
  fi
fi

exit 0
