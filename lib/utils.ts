import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  if (value === null || value === undefined) {
    return "0"
  }
  return new Intl.NumberFormat("en-US").format(value)
}
