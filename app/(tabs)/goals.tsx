import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
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

type Goal = {
  id: string;
  title: string;
  target: string;
  deadline: string;
  progress: number;
  category: string;
  date: string;
};

const STORAGE_KEY = 'goals_records';

const categories = ['Финансы', 'Бизнес', 'Court Hunter', 'Baraka', 'Здоровье', 'Личное'];

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [progress, setProgress] = useState('0');
  const [category, setCategory] = useState('Личное');

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setGoals(JSON.parse(data));
    } catch {
      console.log('Ошибка загрузки целей');
    }
  }

  async function saveGoals(nextGoals: Goal[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextGoals));
    } catch {
      console.log('Ошибка сохранения целей');
    }
  }

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

  function addGoal() {
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

    const updatedGoals = [newGoal, ...goals];

    setGoals(updatedGoals);
    saveGoals(updatedGoals);
    resetForm();
    setModalVisible(false);
  }

  function changeProgress(id: string, delta: number) {
    const updatedGoals = goals.map((goal) => {
      if (goal.id !== id) return goal;

      return {
        ...goal,
        progress: Math.min(100, Math.max(0, goal.progress + delta)),
      };
    });

    setGoals(updatedGoals);
    saveGoals(updatedGoals);
  }

  function deleteGoal(id: string) {
    Alert.alert('Удалить цель?', 'Это действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          const updatedGoals = goals.filter((goal) => goal.id !== id);
          setGoals(updatedGoals);
          saveGoals(updatedGoals);
        },
      },
    ]);
  }

  function getProgressColor(value: number) {
    if (value >= 80) return '#10b981';
    if (value >= 40) return '#3b82f6';
    return '#f59e0b';
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
              <TouchableOpacity style={styles.controlButton} onPress={() => changeProgress(item.id, -10)}>
                <Text style={styles.controlText}>−10%</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={() => changeProgress(item.id, 10)}>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },
  title: { fontSize: 30, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 6, marginBottom: 22 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
  },
  statValue: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 5 },

  addButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 12 },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 20 },

  card: { backgroundColor: '#fff', borderRadius: 22, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    backgroundColor: '#ede9fe',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { color: '#5b21b6', fontSize: 12, fontWeight: '800' },
  progressText: { fontSize: 16, fontWeight: '900' },
  cardTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a', marginTop: 14 },
  metaText: { fontSize: 13, color: '#64748b', marginTop: 8 },

  progressBg: {
    height: 9,
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: { height: '100%', borderRadius: 999 },

  controls: { flexDirection: 'row', gap: 10, marginTop: 14 },
  controlButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 11,
    alignItems: 'center',
  },
  controlText: { color: '#475569', fontWeight: '800' },

  modal: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 70 },
  modalTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 20 },

  label: { fontSize: 13, fontWeight: '700', color: '#64748b', marginTop: 18, marginBottom: 8 },
  input: {
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#f1f5f9',
  },
  categoryActive: { backgroundColor: '#111827' },
  categoryText: { color: '#64748b', fontWeight: '700' },
  categoryActiveText: { color: '#fff' },

  saveButton: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 17,
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  cancelButton: { padding: 17, alignItems: 'center' },
  cancelButtonText: { color: '#94a3b8', fontSize: 15, fontWeight: '700' },
});