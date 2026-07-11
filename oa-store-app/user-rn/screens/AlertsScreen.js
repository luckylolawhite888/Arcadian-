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
