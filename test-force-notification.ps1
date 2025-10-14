# 强制提醒功能测试工具 (Windows)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  强制提醒功能测试工具" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ 错误：请在 channel-app 目录下运行此脚本" -ForegroundColor Red
    exit 1
}

Write-Host "📋 测试准备清单：" -ForegroundColor Green
Write-Host ""
Write-Host "□ 准备两台手机（或一台手机+一台平板）"
Write-Host "□ 两台设备都安装了 Expo Go 应用"
Write-Host "□ 两台设备连接到同一 WiFi 网络"
Write-Host "□ 确保手机允许通知权限"
Write-Host ""

$ready = Read-Host "是否已准备好？(y/n)"

if ($ready -ne "y") {
    Write-Host "请准备好设备后再运行此脚本" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 正在启动 Expo 开发服务器..." -ForegroundColor Green
Write-Host ""

# 启动 Expo
npx expo start

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  测试步骤" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  设备A (频道主)：" -ForegroundColor Green
Write-Host "   - 扫描二维码打开应用"
Write-Host "   - 注册: 频道主A / 13800000001"
Write-Host "   - 创建频道: 强提醒测试频道"
Write-Host ""
Write-Host "2️⃣  设备B (用户)：" -ForegroundColor Green
Write-Host "   - 扫描二维码打开应用"
Write-Host "   - 注册: 用户B / 13800000002"
Write-Host "   - 订阅: 强提醒测试频道"
Write-Host ""
Write-Host "3️⃣  设备A (审核)：" -ForegroundColor Green
Write-Host "   - 进入消息页面"
Write-Host "   - 批准订阅申请"
Write-Host "   - 选择会员期限: 1分钟(测试)"
Write-Host ""
Write-Host "4️⃣  设备B (开启)：" -ForegroundColor Green
Write-Host "   - 刷新频道详情页"
Write-Host "   - 点击: 开启强制提醒"
Write-Host "   - 允许通知权限"
Write-Host ""
Write-Host "5️⃣  设备A (发布)：" -ForegroundColor Green
Write-Host "   - 发布测试内容"
Write-Host ""
Write-Host "6️⃣  设备B (验证)：" -ForegroundColor Green
Write-Host "   - ✅ 震动 (1.5秒)"
Write-Host "   - ✅ 横幅通知"
Write-Host "   - ✅ 声音提醒"
Write-Host "   - ✅ 锁屏显示"
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "详细文档: docs\FORCE_NOTIFICATION_TEST_GUIDE.md" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
