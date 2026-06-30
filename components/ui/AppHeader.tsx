import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
};

export function AppHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 22,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
  },
});