# 简化版APK构建脚本
Write-Host "开始构建APK..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

# 设置环境变量
$env:EXPO_NO_GIT_STATUS = "1"

# 开始构建
eas build -p android --profile preview --non-interactive

Write-Host "构建命令已启动，请查看输出结果" -ForegroundColor Green