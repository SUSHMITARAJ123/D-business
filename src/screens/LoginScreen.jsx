import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ImageBackground,
  Dimensions,
} from 'react-native';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [method, setMethod] = useState('mobile');
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
    if (!input.trim()) {
      Alert.alert('Error', `Please enter your ${method}.`);
      return;
    }

    if (method === 'email') {
      if (!password.trim()) {
        Alert.alert('Error', 'Please enter your password.');
        return;
      }

      Alert.alert('Success', `Logged in with email: ${input}`);
    } else {
      navigation.navigate('SignInOtpVerification', { method, input });
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/logobg.png')}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Welcome to E-Logistics</Text>
        </View>
      </ImageBackground>

      <View style={styles.formContainer}>
        <Text style={styles.header}>Login With</Text>

        <View style={styles.toggleContainer}>
          <Pressable
            style={[styles.toggle, method === 'mobile' && styles.active]}
            onPress={() => {
              setMethod('mobile');
              setPassword('');
            }}
          >
            <Text style={[styles.toggleText, method === 'mobile' && styles.activeText]}>
              Mobile
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toggle, method === 'email' && styles.active]}
            onPress={() => {
              setMethod('email');
            }}
          >
            <Text style={[styles.toggleText, method === 'email' && styles.activeText]}>
              Email
            </Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          placeholder={`Enter your ${method}`}
          keyboardType={method === 'mobile' ? 'phone-pad' : 'email-address'}
          value={input}
          onChangeText={setInput}
        />

{method === 'email' && (
  <>
    <TextInput
      style={styles.input}
      placeholder="Enter your password"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00796B',
  },
  imageBackground: {
    height: height * 0.58,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toggle: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 8,
    borderColor: 'black',
  },
  active: {
    backgroundColor: '#2563EB',
  },
  toggleText: {
    fontSize: 15,
    color: 'black',
    fontWeight: '600',
  },
  activeText: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  resetText: {
    color: '#2563EB',
    textAlign: 'right',
    marginBottom: 20,
    fontWeight: '600',
  },
  
});

export default LoginScreen;
