from PIL import Image,ImageDraw,ImageFilter
from pathlib import Path
import math,numpy as np
ROOT=Path(__file__).resolve().parents[1]
W,H=1440,960
slugs=['01-washed-charcoal','02-pink-stripe','03-silver-tech','04-burgundy-archive','05-harness-tee','06-flame-hoodie','07-halftone-acid','08-stone-graphics','09-white-basic','10-sage-archive']

def create(center=4,intro=False):
 a=np.zeros((H,W,3),dtype=np.float32)
 for y in range(H):
  u=y/(H-1)
  if u<.32: t=u/.32;top=(18,27,35);bot=(46,59,67)
  elif u<.70:t=(u-.32)/.38;top=(46,59,67);bot=(126,139,144)
  else:t=(u-.70)/.30;top=(126,139,144);bot=(177,186,190)
  a[y,:,0:3]=[top[i]*(1-t)+bot[i]*t for i in range(3)]
 ys,xs=np.mgrid[:H,:W];centerGlow=18*np.exp(-(((xs-W*.5)/(W*.52))**2+((ys-H*.63)/(H*.4))**2)*2)
 a+=centerGlow[:,:,None]
 # wall haze, radial vignette
 vig=np.clip(1-0.25*(((xs-W/2)/(W/2))**2+((ys-H/2)/(H/2))**2),.5,1)
 a*=vig[:,:,None]
 bg=Image.fromarray(np.uint8(np.clip(a,0,255)),'RGB').convert('RGBA')
 d=ImageDraw.Draw(bg,'RGBA')
 # ground pooled shadow
 d.ellipse((80,770,1360,912),fill=(36,46,49,35))
 # seamless floor perspective and tonal highlight
 d.line((0,806,1440,806),fill=(202,209,210,20),width=2)
 # rack with chunky chrome gradients and rounded bends
 for off,width,col in [(6,17,(45,65,73,70)),(0,11,(214,223,225,245)),(-3,3,(255,255,255,200))]:
  d.line((66,282+off,1375,282+off),fill=col,width=width)
 for x in (69,1375):
  d.line((x,287,x,824),fill=(213,222,224,235),width=10)
  d.line((x-3,287,x-3,824),fill=(245,248,249,140),width=2)
  d.polygon([(x-5,795),(x+5,795),(x+49,890),(x-49,890)],fill=(149,162,165,255))
  d.ellipse((x-47,876,x+47,897),fill=(191,201,204,255))
 # stagger clothing behind selected
 indices=[i for i in range(10) if i!=center]+[center]
 for i in indices:
  art=Image.open(ROOT/'assets/product-art'/f'{slugs[i]}.webp').convert('RGBA')
  # crop transparent padding and make hanging smaller if sideways
  box=art.getbbox();art=art.crop(box)
  sel=i==center
  h=390 if sel else 320
  w=int(210 if sel else 69)
  art=art.resize((w,h),Image.Resampling.LANCZOS)
  x=int(140+(i*129)-w/2)
  y=323 if sel else 338
  shadow=Image.new('RGBA',art.size,(10,14,15,0));shadow.putalpha(art.getchannel('A').filter(ImageFilter.GaussianBlur(5)).point(lambda a:int(a*.19)))
  bg.alpha_composite(shadow,(x+6,y+7));bg.alpha_composite(art,(x,y))
  # single hanger vertical above shirt
  d=ImageDraw.Draw(bg,'RGBA')
  hx=140+i*129
  d.line([(hx,283),(hx,330)],fill=(18,24,26,235),width=6)
  d.line([(hx-17,338),(hx,323),(hx+17,338)],fill=(22,27,29,230),width=6)
 if intro:
  bg=bg.filter(ImageFilter.GaussianBlur(13))
  fade=Image.new('RGBA',bg.size,(15,24,31,45));bg=Image.alpha_composite(bg,fade)
 return bg.convert('RGB')

create(4,True).save(ROOT/'assets'/'fallback-intro.jpg',quality=90)
create(4).save(ROOT/'assets'/'fallback-showroom.jpg',quality=90)
create(6).save(ROOT/'assets'/'fallback-acid.jpg',quality=90)
print('Done')
