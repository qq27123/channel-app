# 检查Expo构建状态脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host " 检查Expo构建状态" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置环境
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "项目信息:" -ForegroundColor Yellow
Write-Host "项目目录: $(Get-Location)" -ForegroundColor Gray
Write-Host "Expo账户: $(npx eas whoami)" -ForegroundColor Gray
Write-Host ""

# 尝试列出构建
Write-Host "正在获取构建列表..." -ForegroundColor Yellow
try {
    # 使用Invoke-WebRequest直接访问API
    $projectId = "f9b4d72e-2199-4b81-b041-fd8e6421d2ed"
    $url = "https://expo.dev/api/v2/projects/$projectId/builds?limit=5&platform=android"
    Write-Host "访问URL: $url" -ForegroundColor Gray
    
    # 打开浏览器查看构建状态
    Start-Process "https://expo.dev/accounts/qq27122/projects/channel-app/builds"
    Write-Host "已在浏览器中打开构建状态页面" -ForegroundColor Green
    Write-Host "请在浏览器中查看构建状态" -ForegroundColor Yellow
} catch {
    Write-Host "检查构建状态时出错: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "建议:" -ForegroundColor Yellow
Write-Host "1. 请访问 https://expo.dev/accounts/qq27122/projects/channel-app/builds 查看构建状态" -ForegroundColor Gray
Write-Host "2. 如果没有正在进行的构建，请重新运行构建命令:" -ForegroundColor Gray
Write-Host "   cd d:\wenjianjia2\channel-app" -ForegroundColor Gray
Write-Host "   npx eas build --platform android --profile preview" -ForegroundColor Gray
Write-Host ""