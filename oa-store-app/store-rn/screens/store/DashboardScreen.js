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

