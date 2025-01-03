import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SplashScreen from './assets/Screens/SplashScreen';
import AboutUs from './assets/Screens/AboutUs';
import MainChatScreen from './assets/Screens/MainChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AboutUs" 
          component={AboutUs} 
          options={{ headerShown: false }
        
        } 
        />
        <Stack.Screen 
          name="MainChat" 
          component={MainChatScreen} 
          options={{ headerShown: false }}  
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
