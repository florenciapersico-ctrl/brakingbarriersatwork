#!/usr/bin/env python3
"""Reemplaza el fondo por un espacio de trabajo desenfocado (versión «oficina», aprobada como opción el 20/10).
Uso: python3 fondo.py <video_original> <salida.mov> [fondo.png]
Requisitos: pip install mediapipe; apt-get install -y libegl1 libgles2;
modelo: curl -o /tmp/mc.tflite https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite
Después correr reel.py render sobre <salida.mov> (mismos tiempos que el original)."""
import numpy as np, mediapipe as mp, subprocess, sys, os
from mediapipe.tasks.python import vision, BaseOptions
from PIL import Image, ImageFilter
src,out=sys.argv[1],sys.argv[2]
fondo=sys.argv[3] if len(sys.argv)>3 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','fondo-oficina-plantas.png')
W,H=1080,1920
seg=vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(base_options=BaseOptions(model_asset_path='/tmp/mc.tflite'),output_confidence_masks=True))
bg=Image.open(fondo).convert('RGB'); s=max(W/bg.width,H/bg.height); bg=bg.resize((int(bg.width*s),int(bg.height*s)))
bg=bg.crop(((bg.width-W)//2,0,(bg.width-W)//2+W,H)).filter(ImageFilter.GaussianBlur(5)); bg=np.asarray(bg).astype(np.float32)
dec=subprocess.Popen(['ffmpeg','-v','error','-i',src,'-vf',f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r','30','-i','-','-i',src,'-map','0:v','-map','1:a','-c:v','libx264','-crf','14','-preset','medium','-pix_fmt','yuv420p','-c:a','copy',out],stdin=subprocess.PIPE)
prev=None
while True:
  buf=dec.stdout.read(W*H*3)
  if len(buf)<W*H*3: break
  a=np.frombuffer(buf,np.uint8).reshape(H,W,3)
  r=seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB,data=np.ascontiguousarray(a)))
  m=np.clip((1-np.squeeze(r.confidence_masks[0].numpy_view())-0.15)/0.7,0,1)
  if prev is not None: m=0.6*m+0.4*prev
  prev=m
  mi=np.asarray(Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))).astype(np.float32)[...,None]/255
  enc.stdin.write((a.astype(np.float32)*mi+bg*(1-mi)).astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait(); print('listo',out)
