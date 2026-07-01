import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type FinanceRecord = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  createdAt: string;
};

export type Idea = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
};

export type Goal = {
  id: string;
  title: string;
  target: string;
  deadline: string;
  progress: number;
  category: string;
  date: string;
};

export type FinanceCategoryLimits = Record<string, number>;

type AppStore = {
  finance: FinanceRecord[];
  financeCategories: string[];
  financeCategoryLimits: FinanceCategoryLimits;
  ideas: Idea[];
  goals: Goal[];

  isLoaded: boolean;

  loadAppData: () => Promise<void>;

  addFinanceRecord: (record: FinanceRecord) => Promise<void>;
  updateFinanceRecord: (id: string, record: FinanceRecord) => Promise<void>;
  deleteFinanceRecord: (id: string) => Promise<void>;

  addFinanceCategory: (category: string) => Promise<void>;
  deleteFinanceCategory: (category: string) => Promise<void>;
  setFinanceCategoryLimit: (category: string, limit: number) => Promise<void>;
  deleteFinanceCategoryLimit: (category: string) => Promise<void>;

  addIdea: (idea: Idea) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;

  addGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoalProgress: (id: string, delta: number) => Promise<void>;
};

const FINANCE_KEY = 'finance_records';
const FINANCE_CATEGORIES_KEY = 'finance_categories';
const FINANCE_CATEGORY_LIMITS_KEY = 'finance_category_limits';
const IDEAS_KEY = 'ideas_records';
const GOALS_KEY = 'goals_records';

export const DEFAULT_FINANCE_CATEGORIES = [
  'Еда',
  'Транспорт',
  'Бизнес',
  'Теннис',
  'Дом',
  'Другое',
];

function uniqueCategories(categories: string[]) {
  return [...new Set(categories.map((item) => item.trim()).filter(Boolean))];
}

function parseRuDateToIso(date: string) {
  const [day, month, year] = date.split('.').map(Number);

  if (!day || !month || !year) {
    return new Date().toISOString();
  }

  return new Date(year, month - 1, day, 0, 0, 0).toISOString();
}

function normalizeFinanceRecord(record: any): FinanceRecord {
  const createdAt = record.createdAt || parseRuDateToIso(record.date || '');

  return {
    id: String(record.id || Date.now()),
    title: String(record.title || ''),
    amount: Number(record.amount) || 0,
    type: record.type === 'income' ? 'income' : 'expense',
    category: String(record.category || 'Другое'),
    date: record.date || new Date(createdAt).toLocaleDateString('ru-RU'),
    createdAt,
  };
}

