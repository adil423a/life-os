import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

export default function ProfileScreen() {
  const finance = useAppStore((state) => state.finance);
  const ideas = useAppStore((state) => state.ideas);
  const goals = useAppStore((state) => state.goals);

  const stats = useMemo(() => {
    const income = finance.filter((i) => i.type === 'income').reduce((s, i) => s + i.amount, 0);
    const expense = finance.filter((i) => i.type === 'expense').reduce((s, i) => s + i.amount, 0);

    return {
      balance: income - expense,
      ideas: ideas.length,
      goals: goals.filter((g) => g.progress < 100).length,
      records: finance.length,
    };
  }, [finance, ideas, goals]);

  function money(value: number) {
    return value.toLocaleString('ru-RU') + ' ₸';
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Аккаунт</Text>
        <Text style={styles.title}>Профиль</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.name}>Адиль</Text>
          <Text style={styles.role}>Life OS · минимальный режим</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Статистика</Text>

      <View style={styles.grid}>
        <Stat title="Баланс" value={money(stats.balance)} />
        <Stat title="Финансы" value={`${stats.records}`} />
        <Stat title="Идеи" value={`${stats.ideas}`} />
        <Stat title="Цели" value={`${stats.goals}`} />
      </View>

      <Text style={styles.sectionTitle}>Настройки</Text>

      <View style={styles.settingsCard}>
        <Row title="Валюта" value="KZT" />
        <Divider />
        <Row title="Тема" value="Светлая" />
        <Divider />
        <Row title="Уведомления" value="Скоро" />
        <Divider />
        <Row title="Резервная копия" value="Скоро" />
      </View>
    </ScrollView>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function Row({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 64, paddingBottom: 130 },

  header: { marginBottom: 18 },
  kicker: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 5 },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A' },

  profileCard: {
    backgroundColor: '#0F172A',
    borderRadius: 26,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  profileInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  role: { fontSize: 13, fontWeight: '700', color: '#CBD5E1', marginTop: 4 },

  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#0F172A', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    width: '48.5%',
    minHeight: 92,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
  },
  statValue: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  statTitle: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginTop: 8 },

  settingsCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  rowTitle: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  rowValue: { fontSize: 13, fontWeight: '800', color: '#94A3B8' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
});
