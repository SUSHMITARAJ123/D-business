import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Linking, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function SettingsScreen({ navigation }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.item}>
        <Icon name="brightness-6" size={24} color="#555" />
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
      </View>

      <View style={styles.item}>
        <Icon name="notifications-active" size={24} color="#555" />
        <Text style={styles.label}>Enable Notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
      </View>

      <TouchableOpacity style={styles.link} onPress={() => Linking.openURL('https://yourapp.com/privacy')}>
        <Icon name="policy" size={24} color="#555" />
        <Text style={styles.label}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => Linking.openURL('https://yourapp.com/terms')}>
        <Icon name="gavel" size={24} color="#555" />
        <Text style={styles.label}>Terms & Conditions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => Linking.openURL('mailto:support@yourapp.com')}>
        <Icon name="support-agent" size={24} color="#555" />
        <Text style={styles.label}>Contact Support</Text>
      </TouchableOpacity>

      <View style={styles.versionBox}>
        <Text style={styles.version}>App Version: 1.0.0</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.replace('Login')}>
        <Icon name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  item: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: { fontSize: 16, marginLeft: 10 },
  link: {
    flexDirection: 'row',
    // alignItems: 'center',
    marginBottom: 15,
  },
  versionBox: { marginTop: 30, alignItems: 'center' },
  version: { fontSize: 14, color: '#999' },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: '#e63946',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
  },
  logoutText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
});
