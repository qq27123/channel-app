// 数据持久化测试
import { DatabaseService } from '../services/firebaseService';

// 测试数据持久化功能
export const testDataPersistence = async () => {
  console.log('开始测试数据持久化...');
  
  try {
    // 创建测试数据
    const testData = {
      message: '数据持久化测试',
      timestamp: new Date().toISOString(),
      testId: `test-${Date.now()}`
    };
    
    // 写入数据到 Firestore
    const createResult = await DatabaseService.create('test_data', testData);
    
    if (createResult.success) {
      console.log('✅ 数据写入成功，ID:', createResult.id);
      
      // 读取数据
      const readResult = await DatabaseService.getDoc('test_data', createResult.id);
      
      if (readResult.success) {
        console.log('✅ 数据读取成功:', readResult.data);
        
        // 删除测试数据
        const deleteResult = await DatabaseService.delete('test_data', createResult.id);
        
        if (deleteResult.success) {
          console.log('✅ 测试数据清理成功');
        } else {
          console.log('⚠️ 测试数据清理失败:', deleteResult.error);
        }
        
        return true;
      } else {
        console.log('❌ 数据读取失败:', readResult.error);
        return false;
      }
    } else {
      console.log('❌ 数据写入失败:', createResult.error);
      return false;
    }
  } catch (error) {
    console.error('❌ 数据持久化测试异常:', error);
    return false;
  }
};

// 运行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中运行测试
  testDataPersistence().then(result => {
    console.log('数据持久化测试完成:', result ? '通过' : '失败');
  });
}

export default testDataPersistence;