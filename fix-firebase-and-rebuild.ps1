# 修复Firebase配置并重新构建
Write-Host "========================================" -ForegroundColor Green
Write-Host "     修复Firebase配置并重新构建" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "步骤1: 修复Firebase配置文件导入路径..." -ForegroundColor Yellow
# 我们已经修复了src/config/firebase.js中的导入路径

Write-Host "步骤2: 暂存所有更改..." -ForegroundColor Yellow
git add .

Write-Host "步骤3: 提交更改..." -ForegroundColor Yellow
git commit -m "Fix Firebase config import path"

Write-Host "步骤4: 清理项目..." -ForegroundColor Yellow
# 删除问题目录
if (Test-Path "android") {
    Remove-Item -Path "android" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "步骤5: 设置环境变量..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
$env:EAS_NO_VCS = "1"

Write-Host "步骤6: 重新生成Android项目..." -ForegroundColor Yellow
npx expo prebuild --platform android --clean

Write-Host "步骤7: 开始构建..." -ForegroundColor Yellow
Write-Host "这可能需要15-30分钟，请耐心等待..." -ForegroundColor Cyan

try {
    eas build -p android --profile preview --non-interactive --clear-cache
    Write-Host "✓ 构建命令已启动" -ForegroundColor Green
} catch {
    Write-Host "✗ 构建命令失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "          构建过程启动!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "提示:" -ForegroundColor Yellow
Write-Host "• 使用 'eas build:list' 查看构建状态" -ForegroundColor Gray
Write-Host "• 构建完成后使用 'eas build:download' 下载APK" -ForegroundColor Gray