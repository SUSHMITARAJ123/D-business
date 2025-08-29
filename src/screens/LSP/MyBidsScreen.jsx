import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardScreen() {
  const [companyName, setCompanyName] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyAndTenders = async () => {
      try {
        const storedCompany = await AsyncStorage.getItem("companyName");
        if (storedCompany) {
          setCompanyName(storedCompany);

          const response = await fetch(
            `http://10.0.2.2:9090/api/lsp/responses?companyName=${storedCompany}`
          );

          const data = await response.json();
          setTenders(data || []);
        }
      } catch (error) {
        console.error("Error fetching tenders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyAndTenders();
  }, []);

  const renderTender = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.tenderNo}>Tender No: {item.tenderNo}</Text>

      <Text style={styles.detail}>
        <Text style={styles.label}>Source:</Text> {item.sourceLocation}
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Destination:</Text> {item.destinationLocation}
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Pickup:</Text> {item.pickupDate}
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Drop:</Text> {item.dropDate}
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Weight:</Text> {item.weight} kg
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Bid Price:</Text>{" "}
        <Text style={styles.price}>₹{item.bidPrice}</Text>
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>ETA:</Text> {item.estimatedArrivalDate}
      </Text>

      <Text style={[styles.status, getStatusStyle(item.status)]}>
        {item.status}
      </Text>
    </View>
  );

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return { color: "#28a745", backgroundColor: "#e9f7ef" };
      case "rejected":
        return { color: "#dc3545", backgroundColor: "#f8d7da" };
      case "pending":
        return { color: "#ffc107", backgroundColor: "#fff3cd" };
      default:
        return { color: "#007bff", backgroundColor: "#e7f1ff" };
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#80b9f1ff" />
        <Text style={{ marginTop: 10 }}>Loading tenders...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {companyName ? `${companyName} - My Bids` : "Your Bids"}
        </Text>
      </View>

      {tenders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No tenders found for your company</Text>
        </View>
      ) : (
        <FlatList
          data={tenders}
          keyExtractor={(item, index) =>
            item.tenderNo?.toString() || index.toString()
          }
          renderItem={renderTender}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
  },
  header: {
    backgroundColor: "#11438a",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 15 : 60,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#11438a",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  cardBody: {
    marginTop: 5,
  },
  tenderNo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#11438a",
  },
  detail: {
    fontSize: 15,
    marginBottom: 6,
    color: "#333",
  },
  label: {
    fontWeight: "600",
    color: "#1D3557",
  },
  price: {
    fontWeight: "bold",
    color: "#007bff",
  },
  status: {
    fontSize: 15,
    fontWeight: "bold",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    // overflow: "hidden",
    textTransform: "capitalize",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 40,
  },
});
