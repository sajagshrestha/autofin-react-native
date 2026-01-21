import {ThemedText} from "@/components/themed-text";
import {ThemedView} from "@/components/themed-view";
import {Colors} from "@/constants/theme";
import {useAuth} from "@/contexts/AuthContext";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {router} from "expo-router";
import {Alert, Pressable, StyleSheet} from "react-native";

export default function AboutScreen() {
  const {user, signOut} = useAuth();
  const colorScheme = useColorScheme();

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        }
      }
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        About
      </ThemedText>
      {user && (
        <>
          <ThemedText style={styles.email}>Signed in as: {user.email}</ThemedText>
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: Colors[colorScheme ?? "light"].tint
              }
            ]}
            onPress={handleSignOut}>
            <ThemedText
              style={[
                styles.buttonText,
                {
                  color: colorScheme === "dark" ? Colors.dark.text : "#fff"
                }
              ]}>
              Sign Out
            </ThemedText>
          </Pressable>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 20
  },
  title: {
    marginBottom: 16
  },
  email: {
    opacity: 0.7,
    marginBottom: 8
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600"
  }
});
