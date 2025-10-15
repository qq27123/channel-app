# 最终本地构建APK脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "        最终本地APK构建方案" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "步骤1: 清理环境..." -ForegroundColor Yellow
# 停止可能锁定文件的进程
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "adb" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 删除问题目录
if (Test-Path "android") {
    Remove-Item -Path "android" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "步骤2: 生成Android项目..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
npx expo prebuild --platform android --clean

Write-Host "步骤3: 构建Debug APK（更简单的方法）..." -ForegroundColor Yellow
Write-Host "这通常比Release版本构建更快..." -ForegroundColor Cyan

# 进入Android目录并构建Debug版本
Set-Location -Path "android"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.25.9-hotspot"

try {
    Write-Host "正在构建Debug APK..." -ForegroundColor Gray
    .\gradlew.bat assembleDebug
    Write-Host "✓ Debug APK构建完成" -ForegroundColor Green
} catch {
    Write-Host "✗ Debug APK构建失败: $($_.Exception.Message)" -ForegroundColor Red
}

Set-Location -Path ".."

Write-Host "步骤4: 查找生成的APK..." -ForegroundColor Yellow
# 检查Debug APK
$debugApkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $debugApkPath) {
    Write-Host "✓ 找到Debug APK!" -ForegroundColor Green
    Write-Host "位置: $((Resolve-Path $debugApkPath).Path)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "注意: 这是Debug版本，可以直接安装到设备进行测试" -ForegroundColor Yellow
} else {
    Write-Host "✗ 未找到Debug APK文件" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "          构建过程完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "提示:" -ForegroundColor Yellow
Write-Host "• Debug APK可以直接安装到Android设备进行测试" -ForegroundColor Gray
Write-Host "• 如果需要Release版本，可以使用EAS Build云端构建" -ForegroundColor Gray