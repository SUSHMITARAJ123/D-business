import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

const SuccessScreen = () => {
  const navigation = useNavigation();

  const handleGoToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name="check-circle" size={80} color="#22C55E" />
      <Text style={styles.title}>Congratulations!</Text>
      <Text style={styles.message}>Your account has been created successfully.</Text>
      <Text style={styles.message}>You can now login to your account.</Text>

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleGoToLogin}
      >
        <Text style={styles.buttonText}>Go to Login</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#166534",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SuccessScreen;
