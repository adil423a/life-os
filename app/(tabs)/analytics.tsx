import { StyleSheet, Text, View } from 'react-native';

export default function AnalyticsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Аналитика</Text>
      <Text style={styles.text}>Графики, итоги и статистика будут здесь.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, paddingTop: 80 },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  text: { fontSize: 15, color: '#64748b', marginTop: 12 },
});