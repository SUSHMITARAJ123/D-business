import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';

const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:9090' : 'http://localhost:9090';

const DraftedTenderScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { companyName } = route.params || {};
  const [draftedTenders, setDraftedTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  //Fetch drafted tenders on mount & when returning from edit screen
  useFocusEffect(
    React.useCallback(() => {
      if (companyName) fetchDraftedTenders();
    }, [companyName])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  //Fetch drafted tenders
  const fetchDraftedTenders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/3PL/tenders/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, status: 'DRAFT' }),
      });

      if (response.status === 404) {
        setDraftedTenders([]);
        return;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setDraftedTenders(data);
    } catch (error) {
      console.error('Error fetching drafted tenders:', error);
      Alert.alert('Error', 'Could not load drafted tenders. Please check your network or server.');
    } finally {
      setLoading(false);
    }
  };

  // Publish Tender
  const publishTender = async (tenderNo) => {
    try {
      setPublishing(true);
      const response = await fetch(`${BASE_URL}/3PL/tenders/drafts/${tenderNo}/publish`, {
        method: 'PUT',
      });

      if (response.ok) {
        Alert.alert('Success', 'Tender published successfully!');
        fetchDraftedTenders();
      } else if (response.status === 404) {
        Alert.alert('Not Found', 'Tender not found or already published.');
      } else {
        Alert.alert('Error', `Failed to publish tender (${response.status}).`);
      }
    } catch (error) {
      console.error('Error publishing tender:', error);
      Alert.alert('Error', 'Something went wrong while publishing the tender.');
    } finally {
      setPublishing(false);
    }
  };

  // Delete Tender
  const deleteTender = async (tenderNo) => {
    Alert.alert('Delete Tender', 'Are you sure you want to delete this drafted tender?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            const response = await fetch(`${BASE_URL}/3PL/tenders/drafts/${tenderNo}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              Alert.alert('Deleted', 'Tender deleted successfully.');
              fetchDraftedTenders();
            } else {
              Alert.alert('Error', `Failed to delete tender (${response.status}).`);
            }
          } catch (error) {
            console.error('Error deleting tender:', error);
            Alert.alert('Error', 'Something went wrong while deleting the tender.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  //Navigate to Edit Tender 
  const editTender = (tender) => {
    navigation.navigate('CreateTender', {
      tender,
      isEditing: true,
      companyName,
    });
  };

  //Render each tender card
  const renderTender = ({ item }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <LinearGradient colors={['#f9fafaff', '#fff']} style={styles.cardGradient}>
        <View style={styles.cardHeader}>
          <Icon name="file-document-edit-outline" size={22} color="#1D3557" />
          <Text style={styles.tenderNo}>{item.tenderNo}</Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.text}>
            <Icon name="map-marker" size={14} /> From: {item.sourceLocation}
          </Text>
          <Text style={styles.text}>
            <Icon name="map-marker-outline" size={14} /> To: {item.destinationLocation}
          </Text>
          <Text style={styles.text}>
            <Icon name="calendar" size={14} /> Pickup: {item.pickupDate}
          </Text>
          <Text style={styles.text}>
            <Icon name="calendar-check" size={14} /> Drop: {item.dropDate}
          </Text>
          <Text style={styles.text}>
            <Icon name="map-legend" size={14} /> Zone: {item.tenderZone}
          </Text>
          <Text style={[styles.text, styles.priceText]}>
            <Icon name="currency-inr" size={14} /> {item.tenderPrice}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionButton, { backgroundColor: '#cb6e75ff' }]}
            disabled={deleting}
            onPress={() => deleteTender(item.tenderNo)}>
            <Icon name="delete-outline" color="#fff" size={18} />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionButton, { backgroundColor: '#F4A261' }]}
            onPress={() => editTender(item)}>
            <Icon name="pencil-outline" color="#fff" size={18} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionButton, { backgroundColor: '#1D3557' }]}
            disabled={publishing}
            onPress={() => publishTender(item.tenderNo)}>
            <Icon name="upload-outline" color="#fff" size={18} />
            <Text style={styles.actionText}>{publishing ? '...' : 'Publish'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading drafted tenders...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Drafted Tenders</Text>
        <View style={styles.headerLine} />
      </View>

      {draftedTenders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="file-cancel-outline" size={80} color="#fff" />
          <Text style={styles.noData}>No drafted tenders found</Text>
        </View>
      ) : (
        <FlatList
          data={draftedTenders}
          keyExtractor={(item) => item.tenderNo}
          renderItem={renderTender}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 40 },
  headerContainer: { alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerLine: {
    width: 80,
    height: 3,
    backgroundColor: '#e0e6e6ff',
    marginTop: 6,
    borderRadius: 10,
  },
  list: { paddingBottom: 50 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  cardGradient: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tenderNo: { fontWeight: '700', fontSize: 18, color: '#1D3557', marginLeft: 6 },
  cardContent: { marginBottom: 12 },
  text: { fontSize: 15, color: '#333', marginVertical: 2 },
  priceText: { fontWeight: 'bold', color: '#1D3557', marginTop: 4 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 4,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  noData: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 10,
  },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 15 },
});

export default DraftedTenderScreen;
