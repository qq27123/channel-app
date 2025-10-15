// Firebase配置验证脚本
const fs = require('fs');
const path = require('path');

console.log('=== Firebase配置验证 ===\n');

// 读取Firebase配置文件
const firebaseConfigPath = path.join(__dirname, 'src', 'config', 'firebase.js');
const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');

// 提取配置信息
const configMatch = firebaseContent.match(/const firebaseConfig = \{([^}]+)\}/s);
if (configMatch) {
  const configBlock = configMatch[1];
  console.log('找到Firebase配置块:');
  
  // 提取各个配置项
  const apiKeyMatch = configBlock.match(/apiKey:\s*["']([^"']+)["']/);
  const authDomainMatch = configBlock.match(/authDomain:\s*["']([^"']+)["']/);
  const projectIdMatch = configBlock.match(/projectId:\s*["']([^"']+)["']/);
  const storageBucketMatch = configBlock.match(/storageBucket:\s*["']([^"']+)["']/);
  const messagingSenderIdMatch = configBlock.match(/messagingSenderId:\s*["']([^"']+)["']/);
  const appIdMatch = configBlock.match(/appId:\s*["']([^"']+)["']/);
  
  console.log('\n配置详情:');
  console.log('apiKey:', apiKeyMatch ? apiKeyMatch[1] : '未找到');
  console.log('authDomain:', authDomainMatch ? authDomainMatch[1] : '未找到');
  console.log('projectId:', projectIdMatch ? projectIdMatch[1] : '未找到');
  console.log('storageBucket:', storageBucketMatch ? storageBucketMatch[1] : '未找到');
  console.log('messagingSenderId:', messagingSenderIdMatch ? messagingSenderIdMatch[1] : '未找到');
  console.log('appId:', appIdMatch ? appIdMatch[1] : '未找到');
  
  // 验证关键配置
  console.log('\n=== 验证结果 ===');
  if (apiKeyMatch && projectIdMatch) {
    const apiKey = apiKeyMatch[1];
    const projectId = projectIdMatch[1];
    
    if (apiKey.length >= 30 && projectId.length > 5) {
      console.log('✅ 配置信息看起来是完整的');
      console.log('💡 建议:');
      console.log('   1. 重新启动应用测试配置');
      console.log('   2. 如果仍有问题，请在Firebase控制台中重新生成Web配置');
    } else {
      console.log('❌ API密钥或项目ID可能不正确');
      console.log('💡 建议在Firebase控制台中为Web应用重新生成配置');
    }
  } else {
    console.log('❌ 缺少关键配置信息');
    console.log('💡 必须在Firebase控制台中为Web应用创建配置');
  }
} else {
  console.log('❌ 未找到Firebase配置块');
}

console.log('\n=== 故障排除建议 ===');
console.log('1. 如果仍然出现"auth/configuration-not-found"错误:');
console.log('   - 在Firebase控制台中重新生成Web配置');
console.log('   - 确保项目中启用了Web应用');
console.log('2. 临时解决方案:');
console.log('   - 使用默认管理员账户登录 (手机号: 13800138000, 密码: 123456)');
console.log('   - 应用会自动降级到本地存储模式');