#!/usr/bin/env python3
"""Create original procedural 3D clothing + texture maps for a demo virtual showroom.
No third-party garment model is bundled. All generated artwork is original.
"""
from pathlib import Path
import math, random, io
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import trimesh
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals

ROOT=Path(__file__).resolve().parents[1]
GD=ROOT/'assets'/'garments'; TD=ROOT/'assets'/'textures'; PD=ROOT/'assets'/'product-art'
for p in (GD,TD,PD): p.mkdir(parents=True,exist_ok=True)
N=768
rng=random.Random(103)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
font=ImageFont.truetype(FONT,64)
small=ImageFont.truetype(FONT,25)
PRODUCTS=[
 ('01-washed-charcoal','Washed Charcoal Hoodie',(39,44,46),'hoodie'),
 ('02-pink-stripe','Candy Stripe Knit',(236,143,180),'sweater'),
 ('03-silver-tech','Liquid Silver Jacket',(164,171,175),'jacket'),
 ('04-burgundy-archive','Archive Burgundy',(103,31,41),'sweater'),
 ('05-harness-tee','Harness Tee',(230,229,220),'tee'),
 ('06-flame-hoodie','Midnight Flame Hoodie',(30,30,31),'hoodie'),
 ('07-halftone-acid','Halftone Acid Tee',(67,155,173),'tee'),
 ('08-stone-graphics','Stone Archive Knit',(174,162,146),'sweater'),
 ('09-white-basic','Essential Blanc Tee',(232,230,220),'tee'),
 ('10-sage-archive','Sage Archive Hoodie',(130,145,130),'hoodie'),
]

