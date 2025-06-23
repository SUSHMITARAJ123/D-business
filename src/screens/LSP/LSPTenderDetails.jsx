// TenderDetailsScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { Card } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TenderDetailsScreen({ route, navigation }) {
  const { tender } = route.params || {};

  const [bidPrice, setBidPrice] = useState('');
  const [eta, setEta] = useState('');

  const handlePlaceBid = async () => {
    if (!bidPrice || !eta) {
      Alert.alert('Validation', 'Please enter bid price and ETA.');
      return;
    }

  //   try {
  //     const res = await fetch('http://10.0.2.2:9090/lsp/bids/place', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         tenderId: tender.id,
  //         bidPrice: bidPrice,
  //         eta: eta,
  //       }),
  //     });

    //   if (res.ok) {
    //     Alert.alert('Success', 'Bid placed successfully!', [
    //       { text: 'OK', onPress: () => navigation.goBack() },
    //     ]);
    //   } else {
    //     Alert.alert('Error', 'Failed to place bid. Try again.');
    //   }
    // } catch (err) {
    //   console.error(err);
    //   Alert.alert('Error', 'Something went wrong.');
    // }
  };

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{tender.tenderNo}</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.detail}><Text style={styles.bold}>Company:</Text> {tender.companyName}</Text>
            <Text style={styles.detail}><Text style={styles.bold}>From:</Text> {tender.sourceLocation}</Text>
            <Text style={styles.detail}><Text style={styles.bold}>To:</Text> {tender.destinationLocation}</Text>
            <Text style={styles.detail}><Text style={styles.bold}>Pickup:</Text> {tender.pickupDate}</Text>
            <Text style={styles.detail}><Text style={styles.bold}>Drop:</Text> {tender.dropDate}</Text>
            <Text style={styles.detail}><Text style={styles.bold}>Weight:</Text> {tender.weight} kg</Text>
            <Text style={styles.detail}><Text style={styles.bold}>Instructions:</Text> {tender.specialInstructions || 'None'}</Text>
            <Text style={styles.detail}><Text style={styles.bold}>Price:</Text> ₹{tender.tenderPrice}</Text>
          </Card.Content>
        </Card>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Bid Price (₹)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter your bid price"
            placeholderTextColor="#aaa"
            value={bidPrice}
            onChangeText={setBidPrice}
          />

          <Text style={styles.inputLabel}>Estimated Time of Arrival (ETA)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2 days"
            placeholderTextColor="#aaa"
            value={eta}
            onChangeText={setEta}
          />

          <TouchableOpacity style={styles.button} onPress={handlePlaceBid}>
            <Icon name="send" size={22} color="#fff" />
            <Text style={styles.buttonText}>Place Bid</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: {
    marginTop: 20,
    fontSize: 23,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    marginBottom: 30,
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    color: '#1D3557',
  },
  bold: { fontWeight: 'bold' },
  inputContainer: {},
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E63946',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
