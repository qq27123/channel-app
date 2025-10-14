import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { db, isFirebaseConfigured } from '../config/firebase';

// 只在非Web平台导入Firebase功能
let addDoc, collection, serverTimestamp, getDocs;
if (Platform.OS !== 'web') {
  try {
    ({ addDoc, collection, serverTimestamp, getDocs } = require('firebase/firestore'));
  } catch (e) {
    console.log('Firebase imports failed:', e);
  }
}

export default function FirebaseTestScreen({ navigation }) {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (testName, status, details = '') => {
    setTestResults(prev => [...prev, { testName, status, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testFirebaseConnection = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Check if Firebase is configured
      addTestResult('Firebase配置检查', isFirebaseConfigured ? '✅ 通过' : '❌ 失败', 
        isFirebaseConfigured ? 'Firebase配置正确' : 'Firebase未正确配置');
      
      if (!isFirebaseConfigured) {
        setLoading(false);
        return;
      }
      
      // Skip database tests on web platform due to potential issues
      if (Platform.OS === 'web') {
        addTestResult('平台检查', 'ℹ️ 信息', '在Web平台跳过数据库测试以避免兼容性问题');
        setLoading(false);
        return;
      }
      
      // Test 2: Test database write (only on native platforms)
      if (addDoc && collection && serverTimestamp) {
        addTestResult('数据库写入测试', '⏳ 进行中...');
        const testData = {
          message: 'Firebase连接测试',
          timestamp: serverTimestamp(),
          testId: `test-${Date.now()}`
        };
        
        const docRef = await addDoc(collection(db, '_test'), testData);
        addTestResult('数据库写入测试', '✅ 通过', `文档ID: ${docRef.id}`);
        
        // Test 3: Test database read
        addTestResult('数据库读取测试', '⏳ 进行中...');
        const querySnapshot = await getDocs(collection(db, '_test'));
        addTestResult('数据库读取测试', '✅ 通过', `读取到 ${querySnapshot.size} 条记录`);
      } else {
        addTestResult('Firebase功能检查', '❌ 失败', 'Firebase功能未正确导入');
      }
      
    } catch (error) {
      addTestResult('Firebase连接测试', '❌ 失败', error.message);
      console.error('Firebase测试错误:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Firebase测试</Text>
        <Text style={styles.subtitle}>检查Firebase连接和功能</Text>
        <Text style={styles.platformInfo}>当前平台: {Platform.OS === 'web' ? 'Web' : Platform.OS === 'android' ? 'Android' : 'iOS'}</Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.testButton, loading && styles.disabledButton]} 
        onPress={testFirebaseConnection}
        disabled={loading}
      >
        <Text style={styles.testButtonText}>
          {loading ? '测试进行中...' : '运行Firebase测试'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>测试结果</Text>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultText}>
              [{result.timestamp}] {result.testName}: {result.status}
            </Text>
            {result.details ? (
              <Text style={styles.resultDetails}>{result.details}</Text>
            ) : null}
          </View>
        ))}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>部署说明</Text>
        <Text style={styles.infoText}>
          1. Firebase配置已完成，数据将存储在云端
        </Text>
        <Text style={styles.infoText}>
          2. 应用支持Web、Android和iOS平台
        </Text>
        <Text style={styles.infoText}>
          3. 推荐使用Expo Go进行移动端测试
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
    marginBottom: 10,
  },
  platformInfo: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#666666',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  resultItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  resultDetails: {
    color: '#999999',
    fontSize: 12,
    marginTop: 5,
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  infoText: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 5,
  },
});