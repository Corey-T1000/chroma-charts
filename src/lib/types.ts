export interface ColorConfig {
  light: string[];
  dark: string[];
  names?: { [key: string]: string };
  sets?: ColorSet[];
  defaultSetName?: string;
  strictMode?: boolean;
}

export interface NamedColor {
  name: string;
  value: string;
}

export interface ColorSet {
  id: string;
  name: string;
  size: number;
  light: string[];
  dark: string[];
}