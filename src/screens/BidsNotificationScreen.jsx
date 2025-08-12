import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

const BidsNotificationScreen = ({ navigation }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedTenders, setConfirmedTenders] = useState({}); 

  const dummyBids = [
    {
      id: 1,
      tenderNo: 'TDR12345',
      lspName: 'LSP A',
      price: 50000,
      interested: true,
    },
    {
      id: 2,
      tenderNo: 'TDR12345',
      lspName: 'LSP B',
      price: 52000,
      interested: true,
    },
    {
      id: 3,
      tenderNo: 'TDR12346',
      lspName: 'LSP C',
      price: null,
      interested: false,
    },
    {
      id: 4,
      tenderNo: 'TDR12347',
      lspName: 'LSP D',
      price: 55000,
      interested: true,
    },
  ];

  const fetchBids = async () => {
    try {
      setLoading(true);
      setError(null);

      // Uncomment for backend integration
      // const res = await fetch('http://10.0.2.2:9090/bids/all');
      // const data = await res.json();

      const data = dummyBids; // using dummy data for now
      setBids(data);
    } catch (err) {
      console.error('Error fetching bids:', err);
      setError('Failed to fetch bids. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBids();
  };

  const handleConfirm = async (bid) => {
    const { id, tenderNo } = bid;

    try {
      // Uncomment for backend integration
      // const res = await fetch(`http://10.0.2.2:9090/bids/confirm/${id}`, {
      //   method: 'POST',
      // });
      // if (res.ok) {

      const res = { ok: true }; // dummy success

      if (res.ok) {
        Alert.alert('Success', `Bid for tender ${tenderNo} confirmed successfully`);
        setConfirmedTenders({ ...confirmedTenders, [tenderNo]: id });
      } else {
        Alert.alert('Error', 'Failed to confirm bid');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Server error while confirming bid');
    }
  };

  const renderItem = ({ item }) => {
    const tenderConfirmedBidId = confirmedTenders[item.tenderNo];

    return (
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('TenderDetailsScreen', { tenderNo: item.tenderNo })
          }
        >
          <Text
            style={[
              styles.cell,
              {
                flex: 1,
                color: '#2563EB',
                textDecorationLine: 'underline',
              },
            ]}
          >
            {item.tenderNo}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.cell, { flex: 1.5 }]}>{item.lspName}</Text>

        <Text style={[styles.cell, { flex: 1 }]}>
          {item.interested && item.price ? `₹${item.price}` : 'N/A'}
        </Text>

        <Text style={[styles.cell, { flex: 1 }]}>{item.interested ? 'Yes' : 'No'}</Text>

        {item.interested ? (
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (tenderConfirmedBidId &&
                tenderConfirmedBidId !== item.id) ||
              (!item.interested && { backgroundColor: '#9CA3AF' }),
            ]}
            onPress={() => handleConfirm(item)}
            disabled={
              tenderConfirmedBidId !== undefined &&
              tenderConfirmedBidId !== item.id
            }
          >
            <Text style={styles.confirmText}>
              {tenderConfirmedBidId === item.id
                ? 'Confirmed'
                : tenderConfirmedBidId
                ? 'Locked'
                : 'Confirm'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.cell, { flex: 1, color: '#9CA3AF' }]}>-</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.heading}>Bids Notifications</Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, { flex: 1 }]}>Tender No</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>LSP Name</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Price</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Interested</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Confirm</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1D3557" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>
          {error}
        </Text>
      ) : bids.length === 0 ? (
        <Text style={styles.loading}>No bids found.</Text>
      ) : (
        <FlatList
          data={bids}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

export default BidsNotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1D3557',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#457B9D',
    paddingVertical: 10,
    borderRadius: 8,
  },
  headerCell: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  cell: {
    textAlign: 'center',
    fontSize: 15,
    color: '#1F2937',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#34D399',
    marginHorizontal: 8,
    borderRadius: 6,
    paddingVertical: 6,
  },
  confirmText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
    color: '#1D3557',
  },
});
