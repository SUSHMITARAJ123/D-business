// MyBidsScreen.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MyBidsScreen({ navigation }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

   const fetchBids = async () => {
  //   try {
  //     const res = await fetch('http://10.0.2.2:9090/lsp/bids');
  //     const data = await res.json();
  //     setBids(data);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
   };

  useEffect(() => {
    fetchBids();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBids();
  };

  const renderBidItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Tender #{item.tenderNo}</Text>
        <Text style={styles.detail}>
          <Text style={styles.bold}>Bid Price:</Text> ₹{item.bidPrice}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.bold}>ETA:</Text> {item.eta}
        </Text>
        <Text style={[styles.status, getStatusStyle(item.status)]}>
          {item.status}
        </Text>
      </Card.Content>
    </Card>
  );

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return { color: 'green', fontWeight: 'bold' };
      case 'rejected':
        return { color: 'red', fontWeight: 'bold' };
      default:
        return { color: 'orange', fontWeight: 'bold' };
    }
  };

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <Text style={styles.header}>My Bids</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={bids}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBidItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No bids placed yet.</Text>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
    borderRadius: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D3557',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 6,
    color: '#1D3557',
  },
  bold: { fontWeight: 'bold' },
  status: {
    fontSize: 16,
    marginTop: 10,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
