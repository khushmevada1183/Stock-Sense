/**
 * Utility function to get the correct path with base path for GitHub Pages
 */
export const getBasePath = (): string => {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
};

/**
 * Utility function to get the correct path for assets
 * @param path The path to the asset
 * @returns The path with the base path prepended
 */
export const getAssetPath = (path: string): string => {
  const basePath = getBasePath();
  
  // If path already starts with the base path or is an external URL, return it as is
  if (path.startsWith('http') || path.startsWith(basePath)) {
    return path;
  }
  
  // Make sure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${basePath}${normalizedPath}`;
}; 