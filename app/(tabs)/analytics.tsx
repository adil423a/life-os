import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

export default function AnalyticsScreen() {
  const finance = useAppStore((state) => state.finance);
  const ideas = useAppStore((state) => state.ideas);
  const goals = useAppStore((state) => state.goals);

  const data = useMemo(() => {
    const income = finance.filter((i) => i.type === 'income').reduce((s, i) => s + i.amount, 0);
    const expense = finance.filter((i) => i.type === 'expense').reduce((s, i) => s + i.amount, 0);
    const activeGoals = goals.filter((g) => g.progress < 100).length;
    const doneGoals = goals.filter((g) => g.progress >= 100).length;
    const avgProgress = goals.length
      ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
      : 0;

    return {
      balance: income - expense,
      income,
      expense,
      ideas: ideas.length,
      activeGoals,
      doneGoals,
      avgProgress,
    };
  }, [finance, ideas, goals]);

  function money(value: number) {
    return value.toLocaleString('ru-RU') + ' ₸';
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Отчет</Text>
        <Text style={styles.title}>Аналитика</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>Общий баланс</Text>
        <Text style={styles.heroValue}>{money(data.balance)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Финансы</Text>
      <View style={styles.grid}>
        <Stat title="Доходы" value={`+${money(data.income)}`} />
        <Stat title="Расходы" value={`-${money(data.expense)}`} />
      </View>

      <Text style={styles.sectionTitle}>Прогресс</Text>
      <View style={styles.grid}>
        <Stat title="Активные цели" value={`${data.activeGoals}`} />
        <Stat title="Выполнено" value={`${data.doneGoals}`} />
        <Stat title="Средний прогресс" value={`${data.avgProgress}%`} />
        <Stat title="Идеи" value={`${data.ideas}`} />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 64, paddingBottom: 130 },
  header: { marginBottom: 18 },
  kicker: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 5 },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A' },

  hero: { backgroundColor: '#0F172A', borderRadius: 26, padding: 20, marginBottom: 24 },
  heroLabel: { fontSize: 13, fontWeight: '800', color: '#CBD5E1' },
  heroValue: { fontSize: 30, fontWeight: '900', color: '#FFFFFF', marginTop: 10 },

  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#0F172A', marginBottom: 10, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
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
});
