import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`         — звичайна збірка для хостингу (dist/).
// `npm run build:single`  — один HTML-файл з усіма фото всередині (dist-single/),
//                           зручно для швидкого перегляду без сервера.
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    plugins: [react(), ...(single ? [viteSingleFile()] : [])],
    server: { host: true, port: 5173 },
    build: single
      ? { outDir: 'dist-single', assetsInlineLimit: 100_000_000, cssCodeSplit: false }
      : { outDir: 'dist' },
  };
});
