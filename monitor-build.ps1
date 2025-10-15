# 监控EAS Build状态脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "        监控EAS Build状态" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "正在监控构建状态..." -ForegroundColor Yellow
Write-Host "构建链接: https://expo.dev/accounts/qq27123/projects/channel-app/builds/016c5b3a-3b1b-4332-8d5f-bbd5eb241810" -ForegroundColor Cyan
Write-Host ""

# 循环检查构建状态
for ($i = 1; $i -le 10; $i++) {
    Write-Host "检查 #$i..." -ForegroundColor Gray
    try {
        $buildStatus = eas build:list --limit 1 --json | ConvertFrom-Json
        if ($buildStatus -and $buildStatus.Count -gt 0) {
            $status = $buildStatus[0].status
            Write-Host "当前状态: $status" -ForegroundColor Yellow
            
            if ($status -eq "finished") {
                Write-Host "✓ 构建完成!" -ForegroundColor Green
                break
            } elseif ($status -eq "errored") {
                Write-Host "✗ 构建出错" -ForegroundColor Red
                break
            }
        }
    } catch {
        Write-Host "无法获取构建状态" -ForegroundColor Red
    }
    
    # 等待30秒
    Start-Sleep -Seconds 30
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "          监控完成" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "提示:" -ForegroundColor Yellow
Write-Host "• 你也可以在浏览器中查看构建状态" -ForegroundColor Gray
Write-Host "• 构建完成后，可以使用 'eas build:download' 下载APK" -ForegroundColor Gray