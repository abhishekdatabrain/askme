/**
 * Canonical site-wide and Open Graph metadata constants for Ask-Me.Live.
 * Uses absolute production URLs so social crawlers never resolve localhost.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://ask-me.live'
).replace(/\/+$/, '');
export const SITE_NAME = 'Ask-Me.Live';
export const DEFAULT_TITLE = 'Ask-Me.Live — Your Question. Their Live. One Place.';
export const DEFAULT_DESCRIPTION =
  "See who's live across platforms, ask the creator directly, and get notified when they answer.";
export const OG_IMAGE_URL = `${SITE_URL}/og-image.jpg`;

export const DEFAULT_OG_IMAGE = {
  url: OG_IMAGE_URL,
  ...(SITE_URL.startsWith('https://') ? { secureUrl: OG_IMAGE_URL } : {}),
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: DEFAULT_TITLE,
};

/**
 * Builds consistent Open Graph and Twitter Card metadata blocks.
 */
export function buildSocialMetadata({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  url = SITE_URL,
  image = DEFAULT_OG_IMAGE,
} = {}) {
  return {
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  };
}

