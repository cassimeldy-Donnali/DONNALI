import { useEffect } from 'react';

interface MetaTagsOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const DEFAULT_TITLE = 'DONNALI - Envoi de bagages entre voyageurs';
const DEFAULT_DESC = 'Plateforme de mise en relation pour le transport de bagages entre La Reunion, Mayotte et Paris.';
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=1200';
const SITE_URL = 'https://donnali.fr';

function setMeta(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"], meta[name="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    if (property.startsWith('og:') || property.startsWith('twitter:')) {
      el.setAttribute('property', property);
    } else {
      el.setAttribute('name', property);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useMetaTags(options: MetaTagsOptions) {
  useEffect(() => {
    const title = options.title ? `${options.title} | DONNALI` : DEFAULT_TITLE;
    const description = options.description ?? DEFAULT_DESC;
    const image = options.image ?? DEFAULT_IMAGE;
    const url = options.url ?? SITE_URL;

    document.title = title;

    setMeta('description', description);

    setMeta('og:title', title);
    setMeta('og:description', description);
    setMeta('og:image', image);
    setMeta('og:url', url);
    setMeta('og:type', options.type ?? 'website');
    setMeta('og:site_name', 'DONNALI');

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('description', DEFAULT_DESC);
      setMeta('og:title', DEFAULT_TITLE);
      setMeta('og:description', DEFAULT_DESC);
      setMeta('og:image', DEFAULT_IMAGE);
      setMeta('og:url', SITE_URL);
      setMeta('og:type', 'website');
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', DEFAULT_TITLE);
      setMeta('twitter:description', DEFAULT_DESC);
      setMeta('twitter:image', DEFAULT_IMAGE);
    };
  }, [options.title, options.description, options.image, options.url, options.type]);
}
