import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  color?: string;
};

export function PrimaryButton({ title, onPress, color = '#111827' }: Props) {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
});