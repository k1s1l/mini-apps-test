"""Готує фото товару для магазину: квадрат 900px, JPEG ~80%.
Використання: python3 -I scripts/prepare-catalog-photo.py <вхідне-фото> <id-товару>[-N]
Результат: src/assets/catalog/<id>.jpg"""
import os, sys
from PIL import Image, ImageOps

src, key = sys.argv[1], sys.argv[2]
out = os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'catalog', key + '.jpg')
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
w, h = im.size
s = min(w, h)
# Центрований квадрат; для вертикальних фото трохи вище центру, де зазвичай флакон.
left = (w - s) // 2
top = int((h - s) * 0.45)
im = im.crop((left, top, left + s, top + s)).resize((900, 900), Image.LANCZOS)
im.save(out, quality=80, optimize=True, progressive=True)
print(key, f'{os.path.getsize(out) // 1024} KB')
