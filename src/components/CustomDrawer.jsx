// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

// const CustomDrawer = (props) => {
//   return (
//     <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
//       <View style={styles.header}>
//         <Icon name="truck-fast" size={40} color="#fff" />
//         <Text style={styles.username}>LSP Panel</Text>
//       </View>

//       <View style={styles.itemsContainer}>
//         <DrawerItemList {...props} />
//         <TouchableOpacity style={styles.logout} onPress={() => alert('Logging out...')}>
//           <Icon name="logout" size={22} color="#fff" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>
//       </View>
//     </DrawerContentScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#1D3557' },
//   header: {
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#fff',
//     alignItems: 'center',
//   },
//   username: {
//     marginTop: 10,
//     fontSize: 18,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   itemsContainer: { flex: 1, paddingTop: 10 },
//   logout: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 15,
//   },
//   logoutText: {
//     marginLeft: 10,
//     fontSize: 16,
//     color: '#fff',
//   },
// });

// export default CustomDrawer;
