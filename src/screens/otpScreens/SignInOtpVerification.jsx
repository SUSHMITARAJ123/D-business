import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome'; 
import LinearGradient from 'react-native-linear-gradient'; 

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

  const handleVerify = async () => {
    if (otp.length !== 4) {
      Alert.alert("Error", "Please enter a 4-digit OTP.");
      return;
    }

    try {
      const response = await fetch("http://10.0.2.2:9090/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobileNumber: input,
          otp: otp,
        }),
      });

     console.log('response',response)
      if (response.status===200) {
        Alert.alert("Success", "OTP verified. You are logged in!");
        navigation.navigate('Dashboard');
      } else {
        Alert.alert("Verification Failed",  "Invalid OTP.");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    setTimer(60);
    Alert.alert("OTP Sent", `A new OTP has been sent to your ${method}.`);
  };

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>

      <Text style={styles.header}>Enter OTP</Text>
      <Text style={styles.subHeader}>
        OTP sent to your {method === "mobile" ? "mobile" : "email"}: {input}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 4-digit OTP"
        keyboardType="numeric"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      {timer > 0 ? (
        <Text style={styles.timerText}>⏳ Resend in {timer} sec</Text>
      ) : (
        <Pressable onPress={handleResendOtp}>
          <Text style={styles.resendText}>
            <Icon name="redo" size={16} color="#2563EB" /> Resend OTP
          </Text>
        </Pressable>
      )}

      <Pressable style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>
          <Icon name="check" size={18} color="#fff" /> Verify OTP
        </Text>
      </Pressable>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  back: {
    color: "#FFFFFF",
    marginBottom: 20,
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: "#fff", 
  },
  subHeader: {
    textAlign: "center",
    marginBottom: 20,
    color: "#D1D5DB",
  },
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
    backgroundColor: "#3B82F6", 
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    flexDirection: "row",
    alignItems: "center",
  },
});

export default SignInOtpVerification;
