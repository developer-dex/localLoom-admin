import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names intelligently.
 *
 * This helper is the shadcn/ui `cn` utility (Requirement 2.7): every
 * component in the admin panel MUST use it for conditional class
 * composition so conflicting Tailwind utilities resolve deterministically.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
