# 本地构建APK脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "        本地APK构建脚本" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "检查环境配置..." -ForegroundColor Yellow
# 检查Java环境
try {
    $javaVersion = java -version 2>&1
    Write-Host "✓ Java环境: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ 未找到Java环境，请安装JDK 11+" -ForegroundColor Red
    exit 1
}

# 检查Android环境
if ($env:ANDROID_HOME) {
    Write-Host "✓ Android SDK路径: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    Write-Host "✗ 未设置ANDROID_HOME环境变量" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "步骤1: 停止可能锁定文件的进程..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "adb" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "步骤2: 清理项目..." -ForegroundColor Yellow
# 清理npm缓存
npm cache clean --force

# 删除问题目录
if (Test-Path "android") {
    Write-Host "  - 删除android目录..." -ForegroundColor Gray
    Remove-Item -Path "android" -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path ".expo") {
    Write-Host "  - 删除.expo目录..." -ForegroundColor Gray
    Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "步骤3: 生成Android原生项目..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
npx expo prebuild --platform android --clean

if (-not (Test-Path "android")) {
    Write-Host "✗ 生成Android项目失败" -ForegroundColor Red
    exit 1
}

Write-Host "步骤4: 配置环境变量..." -ForegroundColor Yellow
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.25.9-hotspot"
$env:ANDROID_HOME = "E:\development\Android\sdk"
Write-Host "  - JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray
Write-Host "  - ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Gray

Write-Host "步骤5: 构建APK..." -ForegroundColor Yellow
Write-Host "这可能需要几分钟时间，请耐心等待..." -ForegroundColor Cyan

# 进入Android目录并构建
Set-Location -Path "android"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.25.9-hotspot"

# 使用gradlew构建APK
try {
    .\gradlew.bat assembleRelease
    Write-Host "✓ APK构建完成" -ForegroundColor Green
} catch {
    Write-Host "✗ APK构建失败: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location -Path ".."
    exit 1
}

Set-Location -Path ".."

Write-Host ""
Write-Host "步骤6: 查找生成的APK..." -ForegroundColor Yellow
$apkPath = "android\app\build\outputs\apk\release\app-release-unsigned.apk"
if (Test-Path $apkPath) {
    Write-Host "✓ 找到APK文件: $apkPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "APK位置: $(Resolve-Path $apkPath)" -ForegroundColor Cyan
} else {
    Write-Host "✗ 未找到APK文件，请检查构建输出" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "          构建过程完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "注意事项:" -ForegroundColor Yellow
Write-Host "• 生成的APK是未签名的版本" -ForegroundColor Gray
Write-Host "• 如需发布到应用商店，需要进行签名" -ForegroundColor Gray
Write-Host "• 测试可以使用此APK直接安装到设备" -ForegroundColor Gray