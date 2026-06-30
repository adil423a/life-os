import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { colors } from '@/constants/colors';

const stats = [
  { title: 'Баланс', value: '245 000 ₸', icon: '💰', color: colors.green },
  { title: 'Цели', value: '5 активных', icon: '🎯', color: colors.purple },
  { title: 'Идеи', value: '18 записей', icon: '💡', color: colors.orange },
  { title: 'Сегодня', value: '3 задачи', icon: '✅', color: colors.blue },
];

const quickActions = [
  { title: 'Доход', icon: '➕', color: colors.green },
  { title: 'Расход', icon: '➖', color: colors.red },
  { title: 'Идея', icon: '💡', color: colors.orange },
  { title: 'Цель', icon: '🎯', color: colors.purple },
];

const recentItems = [
  { title: 'Продукты', desc: 'Расход · Сегодня', icon: '🛒', value: '-12 450 ₸' },
  { title: 'Идея для Court Hunter', desc: 'Идея · Вчера', icon: '🎾', value: '' },
  { title: 'Запустить Life OS', desc: 'Цель · 75%', icon: '🚀', value: '' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AppHeader title="Добрый вечер, Адиль 👋" subtitle="Сегодня хороший день для порядка" />

      <AppCard style={styles.heroCard}>
        <Text style={styles.heroLabel}>Общий баланс</Text>
        <Text style={styles.heroValue}>245 000 ₸</Text>
        <Text style={styles.heroMeta}>+18 500 ₸ за этот месяц</Text>
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

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Быстро добавить</Text>
      </View>

      <View style={styles.actions}>
        {quickActions.map((item) => (
          <TouchableOpacity key={item.title} style={styles.action}>
            <View style={[styles.actionIconBox, { backgroundColor: `${item.color}18` }]}>
              <Text style={styles.actionIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.actionText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Последние записи</Text>
        <Text style={styles.seeAll}>Все</Text>
      </View>

      <AppCard>
        {recentItems.map((item, index) => (
          <View key={item.title}>
            <View style={styles.record}>
              <View style={styles.recordIcon}>
                <Text>{item.icon}</Text>
              </View>

              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>{item.title}</Text>
                <Text style={styles.recordDesc}>{item.desc}</Text>
              </View>

              {!!item.value && <Text style={styles.recordValue}>{item.value}</Text>}
            </View>

            {index !== recentItems.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </AppCard>
    </ScrollView>
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
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: colors.black,
    marginBottom: 14,
  },
  heroLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  heroValue: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 8,
  },
  heroMeta: {
    color: colors.green,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    minHeight: 120,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  icon: {
    fontSize: 18,
  },
  statTitle: {
    fontSize: 13,
    color: colors.muted,
  },
  statValue: {
    fontSize: 17,
    color: colors.text,
    fontWeight: '900',
    marginTop: 5,
  },
  sectionRow: {
    marginTop: 26,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  seeAll: {
    fontSize: 13,
    color: colors.purple,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  recordDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 3,
  },
  recordValue: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.red,
  },
  divider: {
    height: 1,
    backgroundColor: colors.soft,
    marginVertical: 12,
  },
});