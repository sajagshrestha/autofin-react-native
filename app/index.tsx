import {ThemedView} from "@/components/themed-view";
import {useAuth} from "@/contexts/AuthContext";
import {router} from "expo-router";
import {useEffect} from "react";
import {ActivityIndicator, StyleSheet} from "react-native";

export default function Index() {
  const {user, loading} = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
