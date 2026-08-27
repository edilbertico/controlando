export type ThemeColors = {
  bg: string;
  panel: string;
  line: string;
  text: string;
  muted: string;
  blue: string;
  blue2: string;
  sky: string;
  sky2: string;
  yellow: string;
  yellow2: string;
  yellow3: string;
  red: string;
  green: string;
};

const base: ThemeColors = {
  bg: '#f0f5fb',
  panel: '#ffffff',
  line: '#dbe6f2',
  text: '#14315c',
  muted: '#5b7290',
  blue: '#14315c',
  blue2: '#1b4f9c',
  sky: '#3f8fd2',
  sky2: '#7db8e8',
  yellow: '#ffc93c',
  yellow2: '#f7a600',
  yellow3: '#a87300',
  red: '#d64550',
  green: '#1f9d55',
};

// Tema de alto contraste para situaciones de crisis / usuarios mayores
const hc: ThemeColors = {
  bg: '#000000',
  panel: '#0a0a0a',
  line: '#ffffff',
  text: '#ffffff',
  muted: '#ffe600',
  blue: '#ffffff',
  blue2: '#7db8e8',
  sky: '#7db8e8',
  sky2: '#7db8e8',
  yellow: '#ffe600',
  yellow2: '#ffb200',
  yellow3: '#ffe600',
  red: '#ff3b3b',
  green: '#37ff8b',
};

export const getTheme = (highContrast: boolean): ThemeColors => (highContrast ? hc : base);

export const pillColors: Record<string, string> = {
  green: '#1f9d55',
  yellow: '#a87300',
  red: '#d64550',
  blue: '#1b4f9c',
};

export const pillBg: Record<string, string> = {
  green: '#e8f7ee',
  yellow: '#fff6dd',
  red: '#fdecec',
  blue: '#e8f2fb',
};

export const pillBgHC: Record<string, string> = {
  green: '#003a1c',
  yellow: '#3a2c00',
  red: '#3a0008',
  blue: '#06203f',
};
