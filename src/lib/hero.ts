import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

/** Responsive AVIF/WebP sources for an LCP hero image; used for both the <picture> and the preload. */
export async function heroSources(src: ImageMetadata) {
  const widths = [640, 960, 1280];
  const sizes = '100vw';
  const avif = await getImage({ src, widths, sizes, format: 'avif', quality: 55 });
  const webp = await getImage({ src, widths, sizes, format: 'webp', quality: 65 });
  return {
    sizes,
    avifSrcset: avif.srcSet.attribute,
    webpSrcset: webp.srcSet.attribute,
    fallback: webp.src,
    width: src.width,
    height: src.height,
  };
}
