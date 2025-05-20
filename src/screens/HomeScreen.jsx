import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Swiper from 'react-native-swiper';

const { width, height } = Dimensions.get('window');

const images = [
  require('../assets/landingscreens.jpg'),
  // require('../assets/logistics1.jpg'),
  require('../assets/logistics2.jpg'),
  require('../assets/logistics3.jpg'),
  require('../assets/logistics4.jpg'),
  require('../assets/logistics6.jpg'),
  require('../assets/logistics111.jpg'),
  require('../assets/logistics222.jpg'),
  require('../assets/logistics555.jpg'),

];

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Swiper
        autoplay={true}
        autoplayTimeout={3}
        showsPagination={false}
        loop={true}
        removeClippedSubviews={false}
      >
        {images.map((image, index) => (
          <ImageBackground
            key={index}
            source={image}
            style={styles.imageBackground}
            resizeMode="cover"
          >
            <View style={styles.overlay} />
          </ImageBackground>
        ))}
      </Swiper>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.title}>E-Logistics</Text>
        <Text style={styles.subtitle}>
          Delivering your needs across every route.
        </Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.createAccountText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    width: width,
    height: height,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,50,0.4)',
  },
  content: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    paddingHorizontal: 30,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#0C1C2C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createAccountButton: {
    backgroundColor: '#FBB040',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  createAccountText: {
    color: '#0C1C2C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LandingScreen;
