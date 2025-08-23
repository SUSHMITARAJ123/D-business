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

  const fadeAnimRefs = useRef([]); 

  useEffect(() => {
    if (!tender || !tender.tenderNo || !tender.createdBy) {
      Alert.alert('Error', 'Tender information is not available');
      setLoading(false);
      return;
    }

    const fetchBids = async () => {
      try {
        const response = await fetch(
          'http://10.0.2.2:9090/api/lsp/responses/filter-by-tender',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              companyName: tender.createdBy,
              tender_no: tender.tenderNo,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
          Alert.alert('No bids available for this tender');
        }

     
        fadeAnimRefs.current = data.map(() => new Animated.Value(0));
        setBids(data);
      } catch (error) {
        console.error('Error fetching bids:', error);
        Alert.alert('Error', 'Failed to load bid data');
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [tender]);

  const handleConfirm = async (index) => {
    const selectedBid = bids[index];

    try {
      const response = await fetch("http://10.0.2.2:9090/3pl/confirm-lsp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenderNo: tender.tenderNo,
          lspCompanyName: selectedBid.lspCompanyName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text(); 
      console.log("Confirm API response:", result);

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
  

   navigation.navigate('BidResult', {
    tender,
    bids,
    acceptedLsp: selectedBid,
  });

    } catch (error) {
      console.error("Error confirming bid:", error);
      Alert.alert("Error", "Failed to confirm bid. Please try again.");
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
              const isDisabled = confirmedIndex !== null && !isConfirmed;

              return (
                <View
                  key={index}
                  style={[
                    styles.row,
                    { backgroundColor: index % 2 === 0 ? '#fff' : '#f0f4f7' },
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
                    {isConfirmed ? (
                      <Animated.View
                        style={{
                          opacity: fadeAnimRefs.current[index],
                          backgroundColor: 'gray',
                          borderRadius: 5,
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={styles.buttonText}>Confirmed</Text>
                      </Animated.View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.confirmButton,
                          isDisabled && { backgroundColor: '#ccc' },
                        ]}
                        onPress={() => handleConfirm(index)}
                        disabled={isDisabled}
                      >
                        <Text style={styles.buttonText}>Confirm</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      {bids.length === 0 && (
        <Text style={styles.noData}>No bids available for this tender.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#1D3557',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 2,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 22,
  },
  tableContainer: {
    margin: 16,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#457B9D',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    textAlignVertical: 'center',
  },
  headerCell: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#1D3557',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmedButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
