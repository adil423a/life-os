import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
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

    const activeGoals = goals.filter((goal) => goal.progress < 100);
    const topGoal = activeGoals
      .slice()
      .sort((a, b) => b.progress - a.progress)[0];

    const lastFinance = finance[0];
    const lastIdea = ideas[0];
    const lastGoal = goals[0];

    const activity = [
      lastFinance && {
        id: `finance-${lastFinance.id}`,
        icon: lastFinance.type === 'income' ? '↑' : '↓',
        title: lastFinance.title,
        meta: `${lastFinance.type === 'income' ? '+' : '-'}${money(lastFinance.amount)}`,
      },
      lastIdea && {
        id: `idea-${lastIdea.id}`,
        icon: '•',
        title: lastIdea.title,
        meta: 'Идея',
      },
      lastGoal && {
        id: `goal-${lastGoal.id}`,
        icon: '•',
        title: lastGoal.title,
        meta: `${lastGoal.progress}%`,
      },
    ].filter(Boolean) as {
      id: string;
      icon: string;
      title: string;
      meta: string;
    }[];

    return {
      income,
      expense,
      balance: income - expense,
      ideasCount: ideas.length,
      activeGoalsCount: activeGoals.length,
      topGoal,
      activity: activity.slice(0, 3),
    };
  }, [finance, ideas, goals]);

  function money(value: number) {
    return value.toLocaleString('ru-RU') + ' ₸';
  }

  function todayText() {
    return new Date().toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  const expensePercent =
    data.income > 0 ? Math.min(100, Math.round((data.expense / data.income) * 100)) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>{todayText()}</Text>
          <Text style={styles.title}>Добрый день, Адиль</Text>
        </View>

        <View style={styles.statusDot} />
      </View>

      <AppCard style={styles.balanceCard}>
        <View style={styles.cardTop}>
          <Text style={styles.cardLabel}>Баланс</Text>
          <Text style={styles.cardHint}>{expensePercent}% расходов</Text>
        </View>

        <Text style={styles.balanceValue}>{money(data.balance)}</Text>

        <View style={styles.moneyRow}>
          <View style={styles.moneyItem}>
            <Text style={styles.moneyLabel}>Доходы</Text>
            <Text style={styles.moneyValue}>+{money(data.income)}</Text>
          </View>

          <View style={styles.moneyItem}>
            <Text style={styles.moneyLabel}>Расходы</Text>
            <Text style={styles.moneyValue}>-{money(data.expense)}</Text>
          </View>
        </View>
      </AppCard>

      <View style={styles.summaryRow}>
        <MiniCard title="Цели" value={`${data.activeGoalsCount}`} />
        <MiniCard title="Идеи" value={`${data.ideasCount}`} />
        <MiniCard title="Сегодня" value="OK" />
      </View>

      <Text style={styles.sectionTitle}>Продолжить</Text>

      <AppCard style={styles.focusCard}>
        {data.topGoal ? (
          <>
            <View style={styles.cardTop}>
              <Text style={styles.focusTitle}>{data.topGoal.title}</Text>
              <Text style={styles.focusPercent}>{data.topGoal.progress}%</Text>
            </View>

            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${data.topGoal.progress}%` }]} />
            </View>

            <Text style={styles.focusMeta}>
              {data.topGoal.category}
              {data.topGoal.deadline ? ` · ${data.topGoal.deadline}` : ''}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.focusTitle}>Нет активной цели</Text>
            <Text style={styles.focusMeta}>Создай цель через кнопку +</Text>
          </>
        )}
      </AppCard>

      <Text style={styles.sectionTitle}>Разделы</Text>

      <View style={styles.grid}>
        <SectionButton title="Финансы" subtitle="Баланс и история" onPress={() => router.push('/finance' as any)} />
        <SectionButton title="Цели" subtitle="Прогресс" onPress={() => router.push('/goals' as any)} />
        <SectionButton title="Идеи" subtitle="Мысли и планы" onPress={() => router.push('/ideas' as any)} />
        <SectionButton title="Отчет" subtitle="Аналитика" onPress={() => router.push('/analytics' as any)} />
      </View>

      <Text style={styles.sectionTitle}>Активность</Text>

      <AppCard style={styles.activityCard}>
        {data.activity.length === 0 ? (
          <Text style={styles.empty}>Пока нет записей</Text>
        ) : (
          data.activity.map((item, index) => (
            <View key={item.id}>
              <View style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityIconText}>{item.icon}</Text>
                </View>

                <View style={styles.activityText}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.activityMeta}>{item.meta}</Text>
                </View>
              </View>

              {index !== data.activity.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        )}
      </AppCard>
    </ScrollView>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <AppCard style={styles.miniCard}>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniTitle}>{title}</Text>
    </AppCard>
  );
}

function SectionButton({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.sectionButton}>
      <Text style={styles.sectionButtonTitle}>{title}</Text>
      <Text style={styles.sectionButtonSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  content: {
    padding: 20,
    paddingTop: 64,
    paddingBottom: 130,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  kicker: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'capitalize',
    marginBottom: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F172A',
    marginTop: 6,
  },

  balanceCard: {
    backgroundColor: '#0F172A',
    marginBottom: 12,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
  },

  cardHint: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },

  balanceValue: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 10,
    letterSpacing: -0.6,
  },

  moneyRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  moneyItem: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 12,
  },

  moneyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },

  moneyValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 5,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },

  miniCard: {
    flex: 1,
    minHeight: 76,
    padding: 14,
  },

  miniValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },

  miniTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 10,
  },

  focusCard: {
    padding: 18,
  },

  focusTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    paddingRight: 10,
  },

  focusPercent: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },

  progressBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 999,
  },

  focusMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 10,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  sectionButton: {
    width: '48.5%',
    minHeight: 92,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  sectionButtonTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },

  sectionButtonSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 8,
  },

  activityCard: {
    padding: 16,
  },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  activityIconText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },

  activityText: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },

  activityMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },

  empty: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
