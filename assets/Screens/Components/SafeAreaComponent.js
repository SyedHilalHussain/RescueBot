import React from 'react';
import { SafeAreaView, View, StatusBar, StyleSheet } from 'react-native';

const SafeAreaComponent = ({ children, backgroundColor }) => {
  return (
    <>
      {/* Status Bar */}
      <StatusBar backgroundColor={backgroundColor || '#FFFFFF'} barStyle="light-content" />

      {/* Safe Area for the Top */}
      <SafeAreaView style={[styles.safeAreaTop, { backgroundColor: backgroundColor || '#FFFFFF' }]} />

      {/* Remaining Content */}
      <View style={styles.container}>{children}</View>
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaTop: {
    flex: 0, // Only for the top part (status bar)
  },
  container: {
    flex: 1, // The main content should occupy the remaining screen
    backgroundColor: '#FFFFFF', // Default background color for the main content
  },
});

export default SafeAreaComponent;
