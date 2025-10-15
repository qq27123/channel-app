# 最终APK构建脚本
Write-Host "开始构建APK..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

# 生成Android原生项目
Write-Host "1. 生成Android原生项目..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
npx expo prebuild --platform android

# 配置环境变量
Write-Host "2. 配置环境变量..." -ForegroundColor Yellow
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-11.0.25.9-hotspot"

# 构建APK
Write-Host "3. 构建APK..." -ForegroundColor Yellow
Set-Location -Path "android"
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-11.0.25.9-hotspot"
.\gradlew.bat assembleRelease

# 返回项目根目录
Set-Location -Path ".."

Write-Host "构建完成!" -ForegroundColor Green
Write-Host "APK位置: android\app\build\outputs\apk\release\app-release-unsigned.apk" -ForegroundColor Cyan