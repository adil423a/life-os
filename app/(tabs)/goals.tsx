import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import { Goal, useAppStore } from '@/store/useAppStore';

const categories = ['Финансы', 'Бизнес', 'Court Hunter', 'Baraka', 'Здоровье', 'Личное'];

export default function GoalsScreen() {
  const goals = useAppStore((state) => state.goals);
  const addGoalToStore = useAppStore((state) => state.addGoal);
  const deleteGoalFromStore = useAppStore((state) => state.deleteGoal);
  const updateGoalProgress = useAppStore((state) => state.updateGoalProgress);

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState('0');
  const [category, setCategory] = useState('Личное');

  const activeGoals = goals.filter((g) => g.progress < 100).length;
  const completedGoals = goals.filter((g) => g.progress >= 100).length;

  const averageProgress = useMemo(() => {
    if (goals.length === 0) return 0;
    const total = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(total / goals.length);
  }, [goals]);

  function resetForm() {
    setTitle('');
    setTarget('');
    setDeadline('');
    setProgress('0');
    setCategory('Личное');
  }

  async function addGoal() {
    if (!title.trim()) return Alert.alert('Ошибка', 'Введите название цели');

    const parsedProgress = Math.min(100, Math.max(0, Number(progress) || 0));

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: title.trim(),
      target: target.trim(),
      deadline: deadline.trim(),
      progress: parsedProgress,
      category,
      date: new Date().toLocaleDateString('ru-RU'),
    };

    await addGoalToStore(newGoal);
    resetForm();
    setModalVisible(false);
  }

  function deleteGoal(id: string) {
    Alert.alert('Удалить цель?', 'Это действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => deleteGoalFromStore(id),
      },
    ]);
  }

  function getProgressColor(value: number) {
    if (value >= 80) return colors.green;
    if (value >= 40) return colors.blue;
    return colors.orange;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>🎯 Цели</Text>
            <Text style={styles.subtitle}>Отслеживай прогресс по важным направлениям</Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{activeGoals}</Text>
                <Text style={styles.statLabel}>Активные</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{completedGoals}</Text>
                <Text style={styles.statLabel}>Выполнено</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>{averageProgress}%</Text>
                <Text style={styles.statLabel}>Средний прогресс</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>＋ Добавить цель</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Мои цели</Text>
          </>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>Пока нет целей. Добавь первую.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => deleteGoal(item.id)}>
            <View style={styles.cardHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>

              <Text style={[styles.progressText, { color: getProgressColor(item.progress) }]}>
                {item.progress}%
              </Text>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>

            {!!item.target && <Text style={styles.metaText}>🎯 {item.target}</Text>}
            {!!item.deadline && <Text style={styles.metaText}>📅 {item.deadline}</Text>}

            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${item.progress}%`,
                    backgroundColor: getProgressColor(item.progress),
                  },
                ]}
              />
            </View>

            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlButton} onPress={() => updateGoalProgress(item.id, -10)}>
                <Text style={styles.controlText}>−10%</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={() => updateGoalProgress(item.id, 10)}>
                <Text style={styles.controlText}>+10%</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Новая цель</Text>

          <Text style={styles.label}>Название</Text>
          <TextInput
            style={styles.input}
            placeholder="Например: запустить Life OS"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Цель / результат</Text>
          <TextInput
            style={styles.input}
            placeholder="Например: MVP до конца месяца"
            value={target}
            onChangeText={setTarget}
          />

          <Text style={styles.label}>Дедлайн</Text>
          <TextInput
            style={styles.input}
            placeholder="Например: 30 июля 2026"
            value={deadline}
            onChangeText={setDeadline}
          />

          <Text style={styles.label}>Прогресс (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            keyboardType="numeric"
            value={progress}
            onChangeText={setProgress}
          />

          <Text style={styles.label}>Категория</Text>
          <View style={styles.categories}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.categoryButton, category === item && styles.categoryActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.categoryText, category === item && styles.categoryActiveText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={addGoal}>
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              resetForm();
              setModalVisible(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },
  title: { fontSize: 30, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 6, marginBottom: 22 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
  },
  statValue: { fontSize: 20, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 11, color: colors.muted, marginTop: 5 },

  addButton: {
    backgroundColor: colors.purple,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  sectionTitle: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 12 },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 20 },

  card: { backgroundColor: colors.card, borderRadius: 22, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    backgroundColor: '#ede9fe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { color: '#5b21b6', fontSize: 12, fontWeight: '800' },
  progressText: { fontSize: 16, fontWeight: '900' },
  cardTitle: { fontSize: 17, fontWeight: '900', color: colors.text, marginTop: 14 },
  metaText: { fontSize: 13, color: colors.muted, marginTop: 8 },

  progressBg: {
    height: 9,
    backgroundColor: colors.soft,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: { height: '100%', borderRadius: 999 },

  controls: { flexDirection: 'row', gap: 10, marginTop: 14 },
  controlButton: {
    flex: 1,
    backgroundColor: colors.soft,
    borderRadius: 14,
    padding: 11,
    alignItems: 'center',
  },
  controlText: { color: '#475569', fontWeight: '800' },

  modal: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 70 },
  modalTitle: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: 20 },

  label: { fontSize: 13, fontWeight: '700', color: colors.muted, marginTop: 18, marginBottom: 8 },
  input: {
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.soft,
  },
  categoryActive: { backgroundColor: colors.black },
  categoryText: { color: colors.muted, fontWeight: '700' },
  categoryActiveText: { color: '#fff' },

  saveButton: {
    backgroundColor: colors.black,
    borderRadius: 18,
    padding: 17,
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  cancelButton: { padding: 17, alignItems: 'center' },
  cancelButtonText: { color: '#94a3b8', fontSize: 15, fontWeight: '700' },
});
