// ============================================================
// OUT & ABOUT — CONSUMER USER APP
// React Native / Expo
// File structure:
//   App.js (this file — entry point + navigation)
//   screens/OnboardingScreen.js
//   screens/HomeScreen.js
//   screens/MapScreen.js
//   screens/DealDetailScreen.js
//   screens/SavedScreen.js
//   screens/AlertsScreen.js
//   constants/deals.js
//   constants/theme.js
// ============================================================

// ─────────────────────────────────────────
// constants/theme.js
// ─────────────────────────────────────────
export const theme = {
  bg:      '#0D0D0D',
  card:    '#1A1A1A',
  card2:   '#222222',
  border:  '#2C2C2C',
  orange:  '#FF5C00',
  orange2: '#FF8C42',
  text:    '#F0EAE0',
  muted:   '#777777',
  green:   '#2ECC71',
  red:     '#E74C3C',
  yellow:  '#F5C518',
  blue:    '#4A9EFF',
};

// ─────────────────────────────────────────
// constants/deals.js
// ─────────────────────────────────────────
export const DEALS = [
  {
    id: '1',
    emoji: '☕',
    title: 'Free Pastry with Any Coffee',
    shop: 'The Coffee Spot',
    address: '12 High Street, NW10',
    category: 'Food & Drink',
    type: 'Flash Sale',
    desc: 'Grab any hot or iced coffee today and get a free pastry on us. Fresh croissants and muffins. Today only — while stocks last. Show this screen at the counter.',
    distance: '0.2mi',
    distanceNum: 0.2,
    timerSecs: 2832,
    redemptions: 6,
    urgency: 'high',
    lat: 51.5322,
    lng: -0.2356,
    bgColor: '#1a0f00',
  },
  {
    id: '2',
    emoji: '✂️',
    title: '50% Off All Haircuts',
    shop: 'Blades Barbers',
    address: '8 Market Lane, NW10',
    category: 'Beauty',
    type: 'Flash Sale',
    desc: 'Flash sale on all cuts — buzz, fade, or full style. No appointment needed. Just walk in and mention Out & About at the till.',
    distance: '0.4mi',
    distanceNum: 0.4,
    timerSecs: 4324,
    redemptions: 3,
    urgency: 'medium',
    lat: 51.5318,
    lng: -0.2341,
    bgColor: '#0a1a0a',
  },
  {
    id: '3',
    emoji: '🍕',
    title: 'Buy 1 Get 1 Free Pizza Slices',
    shop: 'Slice & Dice',
    address: '22 High Street, NW10',
    category: 'Food & Drink',
    type: 'Happy Hour',
    desc: 'Happy hour is on. Buy any slice and get the next one free. Mix and match toppings. Show this screen at the counter.',
    distance: '0.6mi',
    distanceNum: 0.6,
    timerSecs: 13500,
    redemptions: 11,
    urgency: 'low',
    lat: 51.5310,
    lng: -0.2370,
    bgColor: '#0d0d1a',
  },
  {
    id: '4',
    emoji: '💆',
    title: '30% Off All Treatments',
    shop: 'Serenity Beauty',
    address: '5 Park Road, NW10',
    category: 'Beauty',
    type: 'Today Only',
    desc: 'Book any treatment today and get 30% off. Facials, massages, manicures and more. Mention Out & About when you arrive.',
    distance: '0.8mi',
    distanceNum: 0.8,
    timerSecs: 19200,
    redemptions: 4,
    urgency: 'low',
    lat: 51.5330,
    lng: -0.2380,
    bgColor: '#1a0a0a',
  },
  {
    id: '5',
    emoji: '👟',
    title: '20% Off All Footwear',
    shop: 'StepUp Shoes',
    address: '40 High Street, NW10',
    category: 'Retail',
    type: 'Weekend Deal',
    desc: 'Weekend-only deal on our entire footwear range. Trainers, boots, sandals — 20% off everything. No code needed, just show this screen.',
    distance: '1.1mi',
    distanceNum: 1.1,
    timerSecs: 28800,
    redemptions: 9,
    urgency: 'low',
    lat: 51.5305,
    lng: -0.2345,
    bgColor: '#0a0d1a',
  },
];

// ─────────────────────────────────────────
// App.js  — Navigation root
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
          paddingBottom:   24  // extra padding for phone nav bar,
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

// ─────────────────────────────────────────
// screens/OnboardingScreen.js
// ─────────────────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import { theme } from '../constants/theme';

