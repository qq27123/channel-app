// Firebase生产环境配置文件
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

// 🔥 Firebase项目配置
// ⚠️ 生产环境配置
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
const isFirebaseConfigured = firebaseConfig.apiKey && 
                            firebaseConfig.projectId && 
                            firebaseConfig.apiKey !== "" && 
                            firebaseConfig.projectId !== "";

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
    
    console.log('✅ Firebase生产环境配置已加载并初始化成功');
    console.log('📦 项目ID:', firebaseConfig.projectId);
  } catch (error) {
    console.error('❌ Firebase初始化失败:', error.message);
    console.warn('⚠️ 将使用本地存储模式');
  }
} else {
  console.warn('⚠️ Firebase未配置或配置不完整，将使用本地存储模式');
}

export { auth, db };
export { isFirebaseConfigured };

// 📱 导出Firebase应用实例
export default app;