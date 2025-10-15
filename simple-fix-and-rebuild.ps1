# 简化版修复并重新构建脚本
Write-Host "修复Firebase配置并重新构建..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "1. 暂存所有更改..." -ForegroundColor Yellow
git add .

Write-Host "2. 提交更改..." -ForegroundColor Yellow
git commit -m "Fix Firebase config import path"

Write-Host "3. 清理项目..." -ForegroundColor Yellow
if (Test-Path "android") {
    Remove-Item -Path "android" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "4. 设置环境变量..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
$env:EAS_NO_VCS = "1"

Write-Host "5. 重新生成Android项目..." -ForegroundColor Yellow
npx expo prebuild --platform android --clean

Write-Host "6. 开始构建..." -ForegroundColor Yellow
eas build -p android --profile preview --non-interactive --clear-cache

Write-Host "构建已启动!" -ForegroundColor Green