import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
} from "react-native";

const OtpVerificationScreen = ({ route, navigation }) => {
  const { username } = route.params;
  const [otp, setOtp] = useState("");

  const handleVerifyOtp = () => {
    const cleanOtp = otp.trim();
    console.log("Entered OTP:", cleanOtp);
    if (otp === "123456") {
      Alert.alert("🎉 Congratulations", "You can login now", [
        {
          text: "OK",
          onPress: () => navigation.popToTop(),
        },
      ]);
    } else {
      console.log(typeof(otp))
      Alert.alert("Invalid OTP", "Please try again");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>
        Enter the OTP sent to {username}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
      />

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleVerifyOtp}
      >
        <Text style={styles.buttonText}>Verify</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#1E3A8A",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    color: "#4B5563",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    borderColor: "#CBD5E1",
    borderWidth: 1,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OtpVerificationScreen;
