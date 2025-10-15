// 最终Firebase设置验证脚本
const fs = require('fs');
const path = require('path');

console.log('=== 最终 Firebase 设置验证 ===\n');

let allChecksPassed = true;

// 1. 验证 google-services.json 文件
console.log('1. 验证 google-services.json 文件...');
try {
  const googleServicesPath = path.join(__dirname, 'android', 'app', 'google-services.json');
  if (fs.existsSync(googleServicesPath)) {
    console.log('✅ google-services.json 文件存在');
    
    const googleServicesContent = fs.readFileSync(googleServicesPath, 'utf8');
    const googleServices = JSON.parse(googleServicesContent);
    
    const projectId = googleServices.project_info?.project_id;
    const packageName = googleServices.client?.[0]?.client_info?.android_client_info?.package_name;
    
    console.log(`   项目ID: ${projectId}`);
    console.log(`   包名: ${packageName}`);
    
    // 验证关键信息
    if (projectId && packageName) {
      if (projectId === 'tpzys-f63cf' && packageName === 'com.channelapp.mobile') {
        console.log('✅ 配置信息正确');
      } else {
        console.log('⚠️  配置信息可能不匹配');
        allChecksPassed = false;
      }
    } else {
      console.log('❌ 缺少关键配置信息');
      allChecksPassed = false;
    }
  } else {
    console.log('❌ google-services.json 文件不存在');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ 验证 google-services.json 时出错:', error.message);
  allChecksPassed = false;
}

// 2. 验证项目级 build.gradle
console.log('\n2. 验证项目级 build.gradle...');
try {
  const projectBuildGradlePath = path.join(__dirname, 'android', 'build.gradle');
  if (fs.existsSync(projectBuildGradlePath)) {
    console.log('✅ 项目级 build.gradle 存在');
    
    const content = fs.readFileSync(projectBuildGradlePath, 'utf8');
    
    if (content.includes('com.google.gms:google-services')) {
      console.log('✅ 包含 Google Services 插件依赖');
      
      const versionMatch = content.match(/com\.google\.gms:google-services[:"']([^"']+)/);
      if (versionMatch) {
        console.log(`   插件版本: ${versionMatch[1]}`);
      }
    } else {
      console.log('❌ 缺少 Google Services 插件依赖');
      allChecksPassed = false;
    }
  } else {
    console.log('❌ 项目级 build.gradle 不存在');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ 验证项目级 build.gradle 时出错:', error.message);
  allChecksPassed = false;
}

// 3. 验证模块级 build.gradle
console.log('\n3. 验证模块级 build.gradle...');
try {
  const appBuildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');
  if (fs.existsSync(appBuildGradlePath)) {
    console.log('✅ 模块级 build.gradle 存在');
    
    const content = fs.readFileSync(appBuildGradlePath, 'utf8');
    
    // 检查插件应用
    if (content.includes('com.google.gms.google-services')) {
      console.log('✅ 已应用 Google Services 插件');
    } else {
      console.log('❌ 未应用 Google Services 插件');
      allChecksPassed = false;
    }
    
    // 检查Firebase BoM
    if (content.includes('firebase-bom')) {
      console.log('✅ 包含 Firebase BoM');
      
      const versionMatch = content.match(/firebase-bom[:"']([^"']+)/);
      if (versionMatch) {
        console.log(`   BoM 版本: ${versionMatch[1]}`);
      }
    } else {
      console.log('❌ 未找到 Firebase BoM');
      allChecksPassed = false;
    }
    
    // 检查Firebase Analytics
    if (content.includes('firebase-analytics')) {
      console.log('✅ 包含 Firebase Analytics');
    } else {
      console.log('⚠️  未找到 Firebase Analytics (可选)');
    }
  } else {
    console.log('❌ 模块级 build.gradle 不存在');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ 验证模块级 build.gradle 时出错:', error.message);
  allChecksPassed = false;
}

// 4. 验证Firebase配置文件
console.log('\n4. 验证Firebase配置文件...');
try {
  const firebaseConfigPath = path.join(__dirname, 'src', 'config', 'firebase.js');
  if (fs.existsSync(firebaseConfigPath)) {
    console.log('✅ Firebase配置文件存在');
    
    const content = fs.readFileSync(firebaseConfigPath, 'utf8');
    
    if (content.includes('initializeApp') && content.includes('getAuth')) {
      console.log('✅ Firebase初始化代码存在');
    } else {
      console.log('⚠️  Firebase初始化代码可能不完整');
    }
  } else {
    console.log('❌ Firebase配置文件不存在');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ 验证Firebase配置文件时出错:', error.message);
  allChecksPassed = false;
}

console.log('\n=== 验证结果 ===');
if (allChecksPassed) {
  console.log('🎉 所有检查通过！Firebase设置配置正确。');
  console.log('\n下一步建议:');
  console.log('1. 运行构建命令验证配置:');
  console.log('   cd android');
  console.log('   ./gradlew clean');
  console.log('   ./gradlew build');
  console.log('\n2. 如果构建成功，可以运行应用进行测试');
  console.log('3. 使用Expo Go或构建的APK进行测试');
} else {
  console.log('❌ 一些检查未通过，请查看上面的错误信息并进行修复。');
}

console.log('\n如需进一步帮助，请联系: taowang2020@163.com');