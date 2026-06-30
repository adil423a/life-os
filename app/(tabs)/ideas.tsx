import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
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

type Idea = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
};

const STORAGE_KEY = 'ideas_records';
const categories = ['Бизнес', 'Финансы', 'Court Hunter', 'Baraka', 'Личное', 'Другое'];

export default function IdeasScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Другое');

  useEffect(() => {
    loadIdeas();
  }, []);

  async function loadIdeas() {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) setIdeas(JSON.parse(data));
  }

  async function saveIdeas(nextIdeas: Idea[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextIdeas));
  }

  function resetForm() {
    setTitle('');
    setDescription('');
    setCategory('Другое');
  }

  function addIdea() {
    if (!title.trim()) return Alert.alert('Ошибка', 'Введите название идеи');

    const newIdea: Idea = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      category,
      date: new Date().toLocaleDateString('ru-RU'),
    };

    const updatedIdeas = [newIdea, ...ideas];
    setIdeas(updatedIdeas);
    saveIdeas(updatedIdeas);
    resetForm();
    setModalVisible(false);
  }

  function deleteIdea(id: string) {
    Alert.alert('Удалить идею?', 'Это действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          const updatedIdeas = ideas.filter((idea) => idea.id !== id);
          setIdeas(updatedIdeas);
          saveIdeas(updatedIdeas);
        },
      },
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
            <Text style={styles.title}>💡 Идеи</Text>
            <Text style={styles.subtitle}>Быстро сохраняй мысли, проекты и инсайты</Text>

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>＋ Добавить идею</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Все идеи</Text>
          </>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>Пока нет идей. Добавь первую.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onLongPress={() => deleteIdea(item.id)}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.category}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {!!item.description && <Text style={styles.cardDescription}>{item.description}</Text>}
            <Text style={styles.date}>{item.date}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Новая идея</Text>

          <Text style={styles.label}>Название</Text>
          <TextInput
            style={styles.input}
            placeholder="Например: функция для Court Hunter"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Описание</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Опиши идею подробнее..."
            value={description}
            onChangeText={setDescription}
            multiline
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

          <TouchableOpacity style={styles.saveButton} onPress={addIdea}>
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
  addButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 12 },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef3c7',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  badgeText: { color: '#92400e', fontSize: 12, fontWeight: '800' },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
  cardDescription: { fontSize: 13, color: '#64748b', marginTop: 8, lineHeight: 20 },
  date: { fontSize: 12, color: '#94a3b8', marginTop: 12 },
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
  textArea: { height: 120, textAlignVertical: 'top' },
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