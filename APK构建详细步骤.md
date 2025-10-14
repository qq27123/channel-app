# Android APK构建详细步骤指南

## 当前问题

遇到文件权限错误，无法删除 `android\gradle\wrapper` 目录：
```
Error: EPERM: operation not permitted, scandir 'D:\wenjianjia2\channel-app\android\gradle\wrapper'
```

## 完整解决方案

### 第一步：重启计算机（必须）

**原因**：Windows文件系统可能锁定了gradle相关文件，重启可以释放所有文件锁定。

1. 保存所有工作
2. 重启Windows系统
3. 重启后继续下面的步骤

---

### 第二步：以管理员身份运行PowerShell

**步骤**：

1. 按 `Win + X` 键
2. 选择 **"Windows PowerShell (管理员)"** 或 **"终端 (管理员)"**
3. 如果弹出UAC提示，点击 **"是"**

---

### 第三步：清理Android项目目录

在管理员PowerShell中执行：

```powershell
# 1. 进入项目目录
cd d:\wenjianjia2\channel-app

# 2. 停止所有可能的进程
Get-Process | Where-Object {$_.ProcessName -like "*java*" -or $_.ProcessName -like "*gradle*" -or $_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# 3. 等待3秒
Start-Sleep -Seconds 3

# 4. 强制删除android目录
Remove-Item -Path "android" -Recurse -Force -ErrorAction SilentlyContinue

# 5. 验证删除
if (Test-Path "android") {
    Write-Host "⚠️ Android目录仍存在，尝试手动删除..." -ForegroundColor Yellow
    # 尝试使用系统命令删除
    cmd /c "rd /s /q android"
} else {
    Write-Host "✓ Android目录已成功删除" -ForegroundColor Green
}

# 6. 同时清理node_modules/.cache（可选但推荐）
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
```

---

### 第四步：验证Android环境

```powershell
# 1. 验证Android SDK路径
$env:ANDROID_HOME = "E:\development\Android\sdk"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"

# 2. 验证ADB连接
adb devices
# 应该显示: emulator-5554   device

# 3. 验证Java环境（Gradle需要）
java -version
# 如果没有Java，需要安装JDK 17或JDK 11
```

---

### 第五步：重新生成Android项目

```powershell
# 进入项目目录
cd d:\wenjianjia2\channel-app

# 使用expo prebuild生成原生Android项目
npx expo prebuild --platform android --clean

# 如果提示 "Continue with uncommitted changes?"，输入 y
```

**预期输出**：
```
✓ Android project created
✓ iOS project created (如果同时生成)
```

---

### 第六步：构建Debug APK

#### 方法A：使用Gradle直接构建（推荐）

```powershell
# 1. 进入android目录
cd android

# 2. 使用gradlew构建
.\gradlew.bat assembleDebug

# 构建时间：约10-20分钟（首次构建）
# 构建成功后，APK位置：
# app\build\outputs\apk\debug\app-debug.apk
```

#### 方法B：使用Expo命令（自动化）

```powershell
# 返回项目根目录
cd d:\wenjianjia2\channel-app

# 使用expo run:android自动构建并安装
npx expo run:android --device

# 这个命令会：
# 1. 自动构建APK
# 2. 自动安装到连接的设备
# 3. 自动启动应用
```

---

### 第七步：安装APK到模拟器

#### 如果使用方法A（手动安装）：

```powershell
# 1. 返回项目根目录
cd d:\wenjianjia2\channel-app

# 2. 安装APK
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

# -r 参数表示替换已存在的应用
```

#### 如果使用方法B：

应用会自动安装并启动，无需手动操作。

---

### 第八步：启动应用

```powershell
# 1. 启动Metro bundler（如果还没运行）
cd d:\wenjianjia2\channel-app
npx expo start --clear

# 2. 应用应该自动连接到bundler
# 如果没有自动连接，在模拟器中打开应用即可
```

---

## 常见问题和解决方案

### 问题1：即使重启后仍无法删除android目录

**解决方案**：

```powershell
# 使用Unlocker工具或手动通过文件资源管理器删除
# 或者使用Windows安全模式删除

# 临时方案：重命名而非删除
Rename-Item -Path "android" -NewName "android.old"
# 然后重新生成
npx expo prebuild --platform android
```

### 问题2：Gradle构建失败

