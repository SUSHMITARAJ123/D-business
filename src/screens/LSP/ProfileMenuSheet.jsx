import React, { forwardRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Modalize } from 'react-native-modalize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileMenuSheet = forwardRef(({ onNavigate, onLogout, userMobile, userEmail }, ref) => (
  <Modalize ref={ref} adjustToContentHeight handleStyle={{ backgroundColor: '#1D3557' }}>
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.item}
        onPress={() =>
          onNavigate('Profile', {
            mobileNumber: userMobile,
            email: userEmail,
          })
        }
      >
        <Icon name="account" size={22} color="#1D3557" />
        <Text style={styles.text}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => onNavigate('Settings')}>
        <Icon name="cog-outline" size={22} color="#1D3557" />
        <Text style={styles.text}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => onNavigate('MyBids')}>
        <Icon name="clipboard-list-outline" size={22} color="#1D3557" />
        <Text style={styles.text}>My Bids</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={onLogout}>
        <Icon name="logout" size={22} color="#d00000" />
        <Text style={[styles.text, { color: '#d00000' }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  </Modalize>
));

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  text: {
    fontSize: 16,
    marginLeft: 16,
    color: '#1D3557',
    fontWeight: '600',
  },
});

export default ProfileMenuSheet;
