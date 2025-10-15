# 登录并构建APK脚本
Write-Host "开始登录并构建APK..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

# 登录Expo账户
Write-Host "1. 登录Expo账户..." -ForegroundColor Yellow
echo "qq27123" | eas login

# 等待登录完成
Start-Sleep -Seconds 5

# 验证登录状态
Write-Host "2. 验证登录状态..." -ForegroundColor Yellow
eas whoami

# 构建APK
Write-Host "3. 开始构建APK..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
eas build -p android --profile preview --non-interactive

Write-Host "登录和构建过程完成!" -ForegroundColor Green