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

