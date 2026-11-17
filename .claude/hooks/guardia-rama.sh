#!/usr/bin/env bash
# Guardia de rama (hook PreToolUse de Edit/Write).
#
# Problema que corrige: dos veces en una misma sesión el agente empezó una
# tarea editando código directamente en main y solo lo notó `npm run verify`,
# demasiado tarde — con los archivos ya editados. Este hook corta la PRIMERA
# edición: si la rama es main y el archivo es código de tarea, bloquea con
# la instrucción de crear la rama.
#
# Quedan libres a propósito: *.md (plan y docs sí se commitean a main),
# .claude/, .github/, scripts/ y el resto de ops — ese flujo existe y es
# legítimo en este repo.
set -euo pipefail

entrada="$(cat)"
archivo="$(printf '%s' "$entrada" | jq -r '.tool_input.file_path // empty')"
[ -z "$archivo" ] && exit 0

raiz="${CLAUDE_PROJECT_DIR:-$(pwd)}"
rama="$(git -C "$raiz" branch --show-current 2>/dev/null || true)"
[ "$rama" = "main" ] || exit 0

rel="${archivo#"$raiz"/}"
case "$rel" in
  src/* | __tests__/* | cypress/* | supabase/* | tailwind.config.js | jest.config.ts)
    {
      echo "⛔ Rama actual: main — y «$rel» es código de tarea."
      echo "Crea la rama ANTES de editar (manual §3 del plan): git switch -c <tipo>/<nombre-tarea>"
      echo "Solo docs/ops se editan en main; si esto es un hotfix consciente sobre main, pídele la excepción a Omar."
    } >&2
    exit 2
    ;;
esac
exit 0
