/**
 * Utility functions with TypeScript
 * Example templates for common helper functions
 */

// Format duration from minutes to human readable string
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

// Format date to display string
export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' 
      ? { month: 'short', day: 'numeric' }
      : { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  
  return date.toLocaleDateString('vi-VN', options);
}

// Type-safe color utilities
export function getAccentColor(accent: 'blue' | 'purple' | 'orange' | 'green'): string {
  const colors = {
    blue: '#2563EB',
    purple: '#7C3AED',
    orange: '#FB923C',
    green: '#22C55E'
  } as const;
  
  return colors[accent];
}

// Debounce function with types
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Clamp number between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
