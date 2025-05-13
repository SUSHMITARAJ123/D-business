import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import LinearGradient from "react-native-linear-gradient";

const OtpVerificationScreen = ({ route, navigation }) => {
  const { mobile } = route.params;
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 4) {
      Alert.alert("Invalid OTP", "OTP must be 4 digits");
      return;
    }

    console.log('cleanotp',cleanOtp);

    try {
      const response = await fetch("http://10.0.2.2:9090/auth/verify-signup-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobileNumber: mobile,
          otp: cleanOtp,
        }),
      });

      console.log('response',response);

      // const data = await response.json();

      if (response.status===200) {
        Alert.alert("🎉 Success", "You can now login", [
          {
            text: "OK",
            onPress: () => navigation.popToTop(),
          },
        ]);
      } 
      else {
        Alert.alert("❌ Verification Failed", "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert("🚫 Error", "Failed to verify OTP. Please try again later.");
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    setTimer(60);
    Alert.alert("OTP Resent", "A new OTP has been sent to your number.");
  };

  return (
    <LinearGradient colors={["#1D3557", "#457B9D"]} style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the OTP sent </Text>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="#3B82F6" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter 4-digit OTP"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
        />
      </View>

      {timer > 0 ? (
        <Text style={styles.timer}>⏳ Resend in {timer}s</Text>
      ) : (
        <Pressable onPress={handleResendOtp}>
          <Text style={styles.resend}>
            <Icon name="redo" size={16} color="#fff" /> Resend OTP
          </Text>
        </Pressable>
      )}

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleVerifyOtp}
      >
        <Text style={styles.buttonText}>
          <Icon name="check" size={18} color="#fff" /> Verify
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
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    color: "#D1D5DB",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 18,
    color: "#1F2937",
    textAlign: "center",
  },
  timer: {
    textAlign: "center",
    color: "#FCD34D",
    marginBottom: 20,
    fontWeight: "600",
  },
  resend: {
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "600",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3B82F6",
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
    flexDirection: "row",
    alignItems: "center",
  },
});

export default OtpVerificationScreen;
