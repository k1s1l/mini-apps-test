// Перетворює ключ зображення з каталогу на URL.
// Ключ «snk-mid» → локальний файл src/assets/products/snk-mid.jpg.
// Повний URL (https://…) повертається без змін — так можна підключити фото
// зі сховища або CDN, коли з'явиться справжній каталог.

const local = import.meta.glob('../assets/products/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const byKey: Record<string, string> = {};
for (const [path, url] of Object.entries(local)) {
  const key = path.split('/').pop()!.replace(/\.(jpe?g|png|webp)$/, '');
  byKey[key] = url;
}

export function imageUrl(keyOrUrl: string | undefined): string | undefined {
  if (!keyOrUrl) return undefined;
  if (/^(https?:|data:|blob:|\/)/.test(keyOrUrl)) return keyOrUrl;
  return byKey[keyOrUrl];
}
