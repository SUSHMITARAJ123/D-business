import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const PendingTenderScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { companyName } = route.params;
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await fetch('http://10.0.2.2:9090/3PL/tenders/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: companyName,
            status: 'Pending',
          }),
        });

        if (!response.ok) {
          if (response.status === 404) {
            setTenders([]);
            return;
          }
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        setTenders(data);
      } catch (error) {
        console.error('Error fetching pending tenders:', error);
      }
    };

    fetchTenders();
  }, [companyName]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TenderDetails', { tender: item })}
    >
      <Text style={styles.title}>{item.tenderNo}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Pickup:</Text>
        <Text style={styles.value}>{item.pickupDate}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Drop:</Text>
        <Text style={styles.value}>{item.dropDate}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Price:</Text>
        <Text style={[styles.value, { fontWeight: 'bold' }]}>₹{item.tenderPrice}</Text>
      </View>
      <Text style={styles.status}>Status: Pending</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.heading}>Pending Tenders for Company: {companyName}</Text>
        {/* <Text style={styles.subheading}>Company: {companyName}</Text> */}
        <FlatList
          data={tenders}
          keyExtractor={(item) => item.tenderNo}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.noData}>No pending tenders found.</Text>}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PendingTenderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 40,
    marginBottom: 20,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ECEFF1',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F57F17',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 80,
    fontWeight: '500',
    color: '#455A64',
  },
  value: {
    color: '#263238',
  },
  status: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#F57F17',
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 16,
  },
});
