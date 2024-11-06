import { NamedColor } from './types';

interface HSL {
  h: number;
  s: number;
  l: number;
}

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

// Check if a color is suitable for light mode (not too light)
function isSuitableForLightMode(hex: string): boolean {
  const luminance = getLuminance(hex);
  return luminance < 0.7; // Ensures color is not too light
}

// Check if a color is suitable for dark mode (not too dark)
function isSuitableForDarkMode(hex: string): boolean {
  const luminance = getLuminance(hex);
  return luminance > 0.25 && luminance < 0.8; // Ensures good visibility in dark mode
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
  
  // Sort each group by luminance
  groups.forEach((groupColors, name) => {
    groups.set(name, sortByLuminance(groupColors));
  });
  
  return groups;
}

function getUniqueColors(colors: NamedColor[]): string[] {
  const uniqueColors = new Set<string>();
  
  colors.forEach(color => {
    if (color.value !== '#000000' && color.value !== '#ffffff') {
      uniqueColors.add(color.value);
    }
  });
  
  return Array.from(uniqueColors);
}

// Select colors with good contrast from available shades
function selectContrastingColors(
  colorGroups: Map<string, string[]>, 
  count: number, 
  seed: number,
  isLightMode: boolean
): string[] {
  const selected: string[] = [];
  const groupNames = Array.from(colorGroups.keys());
  
  // Create a deterministic but different shuffle for each seed
  const shuffledGroups = [...groupNames].sort((a, b) => {
    return Math.sin(seed * groupNames.indexOf(a)) - Math.sin(seed * groupNames.indexOf(b));
  });

  // Get all available colors that are suitable for the mode
  const allSuitableColors = Array.from(colorGroups.values())
    .flat()
    .filter(isLightMode ? isSuitableForLightMode : isSuitableForDarkMode);

  // If we don't have enough suitable colors, use all available colors
  if (allSuitableColors.length < count) {
    const allColors = Array.from(colorGroups.values()).flat();
    const sorted = sortByLuminance(allColors);
    // For dark mode, prefer medium-bright colors
    if (!isLightMode) {
      return sorted
        .filter(color => {
          const lum = getLuminance(color);
          return lum > 0.25 && lum < 0.8;
        })
        .slice(0, count);
    }
    return sorted.slice(0, count);
  }

  // Try to select one color from each group first
  for (const groupName of shuffledGroups) {
    if (selected.length >= count) break;
    
    const shades = (colorGroups.get(groupName) || [])
      .filter(isLightMode ? isSuitableForLightMode : isSuitableForDarkMode);
    
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

export function generateAccessiblePalette(colors: NamedColor[], count: number, seed: number = 0): string[] {
  if (colors.length === 0) return [];

  // Group colors by their base name
  const colorGroups = groupColorsByName(colors);
  
  // If we couldn't group by names, fall back to unique colors
  if (colorGroups.size === 0) {
    const uniqueColors = getUniqueColors(colors);
    if (uniqueColors.length === 0) return [];
    
    // If we don't have enough unique colors, cycle through them
    const result: string[] = [];
    while (result.length < count) {
      result.push(uniqueColors[result.length % uniqueColors.length]);
    }
    
    // Use seed to create different arrangements
    return result.sort(() => Math.sin(seed * result.length));
  }
  
  // Select colors with good contrast for light mode
  const lightModeColors = selectContrastingColors(colorGroups, count, seed, true);
  
  // For dark mode, we want to ensure we're using brighter variants
  const darkModeColors = selectContrastingColors(colorGroups, count, seed + 1000, false);
  
  return lightModeColors;
}