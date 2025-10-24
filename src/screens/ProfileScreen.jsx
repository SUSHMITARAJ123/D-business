import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

 
  const mobileNumber = route?.params?.mobileNumber ?? null;
  const email = route?.params?.email ?? null;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userMobile, setUserMobile] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
       
        console.log('Fetching profile for:', { mobileNumber, email });

        if (!mobileNumber && !email) {
          Alert.alert('Error', 'No mobile number or email provided!');
          return;
        }

        const body = mobileNumber ? { mobileNumber } : { email };

        const response = await fetch('http://10.0.2.2:9096/users/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        console.log('API status:', response.status);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Profile data:', data);

        setProfile(data);

      
        setCompanyName(data.companyName || '');
        setUserEmail(data.email || '');
        setUserMobile(data.mobileNumber || '');
        setLocation(data.location || '');

      } catch (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [mobileNumber, email]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => navigation.navigate('Login') },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D3557" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Profile not available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D3557" />

      <View style={styles.header}>
        <Text style={styles.headerText}>My Profile</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleLogout}>
            <Icon name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileItem}>
          <Icon name="account" size={24} color="#1D3557" />
          <Text style={styles.profileText}>{profile.companyName}</Text>
        </View>

        <View style={styles.profileItem}>
          <Icon name="email" size={24} color="#1D3557" />
          <Text style={styles.profileText}>{profile.email}</Text>
        </View>

        <View style={styles.profileItem}>
          <Icon name="phone" size={24} color="#1D3557" />
          <Text style={styles.profileText}>{profile.mobileNumber}</Text>
        </View>

        <View style={styles.profileItem}>
          <Icon name="map-marker" size={24} color="#1D3557" />
          <Text style={styles.profileText}>{profile.location}</Text>
        </View>

        <View style={styles.profileItem}>
          <Icon name="shield-account" size={24} color="#1D3557" />
          <Text style={styles.profileText}>{profile.role}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    backgroundColor: '#1D3557',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileText: {
    marginLeft: 15,
    fontSize: 18,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
  },
});
