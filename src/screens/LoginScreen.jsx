import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const LoginScreen = ({ navigation }) => {
  const [method, setMethod] = useState('mobile');
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = async () => {
    if (!input.trim()) {
      Alert.alert('Error', `Please enter your ${method}.`);
      return;
    }

    if (method === 'email' && !password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    try {
      if (method === 'email') {
        // console.log('inside if')
        // Email & Password
        const response = await fetch('http://10.0.2.2:9090/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: input,
            password: password,
          }),
        });
        //  console.log('response',response);
        // const data = await response.json();

        if (response.ok) {
          Alert.alert('Success', 'Login successful!');
          navigation.navigate('Dashboard');
        } else {
          Alert.alert('Login Failed', 'Invalid credentials');
        }
      } else {
        // Mobile Login -> Send OTP
        const response = await fetch('http://10.0.2.2:9090/auth/login-with-mobile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mobileNumber: input }),
        });

        console.log('response',response);
        if (response.status===200) {
          Alert.alert('OTP Sent', `OTP has been sent to ${input}`);
          navigation.navigate('SignInOtpVerification', { method, input });
        } else {
          Alert.alert('Error', 'Failed to send OTP');
        }
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={styles.card}>
            <Text style={styles.loginTitle}>Welcome Back</Text>
            <Text style={styles.loginSubtitle}>Login using mobile or email</Text>

            <View style={styles.toggleContainer}>
              <Pressable
                style={[styles.toggle, method === 'mobile' && styles.activeToggle]}
                onPress={() => {
                  setMethod('mobile');
                  setPassword('');
                }}
              >
                <Text style={[styles.toggleText, method === 'mobile' && styles.activeText]}>
                  📱 Mobile
                </Text>
              </Pressable>

              <Pressable
                style={[styles.toggle, method === 'email' && styles.activeToggle]}
                onPress={() => setMethod('email')}
              >
                <Text style={[styles.toggleText, method === 'email' && styles.activeText]}>
                  📧 Email
                </Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder={`Enter your ${method}`}
              placeholderTextColor="#bbb"
              keyboardType={method === 'mobile' ? 'phone-pad' : 'email-address'}
              value={input}
              onChangeText={setInput}
            />

            {method === 'email' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#bbb"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => navigation.navigate('ResetPassword')}>
                  <Text style={styles.resetText}>Forgot Password?</Text>
                </Pressable>
              </>
            )}

            <Pressable style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>
                {method === 'email' ? 'Login' : 'Send OTP'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    margin: 20,
    borderRadius: 25,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  loginTitle: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: '800',
    color: '#1D3557',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggle: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginHorizontal: 6,
    borderWidth: 1.5,
    borderRadius: 20,
    borderColor: '#94a3b8',
    backgroundColor: '#f1f5f9',
  },
  activeToggle: {
    backgroundColor: '#1D3557',
    borderColor: '#1D3557',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D3557',
  },
  activeText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: 'black',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 14,
    color: '#000',
  },
  resetText: {
    textAlign: 'right',
    color: '#1D4ED8',
    fontWeight: '600',
    marginBottom: 14,
    fontSize: 13,
  },
  button: {
    backgroundColor: '#F1FAEE',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#1D3557',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default LoginScreen;
