import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';

export default function BidDetailScreen({ route }) {
  const { tender } = route.params;
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBid = async () => {
      try {
        const res = await fetch(
          `http://10.0.2.2:9090/api/lsp/responses?companyName=${encodeURIComponent(
            tender.companyName
          )}`
        );

        const text = await res.text();
        if (!text) {
          Alert.alert('Error', 'No response from server.');
          return;
        }

        const data = JSON.parse(text);
        const matched = data.find(
          (item) => item.tenderNo === tender.tenderNo
        );

        if (matched) {
          setBid(matched);
        } else {
          Alert.alert('No Bids Found', 'No bids found for this tender.');
        }
      } catch (error) {
        console.error('Error fetching bid:', error);
        Alert.alert('Error', 'Failed to load bid details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBid();
  }, [tender]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1D3557" />
      </View>
    );
  }

  if (!bid) {
    return (
      <View style={styles.center}>
        <Text>No bid details available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bids by LSP</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Detail label="Tender No" value={bid.tenderNo} />
          <Detail label="LSP Name" value={bid.lspCompanyName} />
          <Detail label="Bid Price" value={`₹${bid.bidPrice}`} />
          <Detail label="ETA" value={bid.estimatedArrivalDate} />
          <Detail label="Message" value={bid.lspMessage || 'No message'} />
        </View>
      </ScrollView>
    </View>
  );
}

const Detail = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1D3557',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 22,
  },
  content: {
    flex: 1,
    padding: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  detailRow: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    color: '#333',
    fontSize: 16,
  },
  value: {
    color: '#555',
    fontSize: 16,
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
