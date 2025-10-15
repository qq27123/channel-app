// 验证Gradle构建文件配置的脚本
const fs = require('fs');
const path = require('path');

console.log('=== 验证 Gradle 构建文件配置 ===\n');

// 检查项目级构建文件
console.log('1. 检查项目级构建文件...');
const projectBuildFiles = [
  { name: 'build.gradle (Groovy)', path: 'android/build.gradle' },
  { name: 'build.gradle.kts (Kotlin DSL)', path: 'android/build.gradle.kts' }
];

let projectBuildFileFound = false;
for (const file of projectBuildFiles) {
  const filePath = path.join(__dirname, file.path);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file.name} 存在`);
    projectBuildFileFound = true;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('com.google.gms:google-services')) {
        console.log(`   包含 Google Services 插件依赖`);
        
        // 提取版本号
        const versionMatch = content.match(/com\.google\.gms:google-services[:"']([^"']+)/);
        if (versionMatch) {
          console.log(`   插件版本: ${versionMatch[1]}`);
        }
      } else {
        console.log(`   ⚠️  未找到 Google Services 插件依赖`);
      }
    } catch (error) {
      console.log(`   ❌ 读取文件时出错: ${error.message}`);
    }
  } else {
    console.log(`ℹ️  ${file.name} 不存在`);
  }
}

if (!projectBuildFileFound) {
  console.log('❌ 未找到项目级构建文件');
}

// 检查模块级构建文件
console.log('\n2. 检查模块级构建文件...');
const appBuildFiles = [
  { name: 'build.gradle (Groovy)', path: 'android/app/build.gradle' },
  { name: 'build.gradle.kts (Kotlin DSL)', path: 'android/app/build.gradle.kts' }
];

let appBuildFileFound = false;
for (const file of appBuildFiles) {
  const filePath = path.join(__dirname, file.path);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file.name} 存在`);
    appBuildFileFound = true;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 检查插件应用
      if (content.includes('com.google.gms.google-services') || 
          content.includes('com.google.gms:google-services')) {
        console.log(`   已应用 Google Services 插件`);
      } else {
        console.log(`   ⚠️  未应用 Google Services 插件`);
      }
      
      // 检查Firebase BoM
      if (content.includes('firebase-bom')) {
        console.log(`   包含 Firebase BoM`);
        
        // 提取版本号
        const versionMatch = content.match(/firebase-bom[:"']([^"']+)/);
        if (versionMatch) {
          console.log(`   BoM 版本: ${versionMatch[1]}`);
        }
      } else {
        console.log(`   ⚠️  未找到 Firebase BoM`);
      }
      
      // 检查Firebase Analytics
      if (content.includes('firebase-analytics')) {
        console.log(`   包含 Firebase Analytics`);
      } else {
        console.log(`   ⚠️  未找到 Firebase Analytics`);
      }
    } catch (error) {
      console.log(`   ❌ 读取文件时出错: ${error.message}`);
    }
  } else {
    console.log(`ℹ️  ${file.name} 不存在`);
  }
}

if (!appBuildFileFound) {
  console.log('❌ 未找到模块级构建文件');
}

// 检查google-services.json文件
console.log('\n3. 检查 google-services.json 文件...');
try {
  const googleServicesPath = path.join(__dirname, 'android', 'app', 'google-services.json');
  if (fs.existsSync(googleServicesPath)) {
    console.log('✅ google-services.json 文件存在');
    
    const googleServicesContent = fs.readFileSync(googleServicesPath, 'utf8');
    const googleServices = JSON.parse(googleServicesContent);
    
    console.log(`   项目ID: ${googleServices.project_info?.project_id}`);
    console.log(`   包名: ${googleServices.client?.[0]?.client_info?.android_client_info?.package_name}`);
  } else {
    console.log('❌ google-services.json 文件不存在');
  }
} catch (error) {
  console.log('❌ 检查 google-services.json 文件时出错:', error.message);
}

console.log('\n=== 验证完成 ===');
console.log('\n构建建议:');
console.log('1. 如果同时存在 .gradle 和 .gradle.kts 文件，建议只保留一种格式');
console.log('2. 确保选择的构建文件包含所有必要配置');
console.log('3. 运行构建命令验证配置是否正确:');
console.log('   cd android');
console.log('   ./gradlew clean');
console.log('   ./gradlew build');