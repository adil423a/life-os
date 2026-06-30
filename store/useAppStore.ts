import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type FinanceRecord = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
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

type AppStore = {
  finance: FinanceRecord[];
  ideas: Idea[];
  goals: Goal[];

  isLoaded: boolean;

  loadAppData: () => Promise<void>;

  addFinanceRecord: (record: FinanceRecord) => Promise<void>;
  deleteFinanceRecord: (id: string) => Promise<void>;

  addIdea: (idea: Idea) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;

  addGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoalProgress: (id: string, delta: number) => Promise<void>;
};

const FINANCE_KEY = 'finance_records';
const IDEAS_KEY = 'ideas_records';
const GOALS_KEY = 'goals_records';

export const useAppStore = create<AppStore>((set, get) => ({
  finance: [],
  ideas: [],
  goals: [],

  isLoaded: false,

  loadAppData: async () => {
    const financeRaw = await AsyncStorage.getItem(FINANCE_KEY);
    const ideasRaw = await AsyncStorage.getItem(IDEAS_KEY);
    const goalsRaw = await AsyncStorage.getItem(GOALS_KEY);

    set({
      finance: financeRaw ? JSON.parse(financeRaw) : [],
      ideas: ideasRaw ? JSON.parse(ideasRaw) : [],
      goals: goalsRaw ? JSON.parse(goalsRaw) : [],
      isLoaded: true,
    });
  },

  addFinanceRecord: async (record) => {
    const updated = [record, ...get().finance];
    set({ finance: updated });
    await AsyncStorage.setItem(FINANCE_KEY, JSON.stringify(updated));
  },

  deleteFinanceRecord: async (id) => {
    const updated = get().finance.filter((item) => item.id !== id);
    set({ finance: updated });
    await AsyncStorage.setItem(FINANCE_KEY, JSON.stringify(updated));
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