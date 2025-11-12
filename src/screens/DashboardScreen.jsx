import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Modal, Switch, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
  const route = useRoute();
  const { companyName, mobileNumber: userMobile, email: userEmail } = route.params;
  const [menuVisible, setMenuVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [tenderStats, setTenderStats] = useState({
    total: 0, ongoing: 0, completed: 0, pending: 0, drafted: 0,
  });

  const fetchTendersByStatus = async (status) => {
    try {
      const res = await fetch('http://10.0.2.2:9090/3PL/tenders/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, status }),
      });
      const text = await res.text();
      if (!text) return 0;
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn(`${status} tenders: Non-JSON response →`, text);
        return 0;
      }
      return Array.isArray(data) ? data.length : 0;
    } catch (err) {
      console.error(`${status} tenders fetch error:`, err);
      return 0;
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const [ongoing, completed, pending, drafted] = await Promise.all([
        fetchTendersByStatus('Active'),
        fetchTendersByStatus('Completed'),
        fetchTendersByStatus('Pending'),
        fetchTendersByStatus('Draft'),
      ]);
      setTenderStats({
        ongoing, completed, pending, drafted,
        total: ongoing + completed + pending + drafted,
      });
      setLoading(false);
    };
    loadStats();
  }, []);

  const handleLogout = () => {
    setMenuVisible(false);
    navigation.replace('Login');
  };

  const features = [
    { title: 'Create Tender', icon: 'add-circle-outline', color: '#2563EB', screen: 'CreateTender' },
    { title: 'Drafted Tenders', icon: 'drafts', color: '#7C3AED', screen: 'DraftedTenderScreen' },
    { title: 'Ongoing Tenders', icon: 'autorenew', color: '#0284C7', screen: 'OngoingTenderScreen' },
    { title: 'Completed Tenders', icon: 'check-circle', color: '#059669', screen: 'CompletedTenderScreen' },
    { title: 'Pending Tenders', icon: 'schedule', color: '#D97706', screen: 'PendingTenderScreen' },
    { title: 'LSP List', icon: 'list', color: '#DC2626', screen: 'LspListScreen' },
  ];

  const theme = darkMode
    ? {
        background: ['#0F172A', '#1E293B'],
        text: '#F1F5F9',
        card: '#1E293B',
        shadow: '#000',
      }
    : {
        background: ['#1D3557', '#264A7F'],
        text: '#FFFFFF',
        card: '#FFFFFF',
        shadow: '#000',
      };

  return (
    <LinearGradient colors={theme.background} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background[0]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Icon name="menu" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Welcome, {companyName}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('BidsNotificationScreen')}>
            <Icon name="notifications-none" size={26} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Profile', {
                mobileNumber: userMobile,
                email: userEmail,
              })
            }>
            <Icon name="person-outline" size={28} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scroll Content */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text> */}

        {loading ? (
          <ActivityIndicator size="large" color="#ffffffff" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.statsRow}>
            {[
              { label: 'Total', value: tenderStats.total },
              { label: 'Ongoing', value: tenderStats.ongoing },
              { label: 'Completed', value: tenderStats.completed },
              { label: 'Pending', value: tenderStats.pending },
              { label: 'Drafted', value: tenderStats.drafted },
            ].map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Actions</Text>

        {features.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.featureCard, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
            onPress={() => navigation.navigate(item.screen, { companyName })}>
            <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
              <Icon name={item.icon} size={26} color="#fff" />
            </View>
            <Text style={[styles.featureText, { color: darkMode ? '#F1F5F9' : '#1E293B' }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, { backgroundColor: darkMode ? '#1E293B' : '#FFFFFF' }]}>
            <Text style={[styles.menuTitle, { color: darkMode ? '#F1F5F9' : '#1E293B' }]}>Settings</Text>
            <View style={styles.toggleRow}>
              <Text style={[styles.menuItem, { color: darkMode ? '#CBD5E1' : '#1E293B' }]}>Dark Mode</Text>
              <Switch value={darkMode} onValueChange={setDarkMode} />
            </View>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Profile', { mobileNumber: userMobile, email: userEmail });
              }}>
              <Text style={[styles.menuItem, { color: darkMode ? '#CBD5E1' : '#1E293B' }]}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={[styles.menuItem, { color: '#DC2626', fontWeight: '600' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 22, fontWeight: '600', marginLeft: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  sectionTitle: { fontSize: 18, fontWeight: '700', marginVertical: 10, opacity: 0.9 },

  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    backgroundColor: '#f6f9fbff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  statLabel: { fontSize: 14, color: '#475569', marginTop: 4 },

  featureCard: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureText: { fontSize: 18, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    padding: 18,
    width: 200,
    marginTop: 60,
    marginRight: 16,
    borderRadius: 10,
    elevation: 8,
  },
  menuTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  menuItem: { fontSize: 18, paddingVertical: 8 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

export default DashboardScreen;
