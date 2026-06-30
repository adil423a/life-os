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
import { FinanceRecord, useAppStore } from '@/store/useAppStore';

const categories = ['Еда', 'Транспорт', 'Бизнес', 'Теннис', 'Дом', 'Другое'];

export default function FinanceScreen() {
  const records = useAppStore((state) => state.finance);
  const addFinanceRecord = useAppStore((state) => state.addFinanceRecord);
  const deleteFinanceRecord = useAppStore((state) => state.deleteFinanceRecord);

  const [modalVisible, setModalVisible] = useState(false);
  const [recordType, setRecordType] = useState<'income' | 'expense'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Другое');

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

  async function addRecord() {
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

    await addFinanceRecord(newRecord);
    resetForm();
    setModalVisible(false);
  }

  function deleteRecord(id: string) {
    Alert.alert('Удалить запись?', 'Это действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => deleteFinanceRecord(id),
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
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },
  title: { fontSize: 30, fontWeight: '900', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 6, marginBottom: 22 },

  balanceCard: {
    backgroundColor: colors.black,
    borderRadius: 26,
    padding: 22,
    marginBottom: 18,
  },
  balanceLabel: { color: '#94a3b8', fontSize: 13 },
  balanceValue: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 8 },
  summaryRow: { flexDirection: 'row', gap: 12, marginTop: 22 },
  summaryItem: { flex: 1, backgroundColor: '#1f2937', borderRadius: 18, padding: 14 },
  summaryLabel: { color: '#94a3b8', fontSize: 12 },
  incomeText: { color: colors.green, fontSize: 15, fontWeight: '800', marginTop: 6 },
  expenseText: { color: colors.red, fontSize: 15, fontWeight: '800', marginTop: 6 },

  addButton: {
    backgroundColor: colors.blue,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  sectionTitle: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 12 },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 20 },

  recordCard: {
    backgroundColor: colors.card,
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
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  recordMeta: { fontSize: 12, color: '#94a3b8', marginTop: 3 },
  recordIncome: { color: colors.green, fontSize: 13, fontWeight: '900' },
  recordExpense: { color: colors.red, fontSize: 13, fontWeight: '900' },

  modal: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 70 },
  modalTitle: { fontSize: 28, fontWeight: '900', color: colors.text, marginBottom: 20 },
  typeSwitch: { flexDirection: 'row', backgroundColor: colors.soft, borderRadius: 16, padding: 4 },
  typeButton: { flex: 1, padding: 14, alignItems: 'center', borderRadius: 13 },
  incomeActive: { backgroundColor: colors.green },
  expenseActive: { backgroundColor: colors.red },
  typeText: { color: colors.muted, fontWeight: '800' },
  activeText: { color: '#fff' },

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
