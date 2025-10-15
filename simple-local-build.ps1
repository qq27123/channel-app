# 简化版本地构建APK脚本
Write-Host "开始本地构建APK..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "1. 清理项目..." -ForegroundColor Yellow
# 删除问题目录
if (Test-Path "android") {
    Remove-Item -Path "android" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "2. 生成Android原生项目..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
npx expo prebuild --platform android --clean

Write-Host "3. 配置环境变量..." -ForegroundColor Yellow
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.25.9-hotspot"
$env:ANDROID_HOME = "E:\development\Android\sdk"

Write-Host "4. 构建APK..." -ForegroundColor Yellow
Write-Host "这可能需要几分钟时间，请耐心等待..." -ForegroundColor Cyan

# 进入Android目录并构建
Set-Location -Path "android"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.25.9-hotspot"
.\gradlew.bat assembleRelease

Set-Location -Path ".."

Write-Host "5. 查找APK..." -ForegroundColor Yellow
$apkPath = "android\app\build\outputs\apk\release\app-release-unsigned.apk"
if (Test-Path $apkPath) {
    Write-Host "✓ APK构建成功!" -ForegroundColor Green
    Write-Host "位置: $((Resolve-Path $apkPath).Path)" -ForegroundColor Cyan
} else {
    Write-Host "✗ 未找到APK文件" -ForegroundColor Red
}

Write-Host "本地构建完成!" -ForegroundColor Green