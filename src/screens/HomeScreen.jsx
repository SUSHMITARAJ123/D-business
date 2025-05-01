import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  const bounceAnim = new Animated.Value(0);

  useEffect(() => {
    // Text bounce animation for the title and brand
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0.9,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Video Section */}
      <View style={styles.topContainer}>
        <Video
          source={require('../assets/truck.mp4')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          repeat
          muted
          playWhenInactive={false}
          playInBackground={false}
          ignoreSilentSwitch="obey"
        />
        <LinearGradient
          colors={['rgba(27, 27, 77, 0.8)', 'rgba(10, 10, 157, 0)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Bottom Gradient Section */}
      <LinearGradient colors={['#1D3557', '#457B9D']} style={styles.bottomContainer}>
        <Animated.View style={[styles.textContainer, { transform: [{ scale: bounceAnim }] }]}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.brand}>E-Logistics</Text>
          <Text style={styles.subtitle}>Delivering your needs across every route.</Text>
        </Animated.View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topContainer: {
    flex: 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    flex: 0.85,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    //paddingVertical: 40,
    //paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  brand: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: 'white',
    width: width * 0.7,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#1D3557', 
    fontSize: 17,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'orange',
    borderColor: 'orange',
    borderWidth: 2,
    width: width * 0.7,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1D3557', // Navy Blue
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default LandingScreen;
