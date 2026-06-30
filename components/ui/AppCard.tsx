import { StyleSheet, View, ViewProps } from 'react-native';

export function AppCard({ children, style }: ViewProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
  },
});