# 简化版监控脚本
Write-Host "监控EAS Build状态..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "构建链接: https://expo.dev/accounts/qq27123/projects/channel-app/builds/016c5b3a-3b1b-4332-8d5f-bbd5eb241810" -ForegroundColor Cyan
Write-Host "请在浏览器中查看构建状态" -ForegroundColor Yellow
Write-Host "构建完成后，可以使用以下命令下载APK:" -ForegroundColor Yellow
Write-Host "eas build:download" -ForegroundColor Gray