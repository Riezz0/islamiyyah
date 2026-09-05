#!/bin/bash
# Download Warsh mushaf page images for the Islamiyyah app
# Plain Warsh: KFGQPC from QuranHub
# Tajweed Warsh: EasyQuran tajweed from jahedev/tajweed-quran-pages

set -e

PUBLIC_DIR="$(cd "$(dirname "$0")/../public" && pwd)"

WARSH_PLAIN_DIR="$PUBLIC_DIR/warsh-plain"
WARSH_TAJWEED_DIR="$PUBLIC_DIR/warsh-tajweed"

mkdir -p "$WARSH_PLAIN_DIR" "$WARSH_TAJWEED_DIR"

# --- Plain Warsh (KFGQPC) ---
WARSH_PLAIN_URL="https://raw.githubusercontent.com/QuranHub/quran-pages-images/main/kfgqpc/warsh"

echo "=== Downloading Warsh plain pages (KFGQPC) ==="
for i in $(seq 1 604); do
  if [ ! -f "$WARSH_PLAIN_DIR/$i.jpg" ]; then
    echo -ne "Downloading page $i/604\r"
    curl -sL -o "$WARSH_PLAIN_DIR/$i.jpg" "$WARSH_PLAIN_URL/$i.jpg"
  fi
done
echo "Warsh plain: done ($(ls "$WARSH_PLAIN_DIR"/*.jpg 2>/dev/null | wc -l) pages)"

# --- Tajweed Warsh (EasyQuran) ---
WARSH_TAJWEED_URL="https://raw.githubusercontent.com/jahedev/tajweed-quran-pages/master/warsh"

echo "=== Downloading Warsh tajweed pages ==="
for i in $(seq 1 604); do
  PADDED=$(printf "%03d" "$i")
  if [ ! -f "$WARSH_TAJWEED_DIR/$PADDED.jpg" ]; then
    echo -ne "Downloading tajweed page $i/604\r"
    curl -sL -o "$WARSH_TAJWEED_DIR/$PADDED.jpg" "$WARSH_TAJWEED_URL/tajweed-$PADDED.jpg"
  fi
done
echo "Warsh tajweed: done ($(ls "$WARSH_TAJWEED_DIR"/*.jpg 2>/dev/null | wc -l) pages)"

echo ""
echo "=== Summary ==="
echo "Plain Warsh:     $WARSH_PLAIN_DIR ($(du -sh "$WARSH_PLAIN_DIR" | cut -f1))"
echo "Tajweed Warsh:   $WARSH_TAJWEED_DIR ($(du -sh "$WARSH_TAJWEED_DIR" | cut -f1))"