export const useAppStore = create<AppStore>((set, get) => ({
  finance: [],
  financeCategories: DEFAULT_FINANCE_CATEGORIES,
  financeCategoryLimits: {},
  ideas: [],
  goals: [],

  isLoaded: false,

  loadAppData: async () => {
    const financeRaw = await AsyncStorage.getItem(FINANCE_KEY);
    const financeCategoriesRaw = await AsyncStorage.getItem(FINANCE_CATEGORIES_KEY);
    const financeCategoryLimitsRaw = await AsyncStorage.getItem(FINANCE_CATEGORY_LIMITS_KEY);
    const ideasRaw = await AsyncStorage.getItem(IDEAS_KEY);
    const goalsRaw = await AsyncStorage.getItem(GOALS_KEY);

    const parsedFinance = financeRaw ? JSON.parse(financeRaw) : [];
    const normalizedFinance = Array.isArray(parsedFinance)
      ? parsedFinance.map(normalizeFinanceRecord)
      : [];

    const savedCategories = financeCategoriesRaw ? JSON.parse(financeCategoriesRaw) : [];

    set({
      finance: normalizedFinance,
      financeCategories: uniqueCategories([...DEFAULT_FINANCE_CATEGORIES, ...savedCategories]),
      financeCategoryLimits: financeCategoryLimitsRaw ? JSON.parse(financeCategoryLimitsRaw) : {},
      ideas: ideasRaw ? JSON.parse(ideasRaw) : [],
      goals: goalsRaw ? JSON.parse(goalsRaw) : [],
      isLoaded: true,
    });

    await AsyncStorage.setItem(FINANCE_KEY, JSON.stringify(normalizedFinance));
  },

  addFinanceRecord: async (record) => {
    const normalizedRecord = normalizeFinanceRecord(record);
    const updated = [normalizedRecord, ...get().finance];

    set({ finance: updated });
    await AsyncStorage.setItem(FINANCE_KEY, JSON.stringify(updated));
  },

  updateFinanceRecord: async (id, record) => {
    const updated = get().finance.map((item) =>
      item.id === id ? normalizeFinanceRecord({ ...record, id }) : item
    );

    set({ finance: updated });
    await AsyncStorage.setItem(FINANCE_KEY, JSON.stringify(updated));
  },

  deleteFinanceRecord: async (id) => {
    const updated = get().finance.filter((item) => item.id !== id);

    set({ finance: updated });
    await AsyncStorage.setItem(FINANCE_KEY, JSON.stringify(updated));
  },

  addFinanceCategory: async (category) => {
    const cleaned = category.trim();
    if (!cleaned) return;

    const exists = get().financeCategories.some(
      (item) => item.toLowerCase() === cleaned.toLowerCase()
    );

    if (exists) return;

    const updated = uniqueCategories([...get().financeCategories, cleaned]);

    set({ financeCategories: updated });
    await AsyncStorage.setItem(FINANCE_CATEGORIES_KEY, JSON.stringify(updated));
  },

  deleteFinanceCategory: async (category) => {
    if (DEFAULT_FINANCE_CATEGORIES.includes(category)) return;

    const updated = get().financeCategories.filter((item) => item !== category);
    const updatedLimits = { ...get().financeCategoryLimits };
    delete updatedLimits[category];

    set({ financeCategories: updated, financeCategoryLimits: updatedLimits });
    await AsyncStorage.setItem(FINANCE_CATEGORIES_KEY, JSON.stringify(updated));
    await AsyncStorage.setItem(FINANCE_CATEGORY_LIMITS_KEY, JSON.stringify(updatedLimits));
  },

  setFinanceCategoryLimit: async (category, limit) => {
    const cleanedCategory = category.trim();
    const cleanedLimit = Math.max(0, Number(limit) || 0);

    if (!cleanedCategory) return;

    const updated = { ...get().financeCategoryLimits };

    if (cleanedLimit <= 0) {
      delete updated[cleanedCategory];
    } else {
      updated[cleanedCategory] = cleanedLimit;
    }

    set({ financeCategoryLimits: updated });
    await AsyncStorage.setItem(FINANCE_CATEGORY_LIMITS_KEY, JSON.stringify(updated));
  },

  deleteFinanceCategoryLimit: async (category) => {
    const updated = { ...get().financeCategoryLimits };
    delete updated[category];

    set({ financeCategoryLimits: updated });
    await AsyncStorage.setItem(FINANCE_CATEGORY_LIMITS_KEY, JSON.stringify(updated));
  },

  addIdea: async (idea) => {
    const updated = [idea, ...get().ideas];

    set({ ideas: updated });
    await AsyncStorage.setItem(IDEAS_KEY, JSON.stringify(updated));
  },

  deleteIdea: async (id) => {
    const updated = get().ideas.filter((item) => item.id !== id);

    set({ ideas: updated });
    await AsyncStorage.setItem(IDEAS_KEY, JSON.stringify(updated));
  },

  addGoal: async (goal) => {
    const updated = [goal, ...get().goals];

    set({ goals: updated });
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updated));
  },

  deleteGoal: async (id) => {
    const updated = get().goals.filter((item) => item.id !== id);

    set({ goals: updated });
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updated));
  },

  updateGoalProgress: async (id, delta) => {
    const updated = get().goals.map((goal) =>
      goal.id === id
        ? { ...goal, progress: Math.min(100, Math.max(0, goal.progress + delta)) }
        : goal
    );

    set({ goals: updated });
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(updated));
  },
}));
