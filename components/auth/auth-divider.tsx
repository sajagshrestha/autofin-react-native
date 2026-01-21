import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, View } from "react-native";

export function AuthDivider() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.dividerContainer}>
      <View
        style={[styles.divider, {backgroundColor: Colors[colorScheme ?? "light"].icon}]}
      />
      <ThemedText style={styles.dividerText}>OR</ThemedText>
      <View
        style={[styles.divider, {backgroundColor: Colors[colorScheme ?? "light"].icon}]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12
  },
  divider: {
    flex: 1,
    height: 1,
    opacity: 0.3
  },
  dividerText: {
    fontSize: 14,
    opacity: 0.6
  }
});
