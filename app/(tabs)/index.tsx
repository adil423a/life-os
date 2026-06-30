import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/useAppStore';

export default function HomeScreen() {
  const finance = useAppStore((state) => state.finance);
  const ideas = useAppStore((state) => state.ideas);
  const goals = useAppStore((state) => state.goals);

  const data = useMemo(() => {
    const income = finance
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);

    const expense = finance
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      balance: income - expense,
      income,
      expense,
      ideasCount: ideas.length,
      goalsCount: goals.filter((goal) => goal.progress < 100).length,
      latestFinance: finance.slice(0, 3),
      latestIdeas: ideas.slice(0, 3),
      latestGoals: goals.slice(0, 3),
    };
  }, [finance, ideas, goals]);

  function money(value: number) {
    return value.toLocaleString('ru-RU') + ' ₸';
  }

  const stats = [
    { title: 'Баланс', value: money(data.balance), icon: '💰', color: colors.green },
    { title: 'Доходы', value: money(data.income), icon: '➕', color: colors.blue },
    { title: 'Идеи', value: `${data.ideasCount}`, icon: '💡', color: colors.orange },
    { title: 'Цели', value: `${data.goalsCount}`, icon: '🎯', color: colors.purple },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppHeader title="Life OS" subtitle="Добрый день, Адиль 👋" />

      <AppCard style={styles.hero}>
        <Text style={styles.heroLabel}>Общий баланс</Text>
        <Text style={styles.heroValue}>{money(data.balance)}</Text>
        <Text style={styles.heroMeta}>
          Доходы: {money(data.income)} · Расходы: {money(data.expense)}
        </Text>
      </AppCard>

      <View style={styles.grid}>
        {stats.map((item) => (
          <AppCard key={item.title} style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: `${item.color}18` }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={styles.statTitle}>{item.title}</Text>
            <Text style={styles.statValue}>{item.value}</Text>
          </AppCard>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Последние финансы</Text>
      <AppCard>
        {data.latestFinance.length === 0 ? (
          <Text style={styles.empty}>Пока нет финансовых записей</Text>
        ) : (
          data.latestFinance.map((item, index) => (
            <View key={item.id}>
              <View style={styles.row}>
                <Text style={styles.rowIcon}>{item.type === 'income' ? '➕' : '➖'}</Text>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowDesc}>{item.category} · {item.date}</Text>
                </View>
                <Text style={item.type === 'income' ? styles.income : styles.expense}>
                  {item.type === 'income' ? '+' : '-'}{money(item.amount)}
                </Text>
              </View>
              {index !== data.latestFinance.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </AppCard>

      <Text style={styles.sectionTitle}>Последние идеи</Text>
      <AppCard>
        {data.latestIdeas.length === 0 ? (
          <Text style={styles.empty}>Пока нет идей</Text>
        ) : (
          data.latestIdeas.map((item, index) => (
            <View key={item.id}>
              <View style={styles.row}>
                <Text style={styles.rowIcon}>💡</Text>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowDesc}>{item.category} · {item.date}</Text>
                </View>
              </View>
              {index !== data.latestIdeas.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </AppCard>

      <Text style={styles.sectionTitle}>Активные цели</Text>
      <AppCard>
        {data.latestGoals.length === 0 ? (
          <Text style={styles.empty}>Пока нет целей</Text>
        ) : (
          data.latestGoals.map((item, index) => (
            <View key={item.id}>
              <View style={styles.row}>
                <Text style={styles.rowIcon}>🎯</Text>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowDesc}>{item.category} · {item.progress}%</Text>
                </View>
              </View>
              {index !== data.latestGoals.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },

  hero: { backgroundColor: colors.black, marginBottom: 14 },
  heroLabel: { color: '#94a3b8', fontSize: 13 },
  heroValue: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 8 },
  heroMeta: { color: colors.green, fontSize: 13, fontWeight: '800', marginTop: 10 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '48%', minHeight: 118 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  icon: { fontSize: 18 },
  statTitle: { fontSize: 13, color: colors.muted },
  statValue: { fontSize: 17, color: colors.text, fontWeight: '900', marginTop: 5 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    marginTop: 26,
    marginBottom: 12,
  },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  rowIcon: { fontSize: 20, marginRight: 12 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '900', color: colors.text },
  rowDesc: { fontSize: 12, color: '#94a3b8', marginTop: 3 },
  income: { color: colors.green, fontSize: 13, fontWeight: '900' },
  expense: { color: colors.red, fontSize: 13, fontWeight: '900' },
  divider: { height: 1, backgroundColor: colors.soft, marginVertical: 12 },
  empty: { color: '#94a3b8', fontSize: 14 },
});
