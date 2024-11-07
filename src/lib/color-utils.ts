import { NamedColor } from './types';

interface HSL {
  h: number;
  s: number;
  l: number;
}

export type ColorScheme = 'mixed' | 'warm' | 'cool' | 'neutral' | 'monochromatic';

function selectDarkModeColor(color: string, availableColors: NamedColor[]): string {
  const targetHsl = hexToHsl(color);
  const darkHsl = {
    h: targetHsl.h,
    s: targetHsl.s,
    l: Math.max(20, targetHsl.l - 20)
  };

  return availableColors
    .map(c => ({
      color: c.value,
      hsl: hexToHsl(c.value),
      distance: colorDistance(darkHsl, hexToHsl(c.value))
    }))
    .sort((a, b) => a.distance - b.distance)[0]?.color || color;
}

function colorDistance(a: HSL, b: HSL): number {
  const hDiff = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h));
  const sDiff = Math.abs(a.s - b.s);
  const lDiff = Math.abs(a.l - b.l);
  return hDiff + sDiff + lDiff;
}

function selectColorsForScheme(
  availableColors: NamedColor[],
  count: number,
  scheme: ColorScheme,
  seed: number
): string[] {
  const filteredColors = availableColors.filter(color => {
    const hsl = hexToHsl(color.value);
    switch (scheme) {
      case 'warm':
        return (hsl.h >= 0 && hsl.h <= 60) || (hsl.h >= 300 && hsl.h <= 360);
      case 'cool':
        return hsl.h > 60 && hsl.h < 300;
      case 'neutral':
        return hsl.s <= 30;
      case 'monochromatic':
      case 'mixed':
        return true;
      default:
        return true;
    }
  });

  if (filteredColors.length === 0) {
    return Array(count).fill(availableColors[0]?.value || '#000000');
  }

  const selected: string[] = [];
  const getRandom = () => Math.sin(seed + selected.length) * 0.5 + 0.5;

  while (selected.length < count) {
    const index = Math.floor(getRandom() * filteredColors.length);
    const color = filteredColors[index].value;
    if (!selected.includes(color)) {
      selected.push(color);
    }
    seed += 1;
  }

  return selected;
}

function hexToHsl(hex: string): HSL {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

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

function generateNeutralVariation(hsl: HSL, index: number, count: number, getRandom: () => number): string {
  const phase = index / (count - 1);
  const newHsl = {
    h: hsl.h,
    s: Math.max(0, Math.min(30, hsl.s + (getRandom() * 10 - 5))),
    l: Math.max(20, Math.min(80, 30 + phase * 50 + (getRandom() * 10 - 5)))
  };
  return hslToHex(newHsl.h, newHsl.s, newHsl.l);
}

function adjustForMode(color: string, isLight: boolean): string {
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
      Math.max(20, hsl.l - 15)
    );
  }
}

export function generateAccessiblePalette(
  colors: NamedColor[],
  count: number,
  seed: number = 0,
  scheme: ColorScheme = 'mixed',
  strictMode: boolean = false
): { light: string[], dark: string[] } {
  if (colors.length === 0) {
    return {
      light: Array(count).fill('#000000'),
      dark: Array(count).fill('#FFFFFF')
    };
  }

  if (strictMode) {
    const light = selectColorsForScheme(colors, count, scheme, seed);
    const dark = light.map(color => selectDarkModeColor(color, colors));
    return { light, dark };
  }

  const baseColors = selectColorsForScheme(colors, Math.min(count, colors.length), scheme, seed);
  const light: string[] = [];
  const dark: string[] = [];

  if (scheme === 'monochromatic') {
    const baseColor = baseColors[Math.floor(Math.abs(Math.sin(seed)) * baseColors.length)];
    const baseHsl = hexToHsl(baseColor);
    
    for (let i = 0; i < count; i++) {
      const phase = i / (count - 1);
      const lightColor = hslToHex(
        baseHsl.h,
        Math.max(20, Math.min(80, baseHsl.s + (phase * 40 - 20) + (Math.sin(seed + i) * 20 - 10))),
        Math.max(30, Math.min(80, 30 + phase * 50 + (Math.sin(seed + i + Math.PI) * 20 - 10)))
      );
      light.push(lightColor);
      dark.push(adjustForMode(lightColor, false));
    }
  } else {
    for (let i = 0; i < count; i++) {
      const baseColor = baseColors[i % baseColors.length];
      const hsl = hexToHsl(baseColor);
      
      let lightColor: string;
      
      if (scheme === 'neutral') {
        lightColor = generateNeutralVariation(hsl, i, count, () => Math.abs(Math.sin(seed + i)));
      } else {
        lightColor = hslToHex(
          (hsl.h + (i * 30 + Math.sin(seed + i) * 20 - 10)) % 360,
          Math.min(90, hsl.s + (Math.sin(seed + i + Math.PI) * 20 - 10)),
          Math.min(90, Math.max(40, hsl.l + (Math.sin(seed + i + Math.PI * 2) * 20 - 10)))
        );
      }
      
      light.push(lightColor);
      dark.push(adjustForMode(lightColor, false));
    }
  }

  return { light, dark };
}