"""绿幕去背: 将AI生成的绿底JPG转为透明PNG, 并裁掉右下角AI水印."""
from PIL import Image
import numpy as np
import os

ASSETS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'assets')
NAMES = ['sticker-cake', 'sticker-cupid', 'sticker-cat-gray', 'sticker-cat-brown', 'sticker-logo']

# 绿幕目标色
GREEN_R, GREEN_G, GREEN_B = 0, 177, 64
# 色差容忍度
TOLERANCE = 100

def green_to_alpha(arr):
    r, g, b = arr[:,:,0].astype(float), arr[:,:,1].astype(float), arr[:,:,2].astype(float)
    dist = np.sqrt((r - GREEN_R)**2 + (g - GREEN_G)**2 + (b - GREEN_B)**2)
    # 完全绿 → alpha 0, 远离绿 → alpha 255
    alpha = np.clip((dist - 60) / 60 * 255, 0, 255).astype(np.uint8)
    return alpha

def auto_trim(rgba):
    alpha = rgba[:,:,3]
    rows = np.any(alpha > 10, axis=1)
    cols = np.any(alpha > 10, axis=0)
    if not rows.any():
        return rgba
    r0, r1 = np.where(rows)[0][[0,-1]]
    c0, c1 = np.where(cols)[0][[0,-1]]
    return rgba[max(0,r0-3):r1+4, max(0,c0-3):c1+4]

def main():
    for name in NAMES:
        jpg_path = os.path.join(ASSETS, f'{name}.jpg')
        if not os.path.exists(jpg_path):
            print(f'  SKIP {name}: no jpg')
            continue
        img = Image.open(jpg_path)
        w, h = img.size
        # 裁掉右下角水印 (底部 6%, 右侧 12%)
        crop = img.crop((0, 0, int(w * 0.88), int(h * 0.94)))
        arr = np.array(crop)
        alpha = green_to_alpha(arr)
        rgba = np.dstack([arr, alpha])
        trimmed = auto_trim(rgba)
        result = Image.fromarray(trimmed, mode='RGBA')
        png_path = os.path.join(ASSETS, f'{name}.png')
        result.save(png_path, 'PNG')
        print(f'  {name}.png: {result.size}')
        # 删除中间jpg
        os.remove(jpg_path)
    print('Done')

if __name__ == '__main__':
    main()
