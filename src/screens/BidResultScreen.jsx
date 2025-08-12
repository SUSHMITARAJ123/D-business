import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const BidResultScreen = ({ route }) => {
  const { tenderNo, acceptedBid, rejectedBids } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Result for Tender {tenderNo}</Text>

      <View style={styles.acceptedCard}>
        <Text style={styles.label}>✅ Accepted Bid:</Text>
        <Text style={styles.name}>{acceptedBid.lspName}</Text>
        <Text style={styles.price}>₹{acceptedBid.price}</Text>
      </View>

      <Text style={styles.rejectedTitle}>❌ Rejected Bids:</Text>
      <FlatList
        data={rejectedBids}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.rejectedCard}>
            <Text style={styles.rejectedName}>{item.lspName}</Text>
            <Text style={styles.rejectedPrice}>₹{item.price || 'N/A'}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default BidResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1D3557',
  },
  acceptedCard: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#047857',
  },
  price: {
    fontSize: 16,
    color: '#047857',
    marginTop: 4,
  },
  rejectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 10,
  },
  rejectedCard: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectedName: {
    fontSize: 16,
    color: '#991B1B',
  },
  rejectedPrice: {
    fontSize: 16,
    color: '#991B1B',
  },
});
