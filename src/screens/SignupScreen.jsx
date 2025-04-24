import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const SignupScreen = () => {
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});
  const navigation = useNavigation();

  const validateFields = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!mobile.trim()) newErrors.mobile = "Mobile number is required";
    if (!password.trim()) newErrors.password = "Password is required";
    if (!address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = () => {
    if (validateFields()) {
      navigation.navigate("OtpVerification", {
        username,
        email,
        mobile,
        userType,
      });
    }
  };

  const renderError = (field) =>
    errors[field] && <Text style={styles.error}>{errors[field]}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!userType ? (
        <>
          <Text style={styles.header}>Welcome to E-Logistics Tendering</Text>
          <Text style={styles.subHeader}>Register as</Text>

          <Pressable
            style={({ pressed }) => [
              styles.selectButton,
              userType === "3pl" && styles.selected,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setUserType("3pl")}
          >
            <Text style={styles.selectText}>3rd Party Logistic</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.selectButton,
              userType === "provider" && styles.selected,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setUserType("provider")}
          >
            <Text style={styles.selectText}>Logistic Service Provider</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.header}>Sign Up</Text>
          <Text style={styles.subHeader}>
            {userType === "3pl"
              ? "For 3rd Party Logistics Partners"
              : "For Logistic Service Providers"}
          </Text>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Fullname</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your fullname"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setErrors((prev) => ({ ...prev, username: "" }));
              }}
            />
            {renderError("username")}
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
            />
            {renderError("email")}
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={(text) => {
                setMobile(text);
                setErrors((prev) => ({ ...prev, mobile: "" }));
              }}
            />
            {renderError("mobile")}
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
            />
            {renderError("password")}
          </View>

          <View style={styles.inputBox}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your location"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                setErrors((prev) => ({ ...prev, address: "" }));
              }}
              //multiline
              //numberOfLines={4}
            />
            {renderError("address")}
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleSignup}
          >
            <Text style={styles.buttonText}>Complete Registration</Text>
          </Pressable>

          <Pressable
            onPress={() => setUserType(null)}
            style={{ marginTop: 20, alignItems: "center" }}
          >
            <Text style={styles.backLink}>← Back to Business Selection</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#00796B",
    padding: 24,
    paddingTop: 60,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 20,
    color: "black",
    textAlign: "center",
    marginBottom: 30,
  },
  selectButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 16,
    borderRadius: 14,
    marginVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  selected: {
    backgroundColor: "#DBEAFE",
    borderColor: "#2563EB",
  },
  selectText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  inputBox: {
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "black",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  textArea: {
    //height: 90,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#2563EB",
    borderWidth: 1,
    borderColor: 'white',
    paddingVertical: 12,
    borderRadius: 40,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 4,
  },
  backLink: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },
});

export default SignupScreen