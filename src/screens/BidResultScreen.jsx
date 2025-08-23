import React, { useEffect } from "react";

import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BidResultScreen({ route }) {
  const { tender, bids, acceptedLsp } = route.params || {}; 

  useEffect(() => {
    if (bids && acceptedLsp) {
      const bidResults = bids.map(bid => ({
        tenderNo: tender?.tenderNo,
        lspCompanyName: bid.lspCompanyName,
        selectionStatus:
          acceptedLsp.lspCompanyName === bid.lspCompanyName &&
          acceptedLsp.bidPrice === bid.bidPrice
            ? "CONFIRMED"
            : "REJECTED",
      }));

      AsyncStorage.setItem("bidResults", JSON.stringify(bidResults));
    }
  }, [bids, acceptedLsp, tender]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerText}>Tender Result</Text>
        <Text style={styles.subHeader}>Tender No: {tender?.tenderNo}</Text>
      </View>

      {/* Bids */}
      {bids?.map((bid, index) => {
        const isAccepted =
          acceptedLsp &&
          bid.lspCompanyName === acceptedLsp.lspCompanyName &&
          bid.bidPrice === acceptedLsp.bidPrice;

        return (
          <View
            key={index}
            style={[styles.card, isAccepted ? styles.accepted : styles.rejected]}
          >
            <Text style={styles.company}>{bid.lspCompanyName}</Text>
            <Text style={styles.price}>Bid Price: ₹{bid.bidPrice}</Text>
            <Text style={styles.status}>
              {isAccepted ? "✅ Accepted" : "❌ Rejected"}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9fafb",
  },
  headerBox: {
    backgroundColor: "#2b61f4ff",
    padding: 6,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    marginTop: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  subHeader: {
    fontSize: 16,
    color: "#e0e7ff", 
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  company: {
    fontSize: 16,
    fontWeight: "bold",
  },
  price: {
    fontSize: 14,
    marginVertical: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
  },
  accepted: {
    borderColor: "green",
    backgroundColor: "#e6ffe6",
  },
  rejected: {
    borderColor: "red",
    backgroundColor: "#ffe6e6",
  },
});