**可能原因和解决方案**：

```powershell
# A. 网络问题（下载依赖失败）
# 配置Gradle使用国内镜像
# 编辑 android\build.gradle，添加阿里云镜像

# B. JDK版本不兼容
# 确保使用JDK 11或JDK 17
java -version

# C. 内存不足
# 编辑 android\gradle.properties
# 添加: org.gradle.jvmargs=-Xmx4096m
```

### 问题3：ADB无法连接设备

```powershell
# 重启ADB服务
adb kill-server
adb start-server
adb devices
```

### 问题4：应用安装后闪退

```powershell
# 查看日志
adb logcat | Select-String "AndroidRuntime"

# 常见原因：
# - 权限问题：检查 app.json 中的权限配置
# - 原生模块问题：确保所有原生依赖已正确链接
```

---

## Gradle构建优化（可选）

为了加速构建，可以配置Gradle缓存和并行构建：

### 编辑 `android\gradle.properties`

添加以下内容：

```properties
# 增加JVM内存
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError

# 启用并行构建
org.gradle.parallel=true

# 启用配置缓存
org.gradle.caching=true

# 启用增量编译
org.gradle.configureondemand=true

# 使用AndroidX
android.useAndroidX=true
android.enableJetifier=true
```

### 配置国内镜像（提升下载速度）

编辑 `android\build.gradle`：

```gradle
allprojects {
    repositories {
        // 阿里云镜像
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        
        // 原有仓库
        google()
        mavenCentral()
    }
}
```

---

## 完整流程检查清单

执行前请确认：

- [ ] 已重启计算机
- [ ] 以管理员身份运行PowerShell
- [ ] Android模拟器已启动（emulator-5554在线）
- [ ] ANDROID_HOME已设置为：E:\development\Android\sdk
- [ ] ADB可以连接到模拟器
- [ ] 已安装Java JDK 11或17
- [ ] android目录已完全删除或重命名

执行步骤：

```powershell
# 1. 设置环境变量
$env:ANDROID_HOME = "E:\development\Android\sdk"

# 2. 进入项目目录
cd d:\wenjianjia2\channel-app

# 3. 清理旧文件
Remove-Item -Path "android" -Recurse -Force -ErrorAction SilentlyContinue

# 4. 重新生成Android项目
npx expo prebuild --platform android --clean

# 5. 构建APK（选择一种方法）
# 方法A：
cd android
.\gradlew.bat assembleDebug
cd ..
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

# 方法B：
npx expo run:android --device

# 6. 启动Metro bundler
npx expo start --clear
```

---

## 测试验证

APK安装成功后，测试以下功能：

### 1. 登录功能
- 使用测试账号：13800138000
- 密码：123456
- 验证登录成功跳转

### 2. 退出登录功能（重点）
- 进入个人中心
- 点击"退出登录"按钮
- 验证Alert.alert()弹窗正常显示
- 确认后验证自动跳转到登录页

### 3. 移动端特有功能
- Alert弹窗
- TouchableOpacity反馈
- SafeAreaView布局
- 系统权限请求（相机、通知等）

### 4. 频道功能
- 浏览频道广场
- 订阅/取消订阅
- 查看频道详情
- 发送消息

### 5. 私聊功能
- 点击创建者头像
- 进入私聊页面
- 发送测试消息

---

## 预估时间

- **清理和准备**：5分钟
- **重新生成项目**：3-5分钟
- **首次Gradle构建**：15-25分钟
- **安装和测试**：5分钟

**总计**：约30-40分钟

---

## 如果仍然失败

如果上述步骤仍然遇到问题，可以考虑：

### 备选方案：使用EAS Build（云端构建）

```powershell
# 1. 安装EAS CLI
npm install -g eas-cli

# 2. 登录Expo账号
eas login

# 3. 配置构建
eas build:configure

# 4. 开始云端构建
eas build --platform android --profile development

# 优势：
# - 在云端构建，不受本地环境影响
# - 构建后可直接下载APK
# - 适合无法解决本地问题的情况
```

---

## 成功标志

看到以下输出表示成功：

```
✓ Android项目已生成
✓ Gradle构建成功
✓ APK已安装到模拟器
✓ 应用启动成功
✓ Metro bundler连接成功
```

祝您构建顺利！🚀
