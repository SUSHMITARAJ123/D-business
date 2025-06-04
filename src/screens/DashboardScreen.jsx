import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
  const route = useRoute();
  const { companyName } = route.params;
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = () => {
    setMenuVisible(false);
    navigation.replace('Login');
  };
  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="#1D3557" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Icon name="menu" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Choose an action to get started</Text> */}

        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={[styles.card, styles.cardBlue]}
            onPress={() => navigation.navigate('CreateTender', { companyName: companyName })}
          >
            <Icon name="add-circle-outline" size={40} color="#00796B" />
            <Text style={styles.cardTitle}>Create Tender</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardGreen]}
            onPress={() => navigation.navigate('CompletedTenderScreen', { companyName })}>
            <Icon name="check-circle" size={40} color="#1E7C31" />
            <Text style={styles.cardTitle}>Completed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardSky]}
           onPress={() => navigation.navigate('OngoingTenderScreen', { companyName })}>
            <Icon name="autorenew" size={40} color="#2563EB" />
            <Text style={styles.cardTitle}>Ongoing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardYellow]}
            onPress={() => navigation.navigate('PendingTenderScreen', { companyName })}>
            <Icon name="schedule" size={40} color="#EAB308" />
            <Text style={styles.cardTitle}>Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.cardYellow]}
            onPress={() => navigation.navigate('LspListScreen', { companyName })}>
            <Icon name="list" size={40} color="#EAB308" />
            <Text style={styles.cardTitle}>LSPs</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Profile');
            }}>
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
  gradient: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 50,
    alignItems: 'center',
    columnGap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    
  },
  subtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    marginBottom: 30,
     marginTop: 10,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 18,
    columnGap: 14,
  },
  card: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 18,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
  },
  cardBlue: {
    backgroundColor: '#E0F2F1',
  },
  cardGreen: {
    backgroundColor: '#E8F5E9',
  },
  cardSky: {
    backgroundColor: '#E3F2FD',
  },
  cardYellow: {
    backgroundColor: '#FFFDE7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    padding: 20,
    width: 180,
    marginTop: 60,
    marginRight: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 10,
  },
  menuItem: {
    fontSize: 16,
    paddingVertical: 10,
    color: '#1D3557',
  },
});

export default DashboardScreen;
