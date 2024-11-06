import { ColorConfig, NamedColor } from './types';

export function parseCssColors(css: string): ColorConfig {
  const variables = extractCssVariables(css);
  const lightColors = extractAllColors(css, ':root', variables);
  const darkColors = extractAllColors(css, '.dark', variables);

  return {
    light: lightColors,
    dark: darkColors.length > 0 ? darkColors : lightColors,
  };
}

export function parseNamedColors(css: string): NamedColor[] {
  const namedColors: NamedColor[] = [];
  
  // Match CSS variable definitions with HSL values
  const hslRegex = /--([a-zA-Z0-9-]+):\s*(\d+)\s+(\d+)%?\s+(\d+)%/g;
  let match;
  
  while ((match = hslRegex.exec(css)) !== null) {
    const [, name, h, s, l] = match;
    const color = hslToHex(
      parseInt(h, 10),
      parseInt(s, 10),
      parseInt(l, 10)
    );
    namedColors.push({ name, value: color });
  }

  // Match hex values (with or without variable names)
  const hexLines = css
    .split(/[\n,]/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  for (const line of hexLines) {
    // Try to match CSS variable with hex
    const varMatch = line.match(/--([a-zA-Z0-9-]+):\s*(#[A-Fa-f0-9]{6})/);
    if (varMatch) {
      const [, name, color] = varMatch;
      namedColors.push({ name, value: color });
      continue;
    }

    // Try to match plain hex value
    const hexMatch = line.match(/^#?([A-Fa-f0-9]{6})$/);
    if (hexMatch) {
      const hex = hexMatch[1];
      const color = `#${hex}`;
      namedColors.push({ name: hex, value: color });
    }
  }

  return namedColors;
}

function extractCssVariables(css: string): { [key: string]: string } {
  const variables: { [key: string]: string } = {};
  const varRegex = /--[\w-]+:\s*([^;]+);/g;
  let match;

  while ((match = varRegex.exec(css)) !== null) {
    const value = match[1].trim();
    const name = match[0].split(':')[0].trim();
    variables[name] = value;
  }

  return variables;
}

function extractAllColors(css: string, selector: string, variables: { [key: string]: string }): string[] {
  const colors: string[] = [];
  const selectorContent = extractSelectorContent(css, selector);

  if (!selectorContent) {
    const colorVars = parseColorVariables(css);
    return colorVars.length > 0 ? colorVars : colors;
  }

  // Get semantic colors first
  const semanticColors = extractColorsByPattern(
    selectorContent,
    /--(?:primary|secondary|accent|muted|background|foreground|success|warning|error|destructive|creative)(?:-foreground)?:\s*([^;]+);/g,
    variables
  );

  // Then get any other color variables
  const otherColors = extractColorsByPattern(
    selectorContent,
    /--[\w-]+(?:-\d+)?:\s*([^;]+);/g,
    variables
  ).filter(color => !semanticColors.includes(color));

  colors.push(...semanticColors, ...otherColors);
  return colors;
}

function extractColorsByPattern(
  content: string,
  pattern: RegExp,
  variables: { [key: string]: string }
): string[] {
  const colors: string[] = [];
  let match;

  while ((match = pattern.exec(content)) !== null) {
    const value = match[1].trim();
    const resolvedColor = resolveColorValue(value, variables);
    if (resolvedColor && !colors.includes(resolvedColor)) {
      colors.push(resolvedColor);
    }
  }

  return colors;
}

function extractSelectorContent(css: string, selector: string): string | null {
  const selectorRegex = new RegExp(`${selector}\\s*{([^}]*)}`, 'g');
  const match = selectorRegex.exec(css);
  return match ? match[1] : null;
}

function resolveColorValue(value: string, variables: { [key: string]: string }): string | null {
  if (value.startsWith('var(')) {
    const varName = value.slice(4, -1).trim();
    const resolvedValue = variables[varName];
    return resolvedValue ? resolveColorValue(resolvedValue, variables) : null;
  }

  if (value.includes(' ')) {
    const [h, s, l] = value.split(' ').map(v => parseFloat(v));
    if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
      return hslToHex(h, s, l);
    }
  }

  if (value.startsWith('#')) {
    return value;
  }

  return null;
}

function parseColorVariables(css: string): string[] {
  const colors: string[] = [];
  const hslRegex = /--[\w-]+:\s*(\d+)\s+(\d+)%?\s+(\d+)%/g;
  let match;

  while ((match = hslRegex.exec(css)) !== null) {
    const [, h, s, l] = match;
    const color = hslToHex(
      parseInt(h, 10),
      parseInt(s, 10),
      parseInt(l, 10)
    );
    if (!colors.includes(color)) {
      colors.push(color);
    }
  }

  return colors;
}

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