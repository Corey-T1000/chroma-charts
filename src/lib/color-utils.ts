import { NamedColor } from './types';

interface HSL {
  h: number;
  s: number;
  l: number;
}

export type ColorScheme = 'mixed' | 'warm' | 'cool' | 'neutral' | 'monochromatic';

function hexToHsl(hex: string): HSL {
  hex = hex.replace(/^#/, '');

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function getLuminance(hex: string): number {
  const rgb = hex.replace(/^#/, '').match(/.{2}/g)!
    .map(x => parseInt(x, 16) / 255)
    .map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function isColorInScheme(hex: string, scheme: ColorScheme): boolean {
  const hsl = hexToHsl(hex);
  
  switch (scheme) {
    case 'warm':
      return (hsl.h >= 0 && hsl.h <= 60) || (hsl.h >= 300 && hsl.h <= 360);
    case 'cool':
      return hsl.h > 60 && hsl.h < 300;
    case 'neutral':
      return hsl.s <= 30;
    case 'monochromatic':
      return true; // Will be handled in color selection
    case 'mixed':
      return true;
    default:
      return true;
  }
}

function isSuitableForMode(hex: string, isLight: boolean): boolean {
  const luminance = getLuminance(hex);
  return isLight ? luminance < 0.7 : luminance > 0.25 && luminance < 0.8;
}

function sortByLuminance(colors: string[]): string[] {
  return [...colors].sort((a, b) => getLuminance(a) - getLuminance(b));
}

function selectColorsForScheme(
  availableColors: string[],
  count: number,
  scheme: ColorScheme,
  seed: number,
  isLight: boolean
): string[] {
  let suitableColors = availableColors
    .filter(color => isColorInScheme(color, scheme))
    .filter(color => isSuitableForMode(color, isLight));

  if (scheme === 'monochromatic' && suitableColors.length > 0) {
    const baseColor = suitableColors[Math.floor(Math.random() * suitableColors.length)];
    const baseHsl = hexToHsl(baseColor);
    suitableColors = suitableColors.filter(color => {
      const hsl = hexToHsl(color);
      return Math.abs(hsl.h - baseHsl.h) <= 30;
    });
  }

  if (suitableColors.length < count) {
    suitableColors = availableColors.filter(color => isSuitableForMode(color, isLight));
  }

  const selected: string[] = [];
  const sorted = sortByLuminance(suitableColors);

  while (selected.length < count && sorted.length > 0) {
    const index = Math.floor((Math.sin(seed * selected.length) + 1) * sorted.length / 2);
    selected.push(sorted.splice(index, 1)[0]);
  }

  return selected;
}

export function generateAccessiblePalette(
  colors: NamedColor[],
  count: number,
  seed: number = 0,
  scheme: ColorScheme = 'mixed'
): { light: string[], dark: string[] } {
  if (colors.length === 0) return { light: [], dark: [] };

  const uniqueColors = Array.from(new Set(colors.map(c => c.value)))
    .filter(color => color !== '#000000' && color !== '#ffffff');

  if (uniqueColors.length === 0) return { light: [], dark: [] };

  const light = selectColorsForScheme(uniqueColors, count, scheme, seed, true);
  const dark = selectColorsForScheme(uniqueColors, count, scheme, seed, false);

  return {
    light: light.length === count ? light : uniqueColors.slice(0, count),
    dark: dark.length === count ? dark : uniqueColors.slice(0, count).reverse(),
  };
}