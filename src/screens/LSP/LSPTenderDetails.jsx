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
  Platform,
  Modal,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Card } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';

export default function TenderDetailsScreen({ route, navigation }) {
  const { tender } = route.params || {};
  const { width } = useWindowDimensions();

  const [bidPrice, setBidPrice] = useState('');
  const [eta, setEta] = useState(null); // JS Date
  const [message, setMessage] = useState('');

  // Android fallback date state
  const [showEtaPicker, setShowEtaPicker] = useState(false);
  const currentYear = new Date().getFullYear();
  const [afDay, setAfDay] = useState('1');
  const [afMonth, setAfMonth] = useState('1');
  const [afYear, setAfYear] = useState(String(currentYear));

  const years = Array.from({ length: 11 }, (_, i) => String(currentYear + i)); // current .. +10
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  }));

  const daysForMonth = (y, m) => {
    const yearNum = parseInt(y, 10);
    const monthNum = parseInt(m, 10); // 1..12
    if (isNaN(yearNum) || isNaN(monthNum)) return [];
    const maxDay = new Date(yearNum, monthNum, 0).getDate(); // last day of month
    return Array.from({ length: maxDay }, (_, i) => String(i + 1));
  };
  const dayOptions = daysForMonth(afYear, afMonth);

  const confirmEtaAndroid = () => {
    const day = parseInt(afDay, 10);
    const month = parseInt(afMonth, 10) - 1; // JS 0..11
    const year = parseInt(afYear, 10);

    const constructed = new Date(year, month, day);
    if (isNaN(constructed.getTime())) {
      Alert.alert('Invalid date', 'Please select a valid date.');
      return;
    }
    setEta(constructed);
    setShowEtaPicker(false);
  };

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

      const url = `http://10.0.2.2:9090/api/lsp/responses/reply/${
        tender.tenderNo
      }?companyName=${encodeURIComponent(companyNameToUse)}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
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
            <Text style={styles.detail}>
              <Text style={styles.bold}>Company:</Text> {tender.createdByCompanyName}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.bold}>From:</Text> {tender.sourceLocation}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.bold}>To:</Text> {tender.destinationLocation}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.bold}>Pickup:</Text> {tender.pickupDate}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.bold}>Drop:</Text> {tender.dropDate}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.bold}>Weight:</Text> {tender.weight} kg
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.bold}>Instructions:</Text>{' '}
              {tender.specialInstructions || 'None'}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.bold}>Price:</Text> ₹{tender.tenderPrice}
            </Text>
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
            onPress={() => {
              const base = eta || new Date();
              setAfDay(String(base.getDate()));
              setAfMonth(String(base.getMonth() + 1));
              setAfYear(String(base.getFullYear()));
              setShowEtaPicker(true);
            }}
          >
            <Icon name="calendar" size={20} color="#1D3557" />
            <Text style={styles.dateButtonText}>
              {eta ? eta.toISOString().split('T')[0] : 'Select ETA Date'}
            </Text>
          </TouchableOpacity>

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

      {/* ANDROID DATE PICKER MODAL */}
      {Platform.OS === 'android' && (
        <Modal
          visible={showEtaPicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowEtaPicker(false)}
        >
          <SafeAreaView style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  maxWidth: 500,
                  width: width - 24, // small margin on sides
                },
              ]}
            >
              <Text style={styles.modalTitle}>Select ETA Date</Text>

              <View style={styles.androidPickersRow}>
                <View style={styles.androidPickerCol}>
                  <Text style={styles.pickerLabel}>Day</Text>
                  <Picker
                    selectedValue={afDay}
                    onValueChange={v => setAfDay(v)}
                    style={styles.picker}
                  >
                    {dayOptions.map(d => (
                      <Picker.Item key={d} label={d} value={d} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.androidPickerCol}>
                  <Text style={styles.pickerLabel}>Month</Text>
                  <Picker
                    selectedValue={afMonth}
                    onValueChange={v => setAfMonth(v)}
                    style={styles.picker}
                  >
                    {months.map(m => (
                      <Picker.Item
                        key={m.value}
                        label={m.label}
                        value={m.value}
                      />
                    ))}
                  </Picker>
                </View>

                <View style={styles.androidPickerCol}>
                  <Text style={styles.pickerLabel}>Year</Text>
                  <Picker
                    selectedValue={afYear}
                    onValueChange={v => setAfYear(v)}
                    style={styles.picker}
                  >
                    {years.map(y => (
                      <Picker.Item key={y} label={y} value={y} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => setShowEtaPicker(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalConfirmBtn]}
                  onPress={confirmEtaAndroid}
                >
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    paddingTop: 22,
  },
  title: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  detail: {
    fontSize: 15,
    marginBottom: 6,
    color: '#1D3557',
  },
  bold: { fontWeight: 'bold' },
  inputContainer: {},
  inputLabel: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6f6ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateButtonText: {
    marginLeft: 10,
    color: '#1D3557',
    fontSize: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E63946',
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },

  // modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  androidPickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  androidPickerCol: {
    flex: 1,
    alignItems: 'stretch',
  },
  pickerLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#eee',
  },
  modalConfirmBtn: {
    backgroundColor: '#1D3557',
  },
  modalCancelText: {
    color: '#333',
    fontSize: 14,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
