#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Puerta de calidad de una tarea del PLAN_MAESTRO_DASHBOARD.md
#
# Uso:   npm run verify            (desde la rama de la tarea)
#
# Una tarea NO se marca completada ni se mergea a main si este script no
# termina en «TODO EN VERDE». No sustituye a los criterios de aceptación de la
# tarea: comprueba lo que es común a todas.
#
# Cada paso existe por un fallo concreto que ya ocurrió o que el plan prohíbe;
# el motivo va junto al paso para que nadie lo quite «porque estorba».
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

cd "$(dirname "$0")/.."

# Antipatrones de diseño ya presentes cuando se instaló el detector (ver §3.9
# del plan). Solo puede bajar. T-24 corrigió el último (border-l-4 en
# docs/[slug]): la línea base es 0 y cualquier hallazgo nuevo bloquea.
LINEA_BASE_ANTIPATRONES=0

ROJO=$'\033[31m'; VERDE=$'\033[32m'; GRIS=$'\033[90m'; FIN=$'\033[0m'
fallos=0
paso() { printf '\n%s▸ %s%s\n' "$GRIS" "$1" "$FIN"; }
ok()   { printf '%s  ✔ %s%s\n' "$VERDE" "$1" "$FIN"; }
mal()  { printf '%s  ✘ %s%s\n' "$ROJO" "$1" "$FIN"; fallos=$((fallos + 1)); }

rama="$(git branch --show-current)"
base="$(git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD main)"

# 1 ── Rama propia ───────────────────────────────────────────────────────────
# El plan exige una rama por tarea; trabajar en main salta la revisión entera.
paso "Rama de trabajo"
if [ "$rama" = "main" ] || [ -z "$rama" ]; then
  mal "Estás en «${rama:-HEAD suelto}». Cada tarea va en su propia rama."
else
  ok "$rama"
fi

# 2 ── El visor de proyectos no se toca ──────────────────────────────────────
# src/components/shared/Card.tsx tiene la geometría de los tres iframes
# ajustada a mano. Ninguna tarea está autorizada a modificarlo.
paso "Visor de proyectos intacto (src/components/shared/Card.tsx)"
if git diff --quiet "$base" -- src/components/shared/Card.tsx; then
  ok "sin cambios respecto a main"
else
  mal "Card.tsx fue modificado. Revierte: git checkout $base -- src/components/shared/Card.tsx"
fi

# 3 ── Typecheck ─────────────────────────────────────────────────────────────
paso "Typecheck"
if npm run --silent typecheck >/tmp/verify-tsc.log 2>&1; then
  ok "0 errores"
else
  mal "tsc reporta errores (ver /tmp/verify-tsc.log)"; tail -15 /tmp/verify-tsc.log
fi

# 4 ── Lint ──────────────────────────────────────────────────────────────────
paso "Lint"
if npm run --silent lint >/tmp/verify-lint.log 2>&1; then
  ok "sin avisos ni errores"
else
  mal "eslint reporta problemas (ver /tmp/verify-lint.log)"; tail -15 /tmp/verify-lint.log
fi

# 5 ── Tests ─────────────────────────────────────────────────────────────────
# Incluye los guardarraíles: paletas, visor, tokens, esquema↔tipos y conteos del
# contenido medidos en vivo.
paso "Tests"
if npx jest >/tmp/verify-jest.log 2>&1; then
  ok "$(grep -E '^Tests:' /tmp/verify-jest.log | sed 's/^Tests: *//')"
else
  mal "hay tests en rojo (ver /tmp/verify-jest.log)"
  grep -E '●|^Tests:' /tmp/verify-jest.log | head -20
fi

