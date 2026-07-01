import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { loginRequest } from '../api/client';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const user = await loginRequest(email, password);
      navigation.replace(user.role === 'TRAINER' ? 'TrainerDashboard' : 'Dashboard');
    } catch (err) {
      Alert.alert('Login failed', 'Check your email and password and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PRIME</Text>
      <Text style={styles.subtitle}>Gym Management</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8B93A7"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8B93A7"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 32, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: '#8B93A7', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#131826',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  button: { backgroundColor: '#FF5A1F', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
