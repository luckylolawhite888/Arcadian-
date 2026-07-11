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
  fchip:         { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  fchipSel:      { backgroundColor: theme.orange, borderColor: theme.orange },
  fchipText:     { fontSize: 12, fontWeight: '600', color: theme.muted, whiteSpace: 'nowrap' },
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

