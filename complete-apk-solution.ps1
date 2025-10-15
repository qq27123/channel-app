# 完整APK构建解决方案
Write-Host "开始完整的APK构建解决方案..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "步骤1: 停止可能锁定文件的进程..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "adb" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "步骤2: 清理项目缓存..." -ForegroundColor Yellow
# 清理npm缓存
npm cache clean --force

# 删除可能有问题的目录
if (Test-Path "android") {
    # 使用robocopy清空目录
    $emptyDir = "empty_dir"
    New-Item -ItemType Directory -Path $emptyDir -Force | Out-Null
    robocopy $emptyDir "android" /MIR /R:0 /W:0 | Out-Null
    Remove-Item -Path $emptyDir -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "android" -Force -ErrorAction SilentlyContinue
}

if (Test-Path ".expo") {
    Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "步骤3: 重新生成原生代码..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
npx expo prebuild --platform android --clean

Write-Host "步骤4: 开始构建..." -ForegroundColor Yellow
Write-Host "构建过程可能需要15-30分钟，请耐心等待..." -ForegroundColor Cyan
eas build -p android --profile preview --non-interactive

Write-Host "完成!" -ForegroundColor Green