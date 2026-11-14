#!/usr/bin/env bash
set -e

SOURCE="mobile/icon-store-512.png"
RES="mobile/android/app/src/main/res"
TMP="/tmp/loly_gen"
mkdir -p "$TMP"

echo "==> Generating Android Icons from $SOURCE"

# 1. Legacy & Round Icons (square / round launcher)
declare -a DENSITIES=("mdpi:48" "hdpi:72" "xhdpi:96" "xxhdpi:144" "xxxhdpi:192")
for item in "${DENSITIES[@]}"; do
  D="${item%%:*}"
  S="${item##*:}"
  OUT_DIR="$RES/mipmap-$D"
  mkdir -p "$OUT_DIR"
  sips -z "$S" "$S" "$SOURCE" --out "$OUT_DIR/ic_launcher.png" > /dev/null
  sips -z "$S" "$S" "$SOURCE" --out "$OUT_DIR/ic_launcher_round.png" > /dev/null
  echo "    [+] mipmap-$D: ${S}x${S} ic_launcher & round"
done

# 2. Adaptive Icons Foreground (108dp canvas, ~72dp artwork centered with transparent padding)
declare -a ADAPTIVE=("mdpi:108:72" "hdpi:162:108" "xhdpi:216:144" "xxhdpi:324:216" "xxxhdpi:432:288")
for item in "${ADAPTIVE[@]}"; do
  IFS=":" read -r D CANVAS_S ART_S <<< "$item"
  OUT_DIR="$RES/mipmap-$D"
  TMP_ART="$TMP/art_${D}.png"
  # Resize artwork
  sips -z "$ART_S" "$ART_S" "$SOURCE" --out "$TMP_ART" > /dev/null
  # Pad to canvas size (transparent padding preserved)
  sips -p "$CANVAS_S" "$CANVAS_S" "$TMP_ART" --out "$OUT_DIR/ic_launcher_foreground.png" > /dev/null
  echo "    [+] mipmap-$D: ${CANVAS_S}x${CANVAS_S} foreground (art: ${ART_S}x${ART_S})"
done

# 3. Remove obsolete drawable-v24 android robot foreground if present
if [ -f "$RES/drawable-v24/ic_launcher_foreground.xml" ]; then
  rm -f "$RES/drawable-v24/ic_launcher_foreground.xml"
  echo "    [-] Removed legacy drawable-v24/ic_launcher_foreground.xml (robot head)"
fi

# 4. Splash Screens (Portrait & Landscape with #07090e background and centered crisp logo)
echo "==> Generating Splash Screens"

# drawable default
sips -z 160 160 "$SOURCE" --out "$TMP/logo_160.png" > /dev/null
sips -p 320 480 --padColor 07090E "$TMP/logo_160.png" --out "$RES/drawable/splash.png" > /dev/null
echo "    [+] drawable: 480x320 splash"

# Portrait
declare -a PORT_SPLASH=(
  "drawable-port-mdpi:320:480:120"
  "drawable-port-hdpi:480:800:180"
  "drawable-port-xhdpi:720:1280:260"
  "drawable-port-xxhdpi:960:1600:340"
  "drawable-port-xxxhdpi:1280:1920:440"
)
for item in "${PORT_SPLASH[@]}"; do
  IFS=":" read -r DIR W H LOGO <<< "$item"
  OUT_DIR="$RES/$DIR"
  mkdir -p "$OUT_DIR"
  TMP_LOGO="$TMP/logo_p_${LOGO}.png"
  sips -z "$LOGO" "$LOGO" "$SOURCE" --out "$TMP_LOGO" > /dev/null
  sips -p "$H" "$W" --padColor 07090E "$TMP_LOGO" --out "$OUT_DIR/splash.png" > /dev/null
  echo "    [+] $DIR: ${W}x${H} splash (logo: ${LOGO}px)"
done

# Landscape
declare -a LAND_SPLASH=(
  "drawable-land-mdpi:480:320:120"
  "drawable-land-hdpi:800:480:180"
  "drawable-land-xhdpi:1280:720:260"
  "drawable-land-xxhdpi:1600:960:340"
  "drawable-land-xxxhdpi:1920:1280:440"
)
for item in "${LAND_SPLASH[@]}"; do
  IFS=":" read -r DIR W H LOGO <<< "$item"
  OUT_DIR="$RES/$DIR"
  mkdir -p "$OUT_DIR"
  TMP_LOGO="$TMP/logo_l_${LOGO}.png"
  sips -z "$LOGO" "$LOGO" "$SOURCE" --out "$TMP_LOGO" > /dev/null
  sips -p "$H" "$W" --padColor 07090E "$TMP_LOGO" --out "$OUT_DIR/splash.png" > /dev/null
  echo "    [+] $DIR: ${W}x${H} splash (logo: ${LOGO}px)"
done

rm -rf "$TMP"
echo "==> All icons and splash screens successfully generated!"
