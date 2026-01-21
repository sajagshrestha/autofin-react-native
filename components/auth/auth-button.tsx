import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";

interface AuthButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  loadingText?: string;
}

export function AuthButton({
  title,
  loading = false,
  loadingText,
  style,
  disabled,
  ...props
}: AuthButtonProps) {
  const colorScheme = useColorScheme();

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: Colors[colorScheme ?? "light"].tint,
          opacity: loading || disabled ? 0.6 : 1
        },
        style
      ]}
      disabled={loading || disabled}
      {...props}>
      <ThemedText
        style={[
          styles.buttonText,
          {
            color: colorScheme === "dark" ? Colors.light.text : Colors.dark.text
          }
        ]}>
        {loading ? loadingText || title : title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600"
  }
});
