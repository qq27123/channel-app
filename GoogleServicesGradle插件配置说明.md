# Google Services Gradle 插件配置说明

## 概述

Google Services Gradle 插件用于处理 `google-services.json` 配置文件，并将其配置值提供给 Firebase SDK。本文档说明了如何正确配置该插件。

## 配置步骤

### 1. 项目级配置

在项目级 `build.gradle` 文件中添加 Google Services 插件依赖：

**文件位置**: `<project>/android/build.gradle`

```gradle
buildscript {
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath('com.android.tools.build:gradle:7.4.2')
    classpath('com.facebook.react:react-native-gradle-plugin')
    classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')
    // 添加 Google Services 插件
    classpath("com.google.gms:google-services:4.4.4")
  }
}

allprojects {
  repositories {
    google()
    mavenCentral()
    maven { url 'https://www.jitpack.io' }
  }
}
```

### 2. 模块级配置

在模块级 `build.gradle` 文件中应用 Google Services 插件：

**文件位置**: `<project>/android/app/build.gradle`

```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"
// 应用 Google Services 插件
apply plugin: "com.google.gms.google-services"

// ... 其他配置
```

## 插件功能

Google Services Gradle 插件执行以下操作：

1. **处理配置文件**: 读取 `google-services.json` 文件并解析其中的配置信息
2. **生成资源文件**: 创建 `R.string.google_app_id` 等资源，供 Firebase SDK 使用
3. **注入配置值**: 将 API 密钥、项目ID等配置值注入到应用中

## 配置验证

### 1. 检查插件是否正确应用

运行以下命令验证插件是否正确应用：

```bash
cd android
./gradlew tasks | grep google
```

应该能看到与 Google Services 相关的任务。

### 2. 验证生成的资源文件

构建项目后，检查是否生成了正确的资源文件：

```
android/app/build/generated/res/google-services/debug/values/values.xml
```

该文件应包含类似以下内容：

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <string name="google_app_id" translatable="false">1:1088059202177:android:bb296c5ba2d417d5db8b80</string>
  <string name="gcm_defaultSenderId" translatable="false">1088059202177</string>
  <string name="default_web_client_id" translatable="false">your-web-client-id</string>
  <!-- 其他配置值 -->
</resources>
```

## 常见问题和解决方案

### 1. 插件未找到错误

**错误信息**:
```
Plugin with id 'com.google.gms.google-services' not found
```

**解决方案**:
1. 确保在项目级 `build.gradle` 文件中添加了插件依赖
2. 同步 Gradle 项目

### 2. 配置文件未找到错误

**错误信息**:
```
File google-services.json is missing
```

**解决方案**:
1. 确保 `google-services.json` 文件位于正确位置：`android/app/google-services.json`
2. 确保文件名正确（包括大小写）

### 3. 配置值未注入

**问题**: Firebase SDK 无法获取配置值

**解决方案**:
1. 确保在模块级 `build.gradle` 文件中应用了插件
2. 清理并重新构建项目：
   ```bash
   cd android
   ./gradlew clean
   ./gradlew build
   ```

## 版本兼容性

### 推荐版本

- **Google Services 插件**: 4.4.4
- **Android Gradle 插件**: 7.4.2
- **Gradle**: 7.5+

### 版本检查

检查当前使用的版本：

**项目级 build.gradle**:
```gradle
dependencies {
  classpath("com.google.gms:google-services:4.4.4")  // 插件版本
}
```

**gradle-wrapper.properties**:
```
distributionUrl=https\://services.gradle.org/distributions/gradle-7.5-all.zip
```

## 安全注意事项

1. **不要提交真实的配置文件**: 如果项目是公开的，不要提交包含真实API密钥的 `google-services.json` 文件
2. **定期更新插件**: 定期检查并更新到最新版本的 Google Services 插件
3. **限制权限**: 为 Firebase 服务配置适当的权限规则

## 故障排除

### 1. 清理构建缓存

```bash
cd android
./gradlew clean
./gradlew --stop
# 删除构建目录
rm -rf app/build
```

### 2. 重新同步项目

在 Android Studio 中：
1. File → Sync Project with Gradle Files
2. 或点击 "Sync Now" 提示

### 3. 检查日志

查看详细构建日志：
```bash
cd android
./gradlew build --info
```

## 联系支持

如有问题，请联系：
- 邮箱：taowang2020@163.com

## 版本信息

- 文档最后更新：2025年10月15日
- Google Services 插件版本：4.4.4