import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ProfileScreen() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Sushmita Raj',
    company: 'LogiTrack Pvt Ltd',
    email: 'sushmita@example.com',
    phone: '9876543210',
    location: 'Muzaffarpur, Bihar',
  });

  const handleEditToggle = () => setEditing(!editing);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Image style={styles.avatar} source={{ uri: 'https://i.pravatar.cc/300' }} /> */}
      <TouchableOpacity style={styles.editBtn} onPress={handleEditToggle}>
        <Icon name={editing ? "check" : "pencil"} size={20} color="#fff" />
        <Text style={styles.editText}>{editing ? "Save" : "Edit Profile"}</Text>
      </TouchableOpacity>

      {Object.entries(profile).map(([key, value]) => (
        <View key={key} style={styles.field}>
          <Text style={styles.label}>{key.toUpperCase()}</Text>
          {editing && key !== 'email' && key !== 'company' ? (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={(text) => setProfile({ ...profile, [key]: text })}
            />
          ) : (
            <Text style={styles.value}>{value}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5a67d8',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  editText: { color: '#fff', marginLeft: 8 },
  field: { width: '100%', marginBottom: 15 },
  label: { fontSize: 12, color: '#999' },
  value: { fontSize: 16, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
});


// import React, { useEffect, useState } from 'react';
// import {
//   View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// export default function ProfileScreen() {
//   const [editing, setEditing] = useState(false);
//   const [profile, setProfile] = useState(null);
//   const [userRole, setUserRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchProfile = async () => {
//     try {
//       const token = await AsyncStorage.getItem('authToken');
//       const role = await AsyncStorage.getItem('userRole');
//       setUserRole(role);

//       let endpoint = '';
//       if (role === '3PL') endpoint = '/3PL/profile';
//       else if (role === 'LSP') endpoint = '/LSP/profile';
//       else if (role === 'Admin') endpoint = '/admin/profile';
//       else throw new Error('Invalid role');

//       const response = await fetch(`http://10.0.2.2:9090${endpoint}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await response.json();
//       setProfile(data);
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Failed to load profile');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateProfile = async () => {
//     try {
//       const token = await AsyncStorage.getItem('authToken');
//       let endpoint = userRole === '3PL' ? '/3PL/profile' :
//                      userRole === 'LSP' ? '/LSP/profile' :
//                      '/admin/profile';

//       const response = await fetch(`http://10.0.2.2:9090${endpoint}`, {
//         method: 'PUT',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(profile),
//       });

//       if (!response.ok) throw new Error("Failed to update");

//       Alert.alert("Success", "Profile updated");
//       setEditing(false);
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Failed to update profile');
//     }
//   };

//   const handleEditToggle = () => {
//     if (editing) updateProfile();
//     else setEditing(true);
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   if (loading || !profile) return <Text style={{ marginTop: 40 }}>Loading...</Text>;

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <TouchableOpacity style={styles.editBtn} onPress={handleEditToggle}>
//         <Icon name={editing ? "check" : "pencil"} size={20} color="#fff" />
//         <Text style={styles.editText}>{editing ? "Save" : "Edit Profile"}</Text>
//       </TouchableOpacity>

//       {Object.entries(profile).map(([key, value]) => (
//         <View key={key} style={styles.field}>
//           <Text style={styles.label}>{key.toUpperCase()}</Text>
//           {editing && key !== 'email' && key !== 'role' ? (
//             <TextInput
//               style={styles.input}
//               value={value}
//               onChangeText={(text) => setProfile({ ...profile, [key]: text })}
//             />
//           ) : (
//             <Text style={styles.value}>{value}</Text>
//           )}
//         </View>
//       ))}
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   editBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#5a67d8',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 20,
//     alignSelf: 'center',
//   },
//   editText: { color: '#fff', marginLeft: 8 },
//   field: { marginBottom: 15 },
//   label: { fontSize: 12, color: '#999' },
//   value: { fontSize: 16, color: '#333' },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 10,
//     fontSize: 16,
//     color: '#333',
//   },
// });

