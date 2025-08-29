import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  Animated,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function BidDetailScreen({ route }) {
  const navigation = useNavigation();
  const { tender } = route.params || {};
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmedIndex, setConfirmedIndex] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const fadeAnimRefs = useRef([]);

  useEffect(() => {
    if (!tender || !tender.tenderNo || !tender.createdBy) {
      Alert.alert('Error', 'Tender information is not available');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // 1️⃣ Fetch bids
        const response = await fetch(
          'http://10.0.2.2:9090/api/lsp/responses/filter-by-tender',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyName: tender.createdBy,
              tender_no: tender.tenderNo,
            }),
          }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        fadeAnimRefs.current = data.map(() => new Animated.Value(0));
        setBids(data);

        // 2️⃣ Fetch assignment
        const res = await fetch(
          `http://10.0.2.2:9090/3pl/assignments?companyName=${tender.createdBy}`
        );
        if (res.ok) {
          const assignments = await res.json();
          const tenderAssignment = assignments.find(
            (a) => a.tenderNo === tender.tenderNo
          );
          if (tenderAssignment) {
            setAssignment(tenderAssignment);

            // Find which bid was confirmed
            const confirmedIdx = data.findIndex(
              (b) => b.lspCompanyName === tenderAssignment.lspCompanyName
            );
            if (confirmedIdx !== -1) {
              setConfirmedIndex(confirmedIdx);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load bid data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tender]);

  const handleConfirm = async (index) => {
    const selectedBid = bids[index];

    try {
      const response = await fetch('http://10.0.2.2:9090/3pl/confirm-lsp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderNo: tender.tenderNo,
          lspCompanyName: selectedBid.lspCompanyName,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setConfirmedIndex(index);

      Animated.timing(fadeAnimRefs.current[index], {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      if (Platform.OS === 'android') {
        ToastAndroid.show('Bid confirmed successfully!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Confirmed', 'Bid confirmed successfully!');
      }

      // Refresh assignment
      const res = await fetch(
        `http://10.0.2.2:9090/3pl/assignments?companyName=${tender.createdBy}`
      );
      if (res.ok) {
        const assignments = await res.json();
        const tenderAssignment = assignments.find(
          (a) => a.tenderNo === tender.tenderNo
        );
        setAssignment(tenderAssignment || null);
      }

      navigation.navigate('BidResult', {
        tender,
        bids,
        acceptedLsp: selectedBid,
      });
    } catch (error) {
      console.error('Error confirming bid:', error);
      Alert.alert('Error', 'Failed to confirm bid. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1D3557" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Bid Details for {tender?.tenderNo}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <ScrollView style={styles.tableContainer} horizontal>
          <View style={styles.table}>
            <View style={[styles.row, styles.tableHeader]}>
              <Text style={[styles.cell, styles.headerCell, { minWidth: 150 }]}>LSP Name</Text>
              <Text style={[styles.cell, styles.headerCell, { minWidth: 100 }]}>Bid Price</Text>
              <Text style={[styles.cell, styles.headerCell, { minWidth: 150 }]}>ETA</Text>
              <Text style={[styles.cell, styles.headerCell, { minWidth: 200 }]}>Message</Text>
              <Text style={[styles.cell, styles.headerCell, { minWidth: 130 }]}>Action</Text>
            </View>

            {bids.map((item, index) => {
              const isConfirmed = confirmedIndex === index;
              const alreadyConfirmed = confirmedIndex !== null;

              return (
                <View
                  key={index}
                  style={[
                    styles.row,
                    { backgroundColor: index % 2 === 0 ? '#fff' : '#dfe9f1ff' },
                    isConfirmed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={[styles.cell, { minWidth: 150 }]}>{item.lspCompanyName}</Text>
                  <Text style={[styles.cell, { minWidth: 100 }]}>
                    {item.bidPrice !== null ? `₹${item.bidPrice}` : 'N/A'}
                  </Text>
                  <Text style={[styles.cell, { minWidth: 150 }]}>
                    {item.estimatedArrivalDate || 'N/A'}
                  </Text>
                  <Text style={[styles.cell, { minWidth: 200 }]}>{item.lspMessage || 'N/A'}</Text>
                  <View style={[styles.cell, { minWidth: 130 }]}>
                    {alreadyConfirmed ? (
                      isConfirmed ? (
                        <View style={[styles.statusBox, { backgroundColor: '#49f791ff' }]}>
                          <Text style={styles.buttonText}>Confirmed</Text>
                        </View>
                      ) : (
                        <View style={[styles.statusBox, { backgroundColor: '#f57a6dff' }]}>
                          <Text style={styles.buttonText}>Rejected</Text>
                        </View>
                      )
                    ) : (
                      (item.bidPrice !== null || item.estimatedArrivalDate || item.lspMessage) && (
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => handleConfirm(index)}
      >
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
    )
  )}
</View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* 🚚 Assigned transporter details */}
        {assignment && (
          <View style={styles.assignmentCard}>
            <Text style={styles.assignmentTitle}>Assigned Transporter</Text>
            <Text style={styles.assignmentText}>🚛 LSP: {assignment.lspCompanyName}</Text>
            <Text style={styles.assignmentText}>🚚 Vehicle: {assignment.vehicleNumber}</Text>
            <Text style={styles.assignmentText}>👨‍✈️ Driver: {assignment.driverName}</Text>
            <Text style={styles.assignmentText}>📞 Contact: {assignment.driverContact}</Text>
          </View>
        )}
      </ScrollView>

      {bids.length === 0 && (
        <Text style={styles.noData}>No bids available for this tender.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { backgroundColor: '#1D3557', paddingVertical: 20, alignItems: 'center' },
  headerText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 22 },
  tableContainer: { margin: 16, borderRadius: 10, backgroundColor: '#ffffff' },
  table: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden' },
  tableHeader: { backgroundColor: '#457B9D' },
  row: { flexDirection: 'row', alignItems: 'center' },
  cell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    textAlignVertical: 'center',
  },
  headerCell: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  confirmButton: {
    backgroundColor: '#1D3557',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  statusBox: {
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  noData: { textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  assignmentCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  assignmentTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1e3a8a' },
  assignmentText: { fontSize: 15, marginBottom: 6, color: '#374151' },
});
