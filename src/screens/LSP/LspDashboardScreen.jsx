import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  LayoutAnimation,
  UIManager,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ProfileMenuSheet from '../LSP/ProfileMenuSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LspDashboardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const userMobile = route?.params?.mobileNumber ?? null;
  const userEmail = route?.params?.email ?? null;

  const [activeTenders, setActiveTenders] = useState([]);
  const [pendingTenders, setPendingTenders] = useState([]);
  const [completedTenders, setCompletedTenders] = useState([]);
  const [inprocessTenders, setInprocessTenders] = useState([]);
  const [expandedTenders, setExpandedTenders] = useState({});
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const profileMenuRef = useRef(null);

  const uniqueByTenderNo = (tenders) => {
    const map = new Map();
    for (const tender of tenders) {
      if (!map.has(tender.tenderNo)) {
        map.set(tender.tenderNo, tender);
      }
    }
    return Array.from(map.values());
  };


  const fetchData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const storedCompanyName = await AsyncStorage.getItem('companyName');
      if (!storedCompanyName) {
        console.warn('⚠ No companyName found in AsyncStorage — skipping API call.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('Fetching tenders for:', storedCompanyName);

      const statuses = ['Active', 'Pending', 'Completed', 'INPROCESS'];
      let active = [], pending = [], completed = [], inprocess = [];

      for (const status of statuses) {
        const res = await fetch('http://10.0.2.2:9090/api/lsp/responses/filter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: storedCompanyName, status }),
        });
        
        const storedResults = await AsyncStorage.getItem("bidResults");
const bidResults = storedResults ? JSON.parse(storedResults) : [];
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            const mapped = data.map(tender => {
  const match = bidResults.find(
    b => b.tenderNo === tender.tender_no && b.lspCompanyName === tender.company_name
  );

  return {
    ...tender,
    companyName: storedCompanyName,
    selection_status: match ? match.selection_status : "PENDING",
  };
});

            if (status === 'Active') active = active.concat(mapped);
            else if (status === 'Pending') pending = pending.concat(mapped);
            else if (status === 'Completed') completed = completed.concat(mapped);
           else if (status === 'INPROCESS') inprocess = inprocess.concat(mapped);
          }
        }
      }

      const inprocessMap = new Set(inprocess.map(t => t.tenderNo));
      const filteredActive = active.filter(t => !inprocessMap.has(t.tenderNo));

      setActiveTenders(uniqueByTenderNo(filteredActive));
      setPendingTenders(uniqueByTenderNo(pending));
      setCompletedTenders(uniqueByTenderNo(completed));
      setInprocessTenders(uniqueByTenderNo(inprocess));
    } catch (err) {
      console.error('Error in fetchData:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: () => navigation.navigate('Login') },
    ]);
  };

  const toggleExpand = (tenderNo) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTenders(prev => ({
      ...prev,
      [tenderNo]: !prev[tenderNo],
    }));
  };

  const renderTenderItem = ({ item }) => {
    const isExpanded = expandedTenders[item.tenderNo];

     const handleDetailsPress = () => {
    switch (selectedStatus.toUpperCase()) {
      case 'ACTIVE':
      case 'PENDING':
        navigation.navigate('LSPTenderDetails', { tender: item });
        break;

      case 'COMPLETED':
        Alert.alert("Tender Completed", "✅ This tender has already been completed.");
        break;

      case 'INPROCESS': 
        if (item.selectionStatus === 'CONFIRMED') {
          Alert.alert("Tender Status", "✅ Your bid is accepted and confirmed!");
        } else if (item.selectionStatus === 'REJECTED') {
          Alert.alert("Tender Status", "❌ Not selected this time. Next tender may be yours, keep eye on the notifications.");
        } else {
          Alert.alert("Tender Status", "⏳ Waiting for 3PL response.");
        }
        break;

      default:
        Alert.alert("Status Unknown", "⚠️ Unable to determine the tender status.");
        break;
    }
  };

    return (
      <TouchableOpacity onPress={() => toggleExpand(item.tenderNo)} activeOpacity={0.85}>
        <View style={styles.tenderItem}>
          <Text style={styles.tenderTitle}>Tender #{item.tenderNo}</Text>

          <View style={styles.tenderRow}>
            <Icon name="map-marker" size={18} color="#1D3557" />
            <Text style={styles.tenderInfo}>
              {item.sourceLocation} → {item.destinationLocation}
            </Text>
          </View>

          {isExpanded && (
            <>
              <View style={styles.tenderRow}>
                <Icon name="calendar" size={18} color="#1D3557" />
                <Text style={styles.tenderInfo}>Pickup: {item.pickupDate}</Text>
              </View>

              <View style={styles.tenderRow}>
                <Icon name="calendar-check" size={18} color="#1D3557" />
                <Text style={styles.tenderInfo}>Drop: {item.dropDate}</Text>
              </View>

              <View style={styles.tenderRow}>
                <Icon name="weight-kilogram" size={18} color="#1D3557" />
                <Text style={styles.tenderInfo}>Weight: {item.weight} kg</Text>
              </View>

              <View style={styles.tenderRow}>
                <Icon name="currency-inr" size={18} color="#1D3557" />
                <Text style={styles.tenderInfo}>Price: ₹{item.tenderPrice}</Text>
              </View>
               
               <View style={styles.tenderRow}>
              <Icon name="information" size={18} color="#1D3557" />
              <Text style={styles.tenderInfo}>
                Bid Status: {item.selectionStatus}
              </Text>
            </View>
            
            {selectedStatus.toUpperCase() !== "COMPLETED" && (
              <>
                <TouchableOpacity 
                  onPress={handleDetailsPress} 
                  style={styles.detailsButton}
                >
                  <Text style={styles.detailsButtonText}>View Details</Text>
                </TouchableOpacity>

                {item.selectionStatus === "CONFIRMED" && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("AssignTransporter", { tenderNo: item.tenderNo })}
                    style={[styles.detailsButton, { backgroundColor: "green", marginTop: 8 }]}
                  >
                    <Text style={styles.detailsButtonText}>Assign Vehicles</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

  const getCurrentTenders = () => {
    if (selectedStatus === 'Active') return activeTenders;
    if (selectedStatus === 'Pending') return pendingTenders;
    if (selectedStatus === 'Completed') return completedTenders;
    return inprocessTenders;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D3557" />
      <View style={styles.header}>
        <Text style={styles.headerText}>LSP Dashboard</Text>
        <TouchableOpacity onPress={() => profileMenuRef.current?.open()} activeOpacity={0.7}>
          <Icon name="account-circle" size={28} color="#fff" style={styles.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          {['Active', 'Pending', 'Completed', 'Inprocess'].map((status, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedStatus(status)}
              style={[
                styles.statCard,
                selectedStatus === status && styles.statCardSelected,
              ]}
            >
              <Icon
                name={
                  status === 'Active'
                    ? 'truck-fast-outline'
                    : status === 'Pending'
                    ? 'clock-outline'
                    : status === 'Completed'
                    ? 'check-circle-outline'
                    : 'sync'
                }
                size={28}
                color="#1D3557"
              />
              <Text style={styles.statNumber}>
                {status === 'Active'
                  ? activeTenders.length
                  : status === 'Pending'
                  ? pendingTenders.length
                  : status === 'Completed'
                  ? completedTenders.length
                  : inprocessTenders.length}
              </Text>
              <Text style={styles.statLabel}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1D3557" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={getCurrentTenders()}
            keyExtractor={(item) => item.tenderNo?.toString()}
            renderItem={renderTenderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>
                No {selectedStatus} tenders to display.
              </Text>
            }
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
    backgroundColor: '#F9FAFB', 
  },
  header: {
    backgroundColor: '#1D3557',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#323030ff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  icon: {
    marginLeft: 20,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 18,
    borderColor: '#1D3557',
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#e1e1e1fd',
    shadowColor: '#f0eaeaff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardSelected: {
    borderWidth: 2,
    borderColor: '#1D3557',
    backgroundColor: '#c9e8faff',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1D3557',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  listContainer: {
    paddingBottom: 20,
  },
  tenderItem: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tenderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D3557',
    marginBottom: 12,
  },
  tenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tenderInfo: {
    marginLeft: 8,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  detailsButton: {
    backgroundColor: '#1D3557',
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.4,
  },
});
