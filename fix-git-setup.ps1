# 修复Git设置脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "        修复Git设置" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 设置路径
Set-Location -Path "D:\wenjianjia2\channel-app"

Write-Host "步骤1: 检查当前Git状态..." -ForegroundColor Yellow
git status

Write-Host "步骤2: 检查当前分支..." -ForegroundColor Yellow
git branch

Write-Host "步骤3: 检查远程仓库..." -ForegroundColor Yellow
git remote -v

Write-Host "步骤4: 如果没有远程仓库，添加origin..." -ForegroundColor Yellow
# 检查是否已有origin远程仓库
$remoteExists = git remote | Select-String "origin"
if (-not $remoteExists) {
    Write-Host "  - 请手动添加你的GitHub仓库URL:" -ForegroundColor Gray
    Write-Host "    git remote add origin https://github.com/你的用户名/你的仓库名.git" -ForegroundColor Gray
} else {
    Write-Host "  - 远程仓库已存在" -ForegroundColor Green
}

Write-Host "步骤5: 如果没有main分支，创建并切换..." -ForegroundColor Yellow
# 检查当前分支
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "  - 当前分支: $currentBranch" -ForegroundColor Gray

if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "  - 创建main分支..." -ForegroundColor Gray
    git checkout -b main
}

Write-Host "步骤6: 推送到正确的分支..." -ForegroundColor Yellow
if ($currentBranch -eq "main") {
    Write-Host "  - 推送到main分支..." -ForegroundColor Gray
    git push origin main
} else {
    Write-Host "  - 推送到master分支..." -ForegroundColor Gray
    git push origin master
}

Write-Host ""
Write-Host "✅ Git设置修复完成!" -ForegroundColor Green
Write-Host ""
Write-Host "如果仍有问题，请手动执行以下步骤:" -ForegroundColor Yellow
Write-Host "1. 添加远程仓库: git remote add origin https://github.com/你的用户名/你的仓库名.git" -ForegroundColor Gray
Write-Host "2. 推送到远程: git push -u origin main" -ForegroundColor Gray