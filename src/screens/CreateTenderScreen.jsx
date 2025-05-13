import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CreateTenderScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    sourceLocation: '',
    destinationLocation: '',
    pickupDate: '',
    dropDate: '',
    weight: '',
    tenderPrice: '',
    specialInstructions: '',
  });

  const [datePickerConfig, setDatePickerConfig] = useState({
    show: false,
    field: null,
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    const missing = Object.entries(formData).find(([key, val]) => !val);
    if (missing) {
      Alert.alert('Validation Error', `Please fill in ${missing[0]}`);
      return;
    }
    Alert.alert('Tender Created Successfully');
    navigation.goBack();
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS !== 'ios') {
      setDatePickerConfig({ show: false, field: null });
    }
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange(datePickerConfig.field, formattedDate);
    }
  };

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="#1D3557" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Create Tender</Text>

        <View style={styles.card}>
          {/* Basic Inputs */}
          {['sourceLocation', 'destinationLocation', 'weight'].map((field, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={field.charAt(0).toUpperCase() + field.replace(/([A-Z])/g, ' $1').slice(1)}
              placeholderTextColor="#6B7280"
              value={formData[field]}
              onChangeText={(text) => handleChange(field, text)}
              keyboardType={field === 'weight' ? 'numeric' : 'default'}
            />
          ))}

          {/* Pickup Date with Calendar Icon */}
          <TouchableOpacity
            style={styles.dateInputWrapper}
            onPress={() => setDatePickerConfig({ show: true, field: 'pickupDate' })}
          >
            <Text style={styles.dateText}>
              {formData.pickupDate ? formData.pickupDate : 'Pickup Date'}
            </Text>
            <Icon name="calendar-today" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Drop Date with Calendar Icon */}
          <TouchableOpacity
            style={styles.dateInputWrapper}
            onPress={() => setDatePickerConfig({ show: true, field: 'dropDate' })}
          >
            <Text style={styles.dateText}>
              {formData.dropDate ? formData.dropDate : 'Drop Date'}
            </Text>
            <Icon name="calendar-today" size={20} color="#6B7280" />
          </TouchableOpacity>

          {/* Tender Price with ₹ symbol */}
          <View style={styles.priceInputWrapper}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Tender Price"
              placeholderTextColor="#6B7280"
              value={formData.tenderPrice}
              onChangeText={(text) => handleChange('tenderPrice', text)}
              keyboardType="numeric"
            />
          </View>

          {/* Special Instructions - placed at end */}
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Special Instructions"
            placeholderTextColor="#6B7280"
            value={formData.specialInstructions}
            onChangeText={(text) => handleChange('specialInstructions', text)}
            multiline
          />

          {/* Date Picker component */}
          {datePickerConfig.show && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit Tender</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#111827',
  },
  dateInputWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 12,
    marginBottom: 20,
  },
  rupeeSymbol: {
    fontSize: 18,
    color: '#111827',
    marginRight: 8,
  },
  priceInput: {
    fontSize: 16,
    flex: 1,
    color: '#111827',
  },
  button: {
    backgroundColor: '#1D3557',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateTenderScreen;
