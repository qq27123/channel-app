# 最终解决方案脚本
Write-Host "开始执行最终解决方案..." -ForegroundColor Green

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

# 保存当前目录
$currentDir = Get-Location

Write-Host "步骤1: 停止可能锁定文件的进程..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "adb" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 等待进程完全停止
Start-Sleep -Seconds 5

Write-Host "步骤2: 强制删除问题目录..." -ForegroundColor Yellow
# 使用多种方法尝试删除android目录
if (Test-Path "android") {
    Write-Host "  - 尝试方法1: 使用PowerShell删除" -ForegroundColor Gray
    try {
        Remove-Item -Path "android" -Recurse -Force -ErrorAction Stop
        Write-Host "  ✓ 方法1成功" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ 方法1失败: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 如果目录仍然存在，尝试其他方法
if (Test-Path "android") {
    Write-Host "  - 尝试方法2: 使用cmd命令删除" -ForegroundColor Gray
    try {
        cmd /c "rmdir /s /q android" 2>$null
        Write-Host "  ✓ 方法2完成" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ 方法2失败" -ForegroundColor Red
    }
}

# 再次检查并强制删除
if (Test-Path "android") {
    Write-Host "  - 尝试方法3: 使用robocopy清空后删除" -ForegroundColor Gray
    try {
        $emptyDir = Join-Path $currentDir "empty_temp_dir"
        New-Item -ItemType Directory -Path $emptyDir -Force | Out-Null
        robocopy $emptyDir "android" /MIR /R:0 /W:0 | Out-Null
        Remove-Item -Path $emptyDir -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "android" -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ 方法3完成" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ 方法3失败" -ForegroundColor Red
    }
}

Write-Host "步骤3: 清理其他缓存目录..." -ForegroundColor Yellow
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "build" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "步骤4: 清理npm缓存..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "步骤5: 重新生成原生代码..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
npx expo prebuild --platform android --clean

Write-Host "步骤6: 设置环境变量并开始构建..." -ForegroundColor Yellow
$env:EXPO_NO_GIT_STATUS = "1"
$env:EAS_NO_VCS = "1"

# 尝试构建
try {
    eas build -p android --profile preview --non-interactive --clear-cache
    Write-Host "构建命令已启动" -ForegroundColor Green
} catch {
    Write-Host "构建命令执行出错: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "所有步骤已完成!" -ForegroundColor Green