# 初始化新Expo项目脚本
Write-Host "初始化新的Expo项目..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "1. 已更新app.json，移除了旧的projectId" -ForegroundColor Yellow
Write-Host "2. 请执行以下步骤:" -ForegroundColor Yellow
Write-Host "   a. 运行 'eas build:configure' 来重新配置项目" -ForegroundColor Gray
Write-Host "   b. 运行 'eas build -p android --profile preview --non-interactive'" -ForegroundColor Gray

Write-Host ""
Write-Host "重要提示:" -ForegroundColor Red
Write-Host "这将为你的项目创建一个新的ID，关联到当前账户(qq27123)" -ForegroundColor Red