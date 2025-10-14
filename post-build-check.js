// 构建后Firebase配置验证脚本
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('构建后Firebase配置验证');
console.log('========================================');

// 验证Firebase配置文件
function validateFirebaseConfig() {
  const firebasePath = path.join(__dirname, 'src', 'config', 'firebase.js');
  
  if (!fs.existsSync(firebasePath)) {
    console.error('❌ Firebase配置文件不存在');
    return false;
  }
  
  const content = fs.readFileSync(firebasePath, 'utf8');
  
  // 检查关键配置是否存在
  const checks = [
    { pattern: /apiKey:\s*"[^"]+"/, name: 'API密钥' },
    { pattern: /projectId:\s*"[^"]+"/, name: '项目ID' },
    { pattern: /authDomain:\s*"[^"]+"/, name: '认证域名' },
    { pattern: /isFirebaseConfigured/, name: '配置检查函数' }
  ];
  
  let allPassed = true;
  for (const check of checks) {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name} 配置正确`);
    } else {
      console.error(`❌ ${check.name} 配置缺失`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// 验证Android配置
function validateAndroidConfig() {
  const appJsonPath = path.join(__dirname, 'app.json');
  
  if (!fs.existsSync(appJsonPath)) {
    console.error('❌ app.json配置文件不存在');
    return false;
  }
  
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  if (appJson.expo && appJson.expo.android && appJson.expo.android.package) {
    console.log(`✅ Android包名配置正确: ${appJson.expo.android.package}`);
    return true;
  } else {
    console.error('❌ Android包名配置缺失');
    return false;
  }
}

// 执行验证
const firebaseValid = validateFirebaseConfig();
const androidValid = validateAndroidConfig();

if (firebaseValid && androidValid) {
  console.log('\n🎉 所有配置验证通过，可以进行构建');
  process.exit(0);
} else {
  console.log('\n❌ 配置验证失败，请检查上述错误');
  process.exit(1);
}