import AsyncStorage from '@react-native-async-storage/async-storage';

type FinanceRecord = {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
};

type Idea = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
};

type Goal = {
  id: string;
  title: string;
  target: string;
  deadline: string;
  progress: number;
  category: string;
  date: string;
};

export async function loadDashboardData() {
  const financeRaw = await AsyncStorage.getItem('finance_records');
  const ideasRaw = await AsyncStorage.getItem('ideas_records');
  const goalsRaw = await AsyncStorage.getItem('goals_records');

  const finance: FinanceRecord[] = financeRaw ? JSON.parse(financeRaw) : [];
  const ideas: Idea[] = ideasRaw ? JSON.parse(ideasRaw) : [];
  const goals: Goal[] = goalsRaw ? JSON.parse(goalsRaw) : [];

  const income = finance
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = finance
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expense;
  const activeGoals = goals.filter((goal) => goal.progress < 100).length;

  return {
    balance,
    income,
    expense,
    ideasCount: ideas.length,
    goalsCount: activeGoals,
    latestFinance: finance.slice(0, 2),
    latestIdeas: ideas.slice(0, 2),
    latestGoals: goals.slice(0, 2),
  };
}