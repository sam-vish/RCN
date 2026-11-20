#!/bin/bash
# Render RCN NA motion assets from clips of RCN gatherings (see README › Footage).
# Every shot: trim → crop (removes burned-in logos) → scale → warm grade → 30fps; shots joined with
# 0.5s crossfades, then the end is crossfaded back into the start so the loop has no visible seam.
set -euo pipefail
SRC="${SRC:-footage}"  # folder of source clips (gitignored)
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/video"
TMP="${TMPDIR:-/tmp}/rcn_render"
mkdir -p "$OUT" "$TMP"
GRADE="eq=saturation=0.55:contrast=1.15:brightness=-0.02,colorbalance=rs=0.04:bs=-0.06:rm=0.05:bm=-0.05:rh=0.06:bh=-0.08"
XF=0.5

# build_reel <name> <W> <H> <shot>...   shot = "clip start dur cropW cropH cropX cropY"
build_reel() {
  local name=$1 W=$2 H=$3; shift 3
  local inputs=() fc="" i=0 offset=0 prev="" durs=()
  for shot in "$@"; do
    read -r clip ss dur cw ch cx cy <<<"$shot"
    inputs+=(-ss "$ss" -t "$dur" -i "$SRC/$clip.mp4")
    fc+="[$i:v]crop=$cw:$ch:$cx:$cy,hqdn3d=1.2:1.2:4:4,scale=$W:$H:flags=lanczos,unsharp=5:5:0.45:5:5:0,fps=30,$GRADE,setsar=1,format=yuv420p[s$i];"
    durs+=("$dur"); i=$((i+1))
  done
  # chain crossfades
  prev="s0"; offset=$(python3 -c "print(${durs[0]}-$XF)")
  for ((k=1; k<i; k++)); do
    fc+="[$prev][s$k]xfade=transition=fade:duration=$XF:offset=$offset[x$k];"
    prev="x$k"; offset=$(python3 -c "print($offset+${durs[$k]}-$XF)")
  done
  fc="${fc%;}"
  ffmpeg -loglevel error -y "${inputs[@]}" -filter_complex "$fc" -map "[$prev]" -c:v libx264 -crf 14 -preset fast -an "$TMP/$name.raw.mp4"
  # seamless loop: final = O[XF:end] crossfaded into O[0:XF]
  local L; L=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/$name.raw.mp4")
  local off; off=$(python3 -c "print(round($L-2*$XF,3))")
  ffmpeg -loglevel error -y -i "$TMP/$name.raw.mp4" -filter_complex \
    "[0:v]split[a][b];[a]trim=start=$XF,setpts=PTS-STARTPTS[body];[b]trim=0:$XF,setpts=PTS-STARTPTS[head];[body][head]xfade=transition=fade:duration=$XF:offset=$off,format=yuv420p[v]" \
    -map "[v]" -c:v libx264 -crf 12 -preset fast -an "$TMP/$name.loop.mp4"
}

# encode <name> <crf264> <crfvp9> : web-ready MP4 (H.264, faststart) + WebM (VP9) + poster
encode() {
  local name=$1
  ffmpeg -loglevel error -y -i "$TMP/$name.loop.mp4" -c:v libx264 -preset slow -tune film -crf "$2" -profile:v high -pix_fmt yuv420p -movflags +faststart -an "$OUT/$name.mp4"
  ffmpeg -loglevel error -y -i "$TMP/$name.loop.mp4" -c:v libvpx-vp9 -b:v 0 -crf "$3" -row-mt 1 -deadline good -cpu-used 2 -an "$OUT/$name.webm"
  ffmpeg -loglevel error -y -i "$TMP/$name.loop.mp4" -frames:v 1 -q:v 6 -update 1 "$OUT/$name-poster.jpg"
  ffmpeg -loglevel error -y -i "$OUT/$name-poster.jpg" -vf "scale=800:-2" -q:v 6 "$OUT/$name-poster-sm.jpg"  # phones
}

# Warm, communal grade (lighter than AAO's): keep skin tones, lift shadows slightly.
GRADE="eq=saturation=0.85:contrast=1.06:brightness=0.01:gamma=1.04,colorbalance=rs=0.03:bs=-0.04:rm=0.04:bm=-0.03:rh=0.05:bh=-0.05"

MODE="${1:-all}"
# Sources: 1080p clips from the HIGHEST-bitrate stream YouTube offers (HLS format 270, ~5 Mbps).
# Shot = "clip start dur cropW cropH cropX cropY". Crops are native resolution (no upscaling) and
# start >=160px in from the left/top so burned-in channel logos (top-left) and watermarks
# (bottom-right) never make it into frame. Closer shots first: dense far-away crowds are what
# livestream compression hurts most.
if [[ $MODE == hero || $MODE == all ]]; then
  build_reel hero 1600 900 \
    "mo_18162 1.0 3.4 1600 900 200 150" \
    "mo_6914 0.6 3.4 1600 900 200 160" \
    "bos_9980 1.0 3.4 1600 900 160 90" \
    "mo_9510 4.6 3.4 1600 900 200 150" \
    "mo_7780 1.5 3.4 1600 900 200 140" \
    "mo_15568 0.4 3.4 1600 900 200 150"
  encode hero 21 31
  build_reel hero-mobile 608 1080 \
    "mo_18162 1.0 3.4 608 1080 656 0" \
    "mo_6914 0.6 3.4 608 1080 486 0" \
    "bos_9980 1.0 3.4 608 1080 666 0" \
    "mo_9510 4.6 3.4 608 1080 656 0" \
    "mo_7780 1.5 3.4 608 1080 560 0" \
    "mo_15568 0.4 3.4 608 1080 656 0"
  encode hero-mobile 22 32
fi
if [[ $MODE == loops || $MODE == all ]]; then
  build_reel boston 1600 900 "bos_9980 0.5 4.2 1600 900 160 90" "bos_9073 0.5 4.0 1600 900 160 90"
  encode boston 22 32
  build_reel orlando 1600 900 "orl_2428 0.5 4.4 1600 900 160 120" "orl_966 2.0 4.2 1600 900 160 160"
  encode orlando 22 32
  build_reel conference 1600 900 "mo_18162 5.0 4.4 1600 900 200 150" "mo_6048 6.0 4.0 1600 900 200 160"
  encode conference 23 33
  build_reel worship 1600 900 "mo_7780 1.5 4.2 1600 900 200 140"
  encode worship 23 33
fi
ls -la "$OUT"
