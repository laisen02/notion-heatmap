import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function clearBrowserData() {
  try {
    // Clear localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    
    // Clear cache and reload
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
    }
    
    // Reload the page
    window.location.reload()
  } catch (error) {
    console.error('Error clearing browser data:', error)
  }
} 