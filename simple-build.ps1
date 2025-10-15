# 简单构建脚本
Write-Host "开始简单构建流程..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

# 设置环境变量
$env:EXPO_NO_GIT_STATUS = "1"

# 清理npm缓存
Write-Host "1. 清理npm缓存..." -ForegroundColor Yellow
npm cache clean --force

# 删除package-lock.json并重新安装
Write-Host "2. 重新安装依赖..." -ForegroundColor Yellow
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
npm install

# 验证登录状态
Write-Host "3. 验证登录状态..." -ForegroundColor Yellow
eas whoami

# 尝试构建
Write-Host "4. 开始构建..." -ForegroundColor Yellow
eas build -p android --profile preview --non-interactive --clear-cache

Write-Host "构建流程完成！" -ForegroundColor Green