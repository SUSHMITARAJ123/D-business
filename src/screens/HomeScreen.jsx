import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import SearchBar from '../components/SearchBar';
import BusinessFlowCard from '../components/BusinessCard';

const HomeScreen = ({navigation}) => {
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>D-Business: Let's Get Digital</Text>
        <Text style={styles.subtitle}>
          Elevate your business with digital transformation.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar />
      </View>

      {/* Business Flow Section */}
      <View style={styles.card}>
        <BusinessFlowCard />
      </View>

      {/* Buttons */}
      <Pressable
        onPress={() => navigation.navigate('Signup')}
        style={({pressed}) => [
          styles.primaryButton,
          pressed && styles.buttonPressed,
        ]}>
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>

      {/* Log In Button */}
      <Pressable
        onPress={() => navigation.navigate('Login')}
        style={({pressed}) => [
          styles.secondaryButton,
          pressed && styles.buttonPressed,
        ]}>
        <Text style={styles.buttonText}>Log In</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    backgroundColor: '#00796B',
    paddingVertical: 40,
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1.1,
  },
  subtitle: {
    fontSize: 14,
    color: '#D1E8FF',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 28,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButton: {
    backgroundColor: '#00796B',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: '#00796B',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#374151',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.7,
  },
});

export default HomeScreen;
