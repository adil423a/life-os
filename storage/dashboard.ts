import AsyncStorage from '@react-native-async-storage/async-storage';

export async function loadDashboardData() {
  const financeRaw = await AsyncStorage.getItem('finance_records');
  const ideasRaw = await AsyncStorage.getItem('ideas_records');
  const goalsRaw = await AsyncStorage.getItem('goals_records');

  const finance = financeRaw ? JSON.parse(financeRaw) : [];
  const ideas = ideasRaw ? JSON.parse(ideasRaw) : [];
  const goals = goalsRaw ? JSON.parse(goalsRaw) : [];

  const income = finance
    .filter((item: any) => item.type === 'income')
    .reduce((sum: number, item: any) => sum + item.amount, 0);

  const expense = finance
    .filter((item: any) => item.type === 'expense')
    .reduce((sum: number, item: any) => sum + item.amount, 0);

  const activeGoals = goals.filter((goal: any) => goal.progress < 100).length;

  return {
    balance: income - expense,
    income,
    expense,
    ideasCount: ideas.length,
    goalsCount: activeGoals,
    latestFinance: finance.slice(0, 3),
    latestIdeas: ideas.slice(0, 3),
    latestGoals: goals.slice(0, 3),
  };
}