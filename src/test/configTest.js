// 配置测试文件
import { isFirebaseConfigured } from '../config/firebase';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

console.log('Firebase 配置检查开始...');

// 检查 Firebase 是否已配置
console.log('Firebase 是否已配置:', isFirebaseConfigured);

if (isFirebaseConfigured) {
  try {
    // 尝试初始化 Firebase
    const app = initializeApp({
      apiKey: "AIzaSyAvLUC1KvlSxUu9IPd1O5DmdVaFug4GI88",
      authDomain: "tpzys-f63cf.firebaseapp.com",
      projectId: "tpzys-f63cf",
      storageBucket: "tpzys-f63cf.firebasestorage.app",
      messagingSenderId: "1088059202177",
      appId: "1:1088059202177:web:a9b0e91668f194d3db8b80",
      measurementId: "G-B2S8YQYN9R"
    });
    
    console.log('✅ Firebase 初始化成功');
    
    // 尝试获取认证和数据库实例
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    console.log('✅ Firebase 认证服务初始化成功');
    console.log('✅ Firebase 数据库服务初始化成功');
    
    console.log('所有配置检查通过！');
  } catch (error) {
    console.error('❌ Firebase 初始化失败:', error.message);
  }
} else {
  console.log('⚠️ Firebase 未配置');
}

export {};