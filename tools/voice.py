"""Ham ses kayıtlarını oyuna hazırlar.  Kullanım: python3 tools/voice.py

voice/raw/ içindeki dosyaları adlarına göre tanır (uzantı ve büyük/küçük harf fark etmez):
  phone 1 … phone 5, phone 6 / phone6_secret  -> voice/phoneN.mp3  (telefon hattı efekti)
  dört*  -> sfx/say4_N.mp3   beş* -> sfx/say5_N.mp3   altı* -> sfx/say6_N.mp3
  *jumpscare* (altı)  -> sfx/say6_scare.mp3  (Sayıcı'nın jumpscare'i)
  *mırıldan*  -> sfx/murmur.mp3   kitapta* -> sfx/kitapta.mp3   nefes* -> sfx/breath.mp3
  miyav*  -> sfx/miyav_N.mp3
Sonunda sfx/voices.json yazar: audio.js hangi seslerin var olduğunu buradan öğrenir.
"""
import json, re, subprocess, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW, VOICE, SFX = ROOT / 'voice/raw', ROOT / 'voice', ROOT / 'sfx'
TRIM = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse'
PHONE = f'aformat=channel_layouts=mono,{TRIM},loudnorm=I=-17:TP=-2:LRA=9,highpass=f=320,lowpass=f=3300,acompressor=threshold=-18dB:ratio=5:attack=5:release=80,acrusher=bits=11:mix=0.2,apad=pad_dur=0.6'
CREEPY = f'aformat=channel_layouts=mono,{TRIM},loudnorm=I=-16:TP=-1.5:LRA=7,aresample=44100,asetrate=44100*0.86,aresample=44100,lowpass=f=5500,aecho=0.8:0.7:70|190:0.32|0.18'


def norm(name):
    return unicodedata.normalize('NFC', name).lower()


def ff(args):
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *args], capture_output=True, text=True)
    if r.returncode:
        sys.exit(r.stderr)


def phone(src, out):
    ff(['-i', str(src), '-f', 'lavfi', '-i', 'anoisesrc=color=pink:amplitude=0.01', '-filter_complex',
        f'[0:a]{PHONE}[v];[1:a]highpass=f=400,lowpass=f=3000[n];[v][n]amix=inputs=2:duration=first:weights=1 1:normalize=0',
        '-ac', '1', '-ar', '22050', '-b:a', '64k', str(out)])


def creepy(src, out, extra=''):
    ff(['-i', str(src), '-af', CREEPY + extra, '-ac', '1', '-b:a', '96k', str(out)])


def main():
    SFX.mkdir(exist_ok=True); VOICE.mkdir(exist_ok=True)
    manifest, made = {}, []
    files = sorted(p for p in RAW.iterdir() if p.is_file() and p.suffix.lower() not in ('.md', '.txt'))
    groups = {}
    for p in files:
        n = norm(p.stem)
        m = re.match(r'phone\s*_?(\d)', n)
        if m:
            k = m.group(1)
            out = VOICE / (f'phone{k}.mp3' if k != '6' else 'phone6_secret.mp3')
            phone(p, out); made.append(out); continue
        if 'jumpscare' in n: key = 'say6_scare'
        elif 'mırıldan' in n or 'mirildan' in n: key = 'murmur'
        elif n.startswith('dört') or n.startswith('dort'): key = 'say4'
        elif n.startswith('beş') or n.startswith('bes'): key = 'say5'
        elif n.startswith('altı') or n.startswith('alti'): key = 'say6'
        elif n.startswith('kitapta'): key = 'kitapta'
        elif n.startswith('nefes'): key = 'breath'
        elif n.startswith('miyav'): key = 'miyav'
        else:
            print('tanınmadı, atlandı:', p.name); continue
        groups.setdefault(key, []).append(p)
    for key, srcs in groups.items():
        for i, src in enumerate(srcs, 1):
            out = SFX / (f'{key}.mp3' if len(srcs) == 1 else f'{key}_{i}.mp3')
            creepy(src, out)
            manifest.setdefault(key, []).append('sfx/' + out.name); made.append(out)
    (SFX / 'voices.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf8')
    for m in made: print(m.relative_to(ROOT))
    print('sfx/voices.json:', ', '.join(f'{k}×{len(v)}' for k, v in manifest.items()))


if __name__ == '__main__':
    main()
