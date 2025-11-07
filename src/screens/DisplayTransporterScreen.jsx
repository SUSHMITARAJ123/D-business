import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

export default function TenderDetailsScreen({ route }) {
  const { tenderNo } = route.params;
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(
          `http://10.0.2.2:9090/3pl/tenders/${tenderNo}/assignment`
        );
        if (response.ok) {
          const data = await response.json();
          setAssignment(data);
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [tenderNo]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 30 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tender #{tenderNo}</Text>

      {assignment ? (
        <View style={styles.card}>
          <Text style={styles.label}>🚚 Vehicle: {assignment.vehicleNumber}</Text>
          <Text style={styles.label}>👨‍✈️ Driver: {assignment.driverName}</Text>
          <Text style={styles.label}>📞 Contact: {assignment.driverContact}</Text>
        </View>
      ) : (
        <Text style={styles.noData}>No transporter assigned yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f7f9fb" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  label: { fontSize: 16, marginBottom: 10, color: "#374151" },
  noData: { fontSize: 16, color: "gray" },
});
