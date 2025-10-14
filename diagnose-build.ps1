# EAS Build诊断脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host " EAS Build诊断脚本" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置环境
Set-Location -Path "D:\wenjianjia2\channel-app"
$env:Path += ";C:\Program Files\Git\bin;C:\Program Files\Git\cmd"
$env:EAS_NO_VCS = "1"

Write-Host "环境设置完成:" -ForegroundColor Yellow
Write-Host "当前目录: $(Get-Location)" -ForegroundColor Gray
Write-Host "EAS_NO_VCS: $env:EAS_NO_VCS" -ForegroundColor Gray
Write-Host ""

# 检查Git状态
Write-Host "检查Git状态..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "发现未提交的更改:" -ForegroundColor Yellow
        git status
    } else {
        Write-Host "✓ Git工作区干净" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Git检查失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 检查EAS项目状态
Write-Host "检查EAS项目状态..." -ForegroundColor Yellow
try {
    npx eas whoami
    Write-Host "✓ EAS账户连接正常" -ForegroundColor Green
} catch {
    Write-Host "✗ EAS账户检查失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 检查项目配置
Write-Host "检查项目配置..." -ForegroundColor Yellow
if (Test-Path "app.json") {
    $appConfig = Get-Content "app.json" -Raw | ConvertFrom-Json
    Write-Host "项目名称: $($appConfig.expo.name)" -ForegroundColor Gray
    Write-Host "项目Slug: $($appConfig.expo.slug)" -ForegroundColor Gray
    if ($appConfig.expo.extra -and $appConfig.expo.extra.eas) {
        Write-Host "EAS项目ID: $($appConfig.expo.extra.eas.projectId)" -ForegroundColor Gray
        Write-Host "✓ EAS项目配置正常" -ForegroundColor Green
    } else {
        Write-Host "⚠ EAS项目ID未配置" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ 未找到app.json配置文件" -ForegroundColor Red
}

Write-Host ""

# 尝试列出构建历史
Write-Host "检查构建历史..." -ForegroundColor Yellow
try {
    $buildList = npx eas build:list --limit 5 --json
    if ($buildList) {
        $builds = $buildList | ConvertFrom-Json
        if ($builds.Count -gt 0) {
            Write-Host "找到 $($builds.Count) 个构建记录:" -ForegroundColor Green
            $builds | ForEach-Object {
                Write-Host "  - ID: $($_.id) | 状态: $($_.status) | 平台: $($_.platform)" -ForegroundColor Gray
            }
        } else {
            Write-Host "未找到构建记录" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "✗ 构建历史检查失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "诊断完成!" -ForegroundColor Green
Write-Host "如果以上检查都正常，但构建仍然失败，请尝试以下步骤:" -ForegroundColor Yellow
Write-Host "1. 访问 https://expo.dev/accounts/qq27122/projects/channel-app/settings" -ForegroundColor Gray
Write-Host "2. 检查项目设置是否正确" -ForegroundColor Gray
Write-Host "3. 尝试运行: npx eas build --platform android --profile preview" -ForegroundColor Gray
Write-Host "4. 如果仍然失败，可以考虑使用本地构建方式" -ForegroundColor Gray