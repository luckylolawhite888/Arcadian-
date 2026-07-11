// ─────────────────────────────────────────
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { theme } from './constants/theme';

import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen       from './screens/HomeScreen';
import MapScreen        from './screens/MapScreen';
import SavedScreen      from './screens/SavedScreen';
import AlertsScreen     from './screens/AlertsScreen';
import DealDetailScreen from './screens/DealDetailScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// Shared saved/followed state — in production replace with Context or Redux
export const AppContext = React.createContext({});

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bg,
          borderTopColor:  theme.border,
          borderTopWidth:  1,
          paddingBottom:   8,
          paddingTop:      6,
          height:          60,
        },
        tabBarActiveTintColor:   theme.orange,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
      }}
    >
      <Tab.Screen name="Home"   component={HomeStack}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text> }} />
      <Tab.Screen name="Map"    component={MapScreen}  options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text> }} />
      <Tab.Screen name="Saved"  component={SavedScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⭐</Text> }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔔</Text>, tabBarBadge: 2 }} />
    </Tab.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Feed"   component={HomeScreen} />
      <Stack.Screen name="Detail" component={DealDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [saved,        setSaved]        = useState(new Set());
  const [followed,     setFollowed]     = useState(new Set());

  if (!hasOnboarded) {
    return <OnboardingScreen onDone={() => setHasOnboarded(true)} />;
  }

  return (
    <AppContext.Provider value={{ saved, setSaved, followed, setFollowed }}>
      <NavigationContainer>
        <HomeTabs />
      </NavigationContainer>
    </AppContext.Provider>
  );
}

