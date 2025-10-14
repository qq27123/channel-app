# Git安装后配置脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host " Git安装后配置脚本" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 等待Git安装完成
Write-Host "等待Git安装完成..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 验证Git安装
Write-Host "验证Git安装..." -ForegroundColor Yellow
try {
    # 刷新环境变量
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    # 尝试运行Git
    $gitVersion = git --version
    Write-Host "✓ Git安装成功: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git安装验证失败，请确保安装已完成" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "配置Git用户信息..." -ForegroundColor Yellow
# 配置Git用户信息（如果需要）
try {
    git config --global user.email "taowang2020@163.com"
    git config --global user.name "taowang"
    Write-Host "✓ Git用户信息配置完成" -ForegroundColor Green
} catch {
    Write-Host "⚠ Git用户信息配置失败" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "初始化项目Git仓库..." -ForegroundColor Yellow
try {
    Set-Location -Path "D:\wenjianjia2\channel-app"
    if (-not (Test-Path ".git")) {
        git init
        git add .
        git commit -m "Initial commit"
        Write-Host "✓ 项目Git仓库初始化完成" -ForegroundColor Green
    } else {
        Write-Host "✓ Git仓库已存在" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ 项目Git仓库初始化失败" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "现在可以使用EAS Build构建APK了!" -ForegroundColor Green
Write-Host "运行以下命令开始构建:" -ForegroundColor Yellow
Write-Host "  cd d:\wenjianjia2\channel-app" -ForegroundColor Gray
Write-Host "  npx eas build --platform android --profile preview" -ForegroundColor Gray

Write-Host ""
Write-Host "配置完成!" -ForegroundColor Green