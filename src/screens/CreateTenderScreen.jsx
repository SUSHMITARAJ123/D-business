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

const CreateTenderScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    sourceLocation: '',
    destinationLocation: '',
    pickupDate: '',
    dropDate: '',
    weight: '',
    tenderPrice: '',
    specialInstructions: '',
  });
  
  const route = useRoute();
 const { companyName } = route.params;
  const [isReviewing, setIsReviewing] = useState(false);
const [showDatePicker, setShowDatePicker] = useState({
  visible: false,
  field: '',
  minimumDate: null,  // added to hold the min selectable date
});

  const [errors, setErrors] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const fetchCompanyName = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) setCompanyName(name);
      } catch (error) {
        console.error('Error fetching companyName:', error);
      }
    };

    fetchCompanyName();
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
const response = await fetch(`http://10.0.2.2:9090/3PL/tenders/create?companyName=${encodedCompanyName}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    sourceLocation: form.sourceLocation,
    destinationLocation: form.destinationLocation,
    pickupDate: form.pickupDate,
    dropDate: form.dropDate,
    weight: parseFloat(form.weight),
    tenderPrice: parseFloat(form.tenderPrice),
    specialInstructions: form.specialInstructions,
  }),
});
      console.log('response during creating tender',response);
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
        });
        setIsReviewing(false);

        navigation.navigate('TenderDetails', { tender: tenderData });
      } else {
        const errorText = await response.text();
        console.error('Server Error:', errorText);
        Alert.alert('Error', 'Failed to create tenders');
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

const renderPickupDateInput = () => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Pickup Date</Text>
    <TouchableOpacity
      style={styles.inputWrapper}
      onPress={() => setShowDatePicker({ visible: true, field: 'pickupDate', minimumDate: null })}
    >
      <Icon name="calendar-today" size={22} color="#666" style={styles.icon} />
      <Text style={form.pickupDate ? styles.dateText : styles.placeholderText}>
        {form.pickupDate ? form.pickupDate : 'Select Pickup Date'}
      </Text>
    </TouchableOpacity>
    {errors.pickupDate && <Text style={styles.errorText}>{errors.pickupDate}</Text>}
  </View>
);

const renderDropDateInput = () => {
  const isDisabled = !form.pickupDate;
  const minDate = form.pickupDate ? new Date(form.pickupDate) : null;

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Drop Date</Text>
      <TouchableOpacity
        style={[
          styles.inputWrapper,
          isDisabled && { backgroundColor: '#f0f0f0', opacity: 0.6 },
        ]}
        onPress={() => {
          if (!isDisabled) {
            setShowDatePicker({ visible: true, field: 'dropDate', minimumDate: minDate });
          }
        }}
        activeOpacity={isDisabled ? 1 : 0.7}
      >
        <Icon
          name="calendar-today"
          size={22}
          color={isDisabled ? '#ccc' : '#666'}
          style={styles.icon}
        />
        <Text style={form.dropDate ? styles.dateText : styles.placeholderText}>
          {form.dropDate ? form.dropDate : 'Select Drop Date'}
        </Text>
      </TouchableOpacity>
      {errors.dropDate && <Text style={styles.errorText}>{errors.dropDate}</Text>}
    </View>
  );
};


  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Create Tender</Text>
          <Animated.View style={[styles.formCard, { opacity: fadeAnim }]}>
            {!isReviewing ? (
              <>
                <View style={styles.section}>
                  {renderInput('Source Location', 'sourceLocation', 'place')}
                  {renderInput('Destination Location', 'destinationLocation', 'place')}
                </View>
            <View style={styles.section}>
  {renderPickupDateInput()}
  {renderDropDateInput()}
</View>

                <View style={styles.section}>
                  {renderInput('Weight (kg)', 'weight', 'scale', 'numeric')}
                  {renderInput('Tender Price (INR)', 'tenderPrice', 'attach-money', 'numeric')}
                  {renderInput('Special Instructions', 'specialInstructions', 'info')}
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
                <Text style={styles.reviewItem}>Pickup Date: {form.pickupDate}</Text>
                <Text style={styles.reviewItem}>Drop Date: {form.dropDate}</Text>
                <Text style={styles.reviewItem}>Weight: {form.weight} kg</Text>
                <Text style={styles.reviewItem}>Price: ₹{form.tenderPrice}</Text>
                <Text style={styles.reviewItem}>Instructions: {form.specialInstructions}</Text>

                <View style={{ marginTop: 20 }}>
                  <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Submit Tender</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.buttonPrimary, { backgroundColor: '#999', marginTop: 10 }]}
                    onPress={() => setIsReviewing(false)}>
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>

          {showDatePicker.visible && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 30,
     marginBottom: 10,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  section: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 6,
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: 4,
  },
  reviewTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
    color: '#111827',
  },
  reviewItem: {
    fontSize: 16,
    marginBottom: 6,
    color: '#444',
  },
  buttonPrimary: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateTenderScreen;
