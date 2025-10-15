# 使用React Native CLI构建APK脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host " 使用React Native CLI构建Android APK" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "[1/4] 生成Android原生项目..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
npx expo prebuild --platform android
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: prebuild失败" -ForegroundColor Red
    exit 1
}
Write-Host "prebuild完成!" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] 配置环境变量..." -ForegroundColor Yellow
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-11.0.25.9-hotspot"
$env:ANDROID_HOME="D:\Android\Sdk"
Write-Host "环境变量配置完成!" -ForegroundColor Green
Write-Host ""

Write-Host "[3/4] 构建Android发布版APK..." -ForegroundColor Yellow
Set-Location -Path "android"
.\gradlew.bat assembleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 构建失败" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}
Set-Location -Path ".."
Write-Host "构建完成!" -ForegroundColor Green
Write-Host ""

Write-Host "[4/4] 复制APK到项目根目录..." -ForegroundColor Yellow
$sourceApk = "android\app\build\outputs\apk\release\app-release-unsigned.apk"
$destinationApk = "channel-app-release-unsigned.apk"

if (Test-Path $sourceApk) {
    Copy-Item -Path $sourceApk -Destination $destinationApk -Force
    Write-Host "APK已复制到项目根目录: $destinationApk" -ForegroundColor Green
} else {
    Write-Host "警告: 未找到APK文件，请检查构建输出" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host " Android APK构建完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "APK文件路径:" -ForegroundColor Cyan
Write-Host "1. 原始路径: $sourceApk" -ForegroundColor Gray
Write-Host "2. 复制路径: $destinationApk" -ForegroundColor Gray
Write-Host ""
Write-Host "注意: 生成的APK是未签名的版本，如需发布请进行签名处理" -ForegroundColor Yellow
Write-Host ""