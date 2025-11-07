import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Enable LayoutAnimation for Android
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

const LspListScreen = () => {
  const [lspsByZone, setLspsByZone] = useState({});
  const [expandedZones, setExpandedZones] = useState({}); 
  const [expandedLspIndex, setExpandedLspIndex] = useState(null); 

  useEffect(() => {
    axios
      .get('http://10.0.2.2:9090/users/lsp')
      .then((response) => {
        const data = response.data;
        const grouped = data.reduce((acc, lsp) => {
          const zone = lsp.serviceZone || 'N/A';
          if (!acc[zone]) acc[zone] = [];
          acc[zone].push(lsp);
          return acc;
        }, {});
        setLspsByZone(grouped);
      })
      .catch((error) => console.error('API error:', error));
  }, []);

  const toggleZone = (zone) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedZones((prev) => ({ ...prev, [zone]: !prev[zone] }));
  };

  const toggleLsp = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedLspIndex(expandedLspIndex === index ? null : index);
  };

  const renderLspItem = (lsp, index) => {
    const isExpanded = expandedLspIndex === index;
    return (
      <TouchableOpacity onPress={() => toggleLsp(index)} activeOpacity={0.8} key={index}>
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              <Icon name="person" size={18} /> {lsp.name}
            </Text>
            <Icon
              name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={28}
              color="#1D3557"
            />
          </View>

          <Text style={styles.subText}>
            <Icon name="business" size={16} /> {lsp.companyName}
          </Text>

          <Text style={styles.subText}>
            <Icon name="public" size={16} /> Zone: {lsp.serviceZone || 'N/A'}
          </Text>

          {isExpanded && (
            <View style={styles.details}>
              <Text style={styles.detailItem}>
                <Icon name="call" size={16} /> Contact: {lsp.mobileNumber}
              </Text>
              <Text style={styles.detailItem}>
                <Icon name="location-on" size={16} /> Location: {lsp.location || 'N/A'}
              </Text>
              <Text style={styles.detailItem}>
                <Icon name="email" size={16} /> Email: {lsp.email || 'N/A'}
              </Text>
              <Text style={styles.detailItem}>
                <Icon name="info" size={16} /> Description: {lsp.description || 'N/A'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.container}>
      <Text style={styles.header}>LSP Directory by Service Zone</Text>
      <FlatList
        data={Object.keys(lspsByZone)}
        keyExtractor={(zone) => zone}
        renderItem={({ item: zone }) => (
          <View style={{ marginBottom: 16 }}>
            <TouchableOpacity onPress={() => toggleZone(zone)} activeOpacity={0.8}>
              <View style={styles.zoneHeader}>
                <Text style={styles.zoneText}>{zone}</Text>
                <Icon
                  name={expandedZones[zone] ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={28}
                  color="#F1FAEE"
                />
              </View>
            </TouchableOpacity>
            {expandedZones[zone] &&
              lspsByZone[zone].map((lsp, index) => renderLspItem(lsp, index))}
          </View>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#F1FAEE', marginBottom: 20, textAlign: 'center' },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#12294aff',
    padding: 12,
    borderRadius: 12,
  },
  zoneText: { color: '#F1FAEE', fontSize: 18, fontWeight: '700' },
  card: {
    backgroundColor: '#F1FAEE',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1D3557' },
  subText: { fontSize: 14, color: '#457B9D', marginTop: 4 },
  details: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 12 },
  detailItem: { fontSize: 14, color: '#1D3557', marginBottom: 6 },
});

export default LspListScreen;
