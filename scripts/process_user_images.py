"""
处理用户提供的4张图片: 去背景转透明PNG.
- 猫x2 + 蛋糕: 纯色浅色背景 → 透明 (亮度+饱和度判断)
- 头像: 棋盘格背景 → 透明 (灰色检测)
"""
from PIL import Image
import numpy as np
import os

ASSETS = r'd:\Projects\lucky-draw\src\assets'

# 用户提供的原图 → 输出透明PNG名
FILES = {
    '445db9eac111c1b2497c2ade9c59284c': 'user-cat-gray',   # 左下灰猫
    '8af5de1ead4a56cc034107a4373ae6bf': 'user-cat-brown',  # 右下棕猫
    '65bc42658396fa78c7e1fe606d8d30be': 'user-cake',        # 蛋糕
    'e6879625378ad54b7e9ab504fe9d915b': 'user-avatar',      # 头像
}

def remove_light_bg(arr):
    """移除浅色背景 (亮度>190, 饱和度<0.12 → 透明), 带羽化."""
    r, g, b = arr[:,:,0].astype(float), arr[:,:,1].astype(float), arr[:,:,2].astype(float)
    brightness = (r + g + b) / 3.0
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    sat = np.where(max_c > 0, (max_c - min_c) / max_c, 0)

    alpha = np.ones(arr.shape[:2], dtype=np.float32) * 255
    # 纯白/浅色 → 透明
    is_bg = (brightness > 190) & (sat < 0.12)
    alpha[is_bg] = 0
    # 羽化
    soft = (~is_bg) & (brightness > 175) & (sat < 0.12)
    alpha[soft] = np.clip(np.interp(brightness[soft], [175, 190], [0, 255]), 0, 255)
    return alpha.astype(np.uint8)

def remove_checkerboard(arr):
    """移除棋盘格背景: 检测灰色像素 (R≈G≈B, 亮度 140-245) → 透明."""
    r, g, b = arr[:,:,0].astype(float), arr[:,:,1].astype(float), arr[:,:,2].astype(float)
    brightness = (r + g + b) / 3.0
    # 灰色判断: 三通道差异小
    channel_diff = np.maximum(np.maximum(np.abs(r-g), np.abs(g-b)), np.abs(r-b))
    is_gray = channel_diff < 12
    # 棋盘格亮度范围
    is_checker = is_gray & (brightness > 130) & (brightness < 250)

    alpha = np.ones(arr.shape[:2], dtype=np.float32) * 255
    alpha[is_checker] = 0
    # 羽化: 灰色边缘
    soft_gray = is_gray & (brightness > 120) & (brightness < 250) & (~is_checker)
    alpha[soft_gray] = np.clip(np.interp(brightness[soft_gray], [120, 135], [0, 255]), 0, 255)
    return alpha.astype(np.uint8)

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
    for src_hash, out_name in FILES.items():
        jpg_path = os.path.join(ASSETS, f'{src_hash}.jpg')
        if not os.path.exists(jpg_path):
            print(f'  SKIP {out_name}: {src_hash}.jpg not found')
            continue

        img = Image.open(jpg_path)
        arr = np.array(img)

        # 裁掉右下角AI水印 (如果有)
        w, h = img.size
        if w > 500:  # 大图才裁
            arr = arr[:int(h*0.96), :int(w*0.94)]

        # 选择去背景方法
        if out_name == 'user-avatar':
            alpha = remove_checkerboard(arr)
        else:
            alpha = remove_light_bg(arr)

        rgba = np.dstack([arr, alpha])
        trimmed = auto_trim(rgba)
        result = Image.fromarray(trimmed, mode='RGBA')

        png_path = os.path.join(ASSETS, f'{out_name}.png')
        result.save(png_path, 'PNG')
        print(f'  {out_name}.png: {result.size}')

    print('Done')

if __name__ == '__main__':
    main()
