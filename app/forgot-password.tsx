import { AuthButton } from "@/components/auth/auth-button";
import { FormInput } from "@/components/auth/form-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemedKeyboardAvoidingView } from "@/components/ui/themed-keyboard-avoiding-view";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet
} from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Email Sent",
        "Please check your email for password reset instructions.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  return (
    <ThemedKeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Forgot Password
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </ThemedText>

          <ThemedView style={styles.form}>
            <FormInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <AuthButton
              title="Send Reset Link"
              loading={loading}
              loadingText="Sending..."
              onPress={handleResetPassword}
            />

            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}>
              <ThemedText style={styles.backButtonText}>
                Back to Sign In
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedKeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center"
  },
  title: {
    textAlign: "center",
    marginBottom: 8
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    opacity: 0.7
  },
  form: {
    gap: 16
  },
  backButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center"
  },
  backButtonText: {
    fontSize: 16,
    opacity: 0.7
  }
});
