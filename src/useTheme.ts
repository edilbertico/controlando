import { useApp } from './context';
import { getTheme, ThemeColors } from './theme';

export const useTheme = (): ThemeColors => {
  const { state } = useApp();
  return getTheme(state.highContrast);
};
