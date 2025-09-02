import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the base path for GitHub Pages
export function getBasePath(): string {
  if (typeof window !== 'undefined') {
    // Check if we're on GitHub Pages
    if (window.location.hostname.includes('github.io')) {
      return '/maplehub';
    }
  }
  return '';
}

// Get asset URL with proper base path
export function getAssetUrl(path: string): string {
  const basePath = getBasePath();
  // Remove leading slash if present and add base path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${basePath}/${cleanPath}`;
}
