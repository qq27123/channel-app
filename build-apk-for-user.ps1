# 为用户构建APK的简单脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "        Expo APK构建助手" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "检查项目配置..." -ForegroundColor Yellow
# 验证项目配置
if (Test-Path "app.json") {
    $appConfig = Get-Content "app.json" | ConvertFrom-Json
    Write-Host "✓ 项目名称: $($appConfig.expo.name)" -ForegroundColor Green
    Write-Host "✓ 项目所有者: $($appConfig.expo.owner)" -ForegroundColor Green
    Write-Host "✓ 项目ID: $($appConfig.expo.extra.eas.projectId)" -ForegroundColor Green
} else {
    Write-Host "✗ 未找到app.json配置文件" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "检查EAS配置..." -ForegroundColor Yellow
if (Test-Path "eas.json") {
    Write-Host "✓ EAS配置文件存在" -ForegroundColor Green
} else {
    Write-Host "✗ 未找到eas.json配置文件" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "验证登录状态..." -ForegroundColor Yellow
try {
    $user = eas whoami 2>$null
    if ($user) {
        Write-Host "✓ 当前登录用户: $user" -ForegroundColor Green
    } else {
        Write-Host "ℹ 请运行 'eas login' 登录你的Expo账户" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "ℹ 请运行 'eas login' 登录你的Expo账户" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "开始构建APK..." -ForegroundColor Yellow
Write-Host "这可能需要15-30分钟，请耐心等待..." -ForegroundColor Cyan
Write-Host ""

# 设置环境变量
$env:EXPO_NO_GIT_STATUS = "1"

# 开始构建
eas build -p android --profile preview --non-interactive

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "          构建过程已完成" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "构建状态:" -ForegroundColor Yellow
Write-Host "• 运行 'eas build:list' 查看构建历史" -ForegroundColor Gray
Write-Host "• 运行 'eas build:logs' 查看构建日志" -ForegroundColor Gray
Write-Host "• 构建完成后可在Expo网站下载APK" -ForegroundColor Gray
Write-Host ""