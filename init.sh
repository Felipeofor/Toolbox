#!/usr/bin/env bash
# init.sh — verifica entorno y prepara estructura del challenge Toolbox
set -u

errors=()
ok() { echo "  [OK] $1"; }
warn() { echo "  [WARN] $1"; }
fail() { errors+=("$1"); echo "  [FAIL] $1"; }

echo "== Toolbox Challenge — env check =="

# Node
if command -v node >/dev/null 2>&1; then
  node_v=$(node -v)
  ok "node $node_v"
else
  fail "node no instalado (requerido: v14 para api, v16 para web — usar nvm o Docker)"
fi

# npm
if command -v npm >/dev/null 2>&1; then
  ok "npm $(npm -v)"
else
  fail "npm no instalado"
fi

# Docker (opcional pero recomendado)
if command -v docker >/dev/null 2>&1; then
  ok "docker $(docker --version | awk '{print $3}' | tr -d ',')"
else
  warn "docker no instalado (opcional, suma en evaluación)"
fi

# docker-compose
if command -v docker-compose >/dev/null 2>&1; then
  ok "docker-compose $(docker-compose --version | awk '{print $4}' | tr -d ',')"
elif docker compose version >/dev/null 2>&1; then
  ok "docker compose plugin disponible"
else
  warn "docker-compose no instalado (opcional)"
fi

# git
if command -v git >/dev/null 2>&1; then
  ok "git $(git --version | awk '{print $3}')"
  if [ -d ".git" ]; then
    staged_sensitive=$(git diff --cached --name-only 2>/dev/null | grep -E '\.(env|properties|pem|key)$|credentials|secret' || true)
    if [ -n "$staged_sensitive" ]; then
      warn "archivos sensibles en staging: $staged_sensitive"
    fi
  else
    warn "no es repo git (correr 'git init' antes de entregar)"
  fi
else
  warn "git no instalado"
fi

# progress/
if [ ! -d "progress" ]; then
  mkdir -p progress
  echo "  [CREATED] progress/"
fi
for f in board.md current.md history.md; do
  if [ ! -f "progress/$f" ]; then
    touch "progress/$f"
    echo "  [CREATED] progress/$f"
  fi
done

echo ""
if [ ${#errors[@]} -eq 0 ]; then
  echo "== OK =="
  exit 0
else
  echo "== ERRORS =="
  for e in "${errors[@]}"; do echo "  - $e"; done
  exit 1
fi
