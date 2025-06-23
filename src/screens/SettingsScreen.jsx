import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Linking,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function SettingsScreen({ navigation }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => navigation.replace('Login') },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, theme.container]}>
      <Text style={[styles.header, theme.text]}>Settings</Text>

      <View style={[styles.item]}>
        <View style={styles.leftItem}>
          <Icon name="brightness-6" size={24} color={theme.iconColor} />
          <Text style={[styles.label, theme.text]}>Dark Mode</Text>
        </View>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
      </View>

      <View style={styles.item}>
        <View style={styles.leftItem}>
          <Icon name="notifications-active" size={24} color={theme.iconColor} />
          <Text style={[styles.label, theme.text]}>Enable Notifications</Text>
        </View>
        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
      </View>

      <TouchableOpacity
        style={styles.link}
        onPress={() => Linking.openURL('https://www.privacypolicies.com/live/example')}>
        <Icon name="policy" size={24} color={theme.iconColor} />
        <Text style={[styles.label, theme.text]}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => Linking.openURL('https://yourapp.com/terms')}>
        <Icon name="gavel" size={24} color={theme.iconColor} />
        <Text style={[styles.label, theme.text]}>Terms & Conditions</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={() => Linking.openURL('mailto:support@yourapp.com')}>
        <Icon name="support-agent" size={24} color={theme.iconColor} />
        <Text style={[styles.label, theme.text]}>Contact Support</Text>
      </TouchableOpacity>

      <View style={styles.versionBox}>
        <Text style={[styles.version, theme.text]}>App Version: 1.0.0</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Icon name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const lightTheme = {
  container: { backgroundColor: '#fff' },
  text: { color: '#000' },
  iconColor: '#555',
};

const darkTheme = {
  container: { backgroundColor: '#121212' },
  text: { color: '#fff' },
  iconColor: '#ccc',
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leftItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginLeft: 10,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  versionBox: {
    marginTop: 30,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    color: '#999',
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: '#e63946',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
