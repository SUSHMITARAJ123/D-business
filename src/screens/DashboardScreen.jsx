import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
  const route = useRoute();
  const { companyName } = route.params;
  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor="#1D3557" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Choose an action to get started</Text>

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
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
     marginTop: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    marginBottom: 30,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    rowGap: 18,
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
});

export default DashboardScreen;
