import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { api } from '../api/client';

export default function DashboardScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/members/me/profile')
      .then(({ data }) => setProfile(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#FF5A1F" size="large" />
      </View>
    );
  }

  const activeMembership = profile?.memberships?.find((m: any) => m.status === 'ACTIVE');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.greeting}>Hi, {profile?.firstName} 👋</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Your check-in QR code</Text>
        <View style={styles.qrWrapper}>
          <QRCode value={profile?.qrCode || 'no-code'} size={160} backgroundColor="#131826" color="#fff" />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Membership</Text>
        {activeMembership ? (
          <>
            <Text style={styles.cardValue}>{activeMembership.plan.name}</Text>
            <Text style={styles.cardSub}>
              Expires {new Date(activeMembership.endDate).toLocaleDateString()}
            </Text>
          </>
        ) : (
          <Text style={styles.cardSub}>No active membership</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Trainer</Text>
        <Text style={styles.cardValue}>
          {profile?.assignedTrainer
            ? `${profile.assignedTrainer.firstName} ${profile.assignedTrainer.lastName}`
            : 'Not assigned yet'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0E14' },
  center: { flex: 1, backgroundColor: '#0B0E14', justifyContent: 'center', alignItems: 'center' },
  greeting: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  card: {
    backgroundColor: '#131826',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardLabel: { color: '#8B93A7', fontSize: 13, marginBottom: 8 },
  cardValue: { color: '#fff', fontSize: 18, fontWeight: '600' },
  cardSub: { color: '#8B93A7', fontSize: 13, marginTop: 4 },
  qrWrapper: { alignItems: 'center', paddingVertical: 8 },
});
