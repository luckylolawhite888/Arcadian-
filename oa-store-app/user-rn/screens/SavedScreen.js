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