def fabric_texture(idx,color):
    im=Image.new('RGB',(N,N),color)
    px=im.load()
    rng2=random.Random(100+idx)
    # Fabric fibers + controlled tonal noise
    noise=np.random.default_rng(100+idx).normal(0,4,(N,N,1))
    a=np.asarray(im).copy().astype(float); a+=noise
    # Light longitudinal ripples, weave pattern
    wave=np.sin(np.arange(N)[None,:,None]*.15)*2
    a+=wave
    if idx==1: # horizontal broad stripes
        for y in range(N):
            bright = (y//82)%2==0
            a[y,:,0:3]=[241,177,198] if bright else [250,239,229]
        a+=noise*.55
    if idx==2:
        for x in range(N):
            a[:,x,:]+=22*math.sin(x*.012)+7*math.sin(x*.13)
    if idx==6: # blue/acid wash
        ys,xs=np.mgrid[:N,:N]; field=np.zeros((N,N))
        for k in range(25):
            cx,cy=rng2.randrange(N),rng2.randrange(N)
            r=rng2.randrange(15,90)
            field+=np.exp(-((xs-cx)**2+(ys-cy)**2)/(2*r*r))*rng2.uniform(.7,1.6)
        a[:,:,0]+=field*13;a[:,:,1]+=field*33;a[:,:,2]-=field*25
    if idx==0:
        a[:,:,:]+=np.sin(np.arange(N)[None,:,None]*.018)*5
    im=Image.fromarray(np.clip(a,0,255).astype('uint8'),'RGB')
    d=ImageDraw.Draw(im)
    if idx==2:
        d.line([(N*.28,0),(N*.48,N*.38),(N*.44,N)], fill=(226,240,100), width=10)
        d.line([(N*.72,0),(N*.52,N*.38),(N*.56,N)], fill=(226,240,100), width=10)
        d.line([(N*.5,0),(N*.5,N)],fill=(50,61,69),width=5)
    if idx==3:
        d.ellipse((N*.40,N*.25,N*.60,N*.44),outline=(200,120,136),width=9)
        d.text((N*.5,N*.49),'ARCHIVE',font=small,anchor='mm',fill=(214,164,173))
    if idx==4:
        col=(165,36,49); w=24
        d.arc((N*.07,N*.08,N*.82,N*.82),-5,190,fill=col,width=w)
        d.arc((N*.2,N*.05,N*.95,N*.82),160,349,fill=col,width=w)
        d.line([(N*.20,N*.15),(N*.62,N*.75)],fill=col,width=19)
        d.line([(N*.80,N*.15),(N*.38,N*.75)],fill=col,width=19)
        d.ellipse((N*.40,N*.28,N*.60,N*.48),outline=col,width=14)
    if idx==5:
        for j in range(12):
            x=j*N/11
            h=85+72*math.sin(j*2.2)**2
            d.polygon([(x-33,N),(x-21,N-h*.44),(x+7,N-h),(x+17,N-h*.48),(x+35,N)], fill=(110,111,106))
    if idx==6:
        d.text((N*.5,N*.22),'LOOPS',font=font,anchor='mm',fill=(29,62,91),stroke_width=1)
        d.text((N*.5,N*.3),'ACID ARCHIVE',font=small,anchor='mm',fill=(215,231,114))
    if idx==7:
        for i in range(7):
            x=i*N/6
            d.line([(x-80,-10),(x+120,N+10)],fill=(140,56,53),width=8)
        d.text((N*.52,N*.34),'02',font=font,anchor='mm',fill=(66,57,52))
    if idx==8:
        d.text((N*.72,N*.23),'L//',font=small,anchor='mm',fill=(69,90,105))
    if idx==9:
        d.text((N*.5,N*.24),'REWORN',font=small,anchor='mm',fill=(48,61,52))
        d.line([(N*.35,N*.27),(N*.65,N*.27)],fill=(48,61,52),width=3)
    # soften digital texture appearance slightly
    im=im.filter(ImageFilter.GaussianBlur(.32))
    return im

def mesh_surface(points, uv, faces, tex, mat, name):
    geom=trimesh.Trimesh(vertices=np.array(points),faces=np.array(faces),process=False)
    # trimesh GLB exporter packs PIL image in PBR base color texture
    geom.visual=TextureVisuals(uv=np.array(uv), material=mat)
    geom.metadata['name']=name
    return geom

def grid_mesh(index,tex,mat,typ):
    verts=[]; uvs=[]; faces=[]
    def add_quad_grid(surf_name, func, nx,ny):
        start=len(verts)
        for j in range(ny+1):
            t=j/ny
            for i in range(nx+1):
                u=i/nx
                x,y,z=func(u,t)
                verts.append((x,y,z)); uvs.append((u,1-t))
        for j in range(ny):
            for i in range(nx):
                a=start+j*(nx+1)+i
                b=a+1;c=a+(nx+1);d=c+1
                # front/back winding will become doubleside via material if needed
                faces.append((a,b,c));faces.append((b,d,c))
    body_w={'tee':.51,'sweater':.58,'hoodie':.61,'jacket':.55}[typ]
    length={'tee':1.55,'sweater':1.72,'hoodie':1.75,'jacket':1.69}[typ]
    def body(u,t,front):
        x=(u-.5)*2*(body_w*(.77+.23*math.pow(t,.56)))
        y=-.08-length*t + .012*math.sin(10*u+index)*t
        ripple=.035*math.sin(u*37+index*.37)*(0.4+.6*t)+.017*math.sin(u*73+t*18)
        z=(.105 if front else -.108)+(ripple if front else -.5*ripple) + .034*math.cos((u-.5)*math.pi*2)*(1-t)
        return x,y,z
    add_quad_grid('front',lambda u,t:body(u,t,True),32,34)
    add_quad_grid('back',lambda u,t:body(1-u,t,False),32,34)
    for side in (-1,1):
        sh=(-1 if side<0 else 1)
        slen={'tee':.50,'sweater':.92,'hoodie':1.05,'jacket':.94}[typ]
        xend={'tee':.88,'sweater':.91,'hoodie':1.00,'jacket':.99}[typ]
        def sleeve(u,t,front=True):
            # u from inner edge to outer edge of sleeve, t from shoulder to cuff
            xx=sh*(body_w*.67+(xend-body_w*.67)*t)
            yy=-.15 - slen*t
            w=.18-.028*t + (.03 if typ=='hoodie' else 0)
            # perpendicular in projected plane of downward-outward sleeve
            xx+=sh*(u-.5)*w*1.12
            yy+=(u-.5)*w*.88
            z=(.138 if front else -.13)+(.02*math.sin(t*12+u*18))
            return xx,yy,z
        add_quad_grid('sleeveF',lambda u,t:sleeve(u,t,True),10,19)
        add_quad_grid('sleeveB',lambda u,t:sleeve(1-u,t,False),10,19)
    return mesh_surface(verts,uvs,faces,tex,mat,'garment')

def art_preview(img,idx,typ):
    canvas=Image.new('RGBA',(720,860),(0,0,0,0))
    mask=Image.new('L',(720,860),0); d=ImageDraw.Draw(mask)
    if typ in ('hoodie','jacket'):
        pts=[(263,100),(333,88),(387,88),(463,100),(515,195),(568,470),(487,486),(442,290),(448,735),(272,735),(278,290),(233,486),(152,470),(205,195)]
    elif typ=='sweater':
        pts=[(263,125),(326,96),(393,96),(457,125),(520,200),(570,435),(488,457),(443,292),(449,715),(271,715),(277,292),(232,457),(150,435),(200,200)]
    else:
        pts=[(276,120),(330,103),(388,103),(444,120),(560,213),(519,365),(447,314),(453,710),(267,710),(273,314),(201,365),(160,213)]
    d.polygon(pts,fill=255)
    pattern=img.resize((720,860))
    # slight print light falloff
    p=np.array(pattern).astype(float); xx=np.arange(720)[None,:,None]
    p*=np.clip(.90+.11*np.cos((xx-360)/360*np.pi),.70,1.1)
    col=Image.fromarray(np.uint8(np.clip(p,0,255)),'RGB').convert('RGBA')
    canvas.paste(col,(0,0),mask)
    draw=ImageDraw.Draw(canvas)
    collar=(35,38,39,255) if idx not in (4,8) else (172,165,156,255)
    draw.arc((323,105,397,174),0,180,fill=collar,width=13)
    if typ=='hoodie':
        draw.arc((274,54,446,185),160,383,fill=(70,74,75,220),width=14)
        draw.line((352,154,344,314),fill=(199,196,186,220),width=4)
        draw.line((379,154,384,306),fill=(199,196,186,220),width=4)
    draw.line(pts+[pts[0]],fill=(30,30,30,75),width=4)
    return canvas

for idx,(slug,name,color,typ) in enumerate(PRODUCTS):
    tex=fabric_texture(idx,color)
    tex.save(TD/f'{slug}.jpg',quality=88,optimize=True)
    mat=PBRMaterial(name=f'Original {slug} cotton', baseColorTexture=tex, metallicFactor=.32 if typ=='jacket' else .02, roughnessFactor=.34 if typ=='jacket' else .86, doubleSided=True)
    m=grid_mesh(idx,tex,mat,typ)
    scene=trimesh.Scene(); scene.add_geometry(m,geom_name=slug)
    exported=scene.export(file_type='glb')
    (GD/f'{slug}.glb').write_bytes(exported)
    art=art_preview(tex,idx,typ)
    art.save(PD/f'{slug}.webp',lossless=False,quality=90,method=6)
    print(f'{slug:28} {len(exported):8} bytes, faces {len(m.faces):5}')
print('Complete')
