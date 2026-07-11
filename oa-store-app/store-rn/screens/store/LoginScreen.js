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

