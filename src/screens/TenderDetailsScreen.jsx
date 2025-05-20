import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const TenderDetailsScreen = ({ route }) => {
  const { tender } = route.params;

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Tender Details</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Tender Number</Text>
          <Text style={styles.value}>{tender.tenderNo}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Source Location</Text>
          <Text style={styles.value}>{tender.sourceLocation}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Destination Location</Text>
          <Text style={styles.value}>{tender.destinationLocation}</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.halfWidth]}>
            <Text style={styles.label}>Pickup Date</Text>
            <Text style={styles.value}>{tender.pickupDate}</Text>
          </View>
          <View style={[styles.card, styles.halfWidth]}>
            <Text style={styles.label}>Drop Date</Text>
            <Text style={styles.value}>{tender.dropDate}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.halfWidth]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <Text style={styles.value}>{tender.weight}</Text>
          </View>
          <View style={[styles.card, styles.halfWidth]}>
            <Text style={styles.label}>Tender Price (₹)</Text>
            <Text style={styles.value}>{tender.tenderPrice}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Special Instructions</Text>
          <Text style={styles.value}>{tender.specialInstructions || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.card, styles.halfWidth]}>
            <Text style={styles.label}>Status</Text>
            <Text
              style={[
                styles.value,
                tender.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive,
              ]}
            >
              {tender.status}
            </Text>
          </View>
          <View style={[styles.card, styles.halfWidth]}>
            <Text style={styles.label}>Created By</Text>
            <Text style={styles.value}>{tender.createdBy}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Created At</Text>
          <Text style={styles.value}>{new Date(tender.createdAt).toLocaleString()}</Text>
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
    padding: 25,
    //paddingBottom: 10,
  },
  screenTitle: {
    fontSize: 25,
    marginTop: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 11,
    marginBottom: 12,
    // Shadow for iOS
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // shadowOffset: { width: 0, height: 4 },
   // elevation: 4,
  },
  label: {
    fontSize: 12,
    color: '#777',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 15,
    color: '#2A2A2A',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  statusActive: {
    color: '#2a9d8f',
    fontWeight: '800',
  },
  statusInactive: {
    color: '#e63946',
    fontWeight: '700',
  },
});

export default TenderDetailsScreen;
