#!/usr/bin/env pwsh
# Android构建脚本 (修复版)

Write-Host "=== 开始Android应用构建 ===" -ForegroundColor Green

# 切换到项目目录
Set-Location D:\wenjianjia2\channel-app

# 清理旧的构建
Write-Host "`n步骤1: 清理旧的构建文件..." -ForegroundColor Yellow
Remove-Item -Recurse -Force android -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# 初始化git（避免警告）
if (-not (Test-Path .git)) {
    Write-Host "`n步骤2: 初始化git仓库（避免警告）..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for Android build"
}

# 运行prebuild
Write-Host "`n步骤3: 生成Android原生项目..." -ForegroundColor Yellow
npx expo prebuild --platform android --clean

# 构建APK
Write-Host "`n步骤4: 构建Android APK..." -ForegroundColor Yellow
Set-Location android
.\gradlew assembleDebug

# 安装到模拟器
Write-Host "`n步骤5: 安装APK到模拟器..." -ForegroundColor Yellow
$apkPath = "app\build\outputs\apk\debug\app-debug.apk"
adb install -r $apkPath

Write-Host "`n=== 构建完成！===" -ForegroundColor Green
Write-Host "APK已安装到模拟器" -ForegroundColor Cyan