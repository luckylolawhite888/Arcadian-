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