# 6 ── La tarea añadió tests ─────────────────────────────────────────────────
# Código nuevo sin test nuevo es una afirmación sin evidencia. Se avisa (no se
# bloquea) porque una tarea de pura documentación no los necesita.
#
# `git diff` solo ve lo que git ya sigue, así que un archivo de test recién
# creado y sin `git add` no aparecía y el aviso saltaba en falso. Se suman los
# archivos sin seguimiento de `git status`.
tocados() {
  {
    git diff --name-only "$base" -- "$@"
    git status --porcelain --untracked-files=all -- "$@" | awk '{print $NF}'
  } | sort -u | grep -v '^$' || true
}

paso "Tests nuevos en esta rama"
if [ -n "$(tocados src)" ]; then
  if [ -n "$(tocados __tests__ cypress)" ]; then
    ok "la rama toca src/ y también añade o cambia tests"
  else
    printf '%s  ⚠ La rama cambia src/ pero no toca ningún test. Justifícalo en el registro de avance.%s\n' "$ROJO" "$FIN"
  fi
else
  ok "la rama no cambia src/"
fi

# 7 ── El CSS compila ────────────────────────────────────────────────────────
# Sustituye al build donde no hay red: prueba que tokens y utilidades existen.
paso "Compilación de Tailwind"
if npx tailwindcss -i src/app/globals.css -o /tmp/verify-tw.css \
     --content "src/**/*.{ts,tsx}" >/tmp/verify-tw.log 2>&1; then
  ok "globals.css compila"
else
  mal "Tailwind no compila (ver /tmp/verify-tw.log)"; tail -10 /tmp/verify-tw.log
fi

# 8 ── Detector de diseño ────────────────────────────────────────────────────
# Cuenta antipatrones reales (no las notas consultivas) en el panel. No puede
# subir respecto a la línea base.
paso "Detector de diseño (Impeccable)"
IMP=".claude/skills/impeccable/scripts/impeccable"
if [ -x "$IMP" ] && "$IMP" detect --json src/app/admin src/components/admin \
     >/tmp/verify-det.json 2>/dev/null; [ -s /tmp/verify-det.json ]; then
  reales="$(node -e '
    const d = JSON.parse(require("fs").readFileSync("/tmp/verify-det.json", "utf8"));
    const a = Array.isArray(d) ? d : (d.findings || d.results || []);
    console.log(a.filter((f) => !f.advisory).length);
  ' 2>/dev/null || echo "?")"
  if [ "$reales" = "?" ]; then
    printf '%s  ⚠ No se pudo leer la salida del detector; revísalo a mano.%s\n' "$ROJO" "$FIN"
  elif [ "$reales" -le "$LINEA_BASE_ANTIPATRONES" ]; then
    ok "$reales antipatrones (línea base: $LINEA_BASE_ANTIPATRONES)"
  else
    mal "$reales antipatrones, por encima de la línea base ($LINEA_BASE_ANTIPATRONES). Corre: $IMP detect src/app/admin src/components/admin"
  fi
else
  printf '%s  ⚠ Detector no disponible en este entorno; paso omitido.%s\n' "$ROJO" "$FIN"
fi

# 9 ── Sin secretos ni archivos de entorno en el commit ──────────────────────
paso "Sin archivos sensibles en la rama"
sensibles="$(git diff --name-only "$base" | grep -E '(^|/)\.env($|\.)|mis-claves|\.pem$|service-role' | grep -v '\.env\.example$' || true)"
if [ -z "$sensibles" ]; then
  ok "ninguno"
else
  mal "archivos sensibles en la rama: $sensibles"
fi

# ── Veredicto ────────────────────────────────────────────────────────────────
echo
if [ "$fallos" -eq 0 ]; then
  printf '%sTODO EN VERDE%s — falta lo propio de la tarea: sus criterios de aceptación,\n' "$VERDE" "$FIN"
  printf 'la revisión a 375 px si tocó interfaz, y tras el merge: gh run watch.\n'
  exit 0
fi
printf '%s%d comprobación(es) en rojo. La tarea sigue abierta.%s\n' "$ROJO" "$fallos" "$FIN"
exit 1
