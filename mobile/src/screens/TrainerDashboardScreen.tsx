import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { api } from '../api/client';

export default function TrainerDashboardScreen() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/trainers/me/members')
      .then(({ data }) => setMembers(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FF5A1F" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Members ({members.length})</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.sub}>
              {item.memberships?.[0]?.plan?.name || 'No active plan'}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.sub}>No members assigned yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  center: { flex: 1, backgroundColor: '#0B0E14', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', padding: 20, paddingBottom: 0 },
  card: {
    backgroundColor: '#131826',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  name: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sub: { color: '#8B93A7', fontSize: 13, marginTop: 4 },
});
