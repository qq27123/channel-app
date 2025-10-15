// Firebase配置验证脚本
const fs = require('fs');
const path = require('path');

console.log('=== Firebase配置验证 ===\n');

// 读取Firebase配置文件
const firebaseConfigPath = path.join(__dirname, 'src', 'config', 'firebase.js');
const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');

console.log('1. 检查Firebase配置文件是否存在...');
if (fs.existsSync(firebaseConfigPath)) {
  console.log('✅ Firebase配置文件存在');
} else {
  console.log('❌ Firebase配置文件不存在');
  process.exit(1);
}

console.log('\n2. 提取配置信息...');
const configMatch = firebaseContent.match(/const firebaseConfig = \{([^}]+)\}/s);
if (configMatch) {
  const configBlock = configMatch[1];
  console.log('✅ 找到Firebase配置块');
  
  // 提取关键配置项
  const apiKeyMatch = configBlock.match(/apiKey:\s*["']([^"']+)["']/);
  const authDomainMatch = configBlock.match(/authDomain:\s*["']([^"']+)["']/);
  const projectIdMatch = configBlock.match(/projectId:\s*["']([^"']+)["']/);
  const storageBucketMatch = configBlock.match(/storageBucket:\s*["']([^"']+)["']/);
  const messagingSenderIdMatch = configBlock.match(/messagingSenderId:\s*["']([^"']+)["']/);
  const appIdMatch = configBlock.match(/appId:\s*["']([^"']+)["']/);
  
  const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;
  const authDomain = authDomainMatch ? authDomainMatch[1] : null;
  const projectId = projectIdMatch ? projectIdMatch[1] : null;
  const storageBucket = storageBucketMatch ? storageBucketMatch[1] : null;
  const messagingSenderId = messagingSenderIdMatch ? messagingSenderIdMatch[1] : null;
  const appId = appIdMatch ? appIdMatch[1] : null;
  
  console.log('\n3. 验证配置信息...');
  if (apiKey && projectId && authDomain && appId) {
    console.log('✅ 所有必需的配置信息都存在');
    console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length-5)}`);
    console.log(`   Auth Domain: ${authDomain}`);
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Storage Bucket: ${storageBucket}`);
    console.log(`   Messaging Sender ID: ${messagingSenderId}`);
    console.log(`   App ID: ${appId}`);
    
    if (apiKey.length >= 30) {
      console.log('✅ API密钥长度看起来是正确的');
    } else {
      console.log('⚠️ API密钥长度可能不正确');
    }
    
    // 检查项目ID格式
    if (projectId.length > 5) {
      console.log('✅ 项目ID格式看起来是正确的');
    } else {
      console.log('❌ 项目ID格式可能不正确');
    }
  } else {
    console.log('❌ 缺少必需的配置信息');
    if (!apiKey) console.log('   缺少API Key');
    if (!projectId) console.log('   缺少Project ID');
    if (!authDomain) console.log('   缺少Auth Domain');
    if (!appId) console.log('   缺少App ID');
  }
} else {
  console.log('❌ 未找到Firebase配置块');
}

console.log('\n=== 验证建议 ===');
console.log('1. 确保Firebase项目在控制台中存在');
console.log('2. 确保Web应用已正确注册');
console.log('3. 确保API密钥未被撤销');
console.log('4. 如果仍有问题，请在Firebase控制台中重新生成Web配置');