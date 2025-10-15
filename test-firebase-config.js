// Firebase配置测试脚本
const fs = require('fs');
const path = require('path');

// 读取Firebase配置文件
const firebaseConfigPath = path.join(__dirname, 'src', 'config', 'firebase.js');
const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');

console.log('=== Firebase配置检查 ===');

// 提取配置信息
const apiKeyMatch = firebaseContent.match(/apiKey:\s*["']([^"']+)["']/);
const projectIdMatch = firebaseContent.match(/projectId:\s*["']([^"']+)["']/);

if (apiKeyMatch && projectIdMatch) {
  const apiKey = apiKeyMatch[1];
  const projectId = projectIdMatch[1];
  
  console.log('✅ 找到Firebase配置信息');
  console.log('API Key:', apiKey);
  console.log('Project ID:', projectId);
  
  // 检查是否是占位符
  if (apiKey === 'your-api-key' || projectId === 'your-project-id') {
    console.log('❌ 检测到占位符配置，请替换为真实的Firebase配置');
  } else if (apiKey.length < 10) {
    console.log('❌ API密钥长度不足，可能不正确');
  } else {
    console.log('✅ 配置信息看起来是有效的');
    console.log('\n=== 使用说明 ===');
    console.log('如果仍然出现Firebase错误，请：');
    console.log('1. 检查Firebase项目是否在控制台中存在');
    console.log('2. 确认API密钥没有被撤销');
    console.log('3. 或使用本地存储模式（默认管理员账户登录）');
  }
} else {
  console.log('❌ 未找到有效的Firebase配置信息');
}

console.log('\n=== 默认管理员账户 ===');
console.log('手机号：13800138000');
console.log('密码：123456');
console.log('提示：如果Firebase配置有问题，应用会自动降级到本地存储模式');