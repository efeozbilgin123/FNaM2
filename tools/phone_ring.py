# Eski masa telefonu zili: 20 Hz'de iki çanı sırayla vuran çekiç (elektromekanik zil) — fiziksel taklit
import numpy as np, wave
SR=44100; rng=np.random.default_rng(4)
def bell(f0, dur=1.0):
    t=np.arange(int(SR*dur))/SR
    parts=[(1,1,.55),(2.32,.45,.28),(4.25,.22,.14),(6.63,.12,.07),(1.5,.08,.4)]   # (oran, genlik, sönüm sn)
    return sum(a*np.sin(2*np.pi*f0*r*t+rng.uniform(0,6))*np.exp(-t/d) for r,a,d in parts)
A,B=bell(1210),bell(1490)
burst=1.7; n=int(SR*(burst+1.2)); y=np.zeros(n)
hits=np.arange(0,burst,1/40)            # 40 vuruş/sn: her çana 20
for i,h in enumerate(hits):
    k=int(h*SR); s=A if i%2==0 else B
    v=(0.75+0.25*rng.random())*min(1,(h+0.05)/0.12)   # ilk vuruşlar biraz zayıf
    seg=s[:n-k]*v
    # çekiç çanın üstündeyken titreşimi biraz boğar
    y[k:k+len(seg)]*=0.55; y[k:k+len(seg)]+=seg
    # çekiç tıkırtısı
    c=rng.normal(0,1,int(SR*.004))*np.exp(-np.arange(int(SR*.004))/(SR*.0008))*.6
    y[k:k+len(c)]+=c[:max(0,min(len(c),n-k))]
# mekanizma vızıltısı (20 Hz armatür)
t=np.arange(n)/SR; env=(t<burst).astype(float)
y+=0.05*np.sign(np.sin(2*np.pi*20*t))*env*np.convolve(rng.normal(0,1,n),np.ones(30)/30,'same')
# eski telefon gövdesi: hafif bant geçiren (basit), sonra normalize
from numpy.fft import rfft,irfft,rfftfreq
F=rfft(y); fr=rfftfreq(n,1/SR); F*=1/(1+((fr-1400)/1600)**2)**.5; F[fr<250]*=0.2; y=irfft(F,n)
y/=np.abs(y).max()*1.12
fade=np.ones(n); fo=int(SR*.15); fade[-fo:]=np.linspace(1,0,fo); y*=fade
import sys; OUT = sys.argv[1] if len(sys.argv) > 1 else 'ring.wav'   # sonra: ffmpeg -i ring.wav -af loudnorm=I=-20:TP=-3 sfx/phone_ring.mp3
w=wave.open(OUT,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y*32767).astype(np.int16).tobytes()); w.close()
print('ok', n/SR)
