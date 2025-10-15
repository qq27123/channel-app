# 自动清理并重新构建Android项目
Write-Host "开始自动清理并重新构建Android项目..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

# 尝试停止任何可能锁定文件的进程
Write-Host "1. 停止可能锁定文件的进程..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "adb" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "emulator" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 尝试删除android目录
Write-Host "2. 删除android目录..." -ForegroundColor Yellow
$androidDir = "android"
if (Test-Path $androidDir) {
    # 首先尝试解除隐藏属性
    cmd /c "attrib -h -s `"$androidDir\*.*`" /s" 2>$null
    # 然后删除
    Remove-Item -Path $androidDir -Recurse -Force -ErrorAction SilentlyContinue
}

# 等待几秒钟让文件系统释放锁
Start-Sleep -Seconds 3

# 再次检查并强制删除
if (Test-Path $androidDir) {
    Write-Host "第一次删除失败，尝试强制删除..." -ForegroundColor Yellow
    # 使用cmd命令强制删除
    cmd /c "rmdir /s /q `"$androidDir`"" 2>$null
}

# 再次检查
Start-Sleep -Seconds 2
if (Test-Path $androidDir) {
    Write-Host "警告: 无法完全删除android目录" -ForegroundColor Red
} else {
    Write-Host "android目录已成功删除" -ForegroundColor Green
}

# 生成新的Android项目
Write-Host "3. 生成新的Android项目..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
echo Y | npx expo prebuild --platform android --clean

Write-Host "自动清理和构建过程完成!" -ForegroundColor Green