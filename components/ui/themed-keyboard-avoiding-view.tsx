import { KeyboardAvoidingView, type KeyboardAvoidingViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedKeyboardAvoidingViewProps = KeyboardAvoidingViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedKeyboardAvoidingView({ style, lightColor, darkColor, ...otherProps }: ThemedKeyboardAvoidingViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <KeyboardAvoidingView style={[{ backgroundColor }, style]} {...otherProps} />;
}
