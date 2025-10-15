# 更新配置并构建APK脚本
Write-Host "更新配置并构建APK..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "1. 已更新app.json中的owner为qq27123" -ForegroundColor Yellow
Write-Host "2. 请手动执行以下步骤:" -ForegroundColor Yellow
Write-Host "   a. 运行 'eas login' 并输入用户名 'qq27123'" -ForegroundColor Gray
Write-Host "   b. 运行 'eas build -p android --profile preview --non-interactive'" -ForegroundColor Gray

Write-Host ""
Write-Host "重要提示:" -ForegroundColor Red
Write-Host "由于权限限制，你需要手动执行登录步骤" -ForegroundColor Red
Write-Host "登录后再次运行构建命令即可" -ForegroundColor Red