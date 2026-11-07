"""Create a static fallback from the user-supplied video only (not used as WebGL geometry).
The site labels this as STATIC PREVIEW when Three.js cannot load.
"""
from PIL import Image,ImageFilter
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[1]
source=root.parent/'hires'

def clean(filename,target):
 im=Image.open(source/filename).convert('RGB')
 w,h=im.size
 a=np.array(im)
 # Remove original on-video navigation and wall headline, which our live DOM redraws.
 t=np.zeros((285,w,3),dtype=np.uint8)
 for y in range(285):
  f=y/285
  for c,(v0,v1) in enumerate(zip((26,36,43),(70,80,84))):
   t[y,:,c]=round(v0*(1-f)+v1*f)
 # Blend boundary into the reference wall color
 for y in range(285):
  if y<238: a[y]=t[y]
  else: 
   ratio=(y-238)/47;a[y]=np.clip(t[y]*(1-ratio)+a[y]*ratio,0,255)
 # Hide the captured yellow label; retain all garment details.
 for y in range(696,757):
  if y>=h:break
  replace=np.mean(np.concatenate([a[y,390:500],a[y,865:975]]),axis=0)
  a[y,445:900]=np.clip(replace,0,255)
 # Replace video-specific bottom navigation with neutral grey floor gradient.
 for y in range(880,h):
  frac=(y-880)/(h-880)
  col=[int(147+8*frac),int(159+7*frac),int(165+6*frac)]
  a[y,:,:]=col
 Image.fromarray(a).save(root/'assets'/target,quality=92,optimize=True)

clean('3.6.jpg','fallback-showroom.jpg')
clean('5.6.jpg','fallback-acid.jpg')
print('Saved static screenshot preview with overlaid capture UI removed.')
