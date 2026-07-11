// ─────────────────────────────────────────
// StoreApp.js — Entry point
// ─────────────────────────────────────────
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { theme } from './constants/theme';

import LoginScreen     from './screens/store/LoginScreen';
import DashboardScreen from './screens/store/DashboardScreen';
import CreateDealScreen from './screens/store/CreateDealScreen';
import MyDealsScreen   from './screens/store/MyDealsScreen';
import SettingsScreen  from './screens/store/SettingsScreen';

export const StoreContext = React.createContext({});

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function StoreTabs({ shopName, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.bg, borderTopColor: theme.border, borderTopWidth: 1, paddingBottom: 8, paddingTop: 6, height: 60 },
        tabBarActiveTintColor:   theme.orange,
        tabBarInactiveTintColor: theme.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
      }}
    >
      <Tab.Screen name="Dashboard" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text> }}>
        {() => <DashboardScreen shopName={shopName} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="New Deal" component={CreateDealScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>➕</Text> }} />
      <Tab.Screen name="My Deals" component={MyDealsScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text> }} />
      <Tab.Screen name="Settings" options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text> }}>
        {() => <SettingsScreen shopName={shopName} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function StoreApp() {
  const [shopName,    setShopName]    = useState(null);
  const [activeDeals, setActiveDeals] = useState(1);
  const [deals,       setDeals]       = useState([
    { id: '1', emoji: '☕', title: 'Free Pastry with Any Coffee', type: 'Flash Sale', status: 'live', views: 47, walkins: 6, shares: 12, timer: '5h 47m' },
    { id: '2', emoji: '🥐', title: 'Morning Muffin Deal — 30% Off', type: 'End of Day', status: 'expired', views: 83, walkins: 14, shares: 21, timer: null },
    { id: '3', emoji: '🍵', title: 'Loyalty Reward — Free Tea', type: 'Loyalty', status: 'draft', views: 0, walkins: 0, shares: 0, timer: null },
  ]);

  if (!shopName) {
    return <LoginScreen onLogin={(name) => setShopName(name)} />;
  }

  return (
    <StoreContext.Provider value={{ shopName, deals, setDeals, activeDeals, setActiveDeals }}>
      <NavigationContainer>
        <StoreTabs shopName={shopName} onLogout={() => setShopName(null)} />
      </NavigationContainer>
    </StoreContext.Provider>
  );
}

