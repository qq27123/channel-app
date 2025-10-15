# Google Services 配置说明

## 概述

本文档说明了如何在项目中正确配置和使用 `google-services.json` 文件，以支持 Firebase 服务。

## 文件位置

`google-services.json` 文件必须放置在以下位置：

```
项目根目录/
└── android/
    └── app/
        └── google-services.json  ← 正确位置
```

## 文件内容结构

```json
{
  "project_info": {
    "project_number": "项目编号",
    "project_id": "项目ID",
    "storage_bucket": "存储桶"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "应用ID",
        "android_client_info": {
          "package_name": "应用包名"
        }
      },
      "oauth_client": [...],
      "api_key": [
        {
          "current_key": "API密钥"
        }
      ],
      "services": {...}
    }
  ],
  "configuration_version": "配置版本"
}
```

## 配置步骤

### 1. 从 Firebase 控制台下载配置文件

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 选择你的项目
3. 点击齿轮图标进入"项目设置"
4. 在"常规"标签页中找到你的 Android 应用
5. 点击"google-services.json"旁边的"下载"按钮

### 2. 将文件放置在正确位置

将下载的 `google-services.json` 文件复制到：
```
your-project/android/app/google-services.json
```

### 3. 验证配置

确保文件中的以下信息与你的应用配置匹配：

- **package_name**: `com.channelapp.mobile`
- **project_id**: `tpzys-f63cf`

### 4. Gradle 配置

确保在以下文件中正确配置了 Google Services 插件：

**android/build.gradle**:
```gradle
buildscript {
  dependencies {
    classpath("com.google.gms:google-services:4.4.4")
  }
}
```

**android/app/build.gradle**:
```gradle
apply plugin: "com.google.gms.google-services"
```

## 常见问题和解决方案

### 1. "auth/configuration-not-found" 错误

**可能原因**:
- `google-services.json` 文件位置不正确
- 文件内容中的项目ID或包名不匹配
- API密钥无效

**解决方案**:
1. 验证文件位置是否正确
2. 检查文件内容是否与Firebase控制台中的配置匹配
3. 重新下载 `google-services.json` 文件

### 2. 构建失败

**可能原因**:
- 未正确应用 Google Services 插件
- Gradle 版本不兼容

**解决方案**:
1. 确保在 `build.gradle` 文件中正确应用了插件
2. 检查 Gradle 版本兼容性

## 安全注意事项

1. **不要提交真实的配置文件**：如果项目是公开的，不要提交包含真实API密钥的 `google-services.json` 文件
2. **定期更新密钥**：定期在Firebase控制台中轮换API密钥
3. **限制权限**：为Firebase服务配置适当的权限规则

## 验证配置

运行验证脚本检查配置：

```bash
node validate-google-services.js
```

## 版本信息

- Google Services 插件版本: 4.4.4
- 最后更新：2025年10月15日