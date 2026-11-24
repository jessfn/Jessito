#!/usr/bin/env bash
# Publica la carpeta emulador/ en GitHub Pages (rama gh-pages) con un número de versión nuevo.
# Las apps abiertas detectan la versión nueva en segundos y se actualizan solas.
# Uso:  bash scripts/publicar-emulador.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
VERSION="$(date -u +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
TMP="$(mktemp -d)"
git fetch -q origin gh-pages
git worktree add -q --detach "$TMP" origin/gh-pages
trap 'git -C "$ROOT" worktree remove --force "$TMP"' EXIT
cp -r emulador/. "$TMP"/
sed -i "s/const APP_VERSION='[^']*';/const APP_VERSION='$VERSION';/" "$TMP/index.html"
printf '{"version":"%s"}\n' "$VERSION" > "$TMP/version.json"
touch "$TMP/.nojekyll"
cd "$TMP"
git add -A
git commit -qm "Publicar emulador $VERSION"
git push -q origin HEAD:gh-pages
echo "Publicado: $VERSION -> https://jessfn.github.io/Jessito/"
