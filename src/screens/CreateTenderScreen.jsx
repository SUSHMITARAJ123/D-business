import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const CreateTenderScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    sourceLocation: '',
    destinationLocation: '',
    pickupDate: '',
    dropDate: '',
    weight: '',
    tenderPrice: '',
    specialInstructions: '',
    tenderZone: '',
    broadcastToAllZones: false,
  });

  const route = useRoute();
  const { companyName } = route.params || {};

  const [isReviewing, setIsReviewing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState({
    visible: false,
    field: '',
    minimumDate: null,
  });
  const [errors, setErrors] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: '' });
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS !== 'ios') setShowDatePicker({ visible: false, field: '' });
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      handleChange(showDatePicker.field, dateString);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'sourceLocation',
      'destinationLocation',
      'pickupDate',
      'dropDate',
      'weight',
      'tenderPrice',
      'tenderZone',
    ];
    requiredFields.forEach(field => {
      if (!form[field]) newErrors[field] = 'This field is required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!companyName) {
      Alert.alert('Error', 'Company name not found. Please login again.');
      return;
    }

    try {
      const encodedCompanyName = encodeURIComponent(companyName);
      const response = await fetch(
        `http://10.0.2.2:9096/3PL/tenders/create?companyName=${encodedCompanyName}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceLocation: form.sourceLocation,
            destinationLocation: form.destinationLocation,
            pickupDate: form.pickupDate,
            dropDate: form.dropDate,
            weight: parseFloat(form.weight),
            tenderPrice: parseFloat(form.tenderPrice),
            specialInstructions: form.specialInstructions,
            tenderZone: form.tenderZone,
            broadcastToAllZones: form.broadcastToAllZones,
          }),
        }
      );

      if (response.status === 201) {
        const tenderData = await response.json();
        Alert.alert('Success', 'Tender created successfully');
        setForm({
          sourceLocation: '',
          destinationLocation: '',
          pickupDate: '',
          dropDate: '',
          weight: '',
          tenderPrice: '',
          specialInstructions: '',
          tenderZone: '',
          broadcastToAllZones: false,
        });
        setIsReviewing(false);
        navigation.navigate('TenderDetails', { tender: tenderData });
      } else {
        const errorText = await response.text();
        console.error('Server Error:', errorText);
        Alert.alert('Error', 'Failed to create tender');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  const renderInput = (label, key, iconName, keyboardType = 'default') => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Icon name={iconName} size={22} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={label}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          value={form[key]}
          onChangeText={value => handleChange(key, value)}
        />
      </View>
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  const renderDateInput = (label, field, minDate = null) => {
    const isDisabled = field === 'dropDate' && !form.pickupDate;
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.inputWrapper, isDisabled && { backgroundColor: '#f0f0f0', opacity: 0.6 }]}
          onPress={() =>
            !isDisabled &&
            setShowDatePicker({
              visible: true,
              field,
              minimumDate: minDate ? new Date(minDate) : null,
            })
          }>
          <Icon name="calendar-today" size={22} color={isDisabled ? '#ccc' : '#666'} style={styles.icon} />
          <Text style={form[field] ? styles.dateText : styles.placeholderText}>
            {form[field] ? form[field] : `Select ${label}`}
          </Text>
        </TouchableOpacity>
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Create Tender</Text>
          <Animated.View style={[styles.formCard, { opacity: fadeAnim }]}>
            {!isReviewing ? (
              <>
                {renderInput('Source Location', 'sourceLocation', 'place')}
                {renderInput('Destination Location', 'destinationLocation', 'place')}
                {renderDateInput('Pickup Date', 'pickupDate')}
                {renderDateInput('Drop Date', 'dropDate', form.pickupDate)}
                {renderInput('Weight (kg)', 'weight', 'scale', 'numeric')}
                {renderInput('Tender Price ₹', 'tenderPrice', 'attach-money', 'numeric')}
                {renderInput('Special Instructions', 'specialInstructions', 'info')}

                {/* Tender Zone Dropdown */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Tender Zone</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={form.tenderZone}
                      onValueChange={value => handleChange('tenderZone', value)}>
                      <Picker.Item label="Select Zone" value="" />
                      <Picker.Item label="North" value="NORTH" />
                      <Picker.Item label="South" value="SOUTH" />
                      <Picker.Item label="East" value="EAST" />
                      <Picker.Item label="West" value="WEST" />
                    </Picker>
                  </View>
                  {errors.tenderZone && <Text style={styles.errorText}>{errors.tenderZone}</Text>}
                </View>

                {/* Broadcast Toggle */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Broadcast to All Zones?</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      form.broadcastToAllZones && { backgroundColor: '#1D4ED8' },
                    ]}
                    onPress={() => handleChange('broadcastToAllZones', !form.broadcastToAllZones)}>
                    <Text
                      style={{
                        color: form.broadcastToAllZones ? '#fff' : '#1D4ED8',
                        fontWeight: '600',
                      }}>
                      {form.broadcastToAllZones ? 'Yes' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.buttonPrimary} onPress={() => setIsReviewing(true)}>
                  <Text style={styles.buttonText}>Review Tender</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View>
                <Text style={styles.reviewTitle}>Review Tender</Text>
                <Text style={styles.reviewItem}>Source: {form.sourceLocation}</Text>
                <Text style={styles.reviewItem}>Destination: {form.destinationLocation}</Text>
                <Text style={styles.reviewItem}>Pickup: {form.pickupDate}</Text>
                <Text style={styles.reviewItem}>Drop: {form.dropDate}</Text>
                <Text style={styles.reviewItem}>Weight: {form.weight} kg</Text>
                <Text style={styles.reviewItem}>Price: ₹{form.tenderPrice}</Text>
                <Text style={styles.reviewItem}>Zone: {form.tenderZone}</Text>
                <Text style={styles.reviewItem}>Broadcast: {form.broadcastToAllZones ? 'Yes' : 'No'}</Text>

                <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Broadcast Tender</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.buttonPrimary, { backgroundColor: '#999', marginTop: 10 }]}
                  onPress={() => setIsReviewing(false)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {showDatePicker.visible && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              minimumDate={showDatePicker.minimumDate || new Date()}
              onChange={handleDateChange}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  inputContainer: { marginBottom: 16 },
  label: { fontWeight: '600', fontSize: 15, marginBottom: 6, color: '#333' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderColor: '#ddd', borderWidth: 1, borderRadius: 10, padding: 10 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10 },
  input: { flex: 1, fontSize: 16 },
  icon: { marginRight: 8 },
  placeholderText: { fontSize: 16, color: '#999' },
  dateText: { fontSize: 16, color: '#000' },
  buttonPrimary: { backgroundColor: '#1D3557', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  toggleButton: { borderWidth: 1, borderColor: '#1D4ED8', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  reviewTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  reviewItem: { fontSize: 16, marginBottom: 6 },
  errorText: { color: 'red', fontSize: 13, marginTop: 4 },
});

export default CreateTenderScreen;
