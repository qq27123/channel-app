// 验证google-services.json文件的脚本
const fs = require('fs');
const path = require('path');

console.log('=== 验证 google-services.json 文件 ===\n');

try {
  // 读取google-services.json文件
  const googleServicesPath = path.join(__dirname, 'android', 'app', 'google-services.json');
  const googleServicesContent = fs.readFileSync(googleServicesPath, 'utf8');
  const googleServices = JSON.parse(googleServicesContent);

  console.log('1. 检查文件结构...');
  console.log('✅ 文件存在且格式正确');

  console.log('\n2. 验证项目信息...');
  if (googleServices.project_info) {
    console.log(`   项目ID: ${googleServices.project_info.project_id}`);
    console.log(`   项目编号: ${googleServices.project_info.project_number}`);
    console.log(`   存储桶: ${googleServices.project_info.storage_bucket}`);
  } else {
    console.log('❌ 缺少项目信息');
  }

  console.log('\n3. 验证客户端信息...');
  if (googleServices.client && googleServices.client.length > 0) {
    const client = googleServices.client[0];
    console.log(`   应用ID: ${client.client_info.mobilesdk_app_id}`);
    
    if (client.client_info.android_client_info) {
      console.log(`   包名: ${client.client_info.android_client_info.package_name}`);
      
      // 验证包名是否正确
      if (client.client_info.android_client_info.package_name === 'com.channelapp.mobile') {
        console.log('✅ 包名配置正确');
      } else {
        console.log('❌ 包名不匹配，请检查配置');
      }
    }
    
    if (client.api_key && client.api_key.length > 0) {
      console.log(`   API密钥: ${client.api_key[0].current_key.substring(0, 10)}...${client.api_key[0].current_key.substring(client.api_key[0].current_key.length - 5)}`);
    }
  } else {
    console.log('❌ 缺少客户端信息');
  }

  console.log('\n4. 验证文件位置...');
  const expectedPath = path.join('android', 'app', 'google-services.json');
  console.log(`✅ 文件位于正确位置: ${expectedPath}`);

  console.log('\n=== 验证完成 ===');
  console.log('\n如果构建时仍然出现Firebase错误，请检查:');
  console.log('1. Firebase控制台中的项目配置是否与文件中的信息匹配');
  console.log('2. API密钥是否有效');
  console.log('3. 是否在Firebase控制台中启用了Android应用');
  
} catch (error) {
  console.log('❌ 验证失败:', error.message);
}