# 简化版清理脚本
Write-Host "开始清理..." -ForegroundColor Green

# 停止可能锁定文件的进程
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 等待
Start-Sleep -Seconds 3

# 使用cmd命令强制删除android目录
cmd /c "rmdir /s /q android" 2>$null

# 等待
Start-Sleep -Seconds 2

Write-Host "清理完成" -ForegroundColor Green