import {ThemedText} from "@/components/themed-text";
import {ThemedView} from "@/components/themed-view";
import {useAuth} from "@/contexts/AuthContext";
import {StyleSheet} from "react-native";

export default function HomeScreen() {
  const {user} = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Home
      </ThemedText>
      {user && <ThemedText style={styles.welcome}>Welcome, {user.email}!</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  title: {
    marginBottom: 16
  },
  welcome: {
    opacity: 0.7
  }
});
