// Firebase配置文件
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';
// 导入新的Firebase配置文件
import { firebaseConfig, isFirebaseConfigured as isConfigured } from '../../firebase-config.js';

// 🔥 Firebase项目配置
// ⚠️ 请替换为你的实际配置信息
// 这些信息可以从Firebase控制台 > 项目设置 > 你的应用 > 配置中获取
const firebaseConfigOriginal = {
  apiKey: "AIzaSyAvLUC1KvlSxUu9IPd1O5DmdVaFug4GI88",
  authDomain: "tpzys-f63cf.firebaseapp.com",
  projectId: "tpzys-f63cf",
  storageBucket: "tpzys-f63cf.firebasestorage.app",
  messagingSenderId: "1088059202177",
  appId: "1:1088059202177:web:87f51116b3bb8dccdb8b80",
  measurementId: "G-6Z8R71RDCS"
};

// 🔍 检查Firebase是否已配置
export const isFirebaseConfigured = isConfigured;

let app = null;
let auth = null;
let db = null;

// ⚠️ 只有在Firebase已配置时才初始化
if (isFirebaseConfigured) {
  try {
    // ✅ 初始化Firebase应用
    app = initializeApp(firebaseConfig);
    
    // ✅ 初始化Firebase服务
    auth = getAuth(app);           // 认证服务
    db = getFirestore(app);       // 数据库服务
    
    // 🔧 开发环境配置
    if (__DEV__) {
      console.log('✅ Firebase配置已加载并初始化成功');
      console.log('项目ID:', firebaseConfig.projectId);
    }
  } catch (error) {
    console.error('❌ Firebase初始化失败:', error.message);
    console.error('详细错误信息:', error);
    console.warn('⚠️ 将使用本地存储模式');
    
    // 将错误信息导出，以便在应用中使用
    if (typeof window !== 'undefined') {
      window.firebaseInitializationError = error.message;
    }
  }
} else {
  if (__DEV__) {
    console.warn('⚠️ Firebase未配置，将使用本地存储模式');
    console.warn('⚠️ 要启用Firebase，请在 src/config/firebase.js 中配置真实的Firebase项目信息');
  }
}

export { auth, db };

// 📱 导出Firebase应用实例
export default app;

// 📋 导出配置信息用于调试
export { firebaseConfig };