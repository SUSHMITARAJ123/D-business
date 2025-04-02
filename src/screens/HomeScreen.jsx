import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from "react-native";
import SearchBar from "../components/SearchBar";
import BusinessFlowCard from "../components/BusinessCard";

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>D-Business : Let's Get Digital</Text>
        <Text style={styles.subtitle}>
          Our mission is to support businesses to expand market.
        </Text>
      </View>

      {/* Search Bar */}
      <SearchBar />

      {/* Business Flow Section */}
      <BusinessFlowCard />

      {/* Buttons */}
      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.buttonText}>Create Your Business Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "smoky white",
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  header: {
    paddingVertical: 30,
    alignItems: "center",
    backgroundColor: "#00796B",
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
    borderRadius: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#B2DFDB",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: "#00796B",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 10,
    elevation: 5,  
    shadowColor: "#00796B",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: "#004D40",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 10,
    elevation: 5, 
    shadowColor: "#004D40",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
});

export default HomeScreen;
