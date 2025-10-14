// 🧪 Firebase连接测试文件
import { testFirebaseConnection } from '../services/firebaseService';

// 测试Firebase配置
export const runFirebaseTests = async () => {
  console.log('🔥 开始Firebase连接测试...');
  
  const tests = [
    {
      name: '基础连接测试',
      test: testFirebaseConnection
    }
  ];
  
  for (const testCase of tests) {
    try {
      console.log(`\n🧪 运行测试: ${testCase.name}`);
      const result = await testCase.test();
      
      if (result) {
        console.log(`✅ ${testCase.name} - 通过`);
      } else {
        console.log(`❌ ${testCase.name} - 失败`);
      }
    } catch (error) {
      console.error(`❌ ${testCase.name} - 异常:`, error);
    }
  }
  
  console.log('\n🔥 Firebase测试完成');
};

// 在开发环境下自动运行测试
if (__DEV__) {
  // 延迟执行，确保Firebase已初始化
  setTimeout(() => {
    runFirebaseTests();
  }, 2000);
}