// ============================================================
// OUT & ABOUT — STORE APP (Shop-facing dashboard)
// React Native / Expo
// File structure:
//   StoreApp.js  (entry point — separate Expo project)
//   screens/store/LoginScreen.js
//   screens/store/DashboardScreen.js
//   screens/store/CreateDealScreen.js
//   screens/store/MyDealsScreen.js
//   screens/store/SettingsScreen.js
//   constants/theme.js  (same as user app)
// ============================================================

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
        tabBarStyle: { backgroundColor: theme.bg, borderTopColor: theme.border, borderTopWidth: 1, paddingBottom: 24  // extra padding for phone nav bar, paddingTop: 6, height: 60 },
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

// ─────────────────────────────────────────
// screens/store/LoginScreen.js
// ─────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { theme } from '../../constants/theme';

export default function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleLogin = () => {
    if (!user || !pass) { Alert.alert('Enter any username and password to demo'); return; }
    onLogin(user.charAt(0).toUpperCase() + user.slice(1));
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.logo}>OUT<Text style={s.amp}>&{'\n'}</Text>ABOUT</Text>
        <View style={s.form}>
          <TextInput style={s.inp} placeholder="Username" placeholderTextColor={theme.muted} value={user} onChangeText={setUser} autoCapitalize="none" />
          <TextInput style={s.inp} placeholder="Password" placeholderTextColor={theme.muted} value={pass} onChangeText={setPass} secureTextEntry />
          <TouchableOpacity><Text style={s.forgot}>Forgot Password?</Text></TouchableOpacity>
          <TouchableOpacity style={s.btn} onPress={handleLogin}>
            <Text style={s.btnText}>Login</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.hint}>Demo: enter any username & password</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: theme.bg },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 32 },
  logo:      { fontSize: 72, fontWeight: '900', color: '#fff', lineHeight: 66, letterSpacing: -2, textAlign: 'center' },
  amp:       { color: theme.orange },
  form:      { width: '100%', gap: 12 },
  inp:       { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.border, borderRadius: 50, paddingHorizontal: 20, paddingVertical: 14, color: theme.text, fontSize: 15 },
  forgot:    { color: theme.muted, fontSize: 13, textAlign: 'center', paddingVertical: 4 },
  btn:       { backgroundColor: theme.orange, borderRadius: 50, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText:   { color: '#fff', fontSize: 17, fontWeight: '700' },
  hint:      { color: '#333', fontSize: 11 },
});

// ─────────────────────────────────────────
// screens/store/DashboardScreen.js
// ─────────────────────────────────────────
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import { StoreContext } from '../../StoreApp';

