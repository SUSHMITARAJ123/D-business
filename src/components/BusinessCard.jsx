import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const BusinessFlowCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Supplier */}
        <View style={styles.iconContainer}>
          <Image source={require("../assets/supplier.png")} style={styles.icon} />
          <Text style={styles.label}>Supplier</Text>
        </View>

        <Text style={styles.arrow}>→</Text>

        {/* Wholesaler */}
        <View style={styles.iconContainer}>
          <Image source={require("../assets/wholesaler.png")} style={styles.icon} />
          <Text style={styles.label}>Wholesaler</Text>
        </View>

        <Text style={styles.arrow}>→</Text>

        {/* Retailer */}
        <View style={styles.iconContainer}>
          <Image source={require("../assets/retailer.png")} style={styles.icon} />
          <Text style={styles.label}>Retailer</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 29,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  icon: {
    width: 60,  
    height: 60,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  arrow: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00796B",
    marginHorizontal: 10,
  },
});

export default BusinessFlowCard;
