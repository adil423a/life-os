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

type FinanceRecord = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
};

const STORAGE_KEY = 'finance_records';

const categories = ['Еда', 'Транспорт', 'Бизнес', 'Теннис', 'Дом', 'Другое'];

export default function FinanceScreen() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [recordType, setRecordType] = useState<'income' | 'expense'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Другое');

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setRecords(JSON.parse(data));
    } catch {
      console.log('Ошибка загрузки финансов');
    }
  }

  async function saveRecords(nextRecords: FinanceRecord[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
    } catch {
      console.log('Ошибка сохранения финансов');
    }
  }

  const totalIncome = useMemo(
    () => records.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0),
    [records]
  );

  const totalExpense = useMemo(
    () => records.filter((r) => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0),
    [records]
  );

  const balance = totalIncome - totalExpense;

  function formatMoney(value: number) {
    return value.toLocaleString('ru-RU') + ' ₸';
  }

  function resetForm() {
    setTitle('');
    setAmount('');
    setCategory('Другое');
    setRecordType('expense');
  }

  function addRecord() {
    const parsedAmount = Number(amount.replace(/\s/g, '').replace(',', '.'));

    if (!title.trim()) return Alert.alert('Ошибка', 'Введите название');
    if (!parsedAmount || parsedAmount <= 0) return Alert.alert('Ошибка', 'Введите корректную сумму');

    const newRecord: FinanceRecord = {
      id: Date.now().toString(),
      title: title.trim(),
      amount: parsedAmount,
      type: recordType,
      category,
      date: new Date().toLocaleDateString('ru-RU'),
    };

    const updatedRecords = [newRecord, ...records];

    setRecords(updatedRecords);
    saveRecords(updatedRecords);
    resetForm();
    setModalVisible(false);
  }

  function deleteRecord(id: string) {
    Alert.alert('Удалить запись?', 'Это действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          const updatedRecords = records.filter((r) => r.id !== id);
          setRecords(updatedRecords);
          saveRecords(updatedRecords);
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>💰 Финансы</Text>
            <Text style={styles.subtitle}>Учет доходов и расходов</Text>

            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Баланс</Text>
              <Text style={styles.balanceValue}>{formatMoney(balance)}</Text>

              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Доходы</Text>
                  <Text style={styles.incomeText}>{formatMoney(totalIncome)}</Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Расходы</Text>
                  <Text style={styles.expenseText}>{formatMoney(totalExpense)}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>＋ Добавить запись</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>История</Text>
          </>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Пока нет записей. Добавь первый доход или расход.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.recordCard} onLongPress={() => deleteRecord(item.id)}>
            <View style={styles.recordLeft}>
              <View style={styles.recordIcon}>
                <Text>{item.type === 'income' ? '➕' : '➖'}</Text>
              </View>

              <View>
                <Text style={styles.recordTitle}>{item.title}</Text>
                <Text style={styles.recordMeta}>
                  {item.category} · {item.date}
                </Text>
              </View>
            </View>

            <Text style={item.type === 'income' ? styles.recordIncome : styles.recordExpense}>
              {item.type === 'income' ? '+' : '-'}
              {formatMoney(item.amount)}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Новая запись</Text>

          <View style={styles.typeSwitch}>
            <TouchableOpacity
              style={[styles.typeButton, recordType === 'income' && styles.incomeActive]}
              onPress={() => setRecordType('income')}
            >
              <Text style={[styles.typeText, recordType === 'income' && styles.activeText]}>
                Доход
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, recordType === 'expense' && styles.expenseActive]}
              onPress={() => setRecordType('expense')}
            >
              <Text style={[styles.typeText, recordType === 'expense' && styles.activeText]}>
                Расход
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Название</Text>
          <TextInput
            style={styles.input}
            placeholder="Например: продукты"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Сумма</Text>
          <TextInput
            style={styles.input}
            placeholder="Например: 12000"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
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

          <TouchableOpacity style={styles.saveButton} onPress={addRecord}>
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

  balanceCard: {
    backgroundColor: '#111827',
    borderRadius: 26,
    padding: 22,
    marginBottom: 18,
  },
  balanceLabel: { color: '#94a3b8', fontSize: 13 },
  balanceValue: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 8 },
  summaryRow: { flexDirection: 'row', gap: 12, marginTop: 22 },
  summaryItem: { flex: 1, backgroundColor: '#1f2937', borderRadius: 18, padding: 14 },
  summaryLabel: { color: '#94a3b8', fontSize: 12 },
  incomeText: { color: '#10b981', fontSize: 15, fontWeight: '800', marginTop: 6 },
  expenseText: { color: '#ef4444', fontSize: 15, fontWeight: '800', marginTop: 6 },

  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 12 },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 20 },

  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  recordMeta: { fontSize: 12, color: '#94a3b8', marginTop: 3 },
  recordIncome: { color: '#10b981', fontSize: 13, fontWeight: '900' },
  recordExpense: { color: '#ef4444', fontSize: 13, fontWeight: '900' },

  modal: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 70 },
  modalTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 20 },
  typeSwitch: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 16, padding: 4 },
  typeButton: { flex: 1, padding: 14, alignItems: 'center', borderRadius: 13 },
  incomeActive: { backgroundColor: '#10b981' },
  expenseActive: { backgroundColor: '#ef4444' },
  typeText: { color: '#64748b', fontWeight: '800' },
  activeText: { color: '#fff' },

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