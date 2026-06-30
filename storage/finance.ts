import AsyncStorage from '@react-native-async-storage/async-storage';

export type FinanceRecord = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
};

const FINANCE_KEY = 'finance_records';

export async function loadFinanceRecords(): Promise<FinanceRecord[]> {
  try {
    const data = await AsyncStorage.getItem(FINANCE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveFinanceRecords(records: FinanceRecord[]) {
  try {
    await AsyncStorage.setItem(FINANCE_KEY, JSON.stringify(records));
  } catch {
    console.log('Ошибка сохранения финансов');
  }
}