export default function OnboardingScreen({ onDone }) {
  const handleAllow = async () => {
    await Location.requestForegroundPermissionsAsync();
    onDone();
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.logoWrap}>
          <Text style={s.logo}>OUT<Text style={s.amp}>&</Text>{'\n'}ABOUT</Text>
          <Text style={s.tagline}>Deals from shops near you.{'\n'}Walk in. Save. Simple.</Text>
        </View>

        <View style={s.permBox}>
          <Text style={s.permIcon}>📍</Text>
          <Text style={s.permTitle}>We need your location</Text>
          <Text style={s.permDesc}>
            So we can show you deals from shops within walking distance — not deals in another city.
          </Text>
        </View>

        <View style={s.actions}>
          <TouchableOpacity style={s.btnPrimary} onPress={handleAllow}>
            <Text style={s.btnPrimaryText}>Allow Location & Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDone}>
            <Text style={s.skipText}>Browse without location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: theme.bg },
  container:   { flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: 28, paddingTop: 60 },
  logoWrap:    { alignItems: 'center' },
  logo:        { fontSize: 72, fontWeight: '900', color: '#fff', lineHeight: 66, letterSpacing: -2, textAlign: 'center' },
  amp:         { color: theme.orange },
  tagline:     { color: theme.muted, fontSize: 16, textAlign: 'center', marginTop: 16, lineHeight: 24 },
  permBox:     { backgroundColor: theme.card, borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
  permIcon:    { fontSize: 36, marginBottom: 10 },
  permTitle:   { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 8 },
  permDesc:    { fontSize: 13, color: theme.muted, textAlign: 'center', lineHeight: 20 },
  actions:     { width: '100%', gap: 14 },
  btnPrimary:  { backgroundColor: theme.orange, borderRadius: 50, padding: 16, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  skipText:    { color: theme.muted, fontSize: 13, textAlign: 'center' },
});

// ─────────────────────────────────────────
// screens/HomeScreen.js
// ─────────────────────────────────────────
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, Share,
} from 'react-native';
import { theme } from '../constants/theme';
import { DEALS } from '../constants/deals';
import { AppContext } from '../App';

const FILTERS = ['All Deals', '☕ Food & Drink', '✂️ Beauty', '🛍️ Retail', '💪 Fitness', '🎉 Flash Sales'];

