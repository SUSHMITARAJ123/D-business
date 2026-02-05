import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

const BidsNotificationScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.heading}>Bids Notifications</Text>
      <View style={styles.messageContainer}>
        <Text style={styles.message}>No notifications available</Text>
      </View>
    </View>
  );
};

export default BidsNotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1D3557',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
