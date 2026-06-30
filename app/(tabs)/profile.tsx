import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

export default function ProfileScreen() {
  const finance = useAppStore((state) => state.finance);
  const ideas = useAppStore((state) => state.ideas);
  const goals = useAppStore((state) => state.goals);

  const stats = useMemo(() => {
    const income = finance
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const expense = finance
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      balance: income - expense,
      expense,
      ideasCount: ideas.length,
      activeGoals: goals.filter((goal) => goal.progress < 100).length,
    };
  }, [finance, ideas, goals]);

  function money(value: number) {
    return value.toLocaleString('ru-RU') + ' ₸';
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppHeader title="👤 Я" subtitle="Личный центр управления Life OS" />

      <AppCard style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>

        <Text style={styles.name}>Адиль</Text>
        <Text style={styles.role}>Life OS · v0.3</Text>
      </AppCard>

      <Text style={styles.sectionTitle}>Статистика</Text>

      <View style={styles.grid}>
        <AppCard style={styles.statCard}>
          <Text style={styles.statIcon}>💰</Text>
          <Text style={styles.statValue}>{money(stats.balance)}</Text>
          <Text style={styles.statLabel}>Баланс</Text>
        </AppCard>

        <AppCard style={styles.statCard}>
          <Text style={styles.statIcon}>💡</Text>
          <Text style={styles.statValue}>{stats.ideasCount}</Text>
          <Text style={styles.statLabel}>Идей</Text>
        </AppCard>

        <AppCard style={styles.statCard}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statValue}>{stats.activeGoals}</Text>
          <Text style={styles.statLabel}>Активных целей</Text>
        </AppCard>

        <AppCard style={styles.statCard}>
          <Text style={styles.statIcon}>📉</Text>
          <Text style={styles.statValue}>{money(stats.expense)}</Text>
          <Text style={styles.statLabel}>Расходы</Text>
        </AppCard>
      </View>

      <Text style={styles.sectionTitle}>Настройки</Text>

      <AppCard>
        <SettingsRow icon="💵" title="Валюта" value="₸ KZT" />
        <View style={styles.divider} />
        <SettingsRow icon="🌙" title="Тема" value="Светлая" />
        <View style={styles.divider} />
        <SettingsRow icon="🔔" title="Уведомления" value="Скоро" />
        <View style={styles.divider} />
        <SettingsRow icon="☁️" title="Резервная копия" value="Скоро" />
      </AppCard>
    </ScrollView>
  );
}

function SettingsRow({ icon, title, value }: { icon: string; title: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },

  profileCard: { alignItems: 'center' },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  name: { fontSize: 24, fontWeight: '900', color: colors.text },
  role: { fontSize: 13, color: colors.muted, marginTop: 4 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginTop: 26,
    marginBottom: 12,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '48%', minHeight: 120 },
  statIcon: { fontSize: 22, marginBottom: 12 },
  statValue: { fontSize: 17, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 5 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  rowIcon: { fontSize: 22, marginRight: 12 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '900', color: colors.text },
  settingValue: { fontSize: 13, fontWeight: '800', color: colors.muted },
  divider: { height: 1, backgroundColor: colors.soft, marginVertical: 12 },
});
