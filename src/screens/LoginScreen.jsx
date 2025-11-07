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
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [method, setMethod] = useState('mobile');
  const [mobileMode, setMobileMode] = useState('password');
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = async () => {
  if (!input.trim()) {
    Alert.alert('Error', `Please enter your ${method}.`);
    return;
  }

  if ((method === 'email' || (method === 'mobile' && mobileMode === 'password')) && !password.trim()) {
    Alert.alert('Error', 'Please enter your password.');
    return;
  }

  try {
    let response, text, data;

    if (method === 'email') {
      response = await fetch('http://10.0.2.2:9090/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input.trim(), password: password.trim() }),
      });

      data = await response.json();
      console.log("📥 Email login response:", data);

      if (response.status === 200 && data.role && data.companyName) {
        await AsyncStorage.setItem('companyName', data.companyName);
        navigation.replace(
          data.role === 'LSP' ? 'LspDashboardScreen' : 'Dashboard',
          { companyName: data.companyName, email: input.trim() }
        );
      } else {
        Alert.alert('Error', 'Invalid email or password.');
      }

    } else if (method === 'mobile') {
      if (mobileMode === 'password') {
        response = await fetch('http://10.0.2.2:9090/auth/login-with-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobileNumber: input.trim(), password: password.trim() }),
        });

        text = await response.text();
        console.log("📥 Mobile login response text:", text);

        if (text.toLowerCase().includes('login successful')) {
          const roleMatch = text.match(/Welcome\s+([A-Z_]+)!/);
          const companyMatch = text.match(/Company:\s*(.+)/);

          const role = roleMatch ? roleMatch[1] : null;
          const companyName = companyMatch ? companyMatch[1].trim() : null;

          if (role && companyName) {
            await AsyncStorage.setItem('companyName', companyName);
            const mobileNumber = input.trim();

            if (role === 'LSP') {
              navigation.replace('LspDashboardScreen', { companyName, mobileNumber });
            } else if (role === 'THREE_PL') {
              navigation.replace('Dashboard', { companyName, mobileNumber });
            } else {
              Alert.alert('Error', `Unrecognized role: ${role}`);
            }
          } else {
            Alert.alert('Error', 'Login failed: role or company not found.');
          }

        } else {
          Alert.alert('Error', text);
        }

      } else {
        // OTP login flow
        response = await fetch('http://10.0.2.2:9090/auth/login-with-mobile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobileNumber: input.trim() }),
        });

        if (response.status === 200) {
          Alert.alert('OTP Sent', `OTP sent to ${input.trim()}`, [
            {
              text: 'OK',
              onPress: () => navigation.navigate('SignInOtpVerification', { method, input: input.trim() }),
            },
          ]);
        } else {
          Alert.alert('Error', 'Failed to send OTP');
        }
      }
    }
  } catch (error) {
    console.error('⚠️ Login Error:', error);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
};


  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View style={styles.card}>
            <Text style={styles.loginTitle}>Welcome Back</Text>
            <Text style={styles.loginSubtitle}>Login using mobile or email</Text>

            {/* Toggle between Mobile & Email */}
            <View style={styles.toggleContainer}>
              <Pressable
                style={[styles.toggle, method === 'mobile' && styles.activeToggle]}
                onPress={() => {
                  setMethod('mobile');
                  setPassword('');
                }}
              >
                <Text style={[styles.toggleText, method === 'mobile' && styles.activeText]}>📱 Mobile</Text>
              </Pressable>

              <Pressable
                style={[styles.toggle, method === 'email' && styles.activeToggle]}
                onPress={() => {
                  setMethod('email');
                  setMobileMode('password');
                }}
              >
                <Text style={[styles.toggleText, method === 'email' && styles.activeText]}>📧 Email</Text>
              </Pressable>
            </View>

            {/* Common input field */}
            <TextInput
              style={styles.input}
              placeholder={`Enter your ${method}`}
              placeholderTextColor="#bbb"
              keyboardType={method === 'mobile' ? 'phone-pad' : 'email-address'}
              value={input}
              onChangeText={setInput}
            />

            {/* Password input for email */}
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

            {/* Mobile password input */}
            {method === 'mobile' && mobileMode === 'password' && (
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#bbb"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            )}

           {/* Mobile toggle & Forgot Password */}
{method === 'mobile' && (
  <View style={styles.rowContainer}>
    <Pressable onPress={() => setMobileMode(mobileMode === 'password' ? 'otp' : 'password')}>
      <Text style={styles.resetText}>
        {mobileMode === 'password' ? 'Login with OTP ' : 'Login with Password '}
      </Text>
    </Pressable>

    {/* Show Forgot Password ONLY if in password mode */}
    {mobileMode === 'password' && (
      <Pressable onPress={() => navigation.navigate('ResetPassword')}>
        <Text style={styles.resetText1}>Forgot Password?</Text>
      </Pressable>
    )}
  </View>
)}


            <Pressable style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>{method === 'mobile' && mobileMode === 'otp' ? 'Send OTP' : 'Login'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  loginTitle: { fontSize: 24, textAlign: 'center', fontWeight: '800', color: '#1D3557', marginBottom: 8 },
  loginSubtitle: { fontSize: 14, textAlign: 'center', color: '#6b7280', marginBottom: 20 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  toggle: { paddingVertical: 10, paddingHorizontal: 22, marginHorizontal: 6, borderWidth: 1.5, borderRadius: 20, borderColor: '#94a3b8', backgroundColor: '#f1f5f9' },
  activeToggle: { backgroundColor: '#1D3557', borderColor: '#1D3557' },
  toggleText: { fontSize: 15, fontWeight: '600', color: '#1D3557' },
  activeText: { color: '#fff' },
  input: { backgroundColor: '#f8fafc', borderColor: 'black', borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 15, marginBottom: 14, color: '#000' },
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resetText: { color: '#1D4ED8', fontWeight: '600', fontSize: 14 },
  resetText1: { color: '#1D4ED8', fontWeight: '600', fontSize: 13 },
  button: { backgroundColor: '#F1FAEE', paddingVertical: 14, borderRadius: 30, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  buttonText: { color: '#1D3557', fontWeight: '700', fontSize: 16 },
});

export default LoginScreen;
