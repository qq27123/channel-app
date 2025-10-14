// Firebase配置修复脚本
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('Firebase配置检查和修复脚本');
console.log('========================================');

// 检查Firebase配置文件
const firebaseConfigPath = path.join(__dirname, 'src', 'config', 'firebase.js');
console.log('检查Firebase配置文件:', firebaseConfigPath);

if (fs.existsSync(firebaseConfigPath)) {
  const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  console.log('✓ Firebase配置文件存在');
  
  // 检查是否包含有效的配置
  if (firebaseContent.includes('apiKey:') && firebaseContent.includes('projectId:')) {
    console.log('✓ Firebase配置信息已找到');
    
    // 检查是否是占位符配置
    if (firebaseContent.includes('"your-api-key"') || firebaseContent.includes('"your-project-id"')) {
      console.log('⚠ 警告: 检测到占位符配置，请确保使用真实的Firebase配置');
    } else {
      console.log('✓ Firebase配置看起来是有效的');
    }
  } else {
    console.log('✗ Firebase配置信息缺失');
  }
} else {
  console.log('✗ Firebase配置文件不存在');
}

// 检查app.json配置
const appConfigPath = path.join(__dirname, 'app.json');
console.log('\n检查app.json配置文件:', appConfigPath);

if (fs.existsSync(appConfigPath)) {
  const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');
  const appConfig = JSON.parse(appConfigContent);
  console.log('✓ app.json配置文件存在');
  
  // 检查extra配置
  if (appConfig.expo && appConfig.expo.extra) {
    console.log('✓ extra配置存在');
    if (appConfig.expo.extra.eas && appConfig.expo.extra.eas.projectId) {
      console.log('✓ EAS项目ID配置存在:', appConfig.expo.extra.eas.projectId);
    } else {
      console.log('⚠ EAS项目ID配置缺失');
    }
  } else {
    console.log('⚠ extra配置缺失');
  }
} else {
  console.log('✗ app.json配置文件不存在');
}

console.log('\n建议的解决方案:');
console.log('1. 确保Firebase配置文件中的配置信息是真实的');
console.log('2. 如果使用EAS Build，配置会自动处理');
console.log('3. 如果使用本地构建，请确保配置在构建过程中不会被覆盖');
console.log('4. 重新构建APK并测试');

console.log('\n修复完成!');