import { NamedColor } from './types';

interface HSL {
  h: number;
  s: number;
  l: number;
}

export type ColorScheme = 'mixed' | 'warm' | 'cool' | 'neutral' | 'monochromatic';

function hexToHsl(hex: string): HSL {
  // Normalize hex format
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // Convert to RGB
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

function hslToHex(h: number, s: number, l: number): string {
  h = h % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`.toUpperCase();
}

function generateBaseColors(scheme: ColorScheme, count: number, seed: number): string[] {
  const colors: string[] = [];
  const baseHue = Math.abs((seed * 137.508) % 360);
  const seedOffset = Math.sin(seed * Math.PI * 2);
  const variance = Math.abs(Math.cos(seed));

  switch (scheme) {
    case 'warm': {
      for (let i = 0; i < count; i++) {
        const phase = i / count;
        const hue = phase < 0.5
          ? (baseHue + i * 30 + seedOffset * 40) % 60
          : 300 + ((i * 30 + seedOffset * 40) % 60);
        const sat = 65 + variance * 20;
        const light = 45 + (phase * variance * 20);
        colors.push(hslToHex(hue, sat, light));
      }
      break;
    }
    case 'cool': {
      const hueStep = 120 / Math.max(1, count - 1);
      for (let i = 0; i < count; i++) {
        const phase = i / count;
        const hue = 180 + (i * hueStep + seedOffset * 40);
        const sat = 60 + variance * 20;
        const light = 45 + (phase * variance * 20);
        colors.push(hslToHex(hue, sat, light));
      }
      break;
    }
    case 'neutral': {
      const hueStep = 360 / count;
      for (let i = 0; i < count; i++) {
        const phase = i / count;
        const hue = (baseHue + i * hueStep + seedOffset * 40) % 360;
        const sat = 15 + variance * 15;
        const light = 55 + (phase * variance * 20);
        colors.push(hslToHex(hue, sat, light));
      }
      break;
    }
    case 'monochromatic': {
      const hue = (baseHue + seedOffset * 60) % 360;
      for (let i = 0; i < count; i++) {
        const phase = i / count;
        const sat = 45 + (phase * 30) + (variance * 20);
        const light = 35 + (phase * 30) + (variance * 15);
        colors.push(hslToHex(hue, sat, light));
      }
      break;
    }
    default: { // mixed
      const hueStep = 360 / count;
      for (let i = 0; i < count; i++) {
        const phase = i / count;
        const hue = (baseHue + i * hueStep + seedOffset * 60) % 360;
        const sat = 65 + variance * 20;
        const light = 45 + (phase * variance * 20);
        colors.push(hslToHex(hue, sat, light));
      }
      break;
    }
  }

  return colors;
}

function getLuminance(hex: string): number {
  const rgb = hex.replace(/^#/, '').match(/.{2}/g)!
    .map(x => parseInt(x, 16) / 255)
    .map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
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
      return true;
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

function adjustColorForMode(color: string, isLight: boolean): string {
  const hsl = hexToHsl(color);
  if (isLight) {
    return hslToHex(
      hsl.h,
      Math.min(100, hsl.s + 5),
      Math.min(100, hsl.l + 5)
    );
  } else {
    return hslToHex(
      hsl.h,
      Math.min(100, hsl.s + 10),
      Math.max(0, hsl.l - 10)
    );
  }
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

  if (scheme === 'monochromatic') {
    const baseColor = suitableColors[Math.floor(Math.abs(Math.sin(seed * Math.PI)) * suitableColors.length)];
    const baseHsl = hexToHsl(baseColor);
    
    const variations: string[] = [];
    for (let i = 0; i < count; i++) {
      const phase = i / (count - 1);
      const saturation = Math.min(100, baseHsl.s + (phase - 0.5) * 40 + Math.sin(seed) * 20);
      const lightness = Math.min(100, baseHsl.l + (phase - 0.5) * 30 + Math.cos(seed) * 15);
      variations.push(hslToHex(baseHsl.h, saturation, lightness));
    }
    
    return variations;
  }

  // Generate new colors if we don't have enough suitable ones
  if (suitableColors.length < count) {
    const newColors = generateBaseColors(scheme, count, seed + Math.random());
    suitableColors = [...suitableColors, ...newColors];
  }

  // Sort by luminance and select colors with good distribution
  const sorted = sortByLuminance(suitableColors);
  const selected: string[] = [];
  
  // Select colors with good distribution
  for (let i = 0; i < count; i++) {
    const phase = i / (count - 1);
    const index = Math.floor(phase * (sorted.length - 1) + (Math.sin(seed + i) * 0.2 * sorted.length));
    selected.push(sorted[Math.max(0, Math.min(sorted.length - 1, index))]);
  }

  return selected;
}

export function generateAccessiblePalette(
  colors: NamedColor[],
  count: number,
  seed: number = 0,
  scheme: ColorScheme = 'mixed'
): { light: string[], dark: string[] } {
  const uniqueColors = Array.from(new Set(colors.map(c => c.value)))
    .filter(color => color !== '#000000' && color !== '#ffffff');

  if (uniqueColors.length === 0) {
    const baseColors = generateBaseColors(scheme, count, seed);
    return {
      light: baseColors.map(color => adjustColorForMode(color, true)),
      dark: baseColors.map(color => adjustColorForMode(color, false))
    };
  }

  const light = selectColorsForScheme(uniqueColors, count, scheme, seed, true);
  const dark = selectColorsForScheme(uniqueColors, count, scheme, seed + Math.PI, false);

  return {
    light: light.map(color => adjustColorForMode(color, true)),
    dark: dark.map(color => adjustColorForMode(color, false))
  };
}