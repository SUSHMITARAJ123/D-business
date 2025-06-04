import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, TouchableOpacity, ScrollView, Platform
} from 'react-native';
import { Card } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native'; 

const LspDashboardScreen = () => {
  const navigation = useNavigation(); 

  const [activeTenders, setActiveTenders] = useState([]);
  const [threePLList, setThreePLList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenderId, setSelectedTenderId] = useState(null);

  const fetchData = async () => {
    try {
      const res3pl = await fetch('http://10.0.2.2:9090/users/3pl');
      if (!res3pl.ok) throw new Error('Failed to fetch 3PLs');
      const threePLData = await res3pl.json();
      setThreePLList(threePLData);

      const tenderPromises = threePLData.map(async (company) => {
        const res = await fetch('http://10.0.2.2:9090/3PL/tenders/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: company.companyName,
            status: 'Active',
          }),
        });

        if (!res.ok) return [];

        const tenders = await res.json();
        return tenders.map((tender) => ({
          ...tender,
          companyName: company.companyName,
        }));
      });

      const allTendersNested = await Promise.all(tenderPromises);
      const allTenders = allTendersNested.flat();
      setActiveTenders(allTenders);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const DashboardStatCard = ({ icon, label, value, bgColor }) => (
    <LinearGradient colors={[bgColor, '#1D3557']} style={styles.statCard}>
      <Icon name={icon} size={36} color="#fff" />
      <View style={{ marginLeft: 16 }}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </LinearGradient>
  );

  const renderTenderItem = ({ item }) => {
    const isSelected = selectedTenderId === item.id;
    return (
      <TouchableOpacity
        onPress={() => setSelectedTenderId(isSelected ? null : item.id)}
        activeOpacity={0.8}
      >
        <Card style={[styles.card, isSelected && styles.cardSelected]} elevation={3}>
          <Card.Content>
            <View style={styles.tenderHeader}>
              <Text style={styles.title}>Tender #{item.tenderNo}</Text>
              <View style={styles.companyBadge}>
                <Icon name="domain" size={16} color="#fff" />
                <Text style={styles.companyName}>{item.companyName}</Text>
              </View>
            </View>
            <Text style={styles.detail}>{item.sourceLocation} → {item.destinationLocation}</Text>
            {isSelected && (
              <View style={styles.expanded}>
                <Text style={styles.detail}><Text style={styles.bold}>Pickup:</Text> {item.pickupDate}</Text>
                <Text style={styles.detail}><Text style={styles.bold}>Drop:</Text> {item.dropDate}</Text>
                <Text style={styles.detail}><Text style={styles.bold}>Weight:</Text> {item.weight} kg</Text>
                <Text style={styles.detail}><Text style={styles.bold}>Instructions:</Text> {item.specialInstructions || 'None'}</Text>
                <Text style={styles.detail}><Text style={styles.bold}>Price:</Text> ₹{item.tenderPrice}</Text>
                <Text style={styles.detail}><Text style={styles.bold}>Created:</Text> {new Date(item.createdAt).toLocaleString()}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const render3PLItem = ({ item }) => (
    <Card style={styles.companyCard} elevation={2}>
      <Card.Content>
        <Text style={styles.companyTitle}>{item.companyName}</Text>
        <View style={styles.infoRow}>
          <Icon name="email-outline" size={18} color="#1D3557" />
          <Text style={styles.detail}> {item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="phone-outline" size={18} color="#1D3557" />
          <Text style={styles.detail}> {item.mobileNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="map-marker-outline" size={18} color="#1D3557" />
          <Text style={styles.detail}> {item.location || 'N/A'}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      { text: 'Logout', onPress: () => console.log('Logging out...') }
    ]);
  };

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.dashboardTitle}>LSP Dashboard</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.7}>
            <Icon name="account-circle" size={28} color="#fff" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
            <Icon name="cog" size={28} color="#fff" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7}>
            <Icon name="logout" size={28} color="#fff" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <DashboardStatCard icon="clipboard-list" label="Active Tenders" value={activeTenders.length} bgColor="blue" />
          <DashboardStatCard icon="warehouse" label="3PL Companies" value={threePLList.length} bgColor="#2a9d8f" />
        </View>

        <Text style={styles.sectionTitle}>Active Tenders</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
        ) : activeTenders.length > 0 ? (
          <FlatList
            data={activeTenders}
            keyExtractor={(item) => `tender-${item.id}`}
            renderItem={renderTenderItem}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        ) : (
          <Text style={styles.noData}>No active tenders found.</Text>
        )}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>3PL Companies</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
        ) : threePLList.length > 0 ? (
          <FlatList
            data={threePLList}
            keyExtractor={(item, index) => `3pl-${index}`}
            renderItem={render3PLItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        ) : (
          <Text style={styles.noData}>No 3PL companies found.</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(4, 4, 4, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  dashboardTitle: {
    marginTop: 30,
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.2,
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 30,
  },
  icon: {
    marginLeft: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 16,
    elevation: 4,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff' ,
  },
  statLabel: {
    fontSize: 14,
    color: '#f0f0f0',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 14,
  },
  noData: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 17,
    marginVertical: 20,
    fontStyle: 'italic',
  },
  card: {
    marginBottom: 14,
    backgroundColor: '#ffffffee',
    borderRadius: 14,
  },
  cardSelected: {
    borderColor: 'blue',
    borderWidth: 2,
  },
  tenderHeader: {
    marginBottom: 8,
  },
  companyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#457B9D',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 6,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D3557',
  },
  detail: {
    fontSize: 14,
    color: '#2a2a2a',
    marginBottom: 4,
    lineHeight: 20,
  },
  expanded: {
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
  },
  bold: {
    fontWeight: '700',
  },
  companyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  companyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1D3557',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(243, 239, 239, 0.3)',
    marginVertical: 28,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
});

export default LspDashboardScreen;
