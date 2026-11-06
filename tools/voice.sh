#!/usr/bin/env bash
# Ham ses kayıtlarını oyuna hazırlar. Kullanım: bash tools/voice.sh
#   voice/raw/phone1..5.m4a, phone6_secret.m4a -> voice/phoneN.mp3     (telefon hattı efekti)
#   voice/raw/sayici.m4a                        -> sfx/sayici_4/5/6.mp3 (sessizliklerden bölünür: 1.,4.,7. parça)
#   voice/raw/miyav.m4a                         -> sfx/miyav.mp3        (ilk parça)
# Herhangi bir ses formatı olur (m4a, mp3, wav, ogg, opus); uzantıya bakılmaz.
set -euo pipefail
cd "$(dirname "$0")/.."
RAW=voice/raw
mkdir -p voice sfx
find_raw() { ls "$RAW/$1".* 2>/dev/null | head -n1 || true; }

PHONE_FX="highpass=f=320,lowpass=f=3300,acompressor=threshold=-20dB:ratio=6:attack=5:release=80,acrusher=bits=10:mix=0.25,volume=1.6"
for n in 1 2 3 4 5 6_secret; do
  src=$(find_raw "phone$n"); [ -n "$src" ] || continue
  ffmpeg -loglevel error -y -i "$src" -f lavfi -i "anoisesrc=color=pink:amplitude=0.012" -filter_complex \
    "[0:a]aformat=channel_layouts=mono,$PHONE_FX[v];[1:a]highpass=f=400,lowpass=f=3000[n];[v][n]amix=inputs=2:duration=first:weights=1 1,apad=pad_dur=0.6" \
    -ac 1 -ar 22050 -b:a 64k "voice/phone$n.mp3"
  echo "voice/phone$n.mp3"
done

# sessizliklere göre parçalara böler, "başlangıç bitiş" satırları basar
segments() {
  local dur; dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
  ffmpeg -hide_banner -nostats -i "$1" -af silencedetect=noise=-38dB:d=0.7 -f null - 2>&1 |
    awk -v D="$dur" '/silence_start/{e=$NF; if (e - s > 0.15) print s, e} /silence_end/{s=$5} BEGIN{s=0} END{if (D - s > 0.15) print s, D}'
}
CREEPY="aformat=channel_layouts=mono,asetrate=44100*0.84,aresample=44100,lowpass=f=5000,aecho=0.8:0.7:60|180:0.35|0.2,volume=2"
cut() { # kaynak başlangıç bitiş hedef
  ffmpeg -loglevel error -y -ss "$2" -to "$3" -i "$1" -af "$CREEPY,afade=t=out:st=$(awk -v a="$2" -v b="$3" 'BEGIN{d=b-a; print (d>0.3?d-0.15:0)}'):d=0.15" -ac 1 -b:a 96k "$4"
  echo "$4"
}
src=$(find_raw sayici)
if [ -n "$src" ]; then
  mapfile -t seg < <(segments "$src")
  for pair in "1 4" "4 5" "7 6"; do
    set -- $pair; i=$(( $1 - 1 ))
    [ "$i" -lt "${#seg[@]}" ] || { echo "uyarı: sayici kaydında $1. parça yok" >&2; continue; }
    cut "$src" ${seg[$i]} "sfx/sayici_$2.mp3"
  done
fi
src=$(find_raw miyav)
if [ -n "$src" ]; then
  mapfile -t seg < <(segments "$src")
  [ "${#seg[@]}" -gt 0 ] && cut "$src" ${seg[0]} sfx/miyav.mp3
fi
