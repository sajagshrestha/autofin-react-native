import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";

interface FormInputProps extends TextInputProps {
  // Additional props can be added here if needed
}

export function FormInput({ style, secureTextEntry, ...props }: FormInputProps) {
  const colorScheme = useColorScheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry === true;

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: Colors[colorScheme ?? "light"].background,
            color: Colors[colorScheme ?? "light"].text,
            borderColor: Colors[colorScheme ?? "light"].icon,
            paddingRight: isPassword ? 50 : 16
          },
          style
        ]}
        placeholderTextColor={Colors[colorScheme ?? "light"].icon}
        secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
        {...props}
      />
      {isPassword && (
        <Pressable
          style={styles.iconContainer}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons
            name={isPasswordVisible ? "eye-off" : "eye"}
            size={20}
            color={Colors[colorScheme ?? "light"].icon}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative"
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16
  },
  iconContainer: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center"
  }
});
