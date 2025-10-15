#!/usr/bin/env node
// Firebase配置验证脚本
// 用于验证Firebase配置是否正确设置

const fs = require('fs');
const path = require('path');

console.log('=== Firebase配置验证工具 ===\n');

// 检查必要的文件是否存在
const requiredFiles = [
  'firebase-config.js',
  'src/config/firebase.js',
  '.env'
];

console.log('1. 检查必要文件是否存在...');
let allFilesExist = true;
for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} 存在`);
  } else {
    console.log(`❌ ${file} 不存在`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n⚠️  一些必要文件缺失，请确保所有文件都已正确放置在应用根目录中。');
}

// 检查firebase-config.js内容
console.log('\n2. 验证Firebase配置文件内容...');
try {
  const firebaseConfigPath = path.join(__dirname, 'firebase-config.js');
  const firebaseConfigContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  // 检查是否包含必要的配置项
  const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId'];
  let allKeysPresent = true;
  
  for (const key of requiredConfigKeys) {
    if (firebaseConfigContent.includes(key)) {
      console.log(`✅ 包含配置项: ${key}`);
    } else {
      console.log(`❌ 缺少配置项: ${key}`);
      allKeysPresent = false;
    }
  }
  
  if (allKeysPresent) {
    console.log('✅ Firebase配置文件内容基本完整');
  } else {
    console.log('❌ Firebase配置文件内容不完整');
  }
  
} catch (error) {
  console.log('❌ 无法读取firebase-config.js文件:', error.message);
}

// 检查.env文件
console.log('\n3. 验证环境变量文件...');
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // 检查是否包含Firebase相关的环境变量
    const firebaseEnvVars = [
      'FIREBASE_API_KEY',
      'FIREBASE_AUTH_DOMAIN',
      'FIREBASE_PROJECT_ID'
    ];
    
    let hasFirebaseEnvVars = false;
    for (const envVar of firebaseEnvVars) {
      if (envContent.includes(envVar)) {
        console.log(`✅ 包含环境变量: ${envVar}`);
        hasFirebaseEnvVars = true;
      }
    }
    
    if (!hasFirebaseEnvVars) {
      console.log('ℹ️  .env文件中未找到Firebase相关环境变量（这可能是正常的）');
    }
  } else {
    console.log('ℹ️  .env文件不存在（这可能是正常的）');
  }
} catch (error) {
  console.log('❌ 检查.env文件时出错:', error.message);
}

// 检查.gitignore
console.log('\n4. 验证.gitignore配置...');
try {
  const gitignorePath = path.join(__dirname, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    // 检查是否忽略了敏感文件
    const sensitiveFiles = ['.env', 'firebase-config.js'];
    for (const file of sensitiveFiles) {
      if (gitignoreContent.includes(file)) {
        console.log(`✅ ${file} 已在.gitignore中忽略`);
      } else {
        console.log(`⚠️  ${file} 未在.gitignore中忽略，可能存在安全风险`);
      }
    }
  } else {
    console.log('❌ .gitignore文件不存在');
  }
} catch (error) {
  console.log('❌ 检查.gitignore时出错:', error.message);
}

console.log('\n=== 验证完成 ===');
console.log('\n下一步建议:');
console.log('1. 确保Firebase控制台中的项目配置正确');
console.log('2. 验证API密钥是否有效');
console.log('3. 测试应用中的Firebase连接');
console.log('4. 如果部署到生产环境，请使用环境变量而不是硬编码的值');