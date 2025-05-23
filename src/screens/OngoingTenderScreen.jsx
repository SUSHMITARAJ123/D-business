import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const OngoingTenderScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { companyName } = route.params;
  const [tenders, setTenders] = useState([]);
  const [filteredTenders, setFilteredTenders] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await fetch('http://10.0.2.2:9090/3PL/tenders/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyName: companyName,
            status: 'ACTIVE',
          }),
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          setTenders(data);
          setFilteredTenders(data);
        } else {
          console.error('Unexpected response:', data);
        }
      } catch (error) {
        console.error('Error fetching tenders:', error);
      }
    };

    fetchTenders();
  }, [companyName]);

  const handleSearch = (text) => {
    setSearch(text);
    const query = text.toLowerCase();
    const filtered = tenders.filter((tender) =>
      tender.tenderNo.toLowerCase().includes(query) ||
      tender.sourceLocation.toLowerCase().includes(query) ||
      tender.destinationLocation.toLowerCase().includes(query)
    );
    setFilteredTenders(filtered);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TenderDetails', { tender: item })}
    >
      <Text style={styles.title}>{item.tenderNo}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>From:</Text>
        <Text>{item.sourceLocation}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>To:</Text>
        <Text>{item.destinationLocation}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Pickup:</Text>
        <Text>{item.pickupDate}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Drop:</Text>
        <Text>{item.dropDate}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Price:</Text>
        <Text style={{ fontWeight: 'bold' }}>₹{item.tenderPrice}</Text>
      </View>
      <Text style={styles.status}>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
        <Text style={styles.heading}>Ongoing Tenders for</Text>
        <Text style={styles.subheading}>Company: {companyName}</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by Tender No, Pickup, or Drop"
          value={search}
          onChangeText={handleSearch}
          placeholderTextColor="#ccc"
        />

        <FlatList
          data={filteredTenders}
          keyExtractor={(item) => item.tenderNo}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.noData}>No tenders found.</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default OngoingTenderScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1D3557',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F1FAEE',
    marginTop: 30,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A8DADC',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#F1FAEE',
    padding: 12,
    borderRadius: 12,
    borderColor: '#A8DADC',
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
    color: '#1D3557',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 14,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1D3557',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 80,
    fontWeight: '600',
    color: '#457B9D',
  },
  status: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0288D1',
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    color: '#F1FAEE',
    fontSize: 16,
  },
});
