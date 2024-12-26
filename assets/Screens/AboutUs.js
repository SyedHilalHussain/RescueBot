import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import SafeAreaComponent from './Components/SafeAreaComponent';

const { width } = Dimensions.get('window');

export default function AboutUsScreen({ navigation }) {
  return (
    <SafeAreaComponent backgroundColor="black">
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Image
            source={require('./assets/logo-rm.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentContainer}>
          
          <Text style={styles.subtitle}>AI-Powered Emergency Response</Text>

          <View style={styles.card}>
           <View style={styles.iconcontainer}><FontAwesome name="plus" size={32} color="red" style={styles.icon} /></View>
            <Text style={styles.cardTitle}>Our Mission</Text>
            <Text style={styles.description}>
              Revolutionizing emergency response through advanced AI technology, 
              providing rapid and accurate assistance when every second counts.
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Support</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>99.9%</Text>
              <Text style={styles.statLabel}>Uptime</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>10s</Text>
              <Text style={styles.statLabel}>Response</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('MainChat')}
          >
            <Text style={styles.buttonText}>Start Emergency Chat</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ScrollView>
    </SafeAreaComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    minHeight: '100%',
  },
  header: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '90%',
    height: "90%",
  },
  contentContainer: {
    padding: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'red',
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    width: width - 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
  },
  statLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 5,
  },
  button: {
    backgroundColor: 'red',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    // marginBottom: 10,
  },
  iconcontainer:{
    width: 50, // Ensure width matches height for a circle
    height: 50, // Ensure height matches width for a circle
    borderRadius: 25, // Half of width/height to make it circular
    padding: 6,
    borderColor: 'white',
    borderWidth: 1,
    justifyContent: 'center', // Center the icon
    alignItems: 'center', // Center the icon
    backgroundColor: 'white',

  }
});