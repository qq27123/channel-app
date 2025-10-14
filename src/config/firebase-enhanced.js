// 增强版Firebase配置文件
import { initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

// 🔥 Firebase项目配置
const firebaseConfig = {
  apiKey: "AIzaSyAvLUC1KvlSxUu9IPd1O5DmdVaFug4GI88",
  authDomain: "tpzys-f63cf.firebaseapp.com",
  projectId: "tpzys-f63cf",
  storageBucket: "tpzys-f63cf.firebasestorage.app",
  messagingSenderId: "1088059202177",
  appId: "1:1088059202177:web:a9b0e91668f194d3db8b80",
  measurementId: "G-B2S8YQYN9R"
};

// 🔍 检查Firebase是否已配置
const isFirebaseConfigured = !!(firebaseConfig.apiKey && 
                               firebaseConfig.projectId && 
                               firebaseConfig.apiKey.length > 10 && 
                               firebaseConfig.projectId.length > 5);

let app = null;
let auth = null;
let db = null;

// 🚀 初始化Firebase应用
function initializeFirebase() {
  try {
    // 检查是否已有初始化的应用
    app = getApp();
    console.log('✅ 使用已存在的Firebase应用实例');
  } catch (error) {
    // 如果没有已存在的应用，则初始化新应用
    if (isFirebaseConfigured) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase应用初始化成功');
    } else {
      console.warn('⚠️ Firebase配置不完整，跳过初始化');
      return false;
    }
  }
  
  // 初始化服务
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase服务初始化成功');
    return true;
  } catch (error) {
    console.error('❌ Firebase服务初始化失败:', error.message);
    return false;
  }
}

// 🔧 初始化Firebase
const firebaseInitialized = initializeFirebase();

// 📤 导出服务
export { auth, db, firebaseInitialized, isFirebaseConfigured };

// 📱 导出Firebase应用实例
export default app;