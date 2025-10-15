# 触发GitHub Actions构建脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "        触发GitHub Actions构建" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "步骤1: 检查Git状态..." -ForegroundColor Yellow
git status

Write-Host "步骤2: 添加并提交更改..." -ForegroundColor Yellow
git add .
git commit -m "Trigger GitHub Actions build for APK"

Write-Host "步骤3: 推送到GitHub..." -ForegroundColor Yellow
git push origin master

Write-Host ""
Write-Host "✅ 构建已触发!" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "1. 访问GitHub仓库的Actions标签页" -ForegroundColor Gray
Write-Host "2. 查看构建进度" -ForegroundColor Gray
Write-Host "3. 构建完成后从Artifacts下载APK" -ForegroundColor Gray
Write-Host ""
Write-Host "构建通常需要15-30分钟完成。" -ForegroundColor Cyan