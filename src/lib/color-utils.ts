import { ColorConfig, NamedColor } from './types';

interface HSL {
  h: number;
  s: number;
  l: number;
}

export type ColorScheme = 'warm' | 'cool' | 'neutral' | 'monochromatic' | 'mixed';

// Convert hex to HSL
export function hexToHsl(hex: string): HSL {
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

// Convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

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

  return `#${rHex}${gHex}${bHex}`;
}

// Calculate relative luminance for WCAG contrast ratio
function getLuminance(hex: string): number {
  const rgb = hex.replace(/^#/, '').match(/.{2}/g)!
    .map(x => parseInt(x, 16) / 255)
    .map(x => x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4));
  
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

// Calculate contrast ratio between two colors
function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Extract color name prefix (e.g., "blue" from "blue-500")
function getColorNamePrefix(name: string): string {
  return name.split('-')[0].toLowerCase();
}

// Sort colors by luminance
function sortByLuminance(colors: string[]): string[] {
  return [...colors].sort((a, b) => getLuminance(a) - getLuminance(b));
}

// Create a dark mode variant while preserving hue
function createDarkModeVariant(color: string): string {
  const hsl = hexToHsl(color);
  return hslToHex(
    hsl.h,
    Math.min(hsl.s + 10, 100), // Slightly increase saturation
    Math.max(30, Math.min(60, 100 - hsl.l)) // Adjust lightness for dark mode
  );
}

// Check if a color is suitable for light mode (not too light)
function isSuitableForLightMode(hex: string): boolean {
  const luminance = getLuminance(hex);
  return luminance < 0.7;
}

// Generate a color with specific hue range
function generateColorInRange(hueRange: [number, number], s: number, l: number): string {
  const hue = Math.floor(Math.random() * (hueRange[1] - hueRange[0])) + hueRange[0];
  return hslToHex(hue, s, l);
}

// Group colors by their base name and sort by luminance
function groupColorsByName(colors: NamedColor[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  
  colors.forEach(color => {
    if (!color.name) return;
    
    const prefix = getColorNamePrefix(color.name);
    if (!prefix) return;
    
    if (!groups.has(prefix)) {
      groups.set(prefix, []);
    }
    groups.get(prefix)?.push(color.value);
  });
  
  groups.forEach((groupColors, name) => {
    groups.set(name, sortByLuminance(groupColors));
  });
  
  return groups;
}

// Get unique colors from the set
function getUniqueColors(colors: NamedColor[]): string[] {
  const uniqueColors = new Set<string>();
  
  colors.forEach(color => {
    if (color.value !== '#000000' && color.value !== '#ffffff') {
      uniqueColors.add(color.value);
    }
  });
  
  return Array.from(uniqueColors);
}

// Generate colors based on scheme and imported colors
function generateSchemeColors(
  count: number, 
  scheme: ColorScheme, 
  importedColors: string[] = []
): { light: string[], dark: string[] } {
  const lightColors: string[] = [];
  const darkColors: string[] = [];
  
  // If we have imported colors, use their hues as a base
  const baseHues = importedColors.map(color => hexToHsl(color).h);
  const baseHue = baseHues.length > 0 
    ? baseHues[Math.floor(Math.random() * baseHues.length)]
    : Math.floor(Math.random() * 360);

  switch (scheme) {
    case 'warm': {
      // Warm colors: reds, oranges, yellows (0-60)
      const warmImported = importedColors.filter(color => {
        const hue = hexToHsl(color).h;
        return hue >= 0 && hue <= 60;
      });
      
      for (let i = 0; i < count; i++) {
        const light = warmImported[i] || generateColorInRange([0, 60], 65 + Math.random() * 20, 45 + Math.random() * 15);
        lightColors.push(light);
        darkColors.push(createDarkModeVariant(light));
      }
      break;
    }

    case 'cool': {
      // Cool colors: blues, greens, purples (180-300)
      const coolImported = importedColors.filter(color => {
        const hue = hexToHsl(color).h;
        return hue >= 180 && hue <= 300;
      });
      
      for (let i = 0; i < count; i++) {
        const light = coolImported[i] || generateColorInRange([180, 300], 60 + Math.random() * 20, 45 + Math.random() * 15);
        lightColors.push(light);
        darkColors.push(createDarkModeVariant(light));
      }
      break;
    }

    case 'neutral': {
      // Neutral colors: low saturation across all hues
      const neutralImported = importedColors.filter(color => {
        const { s } = hexToHsl(color);
        return s <= 30;
      });
      
      for (let i = 0; i < count; i++) {
        const light = neutralImported[i] || generateColorInRange([0, 360], 15 + Math.random() * 15, 40 + Math.random() * 20);
        lightColors.push(light);
        darkColors.push(createDarkModeVariant(light));
      }
      break;
    }

    case 'monochromatic': {
      // Use imported color's hue if available, otherwise use random hue
      const hue = importedColors.length > 0 ? hexToHsl(importedColors[0]).h : baseHue;
      
      for (let i = 0; i < count; i++) {
        const saturation = 40 + Math.floor((i / count) * 40);
        const lightness = 35 + Math.floor((i / count) * 25);
        const light = hslToHex(hue, saturation, lightness);
        lightColors.push(light);
        darkColors.push(createDarkModeVariant(light));
      }
      break;
    }

    default: { // 'mixed'
      // Use imported colors first, then generate additional ones if needed
      const step = 360 / count;
      
      for (let i = 0; i < count; i++) {
        if (i < importedColors.length) {
          lightColors.push(importedColors[i]);
          darkColors.push(createDarkModeVariant(importedColors[i]));
        } else {
          const hue = (baseHue + i * step) % 360;
          const light = hslToHex(hue, 65 + Math.random() * 20, 45 + Math.random() * 15);
          lightColors.push(light);
          darkColors.push(createDarkModeVariant(light));
        }
      }
    }
  }

  return { light: lightColors, dark: darkColors };
}

// Select colors with good contrast
function selectContrastingColors(
  colorGroups: Map<string, string[]>, 
  count: number,
  seed: number
): string[] {
  const selected: string[] = [];
  const groupNames = Array.from(colorGroups.keys());
  
  // Create a deterministic but different shuffle for each seed
  const shuffledGroups = [...groupNames].sort((a, b) => {
    return Math.sin(seed * groupNames.indexOf(a)) - Math.sin(seed * groupNames.indexOf(b));
  });

  // Get all available colors that are suitable for light mode
  const allSuitableColors = Array.from(colorGroups.values())
    .flat()
    .filter(isSuitableForLightMode);

  // If we don't have enough suitable colors, use all available colors
  if (allSuitableColors.length < count) {
    return sortByLuminance(allSuitableColors).slice(0, count);
  }

  // Try to select one color from each group first
  for (const groupName of shuffledGroups) {
    if (selected.length >= count) break;
    
    const shades = (colorGroups.get(groupName) || [])
      .filter(isSuitableForLightMode);
    
    if (shades.length === 0) continue;
    
    const shadeLuminances = shades.map(shade => ({
      shade,
      luminance: getLuminance(shade)
    }));
    
    // Find a shade with good contrast against already selected colors
    let bestShade = shades[Math.floor(shades.length / 2)];
    let bestScore = -1;
    
    for (const { shade, luminance } of shadeLuminances) {
      let minContrast = selected.length === 0 ? 1 : 21;
      
      for (const selectedColor of selected) {
        const selectedLuminance = getLuminance(selectedColor);
        const contrast = getContrastRatio(luminance, selectedLuminance);
        minContrast = Math.min(minContrast, contrast);
      }
      
      // Use seed to add some controlled randomness to selection
      const randomFactor = Math.sin(seed * shades.indexOf(shade));
      const score = minContrast * (1 + randomFactor * 0.2);
      
      if (score > bestScore) {
        bestScore = score;
        bestShade = shade;
      }
    }
    
    selected.push(bestShade);
  }

  // If we still need more colors, add more shades from groups
  while (selected.length < count) {
    const remainingShades = allSuitableColors.filter(shade => !selected.includes(shade));
    
    if (remainingShades.length === 0) {
      // If we run out of suitable shades, cycle through the groups again
      const usedGroups = new Set(selected);
      const availableColors = allSuitableColors.filter(color => !usedGroups.has(color));
      
      if (availableColors.length === 0) {
        // If we've used all colors, start reusing them with slight variations in order
        const reusableColors = allSuitableColors;
        const nextColor = reusableColors[selected.length % reusableColors.length];
        selected.push(nextColor);
      } else {
        // Use a color from the unused ones
        const nextColor = availableColors[Math.floor(Math.sin(seed * selected.length) * availableColors.length)];
        selected.push(nextColor);
      }
    } else {
      // Find the next best color with good contrast
      let bestShade = remainingShades[0];
      let bestScore = -1;
      
      for (const shade of remainingShades) {
        const shadeLuminance = getLuminance(shade);
        let minContrast = 21;
        
        for (const selectedColor of selected) {
          const selectedLuminance = getLuminance(selectedColor);
          const contrast = getContrastRatio(shadeLuminance, selectedLuminance);
          minContrast = Math.min(minContrast, contrast);
        }
        
        const randomFactor = Math.sin(seed * remainingShades.indexOf(shade));
        const score = minContrast * (1 + randomFactor * 0.2);
        
        if (score > bestScore) {
          bestScore = score;
          bestShade = shade;
        }
      }
      
      selected.push(bestShade);
    }
  }
  
  return selected;
}

export function generateAccessiblePalette(
  colors: NamedColor[], 
  count: number,
  seed: number = 0,
  scheme: ColorScheme = 'mixed'
): { light: string[], dark: string[] } {
  // Extract all unique colors from the imported set
  const importedColors = getUniqueColors(colors);
  
  // Generate new colors based on the scheme, using imported colors as reference
  const generated = generateSchemeColors(count, scheme, importedColors);
  
  // If we have imported colors, try to maintain their relationships
  if (colors.length > 0) {
    const colorGroups = groupColorsByName(colors);
    if (colorGroups.size > 0) {
      const selectedLight = selectContrastingColors(colorGroups, count, seed);
      const selectedDark = selectedLight.map(createDarkModeVariant);
      return { light: selectedLight, dark: selectedDark };
    }
  }
  
  return generated;
}