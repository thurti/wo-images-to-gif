# Images To GIF Converter

Repo for https://worksoffline.app/images-to-gif-converter

## Dev

```bash
npm install
npm run copy-ffmpeg
npm run dev
```

## FFmpeg Update

FFmpeg gets cached on its own. To update ffmpeg copy new files to `public/lib/ffmpeg-st` and set new version number in `.env`. This would udpate the cached version.

## Browser & Server Requirements

Browser must support Shared Array Buffer.
Cross Origin Isolation Headers: https://developer.chrome.com/blog/enabling-shared-array-buffer/#cross-origin-isolation

## Credits

This project was only made possible by the work of wonderful people who publish open source libraries.

- https://github.com/ffmpegwasm/ffmpeg.wasm
- https://svelte.dev/
- https://github.com/ItalyPaleAle/svelte-spa-router
- https://vitejs.dev/
- https://vite-pwa-org.netlify.app/
- https://tailwindcss.com/
- https://lodash.com/
