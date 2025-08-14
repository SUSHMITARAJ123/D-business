import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function TenderResultScreen({ route, navigation }) {
  const { tender, bids, myLspName } = route.params;
  const myBidIndex = bids.findIndex(b => b.lspCompanyName === myLspName);
 const confirmedIndex = bids.findIndex(b => b.status === 'ACCEPTED'); 
  const isWinner = confirmedIndex === myBidIndex;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Tender Result</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.info}>Tender No: {tender.tenderNo}</Text>
        <Text style={styles.info}>Source: {tender.sourceLocation}</Text>
        <Text style={styles.info}>Destination: {tender.destinationLocation}</Text>

        {bids.map((bid, index) => (
          <View
            key={index}
            style={[
              styles.bidRow,
              index === confirmedIndex ? styles.winner : styles.loser
            ]}
          >
            <Text>{bid.lspCompanyName}</Text>
            <Text>₹{bid.bidPrice}</Text>
            <Text>{index === confirmedIndex ? '✅ Accepted' : '❌ Rejected'}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: '#1D3557', padding: 16, alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  info: { marginBottom: 4, fontSize: 14 },
  bidRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  winner: { backgroundColor: '#d4edda' },
  loser: { backgroundColor: '#f8d7da' },
  assignBtn: { backgroundColor: '#1D3557', padding: 12, marginTop: 20, borderRadius: 8, alignItems: 'center' },
  assignText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
