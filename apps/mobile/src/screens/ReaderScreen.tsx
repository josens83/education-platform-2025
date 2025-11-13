import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReaderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>리더 화면</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
