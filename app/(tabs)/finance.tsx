import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  Alert,
  FlatList,
  KeyboardTypeOptions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import { formatMoney } from '@/utils/money';
import {
  DEFAULT_FINANCE_CATEGORIES,
  FinanceRecord,
  useAppStore,
} from '@/store/useAppStore';

type FilterType = 'all' | 'income' | 'expense';

const QUICK_AMOUNTS = [1000, 5000, 10000];

type FinanceGroup = {
  key: string;
  title: string;
  total: number;
  items: FinanceRecord[];
};

export default function FinanceScreen() {
  const params = useLocalSearchParams<{ quick?: string }>();

  const records = useAppStore((state) => state.finance);
  const categories = useAppStore((state) => state.financeCategories);
  const categoryLimits = useAppStore((state) => state.financeCategoryLimits);

  const addFinanceRecord = useAppStore((state) => state.addFinanceRecord);
  const updateFinanceRecord = useAppStore((state) => state.updateFinanceRecord);
  const deleteFinanceRecord = useAppStore((state) => state.deleteFinanceRecord);

  const addFinanceCategory = useAppStore((state) => state.addFinanceCategory);
  const deleteFinanceCategory = useAppStore((state) => state.deleteFinanceCategory);
  const setFinanceCategoryLimit = useAppStore((state) => state.setFinanceCategoryLimit);
  const deleteFinanceCategoryLimit = useAppStore((state) => state.deleteFinanceCategoryLimit);

  const [modalVisible, setModalVisible] = useState(false);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [limitModalVisible, setLimitModalVisible] = useState(false);

  const [recordType, setRecordType] = useState<'income' | 'expense'>('expense');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Другое');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [newCategory, setNewCategory] = useState('');
  const [limitCategory, setLimitCategory] = useState('Еда');
  const [limitAmount, setLimitAmount] = useState('');

  useEffect(() => {
    if (params.quick === 'income') openCreateModal('income');
    if (params.quick === 'expense') openCreateModal('expense');
  }, [params.quick]);

  const sortedRecords = useMemo(() => {
    return records.slice().sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [records]);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return sortedRecords.filter((item) => {
      const matchesFilter = filter === 'all' || item.type === filter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.title.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [sortedRecords, filter, search]);

  const groupedRecords = useMemo(() => {
    const groupsMap = new Map<string, FinanceGroup>();

    filteredRecords.forEach((item) => {
      const date = new Date(item.createdAt);
      const key = date.toISOString().slice(0, 10);

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          key,
          title: formatDateHeader(date),
          total: 0,
          items: [],
        });
      }

      const group = groupsMap.get(key)!;

      group.items.push(item);
      group.total += item.type === 'income' ? item.amount : -item.amount;
    });

    return Array.from(groupsMap.values());
  }, [filteredRecords]);

  const totalIncome = useMemo(
    () => records.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0),
    [records]
  );

  const totalExpense = useMemo(
    () => records.filter((r) => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0),
    [records]
  );

  const todayTotal = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);

    return records
      .filter((item) => new Date(item.createdAt).toISOString().slice(0, 10) === todayKey)
      .reduce((sum, item) => (item.type === 'income' ? sum + item.amount : sum - item.amount), 0);
  }, [records]);

  const topCategories = useMemo(() => {
    const current = new Date();
    const currentMonth = current.getMonth();
    const currentYear = current.getFullYear();

    const totals = new Map<string, number>();

    records.forEach((item) => {
      if (item.type !== 'expense') return;

      const itemDate = new Date(item.createdAt);

      if (itemDate.getMonth() !== currentMonth || itemDate.getFullYear() !== currentYear) {
        return;
      }

      totals.set(item.category, (totals.get(item.category) || 0) + item.amount);
    });

    return Array.from(totals.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [records]);

  const maxTopCategoryTotal = topCategories[0]?.total || 0;

  const categoryLimitRows = useMemo(() => {
    const current = new Date();
    const currentMonth = current.getMonth();
    const currentYear = current.getFullYear();

    return Object.entries(categoryLimits)
      .map(([category, limit]) => {
        const spent = records
          .filter((item) => {
            if (item.type !== 'expense' || item.category !== category) return false;

            const itemDate = new Date(item.createdAt);

            return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
          })
          .reduce((sum, item) => sum + item.amount, 0);

        return {
          category,
          limit,
          spent,
          progress: limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0,
        };
      })
      .sort((a, b) => b.progress - a.progress);
  }, [records, categoryLimits]);

  const balance = totalIncome - totalExpense;
  const editingRecord = editingRecordId
    ? records.find((item) => item.id === editingRecordId)
    : null;

  function resetForm() {
    setTitle('');
    setAmount('');
    setCategory('Другое');
    setRecordType('expense');
    setEditingRecordId(null);
    setNewCategory('');
    setShowCategoryInput(false);
  }

  function openCreateModal(type: 'income' | 'expense' = 'expense') {
    resetForm();
    setRecordType(type);
    setModalVisible(true);
  }

  function openEditModal(item: FinanceRecord) {
    setEditingRecordId(item.id);
    setRecordType(item.type);
    setTitle(item.title);
    setAmount(String(item.amount));
    setCategory(item.category);
    setNewCategory('');
    setShowCategoryInput(false);
    setModalVisible(true);
  }

  async function saveRecord() {
    const parsedAmount = Number(amount.replace(/\s/g, '').replace(',', '.'));

    if (!title.trim()) return Alert.alert('Ошибка', 'Введите название');
    if (!parsedAmount || parsedAmount <= 0) {
      return Alert.alert('Ошибка', 'Введите корректную сумму');
    }

    if (editingRecordId && editingRecord) {
      await updateFinanceRecord(editingRecordId, {
        id: editingRecordId,
        title: title.trim(),
        amount: parsedAmount,
        type: recordType,
        category,
        date: editingRecord.date,
        createdAt: editingRecord.createdAt,
      });
    } else {
      const createdAt = new Date().toISOString();

      await addFinanceRecord({
        id: Date.now().toString(),
        title: title.trim(),
        amount: parsedAmount,
        type: recordType,
        category,
        date: new Date(createdAt).toLocaleDateString('ru-RU'),
        createdAt,
      });
    }

    resetForm();
    setModalVisible(false);
  }

  function openLimitModal(categoryName?: string) {
    const selectedCategory = categoryName || categories[0] || 'Другое';
    const currentLimit = categoryLimits[selectedCategory];

    setLimitCategory(selectedCategory);
    setLimitAmount(currentLimit ? String(currentLimit) : '');
    setLimitModalVisible(true);
  }

  async function saveCategoryLimit() {
    const parsedLimit = Number(limitAmount.replace(/\s/g, '').replace(',', '.'));

    if (!limitCategory) return Alert.alert('Ошибка', 'Выберите категорию');
    if (!parsedLimit || parsedLimit <= 0) {
      return Alert.alert('Ошибка', 'Введите корректный лимит');
    }

    await setFinanceCategoryLimit(limitCategory, parsedLimit);
    setLimitModalVisible(false);
  }

  async function removeCategoryLimit(categoryName: string) {
    await deleteFinanceCategoryLimit(categoryName);
  }

  async function createCategory() {
    const cleaned = newCategory.trim();

    if (!cleaned) return Alert.alert('Ошибка', 'Введите название категории');

    const exists = categories.some(
      (item) => item.toLowerCase() === cleaned.toLowerCase()
    );

    if (exists) return Alert.alert('Категория уже есть', 'Выбери ее из списка');

    await addFinanceCategory(cleaned);
    setCategory(cleaned);
    setNewCategory('');
    setShowCategoryInput(false);
  }

  function removeCategory(item: string) {
    if (DEFAULT_FINANCE_CATEGORIES.includes(item)) {
      return Alert.alert('Нельзя удалить', 'Это стандартная категория');
    }

    Alert.alert('Удалить категорию?', item, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await deleteFinanceCategory(item);

          if (category === item) {
            setCategory('Другое');
          }
        },
      },
    ]);
  }

  function openRecordMenu(item: FinanceRecord) {
    Alert.alert(item.title, formatMoney(item.amount), [
      { text: 'Изменить', onPress: () => openEditModal(item) },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => deleteFinanceRecord(item.id),
      },
      { text: 'Отмена', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedRecords}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.kicker}>Деньги</Text>
              <Text style={styles.title}>Финансы</Text>
            </View>

            <View style={styles.hero}>
              <View style={styles.cardTop}>
                <Text style={styles.heroLabel}>Баланс</Text>
                <Text style={styles.heroHint}>{records.length} записей</Text>
              </View>

              <Text style={styles.heroValue}>{formatMoney(balance)}</Text>

              <View style={styles.moneyRow}>
                <View style={styles.moneyBox}>
                  <Text style={styles.moneyLabel}>Доходы</Text>
                  <Text style={styles.moneyValue}>+{formatMoney(totalIncome)}</Text>
                </View>

                <View style={styles.moneyBox}>
                  <Text style={styles.moneyLabel}>Расходы</Text>
                  <Text style={styles.moneyValue}>-{formatMoney(totalExpense)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{formatSignedMoney(todayTotal)}</Text>
                <Text style={styles.statLabel}>Сегодня</Text>
              </View>
            </View>

            <View style={styles.topCategoriesCard}>
              <View style={styles.cardTop}>
                <Text style={styles.topCategoriesTitle}>Топ расходов за месяц</Text>
                <Text style={styles.topCategoriesHint}>{topCategories.length}/3</Text>
              </View>

              {topCategories.length === 0 ? (
                <Text style={styles.topCategoriesEmpty}>Пока нет расходов за месяц</Text>
              ) : (
                topCategories.map((item) => (
                  <View key={item.category} style={styles.topCategoryRow}>
                    <View style={styles.topCategoryText}>
                      <Text style={styles.topCategoryName}>{item.category}</Text>
                      <Text style={styles.topCategoryAmount}>{formatMoney(item.total)}</Text>
                    </View>

                    <View style={styles.topCategoryBarBg}>
                      <View
                        style={[
                          styles.topCategoryBarFill,
                          {
                            width: `${maxTopCategoryTotal ? Math.round((item.total / maxTopCategoryTotal) * 100) : 0}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.limitsCard}>
              <View style={styles.cardTop}>
                <Text style={styles.topCategoriesTitle}>Лимиты по категориям</Text>
                <TouchableOpacity onPress={() => openLimitModal()}>
                  <Text style={styles.addCategoryText}>+ лимит</Text>
                </TouchableOpacity>
              </View>

              {categoryLimitRows.length === 0 ? (
                <Text style={styles.topCategoriesEmpty}>Лимитов пока нет</Text>
              ) : (
                categoryLimitRows.map((item) => (
                  <TouchableOpacity
                    key={item.category}
                    style={styles.limitRow}
                    activeOpacity={0.85}
                    onPress={() => openLimitModal(item.category)}
                    onLongPress={() => removeCategoryLimit(item.category)}
                  >
                    <View style={styles.topCategoryText}>
                      <Text style={styles.topCategoryName}>{item.category}</Text>
                      <Text style={styles.topCategoryAmount}>
                        {formatMoney(item.spent)} / {formatMoney(item.limit)}
                      </Text>
                    </View>

                    <View style={styles.topCategoryBarBg}>
                      <View
                        style={[
                          styles.topCategoryBarFill,
                          { width: `${item.progress}%` },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => openCreateModal('expense')}>
              <Text style={styles.primaryButtonText}>Добавить запись</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.searchInput}
              placeholder="Поиск"
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />

            <View style={styles.filters}>
              <FilterButton title="Все" active={filter === 'all'} onPress={() => setFilter('all')} />
              <FilterButton title="Доходы" active={filter === 'income'} onPress={() => setFilter('income')} />
              <FilterButton title="Расходы" active={filter === 'expense'} onPress={() => setFilter('expense')} />
            </View>

            <Text style={styles.sectionTitle}>История</Text>
          </>
        }
        ListEmptyComponent={<Text style={styles.empty}>Записей не найдено</Text>}
        renderItem={({ item }) => (
          <View style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{item.title}</Text>
              <Text style={styles.groupTotal}>{formatSignedMoney(item.total)}</Text>
            </View>

            <View style={styles.groupCard}>
              {item.items.map((record, index) => (
                <View key={record.id}>
                  <TouchableOpacity style={styles.row} onLongPress={() => openRecordMenu(record)}>
                    <View style={styles.rowIcon}>
                      <Text style={styles.rowIconText}>{record.type === 'income' ? '+' : '−'}</Text>
                    </View>

                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{record.title}</Text>
                      <Text style={styles.rowMeta}>
                        {record.category} · {formatTime(record.createdAt)}
                      </Text>
                    </View>

                    <Text style={styles.rowAmount}>
                      {record.type === 'income' ? '+' : '-'}
                      {formatMoney(record.amount)}
                    </Text>
                  </TouchableOpacity>

                  {index !== item.items.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingRecordId ? 'Изменить запись' : 'Новая запись'}
          </Text>

          <View style={styles.switch}>
            <TouchableOpacity
              style={[styles.switchButton, recordType === 'income' && styles.switchActive]}
              onPress={() => setRecordType('income')}
            >
              <Text style={[styles.switchText, recordType === 'income' && styles.switchTextActive]}>
                Доход
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchButton, recordType === 'expense' && styles.switchActive]}
              onPress={() => setRecordType('expense')}
            >
              <Text style={[styles.switchText, recordType === 'expense' && styles.switchTextActive]}>
                Расход
              </Text>
            </TouchableOpacity>
          </View>

          <Field label="Название" value={title} onChangeText={setTitle} placeholder="Например: продукты" />
          <Field label="Сумма" value={amount} onChangeText={setAmount} placeholder="12000" keyboardType="numeric" />

          <View style={styles.quickAmounts}>
            {QUICK_AMOUNTS.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.quickAmountButton}
                onPress={() => setAmount(String(item))}
              >
                <Text style={styles.quickAmountText}>{formatMoney(item)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.categoryHeader}>
            <Text style={styles.label}>Категория</Text>
            <TouchableOpacity onPress={() => setShowCategoryInput((value) => !value)}>
              <Text style={styles.addCategoryText}>+ новая</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chips}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, category === item && styles.chipActive]}
                onPress={() => setCategory(item)}
                onLongPress={() => removeCategory(item)}
              >
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {showCategoryInput && (
            <View style={styles.inlineCategoryBox}>
              <Text style={styles.inlineCategoryTitle}>Новая категория</Text>

              <TextInput
                style={styles.input}
                placeholder="Например: Подписки"
                placeholderTextColor="#94A3B8"
                value={newCategory}
                onChangeText={setNewCategory}
              />

              <View style={styles.inlineCategoryActions}>
                <TouchableOpacity style={styles.inlineCreateButton} onPress={createCategory}>
                  <Text style={styles.inlineCreateButtonText}>Создать</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inlineCancelButton}
                  onPress={() => {
                    setNewCategory('');
                    setShowCategoryInput(false);
                  }}
                >
                  <Text style={styles.inlineCancelButtonText}>Отмена</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={saveRecord}>
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

      <Modal visible={limitModalVisible} transparent animationType="fade">
        <View style={styles.limitModalOverlay}>
          <View style={styles.limitModal}>
            <Text style={styles.categoryModalTitle}>Лимит категории</Text>

            <Text style={styles.label}>Категория</Text>
            <View style={styles.chips}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, limitCategory === item && styles.chipActive]}
                  onPress={() => {
                    setLimitCategory(item);
                    setLimitAmount(categoryLimits[item] ? String(categoryLimits[item]) : '');
                  }}
                >
                  <Text style={[styles.chipText, limitCategory === item && styles.chipTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Field
              label="Лимит на месяц"
              value={limitAmount}
              onChangeText={setLimitAmount}
              placeholder="Например: 80000"
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveCategoryLimit}>
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setLimitModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function formatSignedMoney(value: number) {
  if (value > 0) return `+${formatMoney(value)}`;
  if (value < 0) return `-${formatMoney(Math.abs(value))}`;

  return formatMoney(0);
}

function formatTime(createdAt: string) {
  return new Date(createdAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateHeader(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'Сегодня';
  if (isSameDay(date, yesterday)) return 'Вчера';

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function FilterButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 64, paddingBottom: 130 },

  header: { marginBottom: 18 },
  kicker: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 5 },
  title: { fontSize: 24, fontWeight: '900', color: '#0F172A' },

  hero: { backgroundColor: '#0F172A', borderRadius: 26, padding: 20, marginBottom: 12 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  heroLabel: { fontSize: 13, fontWeight: '800', color: '#CBD5E1' },
  heroHint: { fontSize: 12, fontWeight: '800', color: '#94A3B8' },
  heroValue: { fontSize: 30, fontWeight: '900', color: '#FFFFFF', marginTop: 10 },
  moneyRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  moneyBox: { flex: 1, backgroundColor: '#1E293B', borderRadius: 18, padding: 12 },
  moneyLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  moneyValue: { fontSize: 13, fontWeight: '900', color: '#FFFFFF', marginTop: 5 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginTop: 5 },

  topCategoriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  topCategoriesTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  topCategoriesHint: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  topCategoriesEmpty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 10,
  },
  topCategoryRow: {
    marginTop: 12,
  },
  topCategoryText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  topCategoryName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
  topCategoryAmount: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
  },
  topCategoryBarBg: {
    height: 7,
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    overflow: 'hidden',
  },
  topCategoryBarFill: {
    height: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 999,
  },

  limitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  limitRow: {
    marginTop: 12,
  },

  primaryButton: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },

  filters: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  filterButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  filterText: { fontSize: 12, fontWeight: '900', color: '#64748B' },
  filterTextActive: { color: '#FFFFFF' },

  sectionTitle: { fontSize: 15, fontWeight: '900', color: '#0F172A', marginBottom: 10 },

  group: { marginBottom: 16 },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupTitle: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  groupTotal: { fontSize: 13, fontWeight: '900', color: '#64748B' },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  row: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rowIconText: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  rowMeta: { fontSize: 12, fontWeight: '700', color: '#94A3B8', marginTop: 3 },
  rowAmount: { fontSize: 13, fontWeight: '900', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9' },
  empty: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textAlign: 'center', marginTop: 20 },

  modal: { flex: 1, backgroundColor: '#FFFFFF' },
  modalContent: { padding: 24, paddingTop: 70, paddingBottom: 40 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 18 },
  switch: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4 },
  switchButton: { flex: 1, padding: 13, alignItems: 'center', borderRadius: 13 },
  switchActive: { backgroundColor: '#0F172A' },
  switchText: { color: '#64748B', fontSize: 13, fontWeight: '900' },
  switchTextActive: { color: '#FFFFFF' },

  label: { fontSize: 12, fontWeight: '900', color: '#64748B', marginTop: 18, marginBottom: 8 },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },

  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 11,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  addCategoryText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#0F172A' },
  chipText: { color: '#64748B', fontSize: 12, fontWeight: '900' },
  chipTextActive: { color: '#FFFFFF' },

  inlineCategoryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inlineCategoryTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
  },
  inlineCategoryActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  inlineCreateButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  inlineCreateButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  inlineCancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inlineCancelButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '900',
  },

  limitModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  limitModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    maxHeight: '82%',
  },
  categoryModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },

  saveButton: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginTop: 26,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  cancelButton: { padding: 16, alignItems: 'center' },
  cancelButtonText: { color: '#94A3B8', fontSize: 14, fontWeight: '800' },
});
