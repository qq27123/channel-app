// 验证Google Services Gradle插件配置的脚本
const fs = require('fs');
const path = require('path');

console.log('=== 验证 Google Services Gradle 插件配置 ===\n');

// 检查项目级build.gradle
console.log('1. 检查项目级 build.gradle 配置...');
try {
  const projectBuildGradlePath = path.join(__dirname, 'android', 'build.gradle');
  const projectBuildGradleContent = fs.readFileSync(projectBuildGradlePath, 'utf8');
  
  // 检查是否包含Google Services插件依赖
  if (projectBuildGradleContent.includes('com.google.gms:google-services')) {
    console.log('✅ 项目级 build.gradle 包含 Google Services 插件依赖');
    
    // 提取版本号
    const versionMatch = projectBuildGradleContent.match(/com\.google\.gms:google-services:([^\s'"]+)/);
    if (versionMatch) {
      console.log(`   插件版本: ${versionMatch[1]}`);
    }
  } else {
    console.log('❌ 项目级 build.gradle 缺少 Google Services 插件依赖');
  }
} catch (error) {
  console.log('❌ 无法读取项目级 build.gradle 文件:', error.message);
}

// 检查模块级build.gradle
console.log('\n2. 检查模块级 build.gradle 配置...');
try {
  const appBuildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');
  const appBuildGradleContent = fs.readFileSync(appBuildGradlePath, 'utf8');
  
  // 检查是否应用了Google Services插件
  if (appBuildGradleContent.includes('com.google.gms.google-services')) {
    console.log('✅ 模块级 build.gradle 已应用 Google Services 插件');
  } else {
    console.log('❌ 模块级 build.gradle 未应用 Google Services 插件');
  }
} catch (error) {
  console.log('❌ 无法读取模块级 build.gradle 文件:', error.message);
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

// 检查生成的资源文件
console.log('\n4. 检查生成的资源文件...');
try {
  const generatedValuesPath = path.join(__dirname, 'android', 'app', 'build', 'generated', 'res', 'google-services');
  if (fs.existsSync(generatedValuesPath)) {
    console.log('✅ 生成的资源文件目录存在');
    
    // 检查是否有debug或release目录
    const dirs = fs.readdirSync(generatedValuesPath);
    for (const dir of dirs) {
      if (dir === 'debug' || dir === 'release') {
        console.log(`   构建变体: ${dir}`);
        
        const valuesXmlPath = path.join(generatedValuesPath, dir, 'values', 'values.xml');
        if (fs.existsSync(valuesXmlPath)) {
          console.log('   ✅ values.xml 文件已生成');
        } else {
          console.log('   ⚠️  values.xml 文件未生成');
        }
      }
    }
  } else {
    console.log('ℹ️  生成的资源文件目录不存在（可能尚未构建）');
  }
} catch (error) {
  console.log('ℹ️  检查生成的资源文件时出错:', error.message);
}

console.log('\n=== 验证完成 ===');
console.log('\n下一步建议:');
console.log('1. 如果尚未构建项目，请运行构建命令以生成资源文件');
console.log('2. 如果遇到Firebase配置错误，请检查上述配置是否正确');
console.log('3. 确保使用Expo Go或构建的APK进行测试');