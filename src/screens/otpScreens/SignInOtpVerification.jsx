import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from "react-native";

const SignInOtpVerification = ({ route, navigation }) => {
  const { method, input } = route.params;
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleVerify = () => {
    if (otp.length !== 6) {
      Alert.alert("Error", "Please enter a 6-digit OTP.");
      return;
    }

    Alert.alert("Success", "OTP verified. You are logged in!");
   
  };

  const handleResendOtp = () => {
    setOtp("");
    setTimer(60);
    Alert.alert("OTP Sent", `A new OTP has been sent to your ${method}.`);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.header}>Enter OTP</Text>
      <Text style={styles.subHeader}>
        OTP sent to your {method === "mobile" ? "mobile" : "email"}: {input}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit OTP"
        keyboardType="numeric"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

     
      {timer > 0 ? (
        <Text style={styles.timerText}>⏳ resend in {timer} sec</Text>
      ) : (
        <Pressable onPress={handleResendOtp}>
          <Text style={styles.resendText}>🔁 Resend OTP</Text>
        </Pressable>
      )}

      <Pressable style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 24, justifyContent: "center" },
  back: { color: "#2563EB", marginBottom: 20, fontSize: 16 },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  subHeader: { textAlign: "center", marginBottom: 20, color: "#6B7280" },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    padding: 14,
    borderRadius: 10,
    fontSize: 18,
    letterSpacing: 6,
    textAlign: "center",
    marginBottom: 20,
  },
  timerText: {
    textAlign: "center",
    color: "#F59E0B",
    fontWeight: "600",
    marginBottom: 20,
    fontSize: 14,
  },
  resendText: {
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 20,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
});

export default SignInOtpVerification;
