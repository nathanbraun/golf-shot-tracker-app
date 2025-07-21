import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert feet to yards
 */
export function feetToYards(feet: number): number {
  return Math.round(feet / 3)
}

/**
 * Convert yards to feet
 */
export function yardsToFeet(yards: number): number {
  return Math.round(yards * 3)
}

/**
 * Determine if a distance should be displayed in feet based on shot type or distance
 */
export function shouldDisplayInFeet(distance: number, shotType?: string): boolean {
  // Always show putts in feet
  if (shotType === "Putt") return true
  
  // Show short distances in feet
  if (distance < 30) return true
  
  // Otherwise show in yards
  return false
}

/**
 * Format a distance with the appropriate unit
 * @param distance Distance in feet (internal storage unit)
 * @param shotType Optional shot type to help determine display unit
 * @returns Formatted distance string with appropriate unit
 */
export function formatDistance(distance: number, shotType?: string): string {
  if (shouldDisplayInFeet(distance, shotType)) {
    return `${distance} ft`
  } else {
    return `${feetToYards(distance)} yards`
  }
}
