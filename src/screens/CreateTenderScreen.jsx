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
  Modal,
  SafeAreaView,
} from 'react-native';
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
    deadline: '',
    weight: '',
    tenderPrice: '',
    specialInstructions: '',
    tenderZone: '',
    broadcastToAllZones: false,
  });

  const route = useRoute();
  const { companyName, tender, isEditing } = route.params || {};

  const [isReviewing, setIsReviewing] = useState(false);

  // Date picker state (Android-only custom modal)
  const [showPicker, setShowPicker] = useState(false);
  const [pickerField, setPickerField] = useState('');
  const [afDay, setAfDay] = useState('1');
  const [afMonth, setAfMonth] = useState('1');
  const [afYear, setAfYear] = useState(String(new Date().getFullYear()));

  const [errors, setErrors] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // simple fade in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Prefill when editing
  useEffect(() => {
    if (isEditing && tender) {
      setForm({
        sourceLocation: tender.sourceLocation || '',
        destinationLocation: tender.destinationLocation || '',
        pickupDate: tender.pickupDate || '',
        dropDate: tender.dropDate || '',
        deadline: tender.deadline || '',
        weight: tender.weight ? tender.weight.toString() : '',
        tenderPrice: tender.tenderPrice ? tender.tenderPrice.toString() : '',
        specialInstructions: tender.specialInstructions || '',
        tenderZone: tender.tenderZone || '',
        broadcastToAllZones: tender.broadcastToAllZones || false,
      });
    }
  }, [isEditing, tender]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const openDatePicker = (field) => {
    setPickerField(field);

    const current = form[field] ? new Date(form[field]) : new Date();
    const valid = isNaN(current.getTime()) ? new Date() : current;

    setAfDay(String(valid.getDate()));
    setAfMonth(String(valid.getMonth() + 1));
    setAfYear(String(valid.getFullYear()));

    setShowPicker(true);
  };

  const confirmAndroidFallback = () => {
    const day = parseInt(afDay, 10);
    const month = parseInt(afMonth, 10) - 1; // JS months: 0–11
    const year = parseInt(afYear, 10);

    const constructed = new Date(year, month, day);

    if (isNaN(constructed.getTime())) {
      Alert.alert('Invalid date', 'Please select a valid date.');
      return;
    }

    const formatted = constructed.toISOString().split('T')[0];
    handleChange(pickerField, formatted);
    setShowPicker(false);
  };

  const cancelAndroidFallback = () => {
    setShowPicker(false);
  };

  const validateForm = (isDraft = false) => {
    const newErrors = {};
    const requiredFields = [
      'sourceLocation',
      'destinationLocation',
      'pickupDate',
      'dropDate',
      'weight',
      'tenderPrice',
      // 'tenderZone',
      'deadline',
    ];
    if (!isDraft) {
      requiredFields.forEach(field => {
        if (!form[field]) newErrors[field] = 'This field is required';
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (saveAsDraft) => {
    if (!validateForm(saveAsDraft)) return;
    if (!companyName) {
      Alert.alert('Error', 'Company name not found. Please login again.');
      return;
    }

    try {
      const encodedCompanyName = encodeURIComponent(companyName);
      const url = isEditing
        ? `http://10.0.2.2:9090/3PL/tenders/${tender.tenderNo}`
        : `http://10.0.2.2:9090/3PL/tenders/create?companyName=${encodedCompanyName}`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          weight: parseFloat(form.weight),
          tenderPrice: parseFloat(form.tenderPrice),
          saveAsDraft,
        }),
      });

      if (response.status === 201 || response.status === 200) {
        await response.json(); // if you need it later
        Alert.alert(
          'Success',
          isEditing
            ? 'Tender updated successfully!'
            : saveAsDraft
            ? 'Tender saved as draft successfully'
            : 'Tender published successfully'
        );
        navigation.goBack();
      } else {
        const errorText = await response.text();
        console.error('Server Error:', errorText);
        Alert.alert('Error', 'Failed to save tender');
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

  const renderDateInput = (label, field) => {
    const isDisabled = field === 'dropDate' && !form.pickupDate;
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.inputWrapper,
            isDisabled && { backgroundColor: '#f0f0f0', opacity: 0.6 },
          ]}
          onPress={() => !isDisabled && openDatePicker(field)}
        >
          <Icon name="calendar-today" size={22} color="#666" style={styles.icon} />
          <Text style={form[field] ? styles.dateText : styles.placeholderText}>
            {form[field]
              ? new Date(form[field]).toLocaleDateString()
              : `Select ${label}`}
          </Text>
        </TouchableOpacity>
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  // ---- helpers for options ----
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => String(currentYear + i)); // current .. +10
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  }));

  const daysForMonth = (yearStr, monthStr) => {
    const y = parseInt(yearStr || currentYear, 10);
    const m = parseInt(monthStr || '1', 10); // 1..12
    const max = new Date(y, m, 0).getDate(); // last day of month m
    return Array.from({ length: max }, (_, i) => String(i + 1));
  };

  const dayOptions = daysForMonth(afYear, afMonth);

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Create Tender</Text>
          <Animated.View style={[styles.formCard, { opacity: fadeAnim }]}>
            {!isReviewing ? (
              <>
                {renderInput('Source Location', 'sourceLocation', 'place')}
                {renderInput('Destination Location', 'destinationLocation', 'place')}
                {renderDateInput('Pickup Date', 'pickupDate')}
                {renderDateInput('Drop Date', 'dropDate')}
                {renderInput('Weight (kg)', 'weight', 'scale', 'numeric')}
                {renderInput('Tender Price ₹', 'tenderPrice', 'attach-money', 'numeric')}
                {renderInput('Special Instructions', 'specialInstructions', 'info')}
                {renderDateInput('Bidding Deadline', 'deadline')}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Tender Zone</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={form.tenderZone}
                      onValueChange={value => handleChange('tenderZone', value)}
                    >
                      <Picker.Item label="Select Zone" value="" />
                      <Picker.Item label="North" value="NORTH" />
                      <Picker.Item label="South" value="SOUTH" />
                      <Picker.Item label="East" value="EAST" />
                      <Picker.Item label="West" value="WEST" />
                    </Picker>
                  </View>
                  {/* {errors.tenderZone && (
                    <Text style={styles.errorText}>{errors.tenderZone}</Text>
                  )} */}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Broadcast to All Zones?</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      form.broadcastToAllZones && { backgroundColor: '#1D4ED8' },
                    ]}
                    onPress={() =>
                      handleChange('broadcastToAllZones', !form.broadcastToAllZones)
                    }
                  >
                    <Text
                      style={{
                        color: form.broadcastToAllZones ? '#fff' : '#1D4ED8',
                        fontWeight: '600',
                      }}
                    >
                      {form.broadcastToAllZones ? 'Yes' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.buttonPrimary}
                  onPress={() => setIsReviewing(true)}
                >
                  <Text style={styles.buttonText}>Review Tender</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View>
                <Text style={styles.reviewTitle}>Review Tender</Text>
                {Object.entries(form).map(([key, val]) => (
                  <Text key={key} style={styles.reviewItem}>
                    {`${key}: ${val || '-'}`}
                  </Text>
                ))}

                <TouchableOpacity
                  style={styles.buttonPrimary}
                  onPress={() => handleSubmit(false)}
                >
                  <Text style={styles.buttonText}>Publish Tender</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.buttonPrimary, { backgroundColor: '#F59E0B', marginTop: 10 }]}
                  onPress={() => handleSubmit(true)}
                >
                  <Text style={styles.buttonText}>Save as Draft</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.buttonPrimary, { backgroundColor: '#999', marginTop: 10 }]}
                  onPress={() => setIsReviewing(false)}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Android-only date modal */}
      {Platform.OS === 'android' && (
        <Modal visible={showPicker} animationType="slide" transparent>
          <SafeAreaView style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Date</Text>

              <View style={styles.androidPickersRow}>
                <View style={styles.androidPickerCol}>
                  <Text style={styles.pickerLabel}>Day</Text>
                  <Picker
                    selectedValue={afDay}
                    onValueChange={(v) => setAfDay(v)}
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
                    onValueChange={(v) => setAfMonth(v)}
                    style={styles.picker}
                  >
                    {months.map(m => (
                      <Picker.Item key={m.value} label={m.label} value={m.value} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.androidPickerCol}>
                  <Text style={styles.pickerLabel}>Year</Text>
                  <Picker
                    selectedValue={afYear}
                    onValueChange={(v) => setAfYear(v)}
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
                  style={[styles.modalBtn, { backgroundColor: '#eee' }]}
                  onPress={cancelAndroidFallback}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: '#1D3557' }]}
                  onPress={confirmAndroidFallback}
                >
                  <Text style={{ color: '#fff' }}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 22, paddingBottom: 40 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 22,
    marginTop: 22,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  inputContainer: { marginBottom: 16 },
  label: { fontWeight: '600', fontSize: 15, marginBottom: 6, color: '#333' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  input: { flex: 1, fontSize: 16, padding: 0 },
  icon: { marginRight: 8 },
  placeholderText: { fontSize: 16, color: '#999' },
  dateText: { fontSize: 16, color: '#000' },
  buttonPrimary: {
    backgroundColor: '#1D3557',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  toggleButton: {
    borderWidth: 1,
    borderColor: '#1D4ED8',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reviewTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  reviewItem: { fontSize: 16, marginBottom: 6 },
  errorText: { color: 'red', fontSize: 13, marginTop: 4 },

  // Modal styles (responsive)
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  androidPickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  androidPickerCol: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: { fontSize: 12, color: '#555', marginBottom: 4 },
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
    padding: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default CreateTenderScreen;
