import json,subprocess
k=json.load(open('keep.json'))['keep'];n=len(k)
grade=("hqdn3d=2:1.5:4:4,scale=1080:1920:flags=lanczos,"
 "curves=master='0/0.02 0.25/0.30 0.5/0.57 0.75/0.80 1/1',"
 "eq=contrast=1.04:saturation=1.08,colortemperature=temperature=5500:mix=0.4,"
 "unsharp=7:7:0.6:5:5:0.0")
aud="highpass=f=80,afftdn=nf=-25,equalizer=f=200:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=3,acompressor=threshold=-20dB:ratio=3:attack=10:release=150:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=9"
fc=''
for i,(a,b) in enumerate(k):
  fc+=f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={max(0,b-a-0.03)}:d=0.03[a{i}];"
fc+=''.join(f"[v{i}][a{i}]" for i in range(n))+f"concat=n={n}:v=1:a=1[cv][ca];[cv]{grade},fps=30[g];[1:v]format=rgba[t];[2:v]format=rgba,fps=30[c];[g][t]overlay=0:0[gt];[gt][c]overlay=0:0:eof_action=pass[ov];[ca]{aud}[oa]"
subprocess.run(['ffmpeg','-v','error','-y','-i','in.mp4','-loop','1','-i','title.png','-f','concat','-safe','0','-i','caps.txt','-filter_complex',fc,'-map','[ov]','-map','[oa]','-t',str(sum(b-a for a,b in k)),'-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','main2.mp4'],check=True)
