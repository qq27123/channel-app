// Firebase诊断脚本
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

console.log('=== Firebase诊断工具 ===\n');

async function diagnoseFirebase() {
  try {
    console.log('1. 验证配置信息...');
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.log('❌ 配置信息不完整');
      return;
    }
    console.log('✅ 配置信息完整');
    
    console.log('\n2. 初始化Firebase应用...');
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase应用初始化成功');
    
    console.log('\n3. 初始化认证服务...');
    const auth = getAuth(app);
    console.log('✅ 认证服务初始化成功');
    
    console.log('\n4. 初始化Firestore...');
    const db = getFirestore(app);
    console.log('✅ Firestore初始化成功');
    
    console.log('\n5. 测试数据库连接...');
    try {
      const querySnapshot = await getDocs(collection(db, '_test'));
      console.log('✅ 数据库连接测试成功');
      console.log(`   读取到 ${querySnapshot.size} 条测试记录`);
    } catch (dbError) {
      console.log('⚠️ 数据库连接测试出现警告:', dbError.message);
      // 这不一定是错误，可能是因为测试集合不存在
    }
    
    console.log('\n=== 诊断完成 ===');
    console.log('如果应用仍然显示Firebase错误，请检查:');
    console.log('1. Firebase项目是否在控制台中存在');
    console.log('2. API密钥是否有效');
    console.log('3. 是否启用了Authentication和Firestore服务');
    
  } catch (error) {
    console.log('❌ Firebase诊断失败:', error.message);
    console.log('详细错误信息:', error);
    
    // 特别检查configuration-not-found错误
    if (error.message && error.message.includes('configuration-not-found')) {
      console.log('\n🔧 解决方案:');
      console.log('   这个错误通常表示Firebase项目配置不正确');
      console.log('   请检查以下几点:');
      console.log('   1. 项目ID "tpzys-f63cf" 是否在Firebase控制台中存在');
      console.log('   2. Web应用是否已正确注册');
      console.log('   3. API密钥是否有效');
      console.log('   4. 是否需要在Firebase控制台中重新生成配置');
    }
  }
}

// 运行诊断
diagnoseFirebase();