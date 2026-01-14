/**
 * EZD Media CDN Helper
 * Utility functions for generating jsDelivr CDN URLs
 */

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/ezdproduct/media@main';
const PURGE_BASE = 'https://purge.jsdelivr.net/gh/ezdproduct/media@main';

/**
 * Generate CDN URL for an image
 * @param {string} path - Path to the image (e.g., "images/logo.png")
 * @param {string|number} version - Optional version for cache busting
 * @returns {string} Full CDN URL
 */
export function getCdnUrl(path, version) {
    const baseUrl = `${CDN_BASE}/${path}`;
    return version ? `${baseUrl}?v=${version}` : baseUrl;
}

/**
 * Get image URL from images folder
 * @param {string} filename - Image filename
 * @param {string} subfolder - Optional subfolder (logos, banners, products, backgrounds)
 */
export function getImageUrl(filename, subfolder = '') {
    const path = subfolder ? `images/${subfolder}/${filename}` : `images/${filename}`;
    return getCdnUrl(path);
}

/**
 * Get icon URL
 * @param {string} filename - Icon filename
 */
export function getIconUrl(filename) {
    return getCdnUrl(`icons/${filename}`);
}

/**
 * Get thumbnail URL
 * @param {string} filename - Thumbnail filename
 */
export function getThumbnailUrl(filename) {
    return getCdnUrl(`thumbnails/${filename}`);
}

/**
 * Get avatar URL
 * @param {string} filename - Avatar filename
 */
export function getAvatarUrl(filename) {
    return getCdnUrl(`avatars/${filename}`);
}

/**
 * Get upload URL
 * @param {string} filename - Uploaded file name
 */
export function getUploadUrl(filename) {
    return getCdnUrl(`uploads/${filename}`);
}

/**
 * Get purge URL (to clear CDN cache)
 * @param {string} path - Path to the file
 */
export function getPurgeUrl(path) {
    return `${PURGE_BASE}/${path}`;
}

/**
 * Preload images for better performance
 * @param {string[]} urls - Array of image URLs to preload
 */
export function preloadImages(urls) {
    urls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Export constants for direct use
export { CDN_BASE, PURGE_BASE };

// Default export for CommonJS compatibility
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