function fmtSecs(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

export default function HomeScreen({ navigation }) {
  const { saved, setSaved } = useContext(AppContext);
  const [filter, setFilter]   = useState('All Deals');
  const [timers, setTimers]   = useState(DEALS.map(d => d.timerSecs));

  useEffect(() => {
    const id = setInterval(() => setTimers(t => t.map(v => Math.max(0, v - 1))), 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = DEALS.filter(d => {
    if (filter === 'All Deals') return true;
    if (filter === '🎉 Flash Sales') return d.type === 'Flash Sale';
    return filter.includes(d.category);
  });

  const toggleSave = (id) => {
    setSaved(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const shareDeal = async (deal) => {
    await Share.share({
      message: `Check out this deal near you — ${deal.title} at ${deal.shop}! Found it on Out & About 📍`,
    });
  };

  const urgencyColor = (u) => u === 'high' ? theme.red : u === 'medium' ? theme.yellow : theme.green;

  return (
    <SafeAreaView style={s.safe}>
      {/* Top bar */}
      <View style={s.topbar}>
        <Text style={s.logo}>OUT<Text style={s.amp}>&</Text>ABOUT</Text>
        <View style={s.locPill}><Text style={s.locText}>📍 NW10</Text></View>
        <TouchableOpacity style={s.notifBtn} onPress={() => navigation.navigate('Alerts')}>
          <Text style={{ fontSize: 17 }}>🔔</Text>
          <View style={s.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Filter bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.fchip, filter === f && s.fchipSel]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.fchipText, filter === f && s.fchipTextSel]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Deal feed */}
      <FlatList
        data={filtered}
        keyExtractor={d => d.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <Text style={s.secLabel}>
            {filter === 'All Deals' ? '🔴 Ending Soon' : `${filter} Deals`}
          </Text>
        }
        renderItem={({ item, index }) => {
          const isSaved = saved.has(item.id);
          const timerColor = urgencyColor(item.urgency);
          return (
            <TouchableOpacity style={s.dealCard} onPress={() => navigation.navigate('Detail', { deal: item, timerSecs: timers[index] })} activeOpacity={0.9}>
              {/* Image area */}
              <View style={[s.dealImg, { backgroundColor: item.bgColor }]}>
                <Text style={{ fontSize: 52 }}>{item.emoji}</Text>
                <View style={[s.urgencyBadge, { backgroundColor: timerColor + '22', borderColor: timerColor }]}>
                  <Text style={[s.urgencyText, { color: timerColor }]}>
                    {item.urgency === 'high' ? '🔴 Ends Soon' : item.type}
                  </Text>
                </View>
                <TouchableOpacity style={s.favBtn} onPress={() => toggleSave(item.id)}>
                  <Text style={{ fontSize: 18 }}>{isSaved ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
              </View>
              {/* Body */}
              <View style={s.dealBody}>
                <View style={s.dealTopRow}>
                  <Text style={s.dealTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={s.dealDist}>{item.distance}</Text>
                </View>
                <Text style={s.dealShop}>{item.emoji} {item.shop}</Text>
                <View style={s.dealBottom}>
                  <Text style={[s.countdown, { color: timerColor }]}>⏱ {fmtSecs(timers[index])}</Text>
                  <TouchableOpacity style={s.shareBtn} onPress={() => shareDeal(item)}>
                    <Text style={s.shareBtnText}>💬 Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: theme.bg },
  topbar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  logo:          { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  amp:           { color: theme.orange },
  locPill:       { backgroundColor: theme.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  locText:       { fontSize: 12, fontWeight: '600', color: theme.text },
  notifBtn:      { width: 36, height: 36, backgroundColor: theme.card, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  notifDot:      { position: 'absolute', top: 6, right: 6, width: 8, height: 8, backgroundColor: theme.orange, borderRadius: 4, borderWidth: 2, borderColor: theme.bg },
  filterBar:     { maxHeight: 52, paddingVertical: 8 },
  fchip:         { backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#444', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  fchipSel:      { backgroundColor: theme.orange, borderColor: theme.orange },
  fchipText:     { fontSize: 12, fontWeight: '600', color: '#B0B0B0', whiteSpace: 'nowrap' },
  fchipTextSel:  { color: '#fff' },
  secLabel:      { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, fontSize: 11, color: theme.orange, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  dealCard:      { marginHorizontal: 16, marginBottom: 12, backgroundColor: theme.card, borderRadius: 20, overflow: 'hidden' },
  dealImg:       { height: 130, alignItems: 'center', justifyContent: 'center' },
  urgencyBadge:  { position: 'absolute', top: 10, left: 10, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  urgencyText:   { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  favBtn:        { position: 'absolute', top: 8, right: 10, width: 34, height: 34, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dealBody:      { padding: 14 },
  dealTopRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 },
  dealTitle:     { fontSize: 16, fontWeight: '800', color: theme.text, flex: 1, lineHeight: 20 },
  dealDist:      { fontSize: 11, color: theme.orange, fontWeight: '700' },
  dealShop:      { fontSize: 12, color: theme.muted, marginBottom: 10 },
  dealBottom:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countdown:     { fontSize: 13, fontWeight: '700' },
  shareBtn:      { backgroundColor: theme.card2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  shareBtnText:  { fontSize: 12, fontWeight: '600', color: theme.text },
});

// ─────────────────────────────────────────
// screens/DealDetailScreen.js
// ─────────────────────────────────────────
import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Linking, Share,
} from 'react-native';
import { theme } from '../constants/theme';
import { AppContext } from '../App';

function fmtSecs(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
}

export default function DealDetailScreen({ route, navigation }) {
  const { deal, timerSecs: initTimer } = route.params;
  const { saved, setSaved, followed, setFollowed } = useContext(AppContext);
  const [timer, setTimer] = useState(initTimer ?? deal.timerSecs);

  useEffect(() => {
    const id = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const isSaved    = saved.has(deal.id);
  const isFollowed = followed.has(deal.shop);

  const toggleSave = () => setSaved(prev => { const n = new Set(prev); n.has(deal.id) ? n.delete(deal.id) : n.add(deal.id); return n; });
  const toggleFollow = () => setFollowed(prev => { const n = new Set(prev); n.has(deal.shop) ? n.delete(deal.shop) : n.add(deal.shop); return n; });

  const openMaps = () => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(deal.address)}`;
    Linking.openURL(url);
  };

  const shareDeal = () => Share.share({ message: `Check this out — ${deal.title} at ${deal.shop}! Get it on Out & About 📍` });

  const urgencyColor = deal.urgency === 'high' ? theme.red : deal.urgency === 'medium' ? theme.yellow : theme.green;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[s.hero, { backgroundColor: deal.bgColor }]}>
          <Text style={{ fontSize: 80 }}>{deal.emoji}</Text>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.favBtn} onPress={toggleSave}>
            <Text style={{ fontSize: 20 }}>{isSaved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.body}>
          {/* Badges */}
          <View style={s.badgeRow}>
            <View style={s.badgeOrange}><Text style={s.badgeOrangeText}>⚡ {deal.type}</Text></View>
            <View style={s.badgeRed}><Text style={s.badgeRedText}>📍 {deal.distance}</Text></View>
          </View>

          <Text style={s.title}>{deal.title}</Text>
          <Text style={s.shop}>{deal.emoji} {deal.shop} · {deal.address}</Text>
          <Text style={s.desc}>{deal.desc}</Text>

          {/* Timer */}
          <View style={s.timerCard}>
            <View>
              <Text style={s.timerLabel}>Time Remaining</Text>
              <Text style={[s.timerVal, { color: urgencyColor }]}>{fmtSecs(timer)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.timerLabel}>Redemptions</Text>
              <Text style={[s.timerVal, { color: theme.green }]}>{deal.redemptions} today</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={s.actionRow}>
            <TouchableOpacity style={s.actMaps} onPress={openMaps}>
              <Text style={s.actMapsText}>📍 Open in Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actShare} onPress={shareDeal}>
              <Text style={s.actShareText}>💬 Tell a Friend</Text>
            </TouchableOpacity>
          </View>

          {/* Shop info */}
          <View style={s.shopCard}>
            <Text style={s.shopCardTitle}>About the shop</Text>
            <Text style={s.shopRow}>📍 {deal.address}</Text>
            <Text style={s.shopRow}>🕐 Open until 7:00 PM today</Text>
            <Text style={s.shopRow}>⭐ Followed by 143 people</Text>
            <TouchableOpacity
              style={[s.followBtn, isFollowed && s.followBtnActive]}
              onPress={toggleFollow}
            >
              <Text style={s.followBtnText}>{isFollowed ? `✓ Following ${deal.shop}` : `+ Follow ${deal.shop}`}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: theme.bg },
  hero:           { height: 220, alignItems: 'center', justifyContent: 'center' },
  backBtn:        { position: 'absolute', top: 16, left: 16, width: 36, height: 36, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  favBtn:         { position: 'absolute', top: 16, right: 16, width: 36, height: 36, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  body:           { padding: 20 },
  badgeRow:       { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badgeOrange:    { backgroundColor: 'rgba(255,92,0,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  badgeOrangeText:{ fontSize: 11, fontWeight: '700', color: theme.orange, textTransform: 'uppercase' },
  badgeRed:       { backgroundColor: 'rgba(74,158,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  badgeRedText:   { fontSize: 11, fontWeight: '700', color: theme.blue, textTransform: 'uppercase' },
  title:          { fontSize: 24, fontWeight: '900', color: theme.text, marginBottom: 6, lineHeight: 28 },
  shop:           { fontSize: 14, color: theme.muted, marginBottom: 14 },
  desc:           { fontSize: 14, color: '#ccc', lineHeight: 22, marginBottom: 20 },
  timerCard:      { backgroundColor: theme.card, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  timerLabel:     { fontSize: 11, color: theme.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  timerVal:       { fontSize: 28, fontWeight: '900' },
  actionRow:      { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actMaps:        { flex: 1, backgroundColor: theme.orange, borderRadius: 16, padding: 14, alignItems: 'center' },
  actMapsText:    { color: '#fff', fontSize: 14, fontWeight: '700' },
  actShare:       { flex: 1, backgroundColor: theme.card, borderRadius: 16, padding: 14, alignItems: 'center' },
  actShareText:   { color: theme.text, fontSize: 14, fontWeight: '700' },
  shopCard:       { backgroundColor: theme.card, borderRadius: 16, padding: 16 },
  shopCardTitle:  { fontSize: 11, color: theme.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  shopRow:        { fontSize: 13, color: theme.text, marginBottom: 8 },
  followBtn:      { marginTop: 12, borderWidth: 1.5, borderColor: theme.orange, borderRadius: 50, padding: 11, alignItems: 'center' },
  followBtnActive:{ backgroundColor: 'rgba(255,92,0,0.1)' },
  followBtnText:  { color: theme.orange, fontSize: 14, fontWeight: '700' },
});

// ─────────────────────────────────────────
// screens/MapScreen.js
// ─────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { theme } from '../constants/theme';
import { DEALS } from '../constants/deals';

const REGION = { latitude: 51.5318, longitude: -0.2360, latitudeDelta: 0.01, longitudeDelta: 0.01 };

export default function MapScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        <Text style={s.logo}>OUT<Text style={s.amp}>&</Text>ABOUT</Text>
        <View style={s.locPill}><Text style={s.locText}>📍 NW10</Text></View>
      </View>

      <MapView style={s.map} initialRegion={REGION} userInterfaceStyle="dark" showsUserLocation>
        {DEALS.map(deal => (
          <Marker key={deal.id} coordinate={{ latitude: deal.lat, longitude: deal.lng }}>
            <View style={s.pin}>
              <Text style={s.pinText}>{deal.emoji} {deal.title.split(' ').slice(0, 3).join(' ')}</Text>
            </View>
            <View style={s.pinTail} />
            <Callout onPress={() => navigation.navigate('Home', { screen: 'Detail', params: { deal } })}>
              <View style={s.callout}>
                <Text style={s.calloutTitle}>{deal.title}</Text>
                <Text style={s.calloutShop}>{deal.shop} · {deal.distance}</Text>
                <Text style={s.calloutTap}>Tap to view →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Bottom list */}
      <FlatList
        data={DEALS}
        keyExtractor={d => d.id}
        style={s.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.listItem} onPress={() => navigation.navigate('Home', { screen: 'Detail', params: { deal: item } })}>
            <View style={s.listIcon}><Text style={{ fontSize: 22 }}>{item.emoji}</Text></View>
            <View style={s.listInfo}>
              <Text style={s.listTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.listShop}>{item.shop}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.listDist}>{item.distance}</Text>
              <Text style={s.listTime}>{item.type}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: theme.bg },
  topbar:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  logo:      { fontSize: 18, fontWeight: '900', color: '#fff' },
  amp:       { color: theme.orange },
  locPill:   { backgroundColor: theme.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  locText:   { fontSize: 12, fontWeight: '600', color: theme.text },
  map:       { flex: 1 },
  pin:       { backgroundColor: theme.orange, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  pinText:   { color: '#fff', fontSize: 11, fontWeight: '700' },
  pinTail:   { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: theme.orange, alignSelf: 'center' },
  callout:   { padding: 10, width: 180 },
  calloutTitle: { fontWeight: '700', fontSize: 13, marginBottom: 2 },
  calloutShop:  { fontSize: 11, color: '#555', marginBottom: 4 },
  calloutTap:   { fontSize: 11, color: theme.orange, fontWeight: '600' },
  list:      { maxHeight: 220, borderTopWidth: 1, borderTopColor: theme.border },
  listItem:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  listIcon:  { width: 44, height: 44, backgroundColor: theme.card, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  listInfo:  { flex: 1 },
  listTitle: { fontSize: 14, fontWeight: '700', color: theme.text },
  listShop:  { fontSize: 12, color: theme.muted },
  listDist:  { fontSize: 12, color: theme.orange, fontWeight: '700' },
  listTime:  { fontSize: 11, color: theme.muted },
});

// ─────────────────────────────────────────
// screens/SavedScreen.js
// ─────────────────────────────────────────
import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../constants/theme';
import { DEALS } from '../constants/deals';
import { AppContext } from '../App';

export default function SavedScreen({ navigation }) {
  const { saved } = useContext(AppContext);
  const savedDeals = DEALS.filter(d => saved.has(d.id));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        <Text style={s.logo}>OUT<Text style={s.amp}>&</Text>ABOUT</Text>
        <Text style={s.pageTitle}>Saved</Text>
        <View style={{ width: 36 }} />
      </View>

      {savedDeals.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ fontSize: 52, marginBottom: 12 }}>⭐</Text>
          <Text style={s.emptyTitle}>No saved deals yet</Text>
          <Text style={s.emptyDesc}>Tap the 🤍 on any deal to save it here. Great for deals you want to come back to.</Text>
        </View>
      ) : (
        <FlatList
          data={savedDeals}
          keyExtractor={d => d.id}
          ListHeaderComponent={<Text style={s.secLabel}>Your saved deals</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.item} onPress={() => navigation.navigate('Home', { screen: 'Detail', params: { deal: item } })}>
              <View style={s.itemIcon}><Text style={{ fontSize: 22 }}>{item.emoji}</Text></View>
              <View style={s.itemInfo}>
                <Text style={s.itemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={s.itemShop}>{item.shop}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.itemDist}>{item.distance}</Text>
                <Text style={s.itemType}>{item.type}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: theme.bg },
  topbar:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  logo:      { fontSize: 18, fontWeight: '900', color: '#fff' },
  amp:       { color: theme.orange },
  pageTitle: { fontSize: 15, fontWeight: '700', color: theme.text },
  secLabel:  { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, fontSize: 11, color: theme.orange, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle:{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: theme.muted, textAlign: 'center', lineHeight: 20 },
  item:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  itemIcon:  { width: 44, height: 44, backgroundColor: theme.card, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemInfo:  { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: theme.text },
  itemShop:  { fontSize: 12, color: theme.muted },
  itemDist:  { fontSize: 12, color: theme.orange, fontWeight: '700' },
  itemType:  { fontSize: 11, color: theme.muted },
});

// ─────────────────────────────────────────
// screens/AlertsScreen.js
// ─────────────────────────────────────────
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../constants/theme';
import { DEALS } from '../constants/deals';

const ALERTS = [
  { id: '1', dealId: '1', icon: '☕', iconBg: 'rgba(255,92,0,0.1)', title: 'Free pastry at The Coffee Spot!', body: 'You walked past — free pastry with any coffee. Ends in 47 mins.', time: '2m ago', unread: true },
  { id: '2', dealId: '2', icon: '✂️', iconBg: 'rgba(245,197,24,0.1)', title: 'Flash sale: 50% off haircuts nearby', body: 'Blades Barbers is running a flash sale — 1 hour 12 mins left.', time: '8m ago', unread: true },
  { id: '3', dealId: '3', icon: '🍕', iconBg: 'rgba(74,158,255,0.1)', title: 'Slice & Dice: Buy 1 Get 1 pizza', body: 'Happy hour starts now at your followed shop. 3h 45m left.', time: '24m ago', unread: false },
  { id: '4', dealId: '4', icon: '💆', iconBg: 'rgba(46,204,113,0.1)', title: '30% off all beauty treatments', body: 'Serenity Beauty has a new deal active nearby.', time: '1h ago', unread: false },
  { id: '5', dealId: '5', icon: '👟', iconBg: theme.card, title: 'StepUp Shoes — 20% off footwear', body: 'Deal expired · Yesterday', time: 'Yesterday', unread: false, expired: true },
];

export default function AlertsScreen({ navigation }) {
  const goToDeal = (dealId) => {
    const deal = DEALS.find(d => d.id === dealId);
    if (deal) navigation.navigate('Home', { screen: 'Detail', params: { deal } });
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        <Text style={s.logo}>OUT<Text style={s.amp}>&</Text>ABOUT</Text>
        <Text style={s.pageTitle}>Deal Alerts</Text>
        <View style={{ width: 36 }} />
      </View>
      <FlatList
        data={ALERTS}
        keyExtractor={a => a.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[s.item, item.unread && s.itemUnread, item.expired && s.itemExpired]}
            onPress={() => goToDeal(item.dealId)}
          >
            <View style={[s.icon, { backgroundColor: item.iconBg }]}><Text style={{ fontSize: 22 }}>{item.icon}</Text></View>
            <View style={s.info}>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.body} numberOfLines={2}>{item.body}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={s.time}>{item.time}</Text>
              {item.unread && <View style={s.dot} />}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: theme.bg },
  topbar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  logo:        { fontSize: 18, fontWeight: '900', color: '#fff' },
  amp:         { color: theme.orange },
  pageTitle:   { fontSize: 15, fontWeight: '700', color: theme.text },
  item:        { flexDirection: 'row', gap: 12, padding: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.border, alignItems: 'flex-start' },
  itemUnread:  { backgroundColor: 'rgba(255,92,0,0.04)' },
  itemExpired: { opacity: 0.5 },
  icon:        { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info:        { flex: 1 },
  title:       { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 2 },
  body:        { fontSize: 12, color: theme.muted, lineHeight: 18 },
  time:        { fontSize: 11, color: theme.muted },
  dot:         { width: 8, height: 8, backgroundColor: theme.orange, borderRadius: 4 },
});
