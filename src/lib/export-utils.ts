import { ColorConfig } from './types';

function getColorName(color: string, names?: { [key: string]: string }): string | undefined {
  return names?.[color];
}

function generateCssForSet(colors: { light: string[], dark: string[] }, names?: { [key: string]: string }): string {
  const generateColorBlock = (colors: string[], names?: { [key: string]: string }) => {
    return colors
      .map((color) => {
        const name = getColorName(color, names);
        const comment = name ? ` /* ${name} */` : '';
        return `  ${name ? `--${name}` : `--chart-${colors.indexOf(color) + 1}`}: ${color};${comment}`;
      })
      .join('\n');
  };

  const lightMode = generateColorBlock(colors.light, names);
  const darkMode = generateColorBlock(colors.dark, names);

  return `:root {\n${lightMode}\n}\n\n.dark {\n${darkMode}\n}`;
}

function generateAllSetsCss(config: ColorConfig): string {
  const defaultSetCss = generateCssForSet(
    { light: config.light, dark: config.dark },
    config.names
  );

  let css = `/* ${config.defaultSetName || 'Default Set'} */\n${defaultSetCss}\n`;

  if (config.sets?.length) {
    css += '\n/* Custom Sets */\n';
    config.sets.forEach((set) => {
      css += `\n/* ${set.name} */\n`;
      css += generateCssForSet({ light: set.light, dark: set.dark }, config.names);
      css += '\n';
    });
  }

  return css;
}

export function exportConfig(
  colors: ColorConfig,
  exportType: 'current' | 'all' = 'current',
  activeSetId?: string | null
) {
  let css: string;
  let filename: string;

  if (exportType === 'all') {
    css = generateAllSetsCss(colors);
    filename = 'all-chart-colors.css';
  } else {
    if (activeSetId) {
      const currentSet = colors.sets?.find((set) => set.id === activeSetId);
      if (currentSet) {
        css = generateCssForSet(
          { light: currentSet.light, dark: currentSet.dark },
          colors.names
        );
        filename = `${currentSet.name.toLowerCase().replace(/\s+/g, '-')}-colors.css`;
      } else {
        css = generateCssForSet(colors, colors.names);
        filename = 'chart-colors.css';
      }
    } else {
      css = generateCssForSet(colors, colors.names);
      filename = 'chart-colors.css';
    }
  }

  const blob = new Blob([css], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}