import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const SignupScreen = () => {
  const [userType, setUserType] = useState(null);
  const [companyName, setCompanyname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const validateFields = () => {
    const newErrors = {};
    if (!companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!password.trim()) newErrors.password = 'Password is required';
    if (!address.trim()) newErrors.address = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateFields()) return;
   
    
    const payload = {
      companyName: companyName,
      email,
      mobileNumber: mobile,
      location: address,
      role: userType, 
      password,
    };

    console.log('Signup Payload:', {
      companyName,
      email,
      mobileNumber: mobile,
      location: address,
      role: userType,
      password,
    });

   


    try {
      setLoading(true);
  
      const response = await fetch('http://10.0.2.2:9090/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
   console.log('response',response);
      const rawText = await response.text();
      let data;
  
      // try {
      //   data = JSON.parse(rawText);
      // } catch (parseError) {
      //   console.error('JSON Parse Error:', parseError);
      //   Alert.alert('Server Error', 'Invalid response from the server.');
      //   setLoading(false);
      //   return;
      // }
  
      setLoading(false);
  
      if (response.status === 201) {
        Alert.alert('Success', 'OTP sent successfully.', [
          {
            text: 'OK',
            onPress: () =>
              navigation.navigate('OtpVerification', {
                companyName,
                email,
                mobile,
                userType,
              }),
          },
        ]);
      } else {
        Alert.alert('Signup Failed');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Unable to connect to the server.');
      console.error('Signup error:', error);
    }
  
  };
    

  const renderError = (field) =>
    errors[field] && <Text style={styles.error}>{errors[field]}</Text>;

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {!userType ? (
            <>
              <Text style={styles.header}>Get Started</Text>
              <Text style={styles.subHeader}>Choose your role:</Text>

              <Pressable
                style={[styles.selectButton, userType === '3PL' && styles.selected]}
                onPress={() => setUserType('3PL')}
              >
                <Text style={styles.selectText}>🚛 3rd Party Logistic</Text>
              </Pressable>

              <Pressable
                style={[styles.selectButton, userType === 'LSP' && styles.selected]}
                onPress={() => setUserType('LSP')}
              >
                <Text style={styles.selectText}>🏢 Logistic Service Provider</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.header}>Create Account</Text>
              <Text style={styles.subHeader}>
                {userType === '3PL' ? '3rd Party Logistics' : 'Logistic Service Provider'}
              </Text>

              <View style={styles.inputBox}>
                <Text style={styles.label}>👤 Company Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your company name"
                  placeholderTextColor="#999"
                  value={companyName}
                  onChangeText={(text) => {
                    setCompanyname(text);
                    setErrors((prev) => ({ ...prev, companyName: '' }));
                  }}
                />
                {renderError('username')}
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.label}>📧 Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                />
                {renderError('email')}
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.label}>📱 Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={mobile}
                  onChangeText={(text) => {
                    setMobile(text);
                    setErrors((prev) => ({ ...prev, mobile: '' }));
                  }}
                />
                {renderError('mobile')}
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.label}>🔒 Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                />
                {renderError('password')}
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.label}>📍 Location</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter your location"
                  placeholderTextColor="#999"
                  multiline
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                />
                {renderError('address')}
              </View>

              <Pressable style={styles.button} onPress={handleSignup} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#1D3557" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => setUserType(null)}
                style={{ marginTop: 20, alignItems: 'center' }}
              >
                <Text style={styles.backLink}>← Back</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: '#DCEFFF',
    textAlign: 'center',
    marginBottom: 25,
  },
  selectButton: {
    backgroundColor: '#ffffff22',
    paddingVertical: 16,
    borderRadius: 14,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A8DADC',
  },
  selected: {
    backgroundColor: '#457B9D',
    borderColor: '#F1FAEE',
  },
  selectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1FAEE',
  },
  inputBox: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    color: '#000',
  },
  textArea: {
    textAlignVertical: 'top',
    height: 80,
  },
  button: {
    backgroundColor: '#F1FAEE',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#1D3557',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#FFCDD2',
    fontSize: 13,
    marginTop: 4,
  },
  backLink: {
    fontSize: 14,
    color: '#F1FAEE',
    fontWeight: '500',
  },
});

export default SignupScreen;
