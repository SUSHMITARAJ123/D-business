import React, { useState, useEffect, useRef  } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import LinearGradient from "react-native-linear-gradient";

const OtpVerificationScreen = ({ route, navigation }) => {
  const { mobile } = route.params;
  //const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputs = useRef([]);
  const scaleAnim = useRef(otpDigits.map(() => new Animated.Value(1))).current;

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

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newOtp = [...otpDigits];
      newOtp[index] = text;
      setOtpDigits(newOtp);
      animateBox(index);

      if (index < 3) {
        inputs.current[index + 1].focus();
      }
    } else if (text === "") {
      const newOtp = [...otpDigits];
      newOtp[index] = "";
      setOtpDigits(newOtp);
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && otpDigits[index] === "" && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const animateBox = (index) => {
    Animated.sequence([
      Animated.timing(scaleAnim[index], {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otpDigits.join("");

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
    setOtpDigits(["", "", "", ""]);
    setTimer(60);
    Alert.alert("OTP Resent", "A new OTP has been sent to your number.");
  };

  return (
    <LinearGradient colors={["#1D3557", "#457B9D"]} style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the OTP sent </Text>

<View style={styles.otpBoxContainer}>
        {otpDigits.map((digit, index) => (
          <Animated.View key={index} style={[styles.animatedBox, { transform: [{ scale: scaleAnim[index] }] }]}>
            <TextInput
              ref={(ref) => (inputs.current[index] = ref)}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              keyboardType="number-pad"
              maxLength={1}
              onKeyPress={(e) => handleKeyPress(e, index)}
              style={styles.otpBox}
              placeholder="-"
              placeholderTextColor="#9CA3AF"
            />
          </Animated.View>
        ))}
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
  otpBoxContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
  animatedBox: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    backgroundColor: "transparent",
    borderRadius: 8,
  },
  otpBox: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 22,
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
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
