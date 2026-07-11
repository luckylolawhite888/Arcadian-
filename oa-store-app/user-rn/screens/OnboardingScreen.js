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

