import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet } from "react-native";

interface AuthLinkProps {
  prompt: string;
  linkText: string;
  onPress: () => void;
}

export function AuthLink({ prompt, linkText, onPress }: AuthLinkProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>{prompt} </ThemedText>
      <ThemedText type="link" style={styles.link} onPress={onPress}>
        {linkText}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16
  },
  text: {
    opacity: 0.7
  },
  link: {
    fontWeight: "600"
  }
});
