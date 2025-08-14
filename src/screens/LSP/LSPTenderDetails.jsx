import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { Card } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function TenderDetailsScreen({ route, navigation }) {
  const { tender } = route.params || {};

  const [bidPrice, setBidPrice] = useState('');
  const [eta, setEta] = useState(null);
  const [message, setMessage] = useState('');
  const [showEtaPicker, setShowEtaPicker] = useState(false);

const handlePlaceBid = async () => {
    if (!bidPrice || !eta) {
      Alert.alert('Validation', 'Please enter bid price and ETA.');
      return;
    }

    try {
      const storedCompanyName = await AsyncStorage.getItem('companyName');
      const companyNameToUse = storedCompanyName || tender.companyName;

      if (!companyNameToUse) {
        Alert.alert('Error', 'No company name found. Please log in again.');
        return;
      }

      const estimatedArrivalDate = eta.toISOString().split('T')[0];

      const payload = {
        estimatedArrivalDate,
        bidPrice: parseFloat(bidPrice),
        lspMessage: message || '',
      };

      const url = `http://10.0.2.2:9090/api/lsp/responses/reply/${tender.tenderNo}?companyName=${encodeURIComponent(companyNameToUse)}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("✅ Bid placed successfully:", response);
        Alert.alert('Success', 'Your bid has been placed.', [
          {
            text: 'OK',
            onPress: () =>
              navigation.navigate('LSPBidDetail', {
                tender: {
                  tenderNo: tender.tenderNo,
                  companyName: companyNameToUse,
                },
              }),
          },
        ]);
      } else {
        const error = await response.text();
        Alert.alert('Error', `Failed to place bid: ${error}`);
      }
    } catch (err) {
      console.error('🔥 Bid error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };


  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{tender.tenderNo}</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.detail}><Text style={styles.bold}>Company:</Text> {tender.createdByCompanyName}</Text>
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
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEtaPicker(true)}
          >
            <Icon name="calendar" size={20} color="#1D3557" />
            <Text style={styles.dateButtonText}>
              {eta ? eta.toISOString().split('T')[0] : 'Select ETA Date'}
            </Text>
          </TouchableOpacity>

          {showEtaPicker && (
            <DateTimePicker
              value={eta || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowEtaPicker(false);
                if (selectedDate) {
                  setEta(selectedDate);
                }
              }}
            />
          )}

          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Add message"
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity style={styles.button} onPress={handlePlaceBid}>
            <Icon name="send" size={12} color="#fff" />
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6f6ff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateButtonText: {
    marginLeft: 10,
    color: '#1D3557',
    fontSize: 16,
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
