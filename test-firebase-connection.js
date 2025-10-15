// Firebase连接测试脚本
import { initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase配置
const firebaseConfig = {
  apiKey: "AIzaSyAvLUC1KvlSxUu9IPd1O5DmdVaFug4GI88",
  authDomain: "tpzys-f63cf.firebaseapp.com",
  projectId: "tpzys-f63cf",
  storageBucket: "tpzys-f63cf.firebasestorage.app",
  messagingSenderId: "1088059202177",
  appId: "1:1088059202177:web:87f51116b3bb8dccdb8b80",
  measurementId: "G-6Z8R71RDCS"
};

console.log('=== Firebase连接测试 ===\n');

// 检查配置
console.log('1. 检查Firebase配置...');
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  console.log('✅ Firebase配置存在');
  console.log(`   Project ID: ${firebaseConfig.projectId}`);
  console.log(`   API Key: ${firebaseConfig.apiKey.substring(0, 10)}...${firebaseConfig.apiKey.substring(firebaseConfig.apiKey.length-5)}`);
} else {
  console.log('❌ Firebase配置不完整');
  process.exit(1);
}

// 尝试初始化Firebase
console.log('\n2. 初始化Firebase应用...');
try {
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase应用初始化成功');
  
  // 尝试获取认证服务
  console.log('\n3. 初始化认证服务...');
  try {
    const auth = getAuth(app);
    console.log('✅ Firebase认证服务初始化成功');
  } catch (authError) {
    console.log('❌ Firebase认证服务初始化失败:', authError.message);
  }
  
  // 尝试获取Firestore服务
  console.log('\n4. 初始化Firestore服务...');
  try {
    const db = getFirestore(app);
    console.log('✅ Firebase Firestore服务初始化成功');
  } catch (dbError) {
    console.log('❌ Firebase Firestore服务初始化失败:', dbError.message);
  }
  
} catch (initError) {
  console.log('❌ Firebase应用初始化失败:', initError.message);
  console.log('详细错误信息:', initError);
}

console.log('\n=== 测试完成 ===');