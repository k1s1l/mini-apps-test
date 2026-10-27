"""Готує демо-фото: квадрат 720px, єдиний тон фону, JPEG.
Використання: python3 -I scripts/prepare-images.py <корінь-джерел> <вихідна-тека>
Джерела — відкриті демо-дані e-commerce проєктів (див. src/data/demo/IMAGE_SOURCES.md)."""
import sys, os
from PIL import Image, ImageChops

SRC, OUT = sys.argv[1], sys.argv[2]
B = 'bagisto/packages/Webkul/Installer/src/Resources/assets/images/seeders/products'
TONE = (234, 232, 228)  # теплий світло-сірий для товарів на білому фоні

# key: (path, mode, tint)  mode: contain | cover | top
JOBS = {
  'snk-campus-burgundy': ('pool/product_adidas.jpg', 'cover', False),
  'snk-campus-navy': ('pool/product_adidas_2.jpg', 'cover', False),
  'snk-campus-grey': ('pool/product_adidas_3.jpg', 'cover', False),
  'snk-zoom': ('pool/product_NikeZoom.jpg', 'cover', False),
  'snk-floral-1': ('pool/product_NikeFloralShoe_1.jpg', 'cover', False),
  'snk-floral-2': ('pool/product_NikeFloralShoe_2.jpg', 'cover', False),
  'snk-pace': ('pool/imani-clovis-234736-unsplash.jpg', 'cover', True),
  'snk-night': ('pool/nikolai-chernichenko-1299748-unsplash.jpg', 'cover', True),
  'snk-eqt': ('pool/thomas-serer-420833-unsplash.jpg', 'cover', False),
  'snk-mid': ('pool/xavier-teo-469050-unsplash.jpg', 'cover', False),
  'snk-chuck': ('pool/mitch-lensink-256007-unsplash.jpg', 'cover', False),
  'snk-neon': ('pool/chuttersnap-584518-unsplash.jpg', 'cover', False),
  'snk-minimal-1': (f'{B}/237/1.webp', 'cover', False),
  'snk-minimal-2': (f'{B}/238/1.webp', 'cover', False),
  'tee-black-1': (f'{B}/44/1.webp', 'cover', False),
  'tee-black-2': (f'{B}/44/2.webp', 'cover', False),
  'tee-white': (f'{B}/45/1.webp', 'cover', False),
  'tee-grey': (f'{B}/46/1.webp', 'cover', False),
  'hoodie-1': (f'{B}/89/1.webp', 'cover', False),
  'hoodie-2': (f'{B}/89/2.webp', 'cover', False),
  'hoodie-3': (f'{B}/101/1.webp', 'cover', False),
  'henley-1': (f'{B}/93/1.webp', 'cover', False),
  'henley-2': (f'{B}/93/2.webp', 'cover', False),
  'jeans-grey-1': (f'{B}/97/1.webp', 'cover', False),
  'jeans-grey-2': (f'{B}/97/2.webp', 'cover', False),
  'jacket-1': (f'{B}/269/1.webp', 'cover', False),
  'jacket-2': (f'{B}/274/1.webp', 'cover', False),
  'jacket-3': (f'{B}/268/1.webp', 'cover', False),
  'blazer-1': (f'{B}/60/1.webp', 'cover', False),
  'blazer-2': (f'{B}/60/2.webp', 'cover', False),
  'sport-set-1': (f'{B}/129/1.webp', 'cover', False),
  'sport-set-2': (f'{B}/130/1.webp', 'cover', False),
  'levis-1': ('pool/product_LeviJeans_1.jpg', 'cover', False),
  'levis-2': ('pool/product_LeviJeans_2.jpg', 'cover', False),
  'nike-tee': ('pool/product_NikeShirt.jpg', 'cover', False),
  'watch-mg01': ('pool/mg01-bk-0.jpg', 'contain', True),
  'watch-mg02': ('pool/mg02-bk-0.jpg', 'contain', True),
  'watch-mg03': ('pool/mg03-br-0.jpg', 'contain', True),
  'watch-mg04': ('pool/mg04-bk-0.jpg', 'contain', True),
  'watch-mg05': ('pool/mg05-br-0.jpg', 'contain', True),
  'bag-duffle': ('pool/mb01-blue-0.jpg', 'contain', True),
  'bag-backpack-blue': ('pool/mb02-blue-0.jpg', 'contain', True),
  'bag-backpack-grey': ('pool/mb02-gray-0.jpg', 'contain', True),
  'bag-backpack-black': ('pool/mb03-black-0.jpg', 'contain', True),
  'bag-sling': ('pool/mb04-black-0.jpg', 'contain', True),
  'bag-messenger': ('pool/mb05-black-0.jpg', 'contain', True),
  'bag-canvas': ('pool/mb06-gray-0.jpg', 'contain', True),
  'bag-tote': ('pool/wb07-brown-0.jpg', 'contain', True),
  'belt': ('pool/product_Belt.jpeg', 'cover', True),
  'sunglasses': ('pool/product_Sunglasses.jpg', 'cover', True),
  'cap': ('pool/product_hat.jpg', 'cover', True),
}

def square(im, mode):
    w, h = im.size
    if mode == 'cover':
        s = min(w, h); l = (w - s) // 2; t = (h - s) // 2
        return im.crop((l, t, l + s, t + s))
    # Обрізаємо порожні поля навколо товару, лишаючи рівний відступ
    bgc = im.getpixel((2, 2))
    diff = ImageChops.difference(im, Image.new('RGB', im.size, bgc)).convert('L').point(lambda v: 255 if v > 18 else 0)
    box = diff.getbbox() or (0, 0, w, h)
    im = im.crop(box); w, h = im.size
    s = int(max(w, h) * 1.22)
    bg = Image.new('RGB', (s, s), bgc)
    bg.paste(im, ((s - w) // 2, (s - h) // 2))
    return bg

os.makedirs(OUT, exist_ok=True)
for key, (path, mode, tint) in JOBS.items():
    im = Image.open(os.path.join(SRC, path)).convert('RGB')
    im = square(im, mode).resize((720, 720), Image.LANCZOS)
    if tint:
        im = ImageChops.multiply(im, Image.new('RGB', im.size, TONE))
    im.save(os.path.join(OUT, key + '.jpg'), quality=78, optimize=True, progressive=True)

# Банер: широкий кадр
hero = Image.open(os.path.join(SRC, 'pool/xavier-teo-469050-unsplash.jpg')).convert('RGB')
w, h = hero.size; nh = int(w * 0.75); t = int((h - nh) * 0.55)
hero.crop((0, t, w, t + nh)).resize((1000, 750), Image.LANCZOS).save(os.path.join(OUT, 'hero.jpg'), quality=76, optimize=True, progressive=True)
print('ok', len(JOBS) + 1)
