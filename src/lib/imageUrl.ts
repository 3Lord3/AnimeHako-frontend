/**
 * Image URL utilities for YummyAnime API
 * 
 * The API returns image URLs as-is (poster, cover, screenshots).
 * This file provides utilities for image optimization and fallbacks.
 */

export function getImageUrl(url: string | null | undefined, fallback?: string): string {
  // Handle non-string values
  if (!url || typeof url !== 'string') return fallback || '/placeholder-anime.png';
  
  // Handle protocol-relative URLs (//example.com)
  if (url.startsWith('//')) {
    return 'https:' + url;
  }
  
  // If it's already an absolute URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // For relative URLs, return as-is
  return url;
}

export function getPosterUrl(anime: { poster?: string | null; cover?: string | null }): string {
  return getImageUrl(anime.poster || anime.cover, '/placeholder-anime.png');
}

export function getCoverUrl(anime: { cover?: string | null; poster?: string | null }): string {
  return getImageUrl(anime.cover || anime.poster, '/placeholder-anime.png');
}

export function getScreenshotUrl(screenshot: string): string {
  return getImageUrl(screenshot, '/placeholder-screenshot.png');
}

export function buildImageProxyUrl(url: string): string {
  // YummyAnime images should be served directly without proxy
  return url;
}

export function getFallbackPoster(): string {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"%3E%3Crect fill="%23333" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-size="24" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
}