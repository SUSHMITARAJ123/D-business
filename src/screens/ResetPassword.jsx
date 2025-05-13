import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

const ResetPasswordFlow = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [timer]);

  // Password strength checker
  useEffect(() => {
    const evaluateStrength = (pwd) => {
      if (pwd.length < 6) return 'Too short';
      const strongRegex = new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})'
      );
      const mediumRegex = new RegExp(
        '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9])))(?=.{6,})'
      );
      if (strongRegex.test(pwd)) return 'Strong';
      if (mediumRegex.test(pwd)) return 'Medium';
      return 'Weak';
    };

    setPasswordStrength(evaluateStrength(newPassword));
  }, [newPassword]);

  const handleSendOTP = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email.');
    try {
      setIsLoading(true);
      await axios.post('http://10.0.2.2:9090/auth/request-password-reset', { email });
      Alert.alert('Success', 'OTP sent to your email.');
      setStep(2);
      setTimer(60);
    } catch {
      Alert.alert('Error', 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return Alert.alert('Error', 'Enter OTP.');
    try {
      setIsLoading(true);
      await axios.post('http://10.0.2.2:9090/auth/verify-reset-otp', { email, otp });
      Alert.alert('Success', 'OTP verified.');
      setStep(3);
    } catch {
      Alert.alert('Error', 'Invalid OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword)
      return Alert.alert('Error', 'Fill in all fields.');

    if (newPassword !== confirmPassword)
      return Alert.alert('Error', 'Passwords do not match.');

    try {
      setIsLoading(true);
      await axios.post('http://10.0.2.2:9090/auth/reset-password', {
        email,
        newPassword,
        confirmPassword,
      });
      Alert.alert('Success', 'Password reset successfully.');
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      Alert.alert('Error', 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderBackButton = () => (
    <Pressable onPress={() => setStep(step - 1)} style={styles.backButton}>
      <Icon name="arrow-left" size={18} color="#FFF" />
      <Text style={styles.backText}>Back</Text>
    </Pressable>
  );

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <Text style={styles.title}>🔐 Reset Password</Text>

      {/* Step 1: Email */}
      {step === 1 && (
        <>
          <View style={styles.inputWrapper}>
            <Icon name="envelope" size={18} color="#3B82F6" style={styles.icon} />
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <Pressable
            style={[
              styles.button,
              (isLoading || timer > 0) && styles.disabledButton,
            ]}
            onPress={handleSendOTP}
            disabled={isLoading || timer > 0}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {timer > 0 ? `Resend OTP in ${timer}s` : 'Send OTP'}
              </Text>
            )}
          </Pressable>
        </>
      )}

      {/* Step 2: OTP */}
      {step === 2 && (
        <>
          {renderBackButton()}
          <Text style={styles.subtitle}>OTP sent to: {email}</Text>
          <View style={styles.inputWrapper}>
            <Icon name="key" size={18} color="#3B82F6" style={styles.icon} />
            <TextInput
              placeholder="Enter OTP"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={6}
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
            />
          </View>
          <Pressable style={styles.button} onPress={handleVerifyOTP} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </Pressable>
        </>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <>
          {renderBackButton()}
          <Text style={styles.subtitle}>Reset password for {email}</Text>

          <View style={styles.inputWrapper}>
            <Icon name="lock" size={18} color="#3B82F6" style={styles.icon} />
            <TextInput
              placeholder="New Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
          <Text style={styles.strengthText}>Strength: {passwordStrength}</Text>

          <View style={styles.inputWrapper}>
            <Icon name="lock" size={18} color="#3B82F6" style={styles.icon} />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <Pressable
            style={styles.button}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </Pressable>
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#D1D5DB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 54,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 6,
  },
  strengthText: {
    fontSize: 14,
    color: '#FBBF24',
    marginBottom: 10,
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default ResetPasswordFlow;
