import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert, 
} from "react-native";

export default function AssignTransporterScreen({ route, navigation }) {
  const { tenderNo } = route.params;

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!vehicleNumber || !driverName || !driverContact) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://10.0.2.2:9090/lsp/assignment/${tenderNo}/vehicle-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleNumber,
            driverName,
            driverContact,
          }),
        }
      );

      if (response.ok) {
        let result;
        try {
          result = await response.json();
        } catch (e) {
          result = await response.text(); 
        }

        Alert.alert(
          " ✅ Success",
          `Transporter for tender ${tenderNo} assigned successfully`
        );
        // navigation.replace("SuccessScreen", { assignment: result });
      } else {
        const errMsg = await response.text();
        alert(errMsg || "Failed to assign transporter");
      }
    } catch (error) {
      console.error("Error assigning transporter:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Assign Transporter</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Vehicle Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter vehicle number"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
        />

        <Text style={styles.label}>Driver Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter driver name"
          value={driverName}
          onChangeText={setDriverName}
        />

        <Text style={styles.label}>Driver Contact</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter driver contact"
          keyboardType="phone-pad"
          value={driverContact}
          onChangeText={setDriverContact}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAssign}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Assign Transporter</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f7f9fb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1e3a8a",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#f9fafb",
    fontSize: 15,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
