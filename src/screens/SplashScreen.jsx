import React, { useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0); 
  const scaleAnim = new Animated.Value(0); 
  const bounceAnim = new Animated.Value(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home'); 
    }, 6000);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(),

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start(),

      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(),
    ]);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient 
      colors={['#1D3557', '#457B9D']} 
      style={styles.container}
    >
      <Animated.View 
        style={[styles.videoContainer, { transform: [{ scale: scaleAnim }] }]} 
      >
        <Video
          source={require('../assets/truck.mp4')}  
          style={styles.video}
          resizeMode="cover"
          repeat
          muted
          paused={false}
        />
      </Animated.View>

      <Animated.View 
        style={[styles.textContainer, { opacity: fadeAnim, transform: [{ scale: bounceAnim }] }]} // Apply bounce and fade effect to text
      >
        <Text style={styles.title}>E-Logistics Tendering</Text>
        <Text style={styles.subtitle}>Streamline your logistics operations</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10, 
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginVertical: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
});

export default SplashScreen;