export default function DashboardScreen({ shopName, onLogout }) {
  const nav = useNavigation();
  const { activeDeals } = useContext(StoreContext);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        <Text style={s.logo}>OUT<Text style={s.amp}>&</Text>ABOUT</Text>
        <Text style={s.shopName} numberOfLines={1}>{shopName}</Text>
        <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Stats */}
        <View style={s.statRow}>
          <View style={s.statCard}><Text style={s.statNum}>{activeDeals}</Text><Text style={s.statLbl}>Active Deals</Text></View>
          <View style={s.statCard}><Text style={s.statNum}>47</Text><Text style={s.statLbl}>Views Today</Text></View>
          <View style={s.statCard}><Text style={s.statNum}>6</Text><Text style={s.statLbl}>Walk-ins</Text></View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={s.bigBtn} onPress={() => nav.navigate('New Deal')}>
          <Text style={s.bigBtnText}>＋ Create New Deal</Text>
        </TouchableOpacity>

        <View style={s.btnRow}>
          <TouchableOpacity style={s.secBtn} onPress={() => nav.navigate('My Deals')}>
            <Text style={s.secBtnText}>My Deals</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secBtn} onPress={() => nav.navigate('Settings')}>
            <Text style={s.secBtnText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={s.tipsBox}>
          <Text style={s.tipsTitle}>💡 Quick Tips</Text>
          <Text style={s.tipsText}>• Post deals that end today to create urgency{'\n'}• Use the AI writer to save time on descriptions{'\n'}• Flash sales work best for last-minute offers</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: theme.bg },
  topbar:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border, gap: 10 },
  logo:       { fontSize: 18, fontWeight: '900', color: '#fff' },
  amp:        { color: theme.orange },
  shopName:   { flex: 1, fontSize: 17, fontWeight: '700', color: theme.text },
  logoutBtn:  { backgroundColor: theme.orange, borderRadius: 50, paddingHorizontal: 14, paddingVertical: 6 },
  logoutText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  scroll:     { padding: 16, gap: 12 },
  statRow:    { flexDirection: 'row', gap: 10 },
  statCard:   { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  statNum:    { fontSize: 28, fontWeight: '900', color: '#111' },
  statLbl:    { fontSize: 11, fontWeight: '700', color: '#333', marginTop: 2 },
  bigBtn:     { backgroundColor: theme.orange, borderRadius: 50, padding: 18, alignItems: 'center' },
  bigBtnText: { color: '#fff', fontSize: 19, fontWeight: '900' },
  btnRow:     { flexDirection: 'row', gap: 10 },
  secBtn:     { flex: 1, backgroundColor: theme.orange, borderRadius: 50, padding: 16, alignItems: 'center' },
  secBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  tipsBox:    { backgroundColor: theme.card, borderRadius: 16, padding: 16 },
  tipsTitle:  { fontSize: 14, fontWeight: '700', color: theme.text, marginBottom: 8 },
  tipsText:   { color: theme.muted, fontSize: 13, lineHeight: 22 },
});

// ─────────────────────────────────────────
// screens/store/CreateDealScreen.js
// ─────────────────────────────────────────
import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Switch, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import { StoreContext } from '../../StoreApp';

const DEAL_TYPES = [
  { key: 'Flash Sale',  icon: '⚡', desc: 'Short burst, high urgency' },
  { key: 'End of Day',  icon: '🌅', desc: 'Clear stock before close' },
  { key: 'Happy Hour',  icon: '🍻', desc: 'Fixed time window' },
  { key: 'Ongoing',     icon: '♻️', desc: 'Runs until you stop it' },
];

const AI_DESCRIPTIONS = [
  "Treat yourself today! Grab any hot or iced coffee and we'll throw in a FREE pastry of your choice. Croissants and muffins fresh this morning — pop in before they're gone. Today only! ☕🥐",
  "It's a good day for a deal. Any coffee + free pastry on us. Simple as that. See you in the queue! ⚡",
  "Running low on energy? Order any coffee this afternoon and pick a pastry on the house. Our way of saying thanks for being a regular. 🙌",
];
let aiIdx = 0;

