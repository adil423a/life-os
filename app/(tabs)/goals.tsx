import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
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
  const params = useLocalSearchParams<{ quick?: string }>();

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

  useEffect(() => {
    if (params.quick === 'goal') setModalVisible(true);
  }, [params.quick]);

  const stats = useMemo(() => {
    const active = goals.filter((g) => g.progress < 100).length;
    const done = goals.filter((g) => g.progress >= 100).length;
    const avg = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;

    return { active, done, avg };
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

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: title.trim(),
      target: target.trim(),
      deadline: deadline.trim(),
      progress: Math.min(100, Math.max(0, Number(progress) || 0)),
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
      { text: 'Удалить', style: 'destructive', onPress: () => deleteGoalFromStore(id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.kicker}>Прогресс</Text>
              <Text style={styles.title}>Цели</Text>
            </View>

            <View style={styles.statsRow}>
              <Stat title="Активные" value={`${stats.active}`} />
              <Stat title="Готово" value={`${stats.done}`} />
              <Stat title="Среднее" value={`${stats.avg}%`} />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.primaryButtonText}>Добавить цель</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Мои цели</Text>
          </>
        }
        ListEmptyComponent={<Text style={styles.empty}>Пока нет целей</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => deleteGoal(item.id)}>
            <View style={styles.cardTop}>
              <Text style={styles.goalTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.percent}>{item.progress}%</Text>
            </View>

            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>

            <Text style={styles.meta}>
              {item.category}
              {item.deadline ? ` · ${item.deadline}` : ''}
            </Text>

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
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Новая цель</Text>

          <Field label="Название" value={title} onChangeText={setTitle} placeholder="Например: запустить Life OS" />
          <Field label="Результат" value={target} onChangeText={setTarget} placeholder="MVP до конца месяца" />
          <Field label="Дедлайн" value={deadline} onChangeText={setDeadline} placeholder="30 июля" />
          <Field label="Прогресс (%)" value={progress} onChangeText={setProgress} placeholder="0" keyboardType="numeric" />

          <Text style={styles.label}>Категория</Text>
          <View style={styles.chips}>
            {categories.map((item) => (
              <TouchableOpacity key={item} style={[styles.chip, category === item && styles.chipActive]} onPress={() => setCategory(item)}>
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={addGoal}>
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => { resetForm(); setModalVisible(false); }}>
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
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

function Field(props: any) {
  return (
    <>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput style={styles.input} {...props} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 64, paddingBottom: 130 },

  header: { marginBottom: 18 },
  kicker: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 5 },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  statTitle: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 5 },

  primaryButton: { backgroundColor: '#0F172A', borderRadius: 18, padding: 15, alignItems: 'center', marginBottom: 22 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#0F172A', marginBottom: 10 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  goalTitle: { flex: 1, fontSize: 14, fontWeight: '900', color: '#0F172A', paddingRight: 10 },
  percent: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  progressBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 999, overflow: 'hidden', marginTop: 14 },
  progressFill: { height: '100%', backgroundColor: '#0F172A', borderRadius: 999 },
  meta: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginTop: 10 },
  controls: { flexDirection: 'row', gap: 8, marginTop: 14 },
  controlButton: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 14, padding: 10, alignItems: 'center' },
  controlText: { color: '#0F172A', fontSize: 12, fontWeight: '900' },
  empty: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textAlign: 'center', marginTop: 20 },

  modal: { flex: 1, backgroundColor: '#FFFFFF' },
  modalContent: { padding: 24, paddingTop: 70, paddingBottom: 40 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '900', color: '#64748B', marginTop: 18, marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 15, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0', color: '#0F172A' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#0F172A' },
  chipText: { color: '#64748B', fontSize: 12, fontWeight: '900' },
  chipTextActive: { color: '#FFFFFF' },
  saveButton: { backgroundColor: '#0F172A', borderRadius: 18, padding: 16, alignItems: 'center', marginTop: 26 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  cancelButton: { padding: 16, alignItems: 'center' },
  cancelButtonText: { color: '#94A3B8', fontSize: 14, fontWeight: '800' },
});
