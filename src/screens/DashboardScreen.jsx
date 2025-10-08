import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Modal, Switch, Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
  const route = useRoute();
  const { companyName, mobileNumber: userMobile, email: userEmail } = route.params;
  const [menuVisible, setMenuVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  

  const [tenderStats, setTenderStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    pending: 0,
  });

  const fetchTendersByStatus = async (status) => {
  try {
    const res = await fetch('http://10.0.2.2:9090/3PL/tenders/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName, status }),
    });


    if (res.status === 404) {
      const text = await res.text();
      console.info(`${status} tenders: ${text}`); 
      return 0;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`${status} tenders: Server error ${res.status} - ${errorText}`);
      return 0;
    }

    const text = await res.text();
    if (!text) return 0;

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn(`${status} tenders: Unexpected non-JSON response →`, text);
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
      const ongoing = await fetchTendersByStatus('Active');
      const completed = await fetchTendersByStatus('Completed');
      const pending = await fetchTendersByStatus('Pending');

      setTenderStats({
        ongoing,
        completed,
        pending,
        total: ongoing + completed + pending,
      });
    };

    loadStats();
  }, []);

  const handleLogout = () => {
    setMenuVisible(false);
    navigation.replace('Login');
  };

  const features = [
    { title: 'Create Tender', icon: 'add-circle-outline', color: '#34D399', screen: 'CreateTender' },
    { title: 'Completed Tenders', icon: 'check-circle', color: '#22D3EE', screen: 'CompletedTenderScreen' },
    { title: 'Ongoing Tenders', icon: 'autorenew', color: '#60A5FA', screen: 'OngoingTenderScreen' },
    { title: 'Pending Tenders', icon: 'schedule', color: '#FBBF24', screen: 'PendingTenderScreen' },
    { title: 'LSP List', icon: 'list', color: '#F87171', screen: 'LspListScreen' },
  ];

  const themeStyles = darkMode
    ? {
        background: ['#0F172A', '#1E293B'],
        text: '#F8FAFC',
        card: '#1E293B',
        shadowColor: '#000',
      }
    : {
        background: ['#1D3557', '#457B9D'],
        text: '#fff',
        card: '#fff',
        shadowColor: '#000',
      };

  return (
    <LinearGradient colors={themeStyles.background} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor={themeStyles.background[0]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Icon name="menu" size={30} color={themeStyles.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeStyles.text }]}>
          Welcome, {companyName}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('BidsNotificationScreen')}>
  <Icon name="notifications" size={26} color={themeStyles.text} />
</TouchableOpacity>

          <TouchableOpacity>
            <TouchableOpacity onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Profile', {
  mobileNumber: userMobile,
  email: userEmail,
});
            }}>
            <Icon name="person" size={30} color={themeStyles.text} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </View>

      {/* Real-time Stats */}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.statsRow}>
          {[
            { label: 'Total Tenders', value: tenderStats.total, color: '#4ADE80' },
            { label: 'Ongoing', value: tenderStats.ongoing, color: '#60A5FA' },
            { label: 'Completed', value: tenderStats.completed, color: '#22D3EE' },
            { label: 'Pending', value: tenderStats.pending, color: '#FACC15' },
          ].map((stat, idx) => (
            <View key={idx} style={[styles.statCard, { backgroundColor: themeStyles.card, shadowColor: themeStyles.shadowColor }]}>
              <Text style={[styles.statValue, { color: darkMode ? '#F8FAFC' : '#1E3A8A' }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: darkMode ? '#CBD5E1' : '#374151' }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: themeStyles.text }]}>Your Actions</Text>

        {features.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.featureCard, { backgroundColor: themeStyles.card, shadowColor: themeStyles.shadowColor }]}
            onPress={() => navigation.navigate(item.screen, { companyName })}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
              <Icon name={item.icon} size={28} color="#fff" />
            </View>
            <Text style={[styles.featureText, { color: darkMode ? '#F8FAFC' : '#1F2937' }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal for menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Settings</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.menuItem}>Dark Mode</Text>
              <Switch value={darkMode} onValueChange={setDarkMode} />
            </View>
            <TouchableOpacity onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Profile', {
            mobileNumber: userMobile,
            email: userEmail,
          });
        }}
      >
              <Text style={styles.menuItem}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.menuItem}>Logout</Text>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    marginLeft: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  iconBtn: {
    padding: 4,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  featureCard: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    padding: 20,
    width: 200,
    marginTop: 60,
    marginRight: 16,
    borderRadius: 10,
    elevation: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  menuItem: {
    fontSize: 16,
    paddingVertical: 10,
    color: '#1D3557',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  statCard: {
    width: '47%',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default DashboardScreen;
