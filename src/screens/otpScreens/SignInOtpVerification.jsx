import React, { useRef,  useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet, Keyboard,} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome'; 
import LinearGradient from 'react-native-linear-gradient'; 

const SignInOtpVerification = ({ route, navigation }) => {
  const { method, input } = route.params;
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);

  const inputsRef = useRef([]);

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

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1].focus();
    }

    if (!value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && otpDigits[index] === "" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
  const otp = otpDigits.join("");

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

    const responseText = await response.text(); 
    console.log('Response:', responseText);

    const roleMatch = responseText.match(/Welcome\s+([A-Z_]+)!/);
    const companyMatch = responseText.match(/Company:\s*(.+)/);

    const role = roleMatch ? roleMatch[1] : null;
    const companyName = companyMatch ? companyMatch[1].trim() : null;

    if (response.status === 200 && role && companyName) {
      Alert.alert("Success", "OTP verified. You are logged in!");

      if (role === "LSP") {
        navigation.navigate("LspDashboardScreen", { companyName });
      } else if (role === "THREE_PL") {
        navigation.navigate("Dashboard", { companyName });
      } else {
        Alert.alert("Error", `Unrecognized role: ${role}`);
      }
    } else {
      Alert.alert("Verification Failed", "Invalid OTP or user role.");
    }
  } catch (error) {
    console.error("OTP Verification Error:", error);
    Alert.alert("Error", "Something went wrong. Please try again.");
  }
};


  const handleResendOtp = () => {
    setOtpDigits(["", "", "", ""]);
    setTimer(60);
    Alert.alert("OTP Sent", `A new OTP has been sent to your ${method}.`);
  };

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>

      <Text style={styles.header}>Enter OTP</Text>
      <Text style={styles.subHeader}>
        OTP sent to your {method === "mobile" ? "mobile" : "email"}: {input}
      </Text>

      <View style={styles.otpContainer}>
        {otpDigits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputsRef.current[index] = ref)}
            style={styles.otpBox}
            value={digit}
            onChangeText={(value) => handleOtpChange(index, value)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            autoFocus={index === 0}
          />
        ))}
      </View>

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
       <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  otpBox: {
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
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
