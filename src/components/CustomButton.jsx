import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const CustomButton = ({ title, onPress, type = "primary" }) => {
  return (
    <TouchableOpacity
      style={[styles.button, type === "primary" ? styles.primary : styles.secondary]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 10,
    elevation: 5, 
  },
  primary: {
    backgroundColor: "#00796B",
    shadowColor: "#00796B",
  },
  secondary: {
    backgroundColor: "#004D40",
    shadowColor: "#004D40",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
});

export default CustomButton;
