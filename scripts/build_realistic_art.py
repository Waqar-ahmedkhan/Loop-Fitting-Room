#!/usr/bin/env python3
"""Build ultra-high-resolution photorealistic e-commerce catalog artwork for all 10 garments.
Each image is centered, studio-lit, luxury editorial quality at 720x960 WebP.
"""
from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PD = ROOT / 'assets' / 'product-art'
BRAIN = Path('/home/waqarahmed/.gemini/antigravity-cli/brain/9f2f647c-18d3-4bda-b449-865d2040caaf')

TARGET_SIZE = (720, 960)

def create_studio_card(garment_rgba, bg_tone=(210, 213, 208)):
    """Composites garment on a soft studio lighting card with vignette and contact shadow."""
    tw, th = TARGET_SIZE
    card = Image.new('RGB', (tw, th), bg_tone)
    c_arr = np.array(card, dtype=float)
    
    # Soft radial studio lighting gradient
    ys, xs = np.mgrid[:th, :tw]
    cx, cy = tw * 0.5, th * 0.45
    radius = math.hypot(tw * 0.5, th * 0.5)
    dist = np.hypot(xs - cx, ys - cy) / radius
    # Bright center, soft falloff
    vignette = np.clip(1.12 - dist * 0.35, 0.75, 1.15)[:, :, None]
    c_arr *= vignette
    card = Image.fromarray(np.clip(c_arr, 0, 255).astype(np.uint8), 'RGB')
    
    # Fit garment
    bbox = garment_rgba.getbbox()
    cropped = garment_rgba.crop(bbox) if bbox else garment_rgba
    cw, ch = cropped.size
    scale = min((tw * 0.86) / cw, (th * 0.86) / ch)
    new_w, new_h = int(cw * scale), int(ch * scale)
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    pos_x = (tw - new_w) // 2
    pos_y = int((th - new_h) // 2 + th * 0.02)
    
    # Ambient soft contact shadow
    alpha = resized.split()[3]
    shadow_mask = alpha.filter(ImageFilter.GaussianBlur(18))
    s_arr = np.array(shadow_mask, dtype=float) * 0.28
    s_im = Image.fromarray(s_arr.astype(np.uint8), mode='L')
    s_layer = Image.new('RGBA', resized.size, (18, 22, 24, 0))
    s_layer.putalpha(s_im)
    
    card_rgba = card.convert('RGBA')
    card_rgba.paste(s_layer, (pos_x, pos_y + 14), s_layer)
    card_rgba.paste(resized, (pos_x, pos_y), resized)
    return card_rgba

def load_clean_ai(im_path):
    im = Image.open(im_path).convert('RGB')
    arr = np.array(im, dtype=float)
    H, W, _ = arr.shape
    top_bg = (arr[10, 10] + arr[10, -10]) / 2.0
    bot_bg = (arr[-10, 10] + arr[-10, -10]) / 2.0
    y_coords = np.linspace(0, 1, H)[:, None, None]
    bg_est = top_bg * (1 - y_coords) + bot_bg * y_coords
    dist = np.linalg.norm(arr - bg_est, axis=2)
    
    # Mask background cleanly
    mask = np.clip((dist - 9.0) / 12.0, 0.0, 1.0)
    mask_im = Image.fromarray((mask * 255).astype(np.uint8), mode='L').filter(ImageFilter.GaussianBlur(0.8))
    rgba = im.convert('RGBA')
    rgba.putalpha(mask_im)
    return rgba

print("Generating 10 luxury studio cards...")

# 01 Washed Charcoal Hoodie
im01 = load_clean_ai(BRAIN / 'washed_charcoal_hoodie_1794028503440.jpg')
art01 = create_studio_card(im01, bg_tone=(210, 213, 208))
art01.save(PD / '01-washed-charcoal.webp', quality=95, method=6)
print("Saved 01")

# 02 Candy Stripe Knit
im02 = load_clean_ai(BRAIN / 'candy_stripe_knit_1794028572986.jpg')
art02 = create_studio_card(im02, bg_tone=(188, 196, 194))
art02.save(PD / '02-pink-stripe.webp', quality=95, method=6)
print("Saved 02")

# 04 Archive Burgundy
im04 = load_clean_ai(BRAIN / 'archive_burgundy_sweater_1794028592058.jpg')
art04 = create_studio_card(im04, bg_tone=(174, 184, 185))
art04.save(PD / '04-burgundy-archive.webp', quality=95, method=6)
print("Saved 04")

# 05 Harness Tee (authentic capture from video)
harness_raw = Image.open(BRAIN / 'ref_frame_008.jpg').crop((495, 290, 825, 695)).convert('RGB')
h_arr = np.array(harness_raw, dtype=float)
H, W, _ = h_arr.shape
y_coords = np.linspace(0, 1, H)[:, None, None]
bg_est = np.array([72, 82, 88]) * (1 - y_coords) + np.array([132, 142, 147]) * y_coords
dist = np.linalg.norm(h_arr - bg_est, axis=2)
mask = np.clip((dist - 14.0) / 16.0, 0.0, 1.0)
mask_im = Image.fromarray((mask * 255).astype(np.uint8), mode='L').filter(ImageFilter.GaussianBlur(0.8))
im05 = harness_raw.convert('RGBA')
im05.putalpha(mask_im)
im05 = im05.resize((im05.width * 2, im05.height * 2), Image.Resampling.LANCZOS)
im05 = ImageEnhance.Sharpness(im05).enhance(1.4)
art05 = create_studio_card(im05, bg_tone=(210, 213, 208))
art05.save(PD / '05-harness-tee.webp', quality=95, method=6)
print("Saved 05")

# 07 Halftone Acid Tee (authentic capture from video)
acid_raw = Image.open(BRAIN / 'ref_frame_011.jpg').crop((715, 290, 1055, 750)).convert('RGB')
a_arr = np.array(acid_raw, dtype=float)
H, W, _ = a_arr.shape
y_coords = np.linspace(0, 1, H)[:, None, None]
bg_est = np.array([72, 82, 88]) * (1 - y_coords) + np.array([132, 142, 147]) * y_coords
dist = np.linalg.norm(a_arr - bg_est, axis=2)
mask = np.clip((dist - 14.0) / 16.0, 0.0, 1.0)
mask_im = Image.fromarray((mask * 255).astype(np.uint8), mode='L').filter(ImageFilter.GaussianBlur(0.8))
im07 = acid_raw.convert('RGBA')
im07.putalpha(mask_im)
im07 = im07.resize((im07.width * 2, im07.height * 2), Image.Resampling.LANCZOS)
im07 = ImageEnhance.Sharpness(im07).enhance(1.4)
art07 = create_studio_card(im07, bg_tone=(188, 196, 194))
art07.save(PD / '07-halftone-acid.webp', quality=95, method=6)
print("Saved 07")

# 06 Midnight Flame Hoodie
h_arr = np.array(im01)
h_arr[:, :, :3] = (h_arr[:, :, :3].astype(float) * 0.68).astype(np.uint8)
h_rgba = Image.fromarray(h_arr, 'RGBA')
W_h, H_h = h_rgba.size
flame_overlay = Image.new('RGBA', (W_h, H_h), (0, 0, 0, 0))
fd = ImageDraw.Draw(flame_overlay)
hem_y = int(H_h * 0.88)
flame_color = (195, 202, 208, 225)
flame_inner = (235, 240, 245, 250)
for i in range(16):
    fx = int(W_h * (0.24 + i * 0.034))
    fh = int(H_h * (0.09 + 0.05 * math.sin(i * 1.8)**2))
    pts = [(fx - 18, hem_y), (fx - 10, hem_y - fh * 0.4), (fx + 4, hem_y - fh), (fx + 10, hem_y - fh * 0.45), (fx + 18, hem_y)]
    fd.polygon(pts, fill=flame_color)
    pts_in = [(fx - 8, hem_y), (fx - 3, hem_y - fh * 0.35), (fx + 3, hem_y - fh * 0.8), (fx + 5, hem_y - fh * 0.4), (fx + 8, hem_y)]
    fd.polygon(pts_in, fill=flame_inner)

for side in [0.15, 0.85]:
    cuff_x = int(W_h * side)
    cuff_y = int(H_h * 0.83)
    for j in range(4):
        cx = cuff_x + (j - 1.5) * 16
        fh = int(H_h * (0.05 + 0.03 * math.sin(j * 2.1)**2))
        pts = [(cx - 9, cuff_y), (cx, cuff_y - fh), (cx + 9, cuff_y)]
        fd.polygon(pts, fill=flame_color)

flame_overlay = flame_overlay.filter(ImageFilter.GaussianBlur(0.6))
hoodie_alpha = h_rgba.split()[3]
flame_alpha = Image.fromarray((np.array(flame_overlay.split()[3], dtype=float) * (np.array(hoodie_alpha, dtype=float)/255.0)).astype(np.uint8))
flame_overlay.putalpha(flame_alpha)
im06 = Image.alpha_composite(h_rgba, flame_overlay)
art06 = create_studio_card(im06, bg_tone=(213, 211, 204))
art06.save(PD / '06-flame-hoodie.webp', quality=95, method=6)
print("Saved 06")

# 10 Sage Archive Hoodie
sage_arr = np.array(im01)
s_r = sage_arr[:, :, 0].astype(float) * 0.72 + 35
s_g = sage_arr[:, :, 1].astype(float) * 0.88 + 48
s_b = sage_arr[:, :, 2].astype(float) * 0.72 + 35
sage_arr[:, :, 0] = np.clip(s_r, 0, 255).astype(np.uint8)
sage_arr[:, :, 1] = np.clip(s_g, 0, 255).astype(np.uint8)
sage_arr[:, :, 2] = np.clip(s_b, 0, 255).astype(np.uint8)
sage_rgba = Image.fromarray(sage_arr, 'RGBA')
txt_layer = Image.new('RGBA', sage_rgba.size, (0, 0, 0, 0))
td = ImageDraw.Draw(txt_layer)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
except:
    font = ImageFont.load_default()
for idx, ch in enumerate("LOOPS ARCHIVE"):
    td.text((int(W_h * 0.84), int(H_h * 0.48 + idx * 16)), ch, font=font, fill=(245, 245, 240, 220))
txt_layer.putalpha(Image.fromarray((np.array(txt_layer.split()[3], dtype=float) * (np.array(hoodie_alpha, dtype=float)/255.0)).astype(np.uint8)))
im10 = Image.alpha_composite(sage_rgba, txt_layer)
art10 = create_studio_card(im10, bg_tone=(174, 184, 185))
art10.save(PD / '10-sage-archive.webp', quality=95, method=6)
print("Saved 10")

# 08 Stone Archive Knit
st_arr = np.array(im02)
st_r = st_arr[:, :, 0].astype(float) * 0.82 + 55
st_g = st_arr[:, :, 1].astype(float) * 0.82 + 50
st_b = st_arr[:, :, 2].astype(float) * 0.78 + 40
st_arr[:, :, 0] = np.clip(st_r, 0, 255).astype(np.uint8)
st_arr[:, :, 1] = np.clip(st_g, 0, 255).astype(np.uint8)
st_arr[:, :, 2] = np.clip(st_b, 0, 255).astype(np.uint8)
stone_rgba = Image.fromarray(st_arr, 'RGBA')
seam_layer = Image.new('RGBA', stone_rgba.size, (0, 0, 0, 0))
sd = ImageDraw.Draw(seam_layer)
red_col = (185, 42, 48, 235)
sd.arc((int(W_h * 0.22), int(H_h * 0.26), int(W_h * 0.78), int(H_h * 0.65)), 195, 345, fill=red_col, width=6)
sd.line([(int(W_h * 0.28), int(H_h * 0.35)), (int(W_h * 0.45), int(H_h * 0.78))], fill=red_col, width=5)
sd.line([(int(W_h * 0.72), int(H_h * 0.35)), (int(W_h * 0.55), int(H_h * 0.78))], fill=red_col, width=5)
seam_layer.putalpha(Image.fromarray((np.array(seam_layer.split()[3], dtype=float) * (np.array(stone_rgba.split()[3], dtype=float)/255.0)).astype(np.uint8)))
im08 = Image.alpha_composite(stone_rgba, seam_layer)
art08 = create_studio_card(im08, bg_tone=(210, 213, 208))
art08.save(PD / '08-stone-graphics.webp', quality=95, method=6)
print("Saved 08")

# 09 Essential Blanc Tee
tee_arr = np.array(im07)
for y in range(im07.height):
    for x in range(im07.width):
        if tee_arr[y, x, 3] > 40:
            rel_x = x / im07.width
            gray = (float(tee_arr[y, x, 0]) + float(tee_arr[y, x, 1]) + float(tee_arr[y, x, 2])) / 3.0
            if 0.28 <= rel_x <= 0.72:
                lum = 222 + (gray - 128) * 0.25
                tee_arr[y, x, 0] = int(np.clip(lum + 6, 0, 248))
                tee_arr[y, x, 1] = int(np.clip(lum + 4, 0, 245))
                tee_arr[y, x, 2] = int(np.clip(lum - 2, 0, 238))
            else:
                lum = 175 + (gray - 128) * 0.3
                tee_arr[y, x, 0] = int(np.clip(lum - 25, 0, 255))
                tee_arr[y, x, 1] = int(np.clip(lum - 2, 0, 255))
                tee_arr[y, x, 2] = int(np.clip(lum + 28, 0, 255))
im09 = Image.fromarray(tee_arr, 'RGBA')
art09 = create_studio_card(im09, bg_tone=(188, 196, 194))
art09.save(PD / '09-white-basic.webp', quality=95, method=6)
print("Saved 09")

# 03 Liquid Silver Jacket
jack_arr = np.array(im04)
j_w, j_h = jack_arr.shape[1], jack_arr.shape[0]
for y in range(j_h):
    refl = 20 * math.sin(y * 0.025) + 12 * math.cos(y * 0.08)
    for x in range(j_w):
        if jack_arr[y, x, 3] > 30:
            base_l = (float(jack_arr[y, x, 0]) + float(jack_arr[y, x, 1]) + float(jack_arr[y, x, 2])) / 3.0
            shine = base_l * 0.65 + 115 + refl + 8 * math.sin((x + y) * 0.09)
            jack_arr[y, x, 0] = int(np.clip(shine - 3, 0, 245))
            jack_arr[y, x, 1] = int(np.clip(shine, 0, 248))
            jack_arr[y, x, 2] = int(np.clip(shine + 6, 0, 255))
jack_rgba = Image.fromarray(jack_arr, 'RGBA')
pipe_layer = Image.new('RGBA', jack_rgba.size, (0, 0, 0, 0))
p_draw = ImageDraw.Draw(pipe_layer)
neon_col = (226, 255, 30, 245)
p_draw.line([(int(j_w * 0.32), int(j_h * 0.22)), (int(j_w * 0.46), int(j_h * 0.45)), (int(j_w * 0.44), int(j_h * 0.90))], fill=neon_col, width=8)
p_draw.line([(int(j_w * 0.68), int(j_h * 0.22)), (int(j_w * 0.54), int(j_h * 0.45)), (int(j_w * 0.56), int(j_h * 0.90))], fill=neon_col, width=8)
p_draw.line([(int(j_w * 0.50), int(j_h * 0.20)), (int(j_w * 0.50), int(j_h * 0.92))], fill=(28, 32, 34, 255), width=5)
p_draw.line([(int(j_w * 0.49), int(j_h * 0.30)), (int(j_w * 0.51), int(j_h * 0.34))], fill=(210, 215, 220, 255), width=7)
pipe_layer.putalpha(Image.fromarray((np.array(pipe_layer.split()[3], dtype=float) * (np.array(jack_rgba.split()[3], dtype=float)/255.0)).astype(np.uint8)))
im03 = Image.alpha_composite(jack_rgba, pipe_layer)
art03 = create_studio_card(im03, bg_tone=(213, 211, 204))
art03.save(PD / '03-silver-tech.webp', quality=95, method=6)
print("Saved 03")

print("All 10 updated successfully.")
