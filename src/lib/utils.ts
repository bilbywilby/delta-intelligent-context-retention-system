import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/**
 * Mock similarity helper for demonstration
 */
export function mockCosineSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  // Deterministic random-ish score for the demo
  const combined = (text1 + text2).length;
  return (combined % 100) / 100;
}