#!/usr/bin/env bash
set -euo pipefail

# Capture the Interactive Lessons showcase reel (LinkedIn-ready vertical MP4).
# Build + serve the app first, then run this:
#
#   npm run build && npm run preview &     # serves dist on http://127.0.0.1:4173
#   scripts/capture_showcase.sh [output.mp4]
#
# Env: URL, NO_AUDIO=1, KEEP_WORK=1

cd "$(dirname "$0")/.."

output_path="${1:-artifacts/interactive-lessons-showcase.mp4}"
url="${URL:-http://127.0.0.1:4173}"
venv="artifacts/.capture-venv"
fontdir="artifacts/fonts"

# Stable interpreter (some systems ship a 3.14 whose ensurepip breaks in venvs).
if [[ ! -x "$venv/bin/python" ]]; then
  py=""
  for cand in python3.13 python3.12 python3.11 python3.10 python3; do
    command -v "$cand" >/dev/null 2>&1 && { py="$cand"; break; }
  done
  "$py" -m venv "$venv"
fi
"$venv/bin/python" -m pip show playwright >/dev/null 2>&1 || {
  "$venv/bin/python" -m pip install -U pip
  "$venv/bin/python" -m pip install playwright numpy
}
"$venv/bin/python" -m pip show numpy >/dev/null 2>&1 || "$venv/bin/python" -m pip install numpy
"$venv/bin/python" -m playwright install chromium >/dev/null

# JetBrains Mono ttf for the on-clip labels (matches the pages' family glue).
mkdir -p "$fontdir"
for face in Bold Regular; do
  f="$fontdir/JetBrainsMono-$face.ttf"
  [[ -s "$f" ]] || curl -fsSL \
    "https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/ttf/JetBrainsMono-$face.ttf" \
    -o "$f"
done

extra=()
[[ "${REBUILD:-0}" == "1" ]] && extra+=(--rebuild)
[[ "${NO_AUDIO:-0}" == "1" ]] && extra+=(--no-audio)
[[ "${KEEP_WORK:-0}" == "1" ]] && extra+=(--keep-work)

"$venv/bin/python" scripts/capture_showcase.py \
  --url "$url" \
  --output "$output_path" \
  --font "$fontdir/JetBrainsMono-Bold.ttf" \
  ${extra[@]+"${extra[@]}"}

printf 'wrote %s\n' "$output_path"
