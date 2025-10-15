# Firebase配置说明

## 概述

本文档说明了如何在项目中配置和使用 Firebase 服务。

## 文件结构

```
项目根目录/
├── firebase-config.js      # Firebase配置文件
├── .env                    # 环境变量文件
├── .env.local              # 本地环境变量文件（不提交）
├── .gitignore              # Git忽略文件
└── src/config/firebase.js  # Firebase初始化文件
```

## 配置步骤

### 1. Firebase控制台配置

1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 创建新项目或选择现有项目
3. 在项目设置中获取Web应用配置信息
4. 启用需要的服务：
   - Authentication（认证）
   - Firestore Database（数据库）
   - Storage（存储，如果需要）

### 2. 环境变量配置

在 [.env](file:///d:/wenjianjia2/channel-app/.env) 文件中配置以下环境变量：

```env
# Firebase配置
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# 应用配置
APP_ENV=development
DEBUG=true
```

### 3. 本地开发配置

为本地开发创建 [.env.local](file:///d:/wenjianjia2/channel-app/.env.local) 文件：

```env
# 本地Firebase配置（不会被提交）
FIREBASE_API_KEY=your_local_api_key
FIREBASE_AUTH_DOMAIN=your-project-local.firebaseapp.com
# ... 其他本地配置
```

### 4. Firebase配置文件

[firebase-config.js](file:///d:/wenjianjia2/channel-app/firebase-config.js) 文件包含：

```javascript
// 导入环境变量
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  // ... 其他配置项
};

// 导出配置
export { firebaseConfig, isFirebaseConfigured };
```

## 安全注意事项

1. **不要提交真实的API密钥**：确保 [.gitignore](file:///d:/wenjianjia2/channel-app/.gitignore) 文件包含敏感文件
2. **使用环境变量**：在生产环境中使用环境变量而不是硬编码的值
3. **定期轮换密钥**：定期在Firebase控制台中轮换API密钥
4. **限制权限**：为Firebase服务配置适当的权限规则

## 测试配置

运行验证脚本检查配置：

```bash
node validate-firebase-setup.js
```

## 故障排除

### 常见错误

1. **"auth/configuration-not-found"**：
   - 检查项目ID是否正确
   - 确保API密钥有效
   - 验证Firebase项目是否存在

2. **网络连接问题**：
   - 检查防火墙设置
   - 确保可以访问Firebase服务

### 联系支持

如有问题，请联系：
- 邮箱：taowang2020@163.com

## 版本信息

- Firebase SDK: ^12.4.0
- 最后更新：2025年10月15日