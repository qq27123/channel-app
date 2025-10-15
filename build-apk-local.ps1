# 本地APK构建脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host " 开始本地构建APK文件" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置环境变量
$env:EAS_NO_VCS = "1"
$env:EAS_PROJECT_ROOT = "D:\wenjianjia2\channel-app"
$env:Path += ";C:\Program Files\Git\bin;C:\Program Files\Git\cmd;C:\Program Files\Git\mingw64\bin"

Write-Host "设置环境变量完成" -ForegroundColor Green
Write-Host ""

# 进入项目目录
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "开始构建APK..." -ForegroundColor Yellow
Write-Host "这可能需要10-20分钟，请耐心等待..." -ForegroundColor Gray
Write-Host ""

# 运行EAS构建命令
npx eas build --platform android --profile preview --non-interactive

Write-Host "构建命令执行完成!" -ForegroundColor Green
Write-Host "请检查上面的输出获取构建结果" -ForegroundColor Yellow