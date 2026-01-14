/**
 * EZD Media CDN Helper - TypeScript Version
 */

export const CDN_BASE = 'https://cdn.jsdelivr.net/gh/ezdproduct/media@main';
export const PURGE_BASE = 'https://purge.jsdelivr.net/gh/ezdproduct/media@main';

type ImageSubfolder = 'logos' | 'banners' | 'products' | 'backgrounds' | '';

/**
 * Generate CDN URL for an image
 */
export function getCdnUrl(path: string, version?: string | number): string {
    const baseUrl = `${CDN_BASE}/${path}`;
    return version ? `${baseUrl}?v=${version}` : baseUrl;
}

/**
 * Get image URL from images folder
 */
export function getImageUrl(filename: string, subfolder: ImageSubfolder = ''): string {
    const path = subfolder ? `images/${subfolder}/${filename}` : `images/${filename}`;
    return getCdnUrl(path);
}

/**
 * Get icon URL
 */
export function getIconUrl(filename: string): string {
    return getCdnUrl(`icons/${filename}`);
}

/**
 * Get thumbnail URL
 */
export function getThumbnailUrl(filename: string): string {
    return getCdnUrl(`thumbnails/${filename}`);
}

/**
 * Get avatar URL
 */
export function getAvatarUrl(filename: string): string {
    return getCdnUrl(`avatars/${filename}`);
}

/**
 * Get upload URL
 */
export function getUploadUrl(filename: string): string {
    return getCdnUrl(`uploads/${filename}`);
}

/**
 * Get purge URL (to clear CDN cache)
 */
export function getPurgeUrl(path: string): string {
    return `${PURGE_BASE}/${path}`;
}

/**
 * Preload images for better performance
 */
export function preloadImages(urls: string[]): void {
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

export default {
    getCdnUrl,
    getImageUrl,
    getIconUrl,
    getThumbnailUrl,
    getAvatarUrl,
    getUploadUrl,
    getPurgeUrl,
    preloadImages,
    CDN_BASE,
    PURGE_BASE,
};
