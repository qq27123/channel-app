# Android APK构建脚本 (修复版)
Write-Host "========================================" -ForegroundColor Green
Write-Host " Android应用发布版本构建脚本" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "[1/5] 清理旧的构建文件..." -ForegroundColor Yellow
if (Test-Path "android") {
    Remove-Item -Path "android" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path ".expo") {
    Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "清理完成!" -ForegroundColor Green
Write-Host ""

Write-Host "[2/5] 生成Android原生项目..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
echo "Y" | npx expo prebuild --platform android --clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: prebuild失败" -ForegroundColor Red
    exit 1
}
Write-Host "prebuild完成!" -ForegroundColor Green
Write-Host ""

Write-Host "[3/5] 构建Android发布版APK..." -ForegroundColor Yellow
Set-Location -Path "android"
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-11.0.25.9-hotspot"
.\gradlew.bat assembleRelease
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 构建失败" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}
Set-Location -Path ".."
Write-Host "构建完成!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host " 发布版本构建完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "APK文件路径: android\app\build\outputs\apk\release\app-release-unsigned.apk" -ForegroundColor Cyan
Write-Host ""
Write-Host "请使用jarsigner和zipalign工具对APK进行签名" -ForegroundColor Yellow
Write-Host ""
Write-Host "签名步骤参考:" -ForegroundColor Yellow
Write-Host "1. 创建密钥库: keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000" -ForegroundColor Gray
Write-Host "2. 签名APK: jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore android\app\build\outputs\apk\release\app-release-unsigned.apk my-key-alias" -ForegroundColor Gray
Write-Host "3. 优化APK: zipalign -v 4 android\app\build\outputs\apk\release\app-release-unsigned.apk channel-app-release.apk" -ForegroundColor Gray
Write-Host ""