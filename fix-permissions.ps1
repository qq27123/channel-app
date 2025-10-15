# 修复权限问题并重新构建
Write-Host "开始修复权限问题..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

# 停止可能锁定文件的进程
Write-Host "1. 停止可能锁定文件的进程..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "adb" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 等待几秒让进程完全停止
Start-Sleep -Seconds 5

# 清理android目录
Write-Host "2. 清理android目录..." -ForegroundColor Yellow
if (Test-Path "android") {
    # 解除隐藏属性
    cmd /c "attrib -h -s android\*.* /s" 2>$null
    # 强制删除
    cmd /c "rmdir /s /q android" 2>$null
}

# 清理其他可能的缓存目录
Write-Host "3. 清理其他缓存目录..." -ForegroundColor Yellow
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue

# 重新安装依赖
Write-Host "4. 重新安装依赖..." -ForegroundColor Yellow
npm install

# 重新生成android项目
Write-Host "5. 重新生成android项目..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
npx expo prebuild --platform android --clean

Write-Host "权限修复完成！现在可以尝试重新构建APK了。" -ForegroundColor Green
Write-Host "运行以下命令构建APK:" -ForegroundColor Cyan
Write-Host "eas build -p android --profile preview --non-interactive" -ForegroundColor Gray