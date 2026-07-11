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
