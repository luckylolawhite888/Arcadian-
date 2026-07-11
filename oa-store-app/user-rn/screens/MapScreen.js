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

