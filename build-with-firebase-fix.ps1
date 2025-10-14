# 带Firebase修复的构建脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host " 带Firebase修复的APK构建脚本" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置环境
Set-Location -Path "D:\wenjianjia2\channel-app"
$env:Path += ";C:\Program Files\Git\bin;C:\Program Files\Git\cmd"
$env:EAS_NO_VCS = "1"

Write-Host "环境设置完成:" -ForegroundColor Yellow
Write-Host "当前目录: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# 检查Firebase配置
Write-Host "检查Firebase配置..." -ForegroundColor Yellow
$firebaseConfig = Get-Content "src\config\firebase.js" -Raw
if ($firebaseConfig -match "AIzaSyAvLUC1KvlSxUu9IPd1O5DmdVaFug4GI88") {
    Write-Host "✓ Firebase API密钥配置正确" -ForegroundColor Green
} else {
    Write-Host "✗ Firebase API密钥配置缺失" -ForegroundColor Red
}

if ($firebaseConfig -match "tpzys-f63cf") {
    Write-Host "✓ Firebase项目ID配置正确" -ForegroundColor Green
} else {
    Write-Host "✗ Firebase项目ID配置缺失" -ForegroundColor Red
}

Write-Host ""

# 提交所有更改
Write-Host "提交代码更改..." -ForegroundColor Yellow
git add .
git commit -m "确保Firebase配置在构建中正确包含" -ErrorAction SilentlyContinue
Write-Host "✓ 代码更改已提交" -ForegroundColor Green
Write-Host ""

# 开始构建
Write-Host "开始EAS构建..." -ForegroundColor Yellow
Write-Host "这可能需要10-20分钟，请耐心等待..." -ForegroundColor Gray
Write-Host ""

try {
    npx eas build --platform android --profile preview
    Write-Host "✅ 构建命令已启动，请在Expo控制台查看进度" -ForegroundColor Green
} catch {
    Write-Host "❌ 构建启动失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "构建脚本执行完成!" -ForegroundColor Green
Write-Host "请访问以下链接查看构建状态:" -ForegroundColor Yellow
Write-Host "https://expo.dev/accounts/qq27122/projects/channel-app/builds" -ForegroundColor Gray