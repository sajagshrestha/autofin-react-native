import { AuthButton } from "@/components/auth/auth-button";
import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthLink } from "@/components/auth/auth-link";
import { FormInput } from "@/components/auth/form-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemedKeyboardAvoidingView } from "@/components/ui/themed-keyboard-avoiding-view";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const {signIn, user} = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    const {error} = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert("Login Error", error.message);
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <ThemedKeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Welcome Back
          </ThemedText>
          <ThemedText style={styles.subtitle}>Sign in to continue</ThemedText>

          <ThemedView style={styles.form}>
            <FormInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <FormInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />

            <Pressable
              style={styles.forgotPasswordButton}
              onPress={() => router.push("/forgot-password")}>
              <ThemedText style={styles.forgotPasswordText}>
                Forgot Password?
              </ThemedText>
            </Pressable>

            <AuthButton
              title="Sign In"
              loading={loading}
              loadingText="Signing in..."
              onPress={handleLogin}
            />

            <AuthDivider />

            <AuthLink
              prompt="Don't have an account?"
              linkText="Sign Up"
              onPress={() => router.push("/signup")}
            />
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
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: -8
  },
  forgotPasswordText: {
    fontSize: 14,
    opacity: 0.7
  }
});
