import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

const LspListScreen = () => {
  const [lsps, setLsps] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const rotationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    axios
      .get('http://10.0.2.2:9090/users/lsp')
      .then((response) => setLsps(response.data))
      .catch((error) => console.error('API error:', error));
  }, []);

  const animateArrow = (expand) => {
    Animated.timing(rotationAnim, {
      toValue: expand ? 1 : 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const toggleExpand = (index) => {
    const willExpand = expandedIndex !== index;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(willExpand ? index : null);
    animateArrow(willExpand);
  };

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const renderItem = ({ item, index }) => {
    const isExpanded = expandedIndex === index;

    return (
      <TouchableOpacity
        onPress={() => toggleExpand(index)}
        activeOpacity={0.8}
      >
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              <Icon name="person" size={18} /> {item.name}
            </Text>
            <Animated.View style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}>
              <Icon name="keyboard-arrow-down" size={28} color="#1D3557" />
            </Animated.View>
          </View>

          <Text style={styles.subText}>
            <Icon name="business" size={16} /> {item.companyName}
          </Text>

          {isExpanded && (
            <View style={styles.details}>
              <Text style={styles.detailItem}>
                <Icon name="call" size={16} /> Contact: {item.mobileNumber}
              </Text>
              <Text style={styles.detailItem}>
                <Icon name="location-on" size={16} /> Location:{' '}
                {item.location || 'N/A'}
              </Text>
              <Text style={styles.detailItem}>
                <Icon name="email" size={16} /> email:{' '}
                {item.email || 'N/A'}
              </Text>
              <Text style={styles.detailItem}>
                <Icon name="info" size={16} /> Description:{' '}
                {item.description || 'N/A'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#1D3557', '#457B9D']}
      style={styles.container}
    >
      <Text style={styles.header}>LSP Directory</Text>
      <FlatList
        data={lsps}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No LSPs found.</Text>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F1FAEE',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#F1FAEE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D3557',
  },
  subText: {
    fontSize: 14,
    color: '#457B9D',
    marginTop: 4,
  },
  details: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 12,
  },
  detailItem: {
    fontSize: 14,
    color: '#1D3557',
    marginBottom: 6,
  },
  emptyText: {
    color: '#F1FAEE',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default LspListScreen;