export default function CreateDealScreen() {
  const nav = useNavigation();
  const { setDeals, setActiveDeals } = useContext(StoreContext);

  const [step,     setStep]     = useState(1);
  const [name,     setName]     = useState('');
  const [desc,     setDesc]     = useState('');
  const [dealType, setDealType] = useState('Flash Sale');
  const [aiLoading, setAiLoading] = useState(false);
  const [channels, setChannels] = useState({ oa: true, instagram: true, facebook: true, whatsapp: false });
  const [published, setPublished] = useState(false);

  const stepLabels = ['Deal Name & Description', 'Deal Type & Duration', 'Where to Post', 'Preview & Publish'];
  const progress = step / 4;

  const aiWrite = async () => {
    setAiLoading(true);
    // In production: call your actual AI endpoint here
    // e.g. fetch('https://your-api.com/ai-write', { method: 'POST', body: JSON.stringify({ shopName, dealName: name }) })
    await new Promise(r => setTimeout(r, 1800));
    setDesc(AI_DESCRIPTIONS[aiIdx % AI_DESCRIPTIONS.length]);
    aiIdx++;
    setAiLoading(false);
  };

  const publish = () => {
    const newDeal = {
      id: Date.now().toString(),
      emoji: '⚡',
      title: name || 'New Deal',
      type: dealType,
      status: 'live',
      views: 0, walkins: 0, shares: 0,
      timer: '6h 0m',
    };
    setDeals(prev => [newDeal, ...prev]);
    setActiveDeals(prev => prev + 1);
    setPublished(true);
  };

  const reset = () => { setStep(1); setName(''); setDesc(''); setDealType('Flash Sale'); setPublished(false); };

  if (published) {
    const activeChannels = Object.entries(channels).filter(([,v]) => v).map(([k]) => ({ oa: '📱 Out & About', instagram: '📸 Instagram', facebook: '👥 Facebook', whatsapp: '💬 WhatsApp' }[k]));
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.successWrap}>
          <View style={s.successCircle}><Text style={{ fontSize: 40 }}>✅</Text></View>
          <Text style={s.successTitle}>Deal is Live!</Text>
          <Text style={s.successSub}>Your deal is now visible to everyone near your shop. We'll notify you when people start walking in.</Text>
          <Text style={s.successPostedTo}>Posted to:</Text>
          <View style={s.channelRow}>{activeChannels.map(c => <View key={c} style={s.channelPill}><Text style={s.channelText}>{c}</Text></View>)}</View>
          <View style={s.captionBox}>
            <Text style={s.captionLabel}>Auto-generated caption</Text>
            <Text style={s.captionText}>⚡ Flash sale! {name || 'Amazing deal'} — today only. While stocks last, pop in and treat yourself! #OutAndAbout #LocalDeals</Text>
          </View>
          <TouchableOpacity style={s.bigBtn} onPress={reset}><Text style={s.bigBtnText}>Create Another Deal</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        {step > 1
          ? <TouchableOpacity onPress={() => setStep(s => s - 1)}><Text style={{ color: theme.text, fontSize: 22 }}>←</Text></TouchableOpacity>
          : <View style={{ width: 24 }} />
        }
        <Text style={s.pageTitle}>Create New Deal</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress */}
      <View style={s.progressWrap}>
        <Text style={s.stepLbl}>Step {step} of 4 — {stepLabels[step - 1]}</Text>
        <View style={s.progressBg}><View style={[s.progressFill, { width: `${progress * 100}%` }]} /></View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        {/* STEP 1 */}
        {step === 1 && (
          <View style={{ gap: 16 }}>
            <View>
              <Text style={s.fieldLabel}>Deal Name</Text>
              <TextInput style={s.inp} placeholder="e.g. Free Pastry with Any Coffee" placeholderTextColor="#555" value={name} onChangeText={setName} />
            </View>
            <View>
              <Text style={s.fieldLabel}>Description</Text>
              <TextInput style={[s.inp, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]} placeholder="Describe your deal..." placeholderTextColor="#555" value={desc} onChangeText={setDesc} multiline />
              <TouchableOpacity style={s.aiBtn} onPress={aiWrite} disabled={aiLoading}>
                {aiLoading ? <ActivityIndicator color={theme.orange} size="small" /> : <Text style={s.aiBtnText}>🤖 AI Write For Me</Text>}
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={s.bigBtn} onPress={() => setStep(2)}><Text style={s.bigBtnText}>Next →</Text></TouchableOpacity>
          </View>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <View style={{ gap: 16 }}>
            <Text style={s.fieldLabel}>Deal Type</Text>
            <View style={s.typeGrid}>
              {DEAL_TYPES.map(t => (
                <TouchableOpacity key={t.key} style={[s.typeChip, dealType === t.key && s.typeChipSel]} onPress={() => setDealType(t.key)}>
                  <Text style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</Text>
                  <Text style={s.typeChipName}>{t.key}</Text>
                  <Text style={s.typeChipDesc}>{t.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.fieldLabel}>Duration</Text>
            <View style={s.timeRow}>
              <View style={s.timeBox}><Text style={s.timeBoxLabel}>Start</Text><Text style={s.timeBoxVal}>Today 12:00 PM</Text></View>
              <View style={s.timeBox}><Text style={s.timeBoxLabel}>End</Text><Text style={s.timeBoxVal}>Today 6:00 PM</Text></View>
            </View>
            <TouchableOpacity style={s.bigBtn} onPress={() => setStep(3)}><Text style={s.bigBtnText}>Next →</Text></TouchableOpacity>
          </View>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <View style={{ gap: 4 }}>
            <Text style={[s.fieldLabel, { marginBottom: 12 }]}>Where to Post</Text>
            {[
              { key: 'oa',        icon: '📱', label: 'Out & About App' },
              { key: 'instagram', icon: '📸', label: 'Instagram' },
              { key: 'facebook',  icon: '👥', label: 'Facebook' },
              { key: 'whatsapp',  icon: '💬', label: 'WhatsApp Broadcast' },
            ].map(ch => (
              <View key={ch.key} style={s.toggleRow}>
                <Text style={{ fontSize: 22 }}>{ch.icon}</Text>
                <Text style={s.toggleLabel}>{ch.label}</Text>
                <Switch
                  value={channels[ch.key]}
                  onValueChange={v => setChannels(p => ({ ...p, [ch.key]: v }))}
                  trackColor={{ false: theme.border, true: theme.orange }}
                  thumbColor="#fff"
                />
              </View>
            ))}
            <View style={{ marginTop: 16 }}>
              <TouchableOpacity style={s.bigBtn} onPress={() => setStep(4)}><Text style={s.bigBtnText}>Next →</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 4 — Preview */}
        {step === 4 && (
          <View style={{ gap: 16 }}>
            <Text style={s.fieldLabel}>Preview</Text>
            <View style={s.previewCard}>
              <View style={s.previewHero}><Text style={{ fontSize: 40 }}>☕</Text></View>
              <View style={{ padding: 14 }}>
                <Text style={s.previewTitle}>{name || 'Your Deal Title'}</Text>
                <Text style={s.previewShop}>Your Shop · 0.2mi away</Text>
                <Text style={s.previewDesc} numberOfLines={3}>{desc || 'Your deal description will appear here.'}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <View style={s.previewBadge}><Text style={s.previewBadgeText}>⚡ {dealType}</Text></View>
                  <View style={s.previewTimer}><Text style={s.previewTimerText}>⏱ 5h 47m left</Text></View>
                </View>
              </View>
            </View>
            <TouchableOpacity style={s.bigBtn} onPress={publish}><Text style={s.bigBtnText}>⚡ Smart Post Now</Text></TouchableOpacity>
            <TouchableOpacity style={s.draftBtn}><Text style={s.draftBtnText}>Save as Draft</Text></TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: theme.bg },
  topbar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  pageTitle:      { fontSize: 16, fontWeight: '700', color: theme.text },
  progressWrap:   { paddingHorizontal: 16, paddingVertical: 10 },
  stepLbl:        { fontSize: 12, color: theme.orange, fontWeight: '700', marginBottom: 6 },
  progressBg:     { height: 3, backgroundColor: theme.border, borderRadius: 2 },
  progressFill:   { height: '100%', backgroundColor: theme.orange, borderRadius: 2 },
  fieldLabel:     { fontSize: 11, color: theme.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  inp:            { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: theme.text, fontSize: 14 },
  aiBtn:          { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: theme.card2, borderWidth: 1, borderColor: theme.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9, alignSelf: 'flex-start' },
  aiBtnText:      { color: theme.orange, fontSize: 13, fontWeight: '600' },
  bigBtn:         { backgroundColor: theme.orange, borderRadius: 50, padding: 18, alignItems: 'center' },
  bigBtnText:     { color: '#fff', fontSize: 17, fontWeight: '900' },
  draftBtn:       { borderWidth: 1, borderColor: theme.border, borderRadius: 50, padding: 13, alignItems: 'center' },
  draftBtnText:   { color: theme.muted, fontSize: 14, fontWeight: '600' },
  typeGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeChip:       { width: '47%', backgroundColor: theme.card, borderWidth: 1.5, borderColor: theme.border, borderRadius: 12, padding: 12, alignItems: 'center' },
  typeChipSel:    { borderColor: theme.orange, backgroundColor: 'rgba(255,92,0,0.1)' },
  typeChipName:   { fontSize: 12, fontWeight: '700', color: theme.text },
  typeChipDesc:   { fontSize: 10, color: theme.muted, marginTop: 2, textAlign: 'center' },
  timeRow:        { flexDirection: 'row', gap: 10 },
  timeBox:        { flex: 1, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 12 },
  timeBoxLabel:   { fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  timeBoxVal:     { fontSize: 14, fontWeight: '700', color: theme.text },
  toggleRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  toggleLabel:    { flex: 1, fontSize: 14, fontWeight: '600', color: theme.text },
  previewCard:    { backgroundColor: theme.card, borderRadius: 16, overflow: 'hidden' },
  previewHero:    { height: 100, backgroundColor: '#1a0f00', alignItems: 'center', justifyContent: 'center' },
  previewTitle:   { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 2 },
  previewShop:    { fontSize: 12, color: theme.muted, marginBottom: 8 },
  previewDesc:    { fontSize: 13, color: '#ccc', lineHeight: 20 },
  previewBadge:   { backgroundColor: 'rgba(255,92,0,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  previewBadgeText: { fontSize: 11, color: theme.orange, fontWeight: '700' },
  previewTimer:   { backgroundColor: theme.card2, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  previewTimerText: { fontSize: 11, color: theme.muted, fontWeight: '600' },
  successWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16 },
  successCircle:  { width: 90, height: 90, backgroundColor: 'rgba(46,204,113,0.15)', borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  successTitle:   { fontSize: 28, fontWeight: '900', color: theme.text },
  successSub:     { fontSize: 14, color: theme.muted, textAlign: 'center', lineHeight: 22 },
  successPostedTo:{ fontSize: 13, color: theme.muted, fontWeight: '600' },
  channelRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  channelPill:    { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  channelText:    { fontSize: 12, fontWeight: '600', color: theme.text },
  captionBox:     { backgroundColor: theme.card, borderRadius: 16, padding: 16, width: '100%' },
  captionLabel:   { fontSize: 11, color: theme.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  captionText:    { fontSize: 13, color: theme.text, lineHeight: 20 },
});

// ─────────────────────────────────────────
// screens/store/MyDealsScreen.js
// ─────────────────────────────────────────
import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../constants/theme';
import { StoreContext } from '../../StoreApp';

export default function MyDealsScreen() {
  const nav = useNavigation();
  const { deals } = useContext(StoreContext);

  const statusBadge = (status) => ({
    live:    { bg: 'rgba(46,204,113,0.15)', color: theme.green,  label: '● Live' },
    expired: { bg: 'rgba(136,136,136,0.15)', color: theme.muted,  label: 'Expired' },
    draft:   { bg: 'rgba(245,197,24,0.15)', color: theme.yellow, label: 'Draft' },
  }[status] || {});

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        <View style={{ width: 24 }} />
        <Text style={s.pageTitle}>My Deals</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={deals}
        keyExtractor={d => d.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const badge = statusBadge(item.status);
          return (
            <View style={[s.card, item.status !== 'live' && { opacity: 0.65 }]}>
              <View style={s.cardTop}>
                <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                <View style={s.cardInfo}>
                  <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={s.cardSub}>{item.type}{item.timer ? ` · Ends ${item.timer}` : item.status === 'expired' ? ' · Expired yesterday' : ''}</Text>
                  {item.status === 'live' && <Text style={s.countdown}>⏱ {item.timer} remaining</Text>}
                </View>
                <View style={[s.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[s.badgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>
              {item.status !== 'draft' && (
                <View style={s.statsRow}>
                  <View style={s.stat}><Text style={s.statN}>{item.views}</Text><Text style={s.statL}>Views</Text></View>
                  <View style={s.stat}><Text style={s.statN}>{item.walkins}</Text><Text style={s.statL}>Walk-ins</Text></View>
                  <View style={s.stat}><Text style={s.statN}>{item.shares}</Text><Text style={s.statL}>Shares</Text></View>
                </View>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
            <TouchableOpacity style={s.newBtn} onPress={() => nav.navigate('New Deal')}>
              <Text style={s.newBtnText}>＋ Create New Deal</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: theme.bg },
  topbar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  pageTitle:  { fontSize: 16, fontWeight: '700', color: theme.text },
  card:       { marginHorizontal: 16, marginTop: 12, backgroundColor: theme.card, borderRadius: 16, overflow: 'hidden' },
  cardTop:    { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  cardInfo:   { flex: 1 },
  cardTitle:  { fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 2 },
  cardSub:    { fontSize: 12, color: theme.muted },
  countdown:  { fontSize: 12, fontWeight: '700', color: theme.orange, marginTop: 4 },
  badge:      { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText:  { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  statsRow:   { flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.border, padding: 10, gap: 20, paddingHorizontal: 14 },
  stat:       { alignItems: 'flex-start' },
  statN:      { fontSize: 20, fontWeight: '900', color: theme.text },
  statL:      { fontSize: 10, color: theme.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  newBtn:     { backgroundColor: theme.orange, borderRadius: 50, padding: 16, alignItems: 'center' },
  newBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});

// ─────────────────────────────────────────
// screens/store/SettingsScreen.js
// ─────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../../constants/theme';

export default function SettingsScreen({ shopName, onLogout }) {
  const [name,    setName]    = useState(shopName);
  const [cat,     setCat]     = useState('Café & Coffee');
  const [addr,    setAddr]    = useState('12 High Street, NW10');
  const [notifs,  setNotifs]  = useState({ views: true, expiry: true, report: true });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        <View style={{ width: 24 }} />
        <Text style={s.pageTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>

        {/* Profile */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Store Profile</Text>
          <View style={{ gap: 10 }}>
            <View><Text style={s.fieldLabel}>Store Name</Text><TextInput style={s.inp} value={name} onChangeText={setName} /></View>
            <View><Text style={s.fieldLabel}>Category</Text><TextInput style={s.inp} value={cat} onChangeText={setCat} /></View>
            <View><Text style={s.fieldLabel}>Address</Text><TextInput style={s.inp} value={addr} onChangeText={setAddr} /></View>
          </View>
        </View>

        {/* Notifications */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Notifications</Text>
          {[
            { key: 'views',  label: 'Deal view alerts' },
            { key: 'expiry', label: 'Deal expiry reminders' },
            { key: 'report', label: 'Weekly performance report' },
          ].map(n => (
            <View key={n.key} style={s.toggleRow}>
              <Text style={s.toggleLabel}>{n.label}</Text>
              <Switch
                value={notifs[n.key]}
                onValueChange={v => setNotifs(p => ({ ...p, [n.key]: v }))}
                trackColor={{ false: theme.border, true: theme.orange }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        {/* Plan */}
        <View style={s.planRow}>
          <View>
            <Text style={s.planName}>Current Plan</Text>
            <Text style={s.planSub}>Starter · £39/mo</Text>
          </View>
          <TouchableOpacity style={s.upgradeBtn}>
            <Text style={s.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.saveBtn}>
          <Text style={s.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.logoutBtn} onPress={onLogout}>
          <Text style={s.logoutBtnText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: theme.bg },
  topbar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  pageTitle:     { fontSize: 16, fontWeight: '700', color: theme.text },
  section:       { backgroundColor: theme.card, borderRadius: 16, padding: 16, gap: 10 },
  sectionTitle:  { fontSize: 11, color: theme.orange, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  fieldLabel:    { fontSize: 11, color: theme.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  inp:           { backgroundColor: theme.card2, borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: theme.text, fontSize: 14 },
  toggleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  toggleLabel:   { fontSize: 14, fontWeight: '600', color: theme.text },
  planRow:       { backgroundColor: theme.card, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planName:      { fontSize: 15, fontWeight: '700', color: theme.text },
  planSub:       { fontSize: 12, color: theme.muted },
  upgradeBtn:    { backgroundColor: 'rgba(255,92,0,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  upgradeBtnText:{ color: theme.orange, fontSize: 12, fontWeight: '700' },
  saveBtn:       { backgroundColor: theme.orange, borderRadius: 50, padding: 15, alignItems: 'center' },
  saveBtnText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutBtn:     { borderWidth: 1, borderColor: theme.border, borderRadius: 50, padding: 13, alignItems: 'center' },
  logoutBtnText: { color: theme.muted, fontSize: 14, fontWeight: '600' },
});
