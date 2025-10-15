# 设置GitHub Actions脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "     设置GitHub Actions构建APK" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "步骤1: 暂存所有更改..." -ForegroundColor Yellow
git add .

Write-Host "步骤2: 提交更改..." -ForegroundColor Yellow
git commit -m "Add GitHub Actions workflow for APK build"

Write-Host "步骤3: 推送到GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ GitHub Actions设置完成!" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "1. 在GitHub仓库设置中添加EXPO_TOKEN密钥" -ForegroundColor Gray
Write-Host "2. 访问https://expo.dev/settings/access-tokens创建访问令牌" -ForegroundColor Gray
Write-Host "3. 在GitHub中进入Settings > Secrets and variables > Actions" -ForegroundColor Gray
Write-Host "4. 添加名为EXPO_TOKEN的密钥，值为你的Expo访问令牌" -ForegroundColor Gray
Write-Host ""
Write-Host "详细设置说明请查看: GITHUB_ACTIONS_SETUP.md" -ForegroundColor Cyan