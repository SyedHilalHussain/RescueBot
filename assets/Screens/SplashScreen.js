import React, { useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  ImageBackground,
  Image,
  Easing
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  // Animation values
  const logoScale = new Animated.Value(0.3);
  const logoOpacity = new Animated.Value(0);
  const glowOpacity = new Animated.Value(0.5);
  const glowScale = new Animated.Value(1.2);
  const raysOpacity = new Animated.Value(0);
  const raysScale = new Animated.Value(0.5);

  // // Create multiple ray animations


  useEffect(() => {
    // Complex animation sequence
    Animated.sequence([
      // Initial logo appearance with glow
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.ease, // Changed from elasticOut to bounce
        }),
        // Glow effect
        // Animated.sequence([
        //   Animated.timing(glowOpacity, {
        //     toValue: 1.2,
        //     duration: 1000,
        //     useNativeDriver: true,
        //   }),
        //   Animated.timing(glowScale, {
        //     toValue: 1.2,
        //     duration: 1000,
        //     useNativeDriver: true,
        //   }),
        // ]),
      ]),
      // // Ray animations
   
      // Continuous subtle animation
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowScale, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
              easing: Easing.out(Easing.ease)
            }),
            Animated.timing(glowScale, {
              toValue: 1.1,
              duration: 1200,
              useNativeDriver: true,
              easing: Easing.out(Easing.ease)
            }),
          ])
        ),
      ]),
    ]).start();

    // Navigate after animation
    setTimeout(() => {
      navigation.replace('AboutUs');
    }, 5000);
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./assets/bg3.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.darkOverlay} />
        <View style={styles.redOverlay} />

        <View style={styles.contentWrapper}>
          {/* Rays */}
       

          {/* Glowing logo container */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}>
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.glow,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />
            <View style={styles.logoContainer}>
              <Image
                source={require('./assets/logo-rm.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
  redOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 2,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  logoWrapper: {
    width: width * 1,
    height: width * 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: width,
    backgroundColor: 'transparent',
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 20,
  },
  logoContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 15,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  ray: {
    position: 'absolute',
    width: 2,
    height: width * 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 1,
    transformOrigin: 'bottom',
  },
});