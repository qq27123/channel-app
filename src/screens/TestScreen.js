import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function TestScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>应用测试页面</Text>
        <Text style={styles.subtitle}>验证应用基本功能</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.text}>
          如果您能看到这个页面，说明应用基本结构正常。
        </Text>
        <Text style={styles.text}>
          Firebase配置信息：
        </Text>
        <Text style={styles.code}>
          projectId: tpzys-f63cf
        </Text>
        <Text style={styles.text}>
          应用已配置Firebase，数据将存储在云端，确保不会丢失。
        </Text>
        <Text style={styles.text}>
          推荐使用Expo Go进行移动端测试，以获得最佳体验。
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 15,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
  },
  code: {
    color: '#007AFF',
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
});