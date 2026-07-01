import { useEffect, useState } from 'react';
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
import { Idea, useAppStore } from '@/store/useAppStore';

const categories = ['Бизнес', 'Финансы', 'Court Hunter', 'Baraka', 'Личное', 'Другое'];

export default function IdeasScreen() {
  const params = useLocalSearchParams<{ quick?: string }>();

  const ideas = useAppStore((state) => state.ideas);
  const addIdeaToStore = useAppStore((state) => state.addIdea);
  const deleteIdeaFromStore = useAppStore((state) => state.deleteIdea);

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Другое');

  useEffect(() => {
    if (params.quick === 'idea') setModalVisible(true);
  }, [params.quick]);

  function resetForm() {
    setTitle('');
    setDescription('');
    setCategory('Другое');
  }

  async function addIdea() {
    if (!title.trim()) return Alert.alert('Ошибка', 'Введите название идеи');

    const newIdea: Idea = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      category,
      date: new Date().toLocaleDateString('ru-RU'),
    };

    await addIdeaToStore(newIdea);
    resetForm();
    setModalVisible(false);
  }

  function deleteIdea(id: string) {
    Alert.alert('Удалить идею?', 'Это действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => deleteIdeaFromStore(id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.kicker}>Мысли</Text>
              <Text style={styles.title}>Идеи</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{ideas.length}</Text>
              <Text style={styles.summaryLabel}>сохраненных идей</Text>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.primaryButtonText}>Добавить идею</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Все идеи</Text>
          </>
        }
        ListEmptyComponent={<Text style={styles.empty}>Пока нет идей</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => deleteIdea(item.id)}>
            <View style={styles.cardTop}>
              <Text style={styles.badge}>{item.category}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {!!item.description && <Text style={styles.cardText} numberOfLines={3}>{item.description}</Text>}
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Новая идея</Text>

          <Field label="Название" value={title} onChangeText={setTitle} placeholder="Например: функция для Life OS" />
          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Опиши идею подробнее..."
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Категория</Text>
          <View style={styles.chips}>
            {categories.map((item) => (
              <TouchableOpacity key={item} style={[styles.chip, category === item && styles.chipActive]} onPress={() => setCategory(item)}>
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={addIdea}>
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

  summaryCard: { backgroundColor: '#0F172A', borderRadius: 26, padding: 20, marginBottom: 12 },
  summaryValue: { fontSize: 30, fontWeight: '900', color: '#FFFFFF' },
  summaryLabel: { fontSize: 13, fontWeight: '800', color: '#CBD5E1', marginTop: 5 },

  primaryButton: { backgroundColor: '#0F172A', borderRadius: 18, padding: 15, alignItems: 'center', marginBottom: 22 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#0F172A', marginBottom: 10 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  badge: { fontSize: 12, fontWeight: '900', color: '#0F172A' },
  date: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  cardTitle: { fontSize: 14, fontWeight: '900', color: '#0F172A' },
  cardText: { fontSize: 13, fontWeight: '600', color: '#64748B', lineHeight: 20, marginTop: 8 },
  empty: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textAlign: 'center', marginTop: 20 },

  modal: { flex: 1, backgroundColor: '#FFFFFF' },
  modalContent: { padding: 24, paddingTop: 70, paddingBottom: 40 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '900', color: '#64748B', marginTop: 18, marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 15, fontSize: 15, borderWidth: 1, borderColor: '#E2E8F0', color: '#0F172A' },
  textArea: { height: 120, textAlignVertical: 'top' },
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
