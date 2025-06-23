import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProfileMenuSheet from '../LSP/ProfileMenuSheet';

const LspDashboardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const companyName = route?.params?.companyName ?? '';
  const userMobile = route?.params?.mobileNumber ?? null;
  const userEmail = route?.params?.email ?? null;

  const [activeTenders, setActiveTenders] = useState([]);
  const [pendingTenders, setPendingTenders] = useState([]);
  const [completedTenders, setCompletedTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const profileMenuRef = useRef(null);

  console.log('Company Name in Dashboard:', companyName);
  console.log('User Mobile:', userMobile);
  console.log('User Email:', userEmail);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res3pl = await fetch('http://10.0.2.2:9090/users/3pl');
        const threePLData = await res3pl.json();

        let active = [];
        let pending = [];
        let completed = [];

        for (const company of threePLData) {
          const activeRes = await fetch('http://10.0.2.2:9090/3PL/tenders/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyName: company.companyName,
              status: 'Active',
            }),
          });
          if (activeRes.ok) {
            const activeData = await activeRes.json();
            active = active.concat(
              activeData.map((tender) => ({ ...tender, companyName: company.companyName }))
            );
          }

          const pendingRes = await fetch('http://10.0.2.2:9090/3PL/tenders/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyName: company.companyName,
              status: 'Pending',
            }),
          });
          if (pendingRes.ok) {
            const pendingData = await pendingRes.json();
            pending = pending.concat(
              pendingData.map((tender) => ({ ...tender, companyName: company.companyName }))
            );
          }

          const completedRes = await fetch('http://10.0.2.2:9090/3PL/tenders/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyName: company.companyName,
              status: 'Completed',
            }),
          });
          if (completedRes.ok) {
            const completedData = await completedRes.json();
            completed = completed.concat(
              completedData.map((tender) => ({ ...tender, companyName: company.companyName }))
            );
          }
        }

        setActiveTenders(active);
        setPendingTenders(pending);
        setCompletedTenders(completed);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => navigation.navigate('Login') },
      ],
      { cancelable: true }
    );
  };

  const renderTenderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('LSPTenderDetails', {
          tender: { ...item, companyName: companyName },
        })
      }
      activeOpacity={0.8}
    >
      <View style={styles.tenderItem}>
        <Text style={styles.tenderTitle}>Tender #{item.tenderNo || 'N/A'}</Text>
        <View style={styles.tenderRow}>
          <Icon name="calendar" size={18} color="#1D3557" />
          <Text style={styles.tenderInfo}>Pickup: {item.pickupDate || 'N/A'}</Text>
        </View>
        <View style={styles.tenderRow}>
          <Icon name="calendar-check" size={18} color="#1D3557" />
          <Text style={styles.tenderInfo}>Drop: {item.dropDate || 'N/A'}</Text>
        </View>
        <View style={styles.tenderRow}>
          <Icon name="currency-inr" size={18} color="#1D3557" />
          <Text style={styles.tenderInfo}>Price: ₹{item.tenderPrice || 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D3557" />
      <View style={styles.header}>
        <Text style={styles.headerText}>LSP Dashboard</Text>
        <TouchableOpacity onPress={() => profileMenuRef.current?.open()} activeOpacity={0.7}>
          <Icon name="account-circle" size={28} color="#fff" style={styles.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="truck-fast-outline" size={28} color="#1D3557" />
            <Text style={styles.statNumber}>{activeTenders.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="truck-fast-outline" size={28} color="#1D3557" />
            <Text style={styles.statNumber}>{pendingTenders.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="check-circle-outline" size={28} color="#1D3557" />
            <Text style={styles.statNumber}>{completedTenders.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <Text style={styles.subHeading}>Active Tenders</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#1D3557" />
        ) : (
          <FlatList
            data={activeTenders}
            renderItem={renderTenderItem}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <ProfileMenuSheet
        ref={profileMenuRef}
        onNavigate={(screen, params) => {
          profileMenuRef.current?.close();
          navigation.navigate(screen, params);
        }}
        onLogout={() => {
          profileMenuRef.current?.close();
          handleLogout();
        }}
        userMobile={userMobile}
        userEmail={userEmail}
      />
    </View>
  );
};

export default LspDashboardScreen;

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
  icon: {
    marginLeft: 20,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#A8DADC',
    marginHorizontal: 5,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D3557',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#1D3557',
  },
  subHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D3557',
    marginBottom: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  tenderItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tenderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D3557',
    marginBottom: 10,
  },
  tenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tenderInfo: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
  },
});
