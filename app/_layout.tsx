import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import "react-native-reanimated";

import { AuthProvider } from "@/contexts/AuthContext";
import { useNetworkState } from "@/hooks/useNetworkState";
import { initializeSMSListener, processQueuedSMS } from "@/services/smsListenerService";
import { registerSMSBackgroundTask } from "@/tasks/smsBackgroundTask";

export const unstable_settings = {
  anchor: "(tabs)"
};

function SMSListenerInitializer() {
  const { isConnected } = useNetworkState();

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    // Initialize SMS listener and background task
    const initSMS = async () => {
      try {
        await registerSMSBackgroundTask();
        await initializeSMSListener();
      } catch (error) {
        console.error('Failed to initialize SMS listener:', error);
      }
    };

    initSMS();
  }, []);

  // Process queued SMS when network becomes available
  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    if (isConnected === true) {
      // Network is available, process queued messages
      processQueuedSMS().catch((error) => {
        console.error('Failed to process queued SMS:', error);
      });
    }
  }, [isConnected]);

  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={DarkTheme}>
        <SMSListenerInitializer />
        <Stack>
          <Stack.Screen name="index" options={{headerShown: false}} />
          <Stack.Screen name="login" options={{headerShown: false}} />
          <Stack.Screen name="signup" options={{headerShown: false}} />
          <Stack.Screen name="(tabs)" options={{headerShown: false}} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
