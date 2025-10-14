# EAS Build自动化脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host " 开始使用EAS Build构建APK文件" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置环境变量
$env:EAS_NO_VCS = "1"
$env:EAS_PROJECT_ROOT = "D:\wenjianjia2\channel-app"

Write-Host "设置环境变量完成" -ForegroundColor Green
Write-Host "EAS_NO_VCS = $env:EAS_NO_VCS" -ForegroundColor Gray
Write-Host "EAS_PROJECT_ROOT = $env:EAS_PROJECT_ROOT" -ForegroundColor Gray
Write-Host ""

# 进入项目目录
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "开始构建APK..." -ForegroundColor Yellow
Write-Host "这可能需要10-20分钟，请耐心等待..." -ForegroundColor Gray
Write-Host ""

# 自动输入"Y"来创建EAS项目
$process = Start-Process -FilePath "npx" -ArgumentList "eas", "build", "--platform", "android", "--profile", "preview" -NoNewWindow -PassThru -RedirectStandardInput "input.txt" -RedirectStandardOutput "output.txt" -RedirectStandardError "error.txt"

# 创建输入文件
"Y" > input.txt

# 等待进程完成
$process.WaitForExit()

# 显示输出
Write-Host "构建完成!" -ForegroundColor Green
Write-Host "请检查output.txt和error.txt文件获取详细信息" -ForegroundColor Yellow